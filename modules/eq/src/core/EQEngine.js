// ================================================================
// EQ ENGINE — аудио-движок (исправленная версия)
// ================================================================

import BiquadMath from './BiquadMath.js';
import ChannelProcessor from './ChannelProcessor.js';
import DynamicEQController from './DynamicEQController.js';

export default class EQEngine {
    constructor(state) {
        this.state = state;
        this.ctx = null;
        this.analyserIn = null;
        this.analyserOut = null;
        this.inputNode = null;
        this.outputNode = null;
        this.gainIn = null;
        this.gainOut = null;
        this.autoGainNode = null;
        this.clipper = null;
        this.filters = []; // массив { filter, bandId }
        this.processors = [];
        this._dynamicsControllers = [];
        this._freqData = null;
        this._tdIn = null;
        this._tdOut = null;
        this._source = null;
        this._sourceType = 'demo';
        this._buffer = null;
        this._fileBuffer = null;
        this._isPlaying = false;
        this._isPaused = false;
        this._currentTime = 0;
        this._sourceOffset = 0;
        this._sourceStartTime = 0;
        this._duration = 0;
        this._micStream = null;
        this._micSrc = null;
        this._systemStream = null;
        this._systemSource = null;
        this._recorder = null;
        this._recordedChunks = [];
        this._recordedBlob = null;
        this._recordedBuffer = null;
        this._isRecording = false;
        this._onPlayChange = null;
        this._rafId = null;
        this._demoOsc = null;
        this._demoOsc2 = null;
        this._demoGain2 = null;
        this._demoMix = null;
        this._demoWave = 'sine';
        this._demoFreq = 220;
        this._demoNoiseSource = null;
        this._abInterval = null;
        this._abSavedBands = null;
        this._abSavedSlot = 'A';
        this._deltaSum = null;
        this._deltaInvert = null;
        this._captureRecorder = null;
        this._captureDest = null;
        this._captureChunks = [];
        this._isCapturing = false;
        this._captureStartTime = 0;
        this._fileEnded = false;
        this._savedCaptureStream = null;
        this._isSoundOn = true;
        this._isInitialized = false;
        this._initAudio();
    }

    _initAudio() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Автозапуск контекста при взаимодействии
        const resume = () => {
            if (this.ctx.state === 'suspended') {
                this.ctx.resume().catch(() => {});
            }
            document.removeEventListener('click', resume);
            document.removeEventListener('touchstart', resume);
        };
        document.addEventListener('click', resume);
        document.addEventListener('touchstart', resume);

        this.analyserIn = this.ctx.createAnalyser();
        this.analyserIn.fftSize = 1024;
        this.analyserIn.smoothingTimeConstant = 0.8;

        this.analyserOut = this.ctx.createAnalyser();
        this.analyserOut.fftSize = 2048;
        this.analyserOut.smoothingTimeConstant = 0.82;
        this._freqData = new Uint8Array(this.analyserOut.frequencyBinCount);
        this._tdIn = new Float32Array(this.analyserIn.fftSize);
        this._tdOut = new Float32Array(this.analyserOut.fftSize);

        this.inputNode = this.ctx.createGain();
        this.gainIn = this.ctx.createGain();
        this.gainIn.gain.value = this.state.inputGain;
        this.gainOut = this.ctx.createGain();
        this.gainOut.gain.value = this.state.outputGain;
        this.autoGainNode = this.ctx.createGain();
        this.autoGainNode.gain.value = 1.0;
        this.clipper = this.ctx.createWaveShaper();
        this.clipper.curve = this._createSoftClipCurve();
        this.clipper.oversample = '4x';
        this.outputNode = this.ctx.createGain();

        this._isInitialized = true;
        this._rebuildChain();
    }

    _createSoftClipCurve() {
        const n = 8192;
        const curve = new Float32Array(n);
        for (let i = 0; i < n; i++) {
            const x = (i / n) * 2 - 1;
            curve[i] = Math.tanh(x * 2) / Math.tanh(2);
        }
        return curve;
    }

    // ===== ОСНОВНОЕ ИСПРАВЛЕНИЕ 1: Полное отключение старых узлов =====
    _rebuildChain() {
        if (!this._isInitialized || !this.ctx) return;

        // ---- 1. ПОЛНОЕ ОТКЛЮЧЕНИЕ ВСЕХ СТАРЫХ УЗЛОВ ----
        try {
            // Отключаем основные узлы
            if (this.inputNode) this.inputNode.disconnect();
            if (this.gainIn) this.gainIn.disconnect();
            if (this.gainOut) this.gainOut.disconnect();
            if (this.autoGainNode) this.autoGainNode.disconnect();
            if (this.clipper) this.clipper.disconnect();
            if (this.outputNode) this.outputNode.disconnect();
            if (this.analyserIn) this.analyserIn.disconnect();
            if (this.analyserOut) this.analyserOut.disconnect();
            if (this._deltaSum) this._deltaSum.disconnect();
            if (this._deltaInvert) this._deltaInvert.disconnect();

            // Отключаем все старые фильтры
            for (const entry of this.filters) {
                try { entry.filter.disconnect(); } catch(e) {}
            }

            // Уничтожаем старые процессоры
            for (const proc of this.processors) {
                try { proc.processor.destroy(); } catch(e) {}
            }
            this.processors = [];

            // Уничтожаем старые динамические контроллеры
            for (const dyn of this._dynamicsControllers) {
                try { dyn.controller.destroy(); } catch(e) {}
            }
            this._dynamicsControllers = [];
        } catch(e) {
            console.warn('Disconnect error (ignored):', e);
        }

        // ---- 2. ОЧИЩАЕМ МАССИВЫ ----
        this.filters = [];
        this._deltaSum = null;
        this._deltaInvert = null;

        // ---- 3. СТРОИМ НОВУЮ ЦЕПОЧКУ ----
        try {
            // Подключаем входной узел
            this.inputNode.connect(this.gainIn);
            this.gainIn.connect(this.analyserIn);
            let node = this.analyserIn;

            // Создаём фильтры для всех полос
            for (const band of this.state.bands) {
                // Пропускаем отключённые полосы
                if (this.state.bypassed || !this.state.isEffectivelyEnabled(band.id)) continue;

                // Создаём процессор для полосы
                const processor = new ChannelProcessor(this.ctx, band, this.state);
                node.connect(processor.inputNode);

                // Если включён динамический режим
                if (band.dynamic && band.dynamic.enabled) {
                    const controller = new DynamicEQController(
                        this.ctx,
                        processor.getFilterForDynamic(),
                        band.id,
                        this.state,
                        {
                            threshold: band.dynamic.threshold,
                            ratio: band.dynamic.ratio,
                            attack: band.dynamic.attack / 1000,
                            release: band.dynamic.release / 1000
                        }
                    );
                    processor.insertDynamicToChannel(band.channelMode || 'stereo', controller);
                    this._dynamicsControllers.push({
                        bandId: band.id,
                        controller: controller,
                        isLink: processor.isLinkMode ? processor.isLinkMode() : false,
                        channel: band.channelMode || 'stereo'
                    });
                }

                node = processor.outputNode;
                this.processors.push({
                    bandId: band.id,
                    processor: processor,
                    mode: band.channelMode || 'stereo'
                });

                // Сохраняем фильтр для быстрого доступа
                const filter = processor.getFilterForDynamic();
                if (filter) {
                    this.filters.push({ filter: filter, bandId: band.id });
                }
            }

            // Delta-режим (сравнение с оригиналом)
            if (this.state.deltaMode) {
                const sum = this.ctx.createGain();
                const invert = this.ctx.createGain();
                invert.gain.value = -1;
                this.analyserIn.connect(invert);
                invert.connect(sum);
                node.connect(sum);
                this._deltaSum = sum;
                this._deltaInvert = invert;
                node = sum;
            }

            // Подключаем выходную цепочку
            node.connect(this.gainOut);
            this.gainOut.connect(this.autoGainNode);

            let tail = this.autoGainNode;
            if (this.state.softClip) {
                tail.connect(this.clipper);
                tail = this.clipper;
            }

            tail.connect(this.analyserOut);
            this.analyserOut.connect(this.outputNode);
            this.outputNode.connect(this.ctx.destination);

            // Подключаем захват, если активен
            if (this._captureDest) {
                this.outputNode.connect(this._captureDest);
            }

            // Обновляем Auto-Gain
            this.updateAutoGain();

        } catch(e) {
            console.error('Rebuild chain error:', e);
        }
    }

    // ===== ОСНОВНОЕ ИСПРАВЛЕНИЕ 2: Правильное обновление фильтров =====
    updateFilters(keepStructure = true) {
        if (!this._isInitialized || !this.ctx) return;

        // Проверяем, изменился ли режим у какой-либо полосы
        let modeChanged = false;
        for (const proc of this.processors) {
            const band = this.state.bands.find(b => b.id === proc.bandId);
            if (band && (band.channelMode || 'stereo') !== proc.mode) {
                modeChanged = true;
                break;
            }
        }

        // Если структура изменилась (добавлена/удалена полоса) или изменился режим — перестраиваем
        if (!keepStructure || this.filters.length !== this.state.bands.length || modeChanged) {
            this._rebuildChain();
            return;
        }

        // Обновляем параметры существующих фильтров
        const now = this.ctx.currentTime;
        const time = 0.03;

        for (const entry of this.filters) {
            const band = this.state.bands.find(b => b.id === entry.bandId);
            if (!band) continue;

            // Проверяем, активна ли полоса
            const isActive = !this.state.bypassed && this.state.isEffectivelyEnabled(band.id);
            const mode = band.channelMode || 'stereo';

            // Определяем тип фильтра
            const typeMap = {
                bell: 'peaking',
                lowshelf: 'lowshelf',
                highshelf: 'highshelf',
                lowcut: 'highpass',
                highcut: 'lowpass',
                notch: 'notch',
                bandpass: 'bandpass'
            };
            const type = typeMap[band.type] || 'peaking';

            // Определяем усиление в зависимости от режима
            let gainVal = 0;
            if (isActive) {
                if (mode === 'stereo') gainVal = band.gain || 0;
                else if (mode === 'mid') gainVal = band.midGain || 0;
                else if (mode === 'side') gainVal = band.sideGain || 0;
                else if (mode === 'left') gainVal = band.leftGain || 0;
                else if (mode === 'right') gainVal = band.rightGain || 0;
            }

            // Для фильтров без усиления — всегда 0
            if (BiquadMath.isGainlessType(band.type)) {
                gainVal = 0;
            }

            // Плавно обновляем параметры
            try {
                if (entry.filter.type !== type) entry.filter.type = type;
                entry.filter.frequency.setTargetAtTime(band.freq, now, time);
                entry.filter.Q.setTargetAtTime(band.q, now, time);
                entry.filter.gain.setTargetAtTime(gainVal, now, time);
            } catch(e) {
                // Если фильтр повреждён — перестраиваем
                this._rebuildChain();
                return;
            }
        }

        // Обновляем динамические контроллеры
        for (const dyn of this._dynamicsControllers) {
            const band = this.state.bands.find(b => b.id === dyn.bandId);
            if (band && band.dynamic) {
                dyn.controller.updateParams({
                    threshold: band.dynamic.threshold,
                    ratio: band.dynamic.ratio,
                    attack: band.dynamic.attack / 1000,
                    release: band.dynamic.release / 1000
                });
            }
        }

        this.updateAutoGain();
    }

    // ===== ОСТАЛЬНЫЕ МЕТОДЫ (без изменений) =====
    getDynamicReduction(bandId) {
        const dyn = this._dynamicsControllers.find(d => d.bandId === bandId);
        return dyn && dyn.controller ? dyn.controller.getReduction() : 0;
    }

    calcTotal(f) {
        if (this.state.bypassed) return 0;
        let total = 0;
        for (const band of this.state.bands) {
            if (!this.state.isEffectivelyEnabled(band.id)) continue;
            let gain = 0;
            const mode = band.channelMode || 'stereo';
            switch(mode) {
                case 'stereo': gain = band.gain || 0; break;
                case 'mid': gain = band.midGain || 0; break;
                case 'side': gain = band.sideGain || 0; break;
                case 'left': gain = band.leftGain || 0; break;
                case 'right': gain = band.rightGain || 0; break;
                default: gain = band.gain || 0;
            }
            total += this.calcFilter(band.type, f, band.freq, gain, band.q);
        }
        return total;
    }

    calcFilter(type, f, fc, gain, Q) {
        if (this.state.bypassed) return 0;
        const sr = this.ctx ? this.ctx.sampleRate : 44100;
        const coeffs = BiquadMath.getCoeffs(type, fc, gain, Q, sr);
        return BiquadMath.magnitudeAt(coeffs, f, sr);
    }

    deleteBand(id) {
        this.state.deleteBand(id);
        this._rebuildChain();
    }

    _computeAutoGain() {
        if (!this.state.autoGain) return 1.0;
        let sumAfter = 0;
        const points = 200;
        for (let i = 0; i <= points; i++) {
            const f = Math.pow(10, Math.log10(20) + (i/points) * (Math.log10(20000) - Math.log10(20)));
            const gainDb = this.calcTotal(f);
            sumAfter += Math.pow(10, gainDb / 20);
        }
        const avgAfter = sumAfter / points;
        const factor = avgAfter > 0 ? 1 / avgAfter : 1.0;
        return Math.max(0.1, Math.min(10, factor));
    }

    updateAutoGain() {
        if (!this._isInitialized || !this.ctx) return;
        const factor = this._computeAutoGain();
        try {
            this.autoGainNode.gain.setTargetAtTime(factor, this.ctx.currentTime, 0.05);
        } catch(e) {}
    }

    setDeltaMode(enabled) {
        this.state.deltaMode = enabled;
        this._rebuildChain();
        this.state.save();
    }

    // ===== ВОСПРОИЗВЕДЕНИЕ =====
    async playSource(type, data, offset = 0) {
        if (type === 'file' || type === 'recorded') this._fileEnded = false;
        this.stopSource();
        this._sourceType = type;
        this._currentTime = offset;
        this._sourceOffset = offset;
        if (this.ctx.state === 'suspended') await this.ctx.resume();

        try {
            switch(type) {
                case 'demo': this._startDemo(); break;
                case 'file':
                    if (data instanceof File) {
                        const ab = await data.arrayBuffer();
                        this._buffer = await this.ctx.decodeAudioData(ab);
                        this._fileBuffer = this._buffer;
                        this._playBuffer(this._buffer, offset);
                    } else if (data instanceof AudioBuffer) {
                        this._buffer = data;
                        this._fileBuffer = data;
                        this._playBuffer(data, offset);
                    }
                    break;
                case 'mic': await this._startMic(); break;
                case 'system': await this._startSystem(); break;
                case 'recorded':
                    if (this._recordedBuffer) {
                        this._buffer = this._recordedBuffer;
                        this._fileBuffer = this._recordedBuffer;
                        this._playBuffer(this._buffer, offset);
                    }
                    break;
            }
            this._isPlaying = true;
            this._isPaused = false;
            if (this._onPlayChange) this._onPlayChange('playing');
        } catch(e) {
            console.error('Play error:', e);
            if (this._onPlayChange) this._onPlayChange('error', e.message);
        }
    }

    pause() {
        if (this._source && this._source.stop) {
            this._currentTime = this._getCurrentTime();
            this.stopSource();
            this._isPaused = true;
            this._isPlaying = false;
            if (this._onPlayChange) this._onPlayChange('paused');
            return;
        }
        if (this.ctx && this.ctx.state === 'running') {
            this.ctx.suspend();
            this._isPaused = true;
            this._isPlaying = false;
            if (this._onPlayChange) this._onPlayChange('paused');
        }
    }

    resume() {
        if (this._isPaused) {
            if (this._buffer && (this._sourceType === 'file' || this._sourceType === 'recorded')) {
                this.playSource(this._sourceType, this._buffer, this._currentTime);
            } else if (this._sourceType === 'demo') {
                this.playSource('demo');
            } else if (this._sourceType === 'mic') {
                this.playSource('mic');
            } else if (this._sourceType === 'system') {
                this.playSource('system');
            }
        }
    }

    stopSource() {
        try {
            if (this._source && typeof this._source.stop === 'function') {
                this._source.stop();
                this._source.disconnect();
            }
            if (this._demoOsc && typeof this._demoOsc.stop === 'function') {
                this._demoOsc.stop();
                this._demoOsc.disconnect();
            }
            if (this._demoOsc2 && typeof this._demoOsc2.stop === 'function') {
                this._demoOsc2.stop();
                this._demoOsc2.disconnect();
            }
            if (this._demoMix) this._demoMix.disconnect();
            if (this._demoNoiseSource) {
                this._demoNoiseSource.stop();
                this._demoNoiseSource.disconnect();
            }
            if (this._micSrc) this._micSrc.disconnect();
            if (this._micStream) {
                this._micStream.getTracks().forEach(t => { try { t.stop(); } catch(e) {} });
                this._micStream = null;
            }
            if (this._systemSource) {
                try { this._systemSource.disconnect(); } catch(e) {}
                this._systemSource = null;
            }
            if (this._systemStream) {
                try { this._systemStream.getTracks().forEach(t => { try { t.stop(); } catch(e) {} }); } catch(e) {}
                this._systemStream = null;
            }
        } catch(e) {}
        this._source = null;
        this._demoOsc = null;
        this._demoOsc2 = null;
        this._demoMix = null;
        this._demoNoiseSource = null;
        this._micSrc = null;
        this._isPlaying = false;
        this._isPaused = false;
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
        if (this._onPlayChange) this._onPlayChange('stopped');
    }

    _playBuffer(buffer, offset = 0) {
        this._duration = buffer.duration;
        const src = this.ctx.createBufferSource();
        src.buffer = buffer;
        src.loop = false;
        this._source = src;
        this._source.connect(this.inputNode);
        this._source.start(0, offset);
        this._sourceStartTime = this.ctx.currentTime;
        this._sourceOffset = offset;
        this._currentTime = offset;
        this._fileEnded = false;
        this._source.onended = () => {
            if (this._source === src) {
                this._isPlaying = false;
                this._isPaused = false;
                this._fileEnded = true;
                this._currentTime = this._duration;
                if (this._onPlayChange) {
                    this._onPlayChange('timeupdate', this._duration);
                    this._onPlayChange('ended', null);
                }
            }
        };
        this._updateTimeLoop();
    }

    _updateTimeLoop() {
        if (!this._isPlaying && !this._isPaused) {
            this._rafId = null;
            return;
        }
        if (this._source && this._buffer) {
            const elapsed = this.ctx.currentTime - this._sourceStartTime;
            this._currentTime = this._sourceOffset + elapsed;
            if (this._currentTime > this._duration) this._currentTime = this._duration;
            if (this._onPlayChange) this._onPlayChange('timeupdate', this._currentTime);
            this._rafId = requestAnimationFrame(() => this._updateTimeLoop());
        } else {
            this._rafId = null;
        }
    }

    _getCurrentTime() {
        if (this._sourceType === 'demo' && this._sourceStartTime) {
            return Math.max(0, this.ctx.currentTime - this._sourceStartTime);
        }
        if (this._sourceType === 'system' && this._sourceStartTime) {
            return Math.max(0, this.ctx.currentTime - this._sourceStartTime);
        }
        if (this._source && this._buffer) {
            const elapsed = this.ctx.currentTime - this._sourceStartTime;
            return Math.min(this._sourceOffset + elapsed, this._duration);
        }
        return this._currentTime;
    }

    // ===== ДЕМО =====
    setDemoParams(wave, freq) {
        const waveChanged = wave !== this._demoWave;
        this._demoWave = wave;
        this._demoFreq = freq;
        
        const isNoise = wave === 'noise';
        const wasNoise = this._demoNoiseSource !== null;

        if (waveChanged && ((isNoise && !wasNoise) || (!isNoise && wasNoise))) {
            const wasPlaying = this._isPlaying;
            if (wasPlaying) {
                this.stopSource();
                this.playSource('demo');
            }
            return;
        }

        if (this._demoOsc) {
            const now = this.ctx.currentTime;
            const rampTime = 0.05;
            try {
                this._demoOsc.frequency.exponentialRampToValueAtTime(freq, now + rampTime);
                if (waveChanged && !isNoise) this._demoOsc.type = wave;
                if (this._demoOsc2) {
                    this._demoOsc2.frequency.exponentialRampToValueAtTime(freq * 2, now + rampTime);
                    if (waveChanged && !isNoise) this._demoOsc2.type = wave;
                }
            } catch(e) {}
        }
    }

_startDemo() {
    const isNoise = this._demoWave === 'noise';

    // Очистка старых узлов
    if (this._demoOsc) {
        try { this._demoOsc.stop(); } catch(e) {}
        try { this._demoOsc.disconnect(); } catch(e) {}
        this._demoOsc = null;
    }
    if (this._demoOsc2) {
        try { this._demoOsc2.stop(); } catch(e) {}
        try { this._demoOsc2.disconnect(); } catch(e) {}
        this._demoOsc2 = null;
    }
    if (this._demoMix) {
        try { this._demoMix.disconnect(); } catch(e) {}
        this._demoMix = null;
    }
    if (this._demoGain2) {
        try { this._demoGain2.disconnect(); } catch(e) {}
        this._demoGain2 = null;
    }
    if (this._demoNoiseSource) {
        try { this._demoNoiseSource.stop(); } catch(e) {}
        try { this._demoNoiseSource.disconnect(); } catch(e) {}
        this._demoNoiseSource = null;
    }

    if (isNoise) {
        this._startNoiseSource();
        return;
    }

    // Проверяем, что inputNode существует
    if (!this.inputNode) {
        this.inputNode = this.ctx.createGain();
    }

    const waveMap = { sine: 'sine', square: 'square', sawtooth: 'sawtooth', triangle: 'triangle' };

    // ОДИН осциллятор (чистый сигнал, без биений)
    const osc = this.ctx.createOscillator();
    osc.type = waveMap[this._demoWave] || 'sine';
    osc.frequency.value = this._demoFreq;

    // Вторая гармоника (обертон)
    const osc2 = this.ctx.createOscillator();
    osc2.type = waveMap[this._demoWave] || 'sine';
    osc2.frequency.value = this._demoFreq * 2;

    const gain1 = this.ctx.createGain();
    gain1.gain.value = 0.2;
    const gain2 = this.ctx.createGain();
    gain2.gain.value = 0.1;

    // Создаём стерео-выход (одинаковый сигнал на оба канала)
    const merger = this.ctx.createChannelMerger(2);
    osc.connect(gain1);
    gain1.connect(merger, 0, 0); // левый канал
    gain1.connect(merger, 0, 1); // правый канал (тот же сигнал)

    osc2.connect(gain2);
    gain2.connect(merger, 0, 0);
    gain2.connect(merger, 0, 1);

    // Запускаем осцилляторы
    osc.start();
    osc2.start();

    this._demoOsc = osc;
    this._demoOsc2 = osc2;
    this._demoMix = merger;
    this._source = merger;
    this._source.connect(this.inputNode);
    this._duration = Infinity;
    this._sourceStartTime = this.ctx.currentTime;
}

    _startNoiseSource() {
        const bufferSize = 32768;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        if (this._demoWave === 'noise') {
            let hasSpare = false;
            let spare = 0;
            const gaussian = () => {
                if (hasSpare) {
                    hasSpare = false;
                    return spare;
                }
                let u = 0, v = 0;
                while (u === 0) u = Math.random();
                while (v === 0) v = Math.random();
                const r = Math.sqrt(-2.0 * Math.log(u));
                spare = r * Math.sin(2.0 * Math.PI * v);
                hasSpare = true;
                return r * Math.cos(2.0 * Math.PI * v);
            };
            for (let i = 0; i < bufferSize; i++) {
                data[i] = gaussian() * 0.12;
            }
        } else {
            for (let i = 0; i < bufferSize; i++) {
                data[i] = 0;
            }
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        const gain = this.ctx.createGain();
        gain.gain.value = 0.3;
        src.connect(gain);
        gain.connect(this.inputNode);
        src.start();
        this._demoNoiseSource = src;
        this._source = gain;
        this._duration = Infinity;
        this._sourceStartTime = this.ctx.currentTime;
    }

    // ===== МИКРОФОН И СИСТЕМНЫЙ ЗВУК =====
    async _startMic() {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
        });
        this._micStream = stream;
        this._micSrc = this.ctx.createMediaStreamSource(stream);
        this._source = this._micSrc;
        this._source.connect(this.inputNode);
        this._sourceType = 'mic';
        this._duration = Infinity;
        this._sourceStartTime = this.ctx.currentTime;
    }

    async captureSystemAudio() {
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isIOS) {
            if (this._onPlayChange) this._onPlayChange('error', 'Захват системного звука недоступен на iOS');
            return false;
        }
        if (!navigator.mediaDevices || typeof navigator.mediaDevices.getDisplayMedia !== 'function') {
            if (this._onPlayChange) this._onPlayChange('error', 'Браузер не поддерживает захват системного звука');
            return false;
        }
        try {
            const constraints = {
                video: true,
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, sampleRate: 48000, channelCount: 2 }
            };
            const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length === 0) {
                stream.getTracks().forEach(t => t.stop());
                if (this._onPlayChange) this._onPlayChange('error', 'Выбранный источник не содержит аудио');
                return false;
            }
            const audioOnlyStream = new MediaStream([audioTracks[0]]);
            stream.getVideoTracks().forEach(track => track.stop());
            if (this.ctx.state === 'suspended') await this.ctx.resume();
            this.stopSource();
            this._systemStream = audioOnlyStream;
            this._systemSource = this.ctx.createMediaStreamSource(audioOnlyStream);
            this._source = this._systemSource;
            this._source.connect(this.inputNode);
            this._sourceType = 'system';
            this._duration = Infinity;
            this._sourceStartTime = this.ctx.currentTime;
            this._isPlaying = true;
            this._isPaused = false;
            this._savedCaptureStream = audioOnlyStream;
            if (this._onPlayChange) {
                this._onPlayChange('playing');
                this._onPlayChange('system-captured', 'desktop');
            }
            return true;
        } catch (error) {
            if (error.name === 'NotAllowedError' || error.name === 'AbortError') return false;
            if (this._onPlayChange) this._onPlayChange('error', 'Ошибка: ' + error.message);
            return false;
        }
    }

    async _startSystem() {
        if (this._systemStream) {
            this._isPlaying = true;
            this._isPaused = false;
            return;
        }
        await this.captureSystemAudio();
    }

    // ===== ЗАПИСЬ =====
    startRecording() {
        if (this._isRecording) return;
        if (!this._micStream) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => { this._micStream = stream; this._startRecStream(stream); })
                .catch(() => {});
            return;
        }
        this._startRecStream(this._micStream);
    }

    _startRecStream(stream) {
        this._recordedChunks = [];
        const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
        try {
            this._recorder = new MediaRecorder(stream, { mimeType: mime });
            this._recorder.ondataavailable = (e) => { if (e.data.size > 0) this._recordedChunks.push(e.data); };
            this._recorder.onstop = () => {
                this._isRecording = false;
                this._recordedBlob = new Blob(this._recordedChunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onload = async (ev) => {
                    try {
                        this._recordedBuffer = await this.ctx.decodeAudioData(ev.target.result);
                        if (this._onPlayChange) this._onPlayChange('recorded');
                    } catch(e) {}
                };
                reader.readAsArrayBuffer(this._recordedBlob);
            };
            this._recorder.start();
            this._isRecording = true;
            if (this._onPlayChange) this._onPlayChange('recording');
        } catch(e) {
            console.error('Recording error:', e);
            if (this._onPlayChange) this._onPlayChange('error', 'Не удалось начать запись');
        }
    }

    stopRecording() {
        if (this._recorder && this._isRecording) {
            try {
                this._recorder.stop();
                if (this._onPlayChange) this._onPlayChange('recording-stopped');
            } catch(e) {}
        }
    }

    // ===== ЗАХВАТ С МОНИТОРИНГОМ =====
    async startCaptureWithMonitoring(withMonitoring = true, mode = 'eq') {
        if (this._isCapturing) return null;
        if (typeof MediaRecorder === 'undefined') throw new Error('Запись не поддерживается браузером');
        if (this.ctx.state === 'suspended') await this.ctx.resume();

        try {
            this._captureDest = this.ctx.createMediaStreamDestination();
            this.outputNode.connect(this._captureDest);

            const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
            this._captureChunks = [];
            this._captureRecorder = new MediaRecorder(this._captureDest.stream, { mimeType: mime });
            this._captureRecorder.ondataavailable = (e) => { if (e.data.size > 0) this._captureChunks.push(e.data); };
            this._captureRecorder.onstop = () => {
                this._isCapturing = false;
                const blob = new Blob(this._captureChunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onload = async (ev) => {
                    try {
                        const buf = await this.ctx.decodeAudioData(ev.target.result);
                        this._recordedBuffer = buf;
                        this._buffer = buf;
                        this._fileBuffer = buf;
                        this._duration = buf.duration;
                        if (this._onPlayChange) this._onPlayChange('capture-done', buf);
                    } catch(e) {
                        if (this._onPlayChange) this._onPlayChange('error', 'Не удалось декодировать запись');
                    }
                };
                reader.readAsArrayBuffer(blob);
            };
            this._captureRecorder.start(250);
            this._isCapturing = true;
            this._captureStartTime = this.ctx.currentTime;
            if (this._onPlayChange) this._onPlayChange('capture-start');
            return true;
        } catch(e) {
            console.error('Capture error:', e);
            if (this._onPlayChange) this._onPlayChange('error', 'Ошибка захвата: ' + e.message);
            return null;
        }
    }

    stopCapture() {
        if (this._captureRecorder && this._isCapturing) {
            try { this._captureRecorder.stop(); } catch(e) {}
        }
        if (this._captureDest) {
            try { this._captureDest.disconnect(); } catch(e) {}
            this._captureDest = null;
        }
        if (this._onPlayChange) this._onPlayChange('capture-stopping');
    }

    // ===== ГЕТТЕРЫ =====
    getRecordedBuffer() { return this._recordedBuffer; }
    isPlaying() { return this._isPlaying && !this._isPaused; }
    isPaused() { return this._isPaused; }
    getBuffer() { return this._fileBuffer || this._recordedBuffer; }
    getCurrentTime() { return this._getCurrentTime(); }
    getDuration() { return this._duration || 0; }

    getFrequencyData() {
        if (this.analyserOut) {
            this.analyserOut.getByteFrequencyData(this._freqData);
        }
        return this._freqData;
    }

    getInputLevel() {
        if (!this.analyserIn) return 0;
        try {
            this.analyserIn.getFloatTimeDomainData(this._tdIn);
            let sum = 0;
            for (let i = 0; i < this._tdIn.length; i++) sum += this._tdIn[i] * this._tdIn[i];
            return Math.min(Math.sqrt(sum / this._tdIn.length) * 2, 1);
        } catch(e) { return 0; }
    }

    getOutputLevel() {
        if (!this.analyserOut) return 0;
        try {
            this.analyserOut.getFloatTimeDomainData(this._tdOut);
            let sum = 0;
            for (let i = 0; i < this._tdOut.length; i++) sum += this._tdOut[i] * this._tdOut[i];
            return Math.min(Math.sqrt(sum / this._tdOut.length) * 2, 1);
        } catch(e) { return 0; }
    }

    getOutputPeak() {
        if (!this.analyserOut) return 0;
        try {
            this.analyserOut.getFloatTimeDomainData(this._tdOut);
            let peak = 0;
            for (let i = 0; i < this._tdOut.length; i++) {
                const a = Math.abs(this._tdOut[i]);
                if (a > peak) peak = a;
            }
            return peak;
        } catch(e) { return 0; }
    }

    // ===== УПРАВЛЕНИЕ ПАРАМЕТРАМИ =====
    setInputGain(val) {
        this.state.inputGain = val;
        if (this.gainIn) {
            try { this.gainIn.gain.setTargetAtTime(val, this.ctx.currentTime, 0.02); } catch(e) {}
        }
        this.state.save();
    }

    setOutputGain(val) {
        this.state.outputGain = val;
        if (this.gainOut) {
            try { this.gainOut.gain.setTargetAtTime(val, this.ctx.currentTime, 0.02); } catch(e) {}
        }
        this.state.save();
    }

    setSoftClip(on) {
        this.state.softClip = on;
        this._rebuildChain();
        this.state.save();
    }

    setBypass(bypass) {
        this.state.bypassed = bypass;
        this.updateFilters(false);
        this.state.save();
    }

    // ===== A/B СРАВНЕНИЕ =====
    startABCompare(interval = 2000) {
        this.stopABCompare();
        this._abSavedSlot = this.state.activeSlot;
        this._abSavedBands = JSON.stringify(this.state.bands);
        this.state.slots[this.state.activeSlot] = this._abSavedBands;
        let toggleState = false;
        this._abInterval = setInterval(() => {
            toggleState = !toggleState;
            const newSlot = toggleState ? 'B' : 'A';
            this.state.activeSlot = newSlot;
            if (this.state.slots[newSlot]) {
                this.state.bands = JSON.parse(this.state.slots[newSlot]);
                let maxId = 0;
                for (const b of this.state.bands) if (b.id > maxId) maxId = b.id;
                this.state.nextId = maxId + 1;
                this.state.activeId = this.state.bands.length ? this.state.bands[0].id : null;
            } else {
                this.state.bands = [];
                this.state.activeId = null;
                this.state.nextId = 1;
            }
            this.state.history = [];
            this.state.historyIdx = -1;
            this.updateFilters(false);
            if (this._onPlayChange) this._onPlayChange('ab-switch', newSlot);
        }, interval);
        this.state.abCompare = true;
    }

    stopABCompare() {
        if (this._abInterval) {
            clearInterval(this._abInterval);
            this._abInterval = null;
        }
        if (this._abSavedBands) {
            this.state.activeSlot = this._abSavedSlot;
            this.state.bands = JSON.parse(this._abSavedBands);
            let maxId = 0;
            for (const b of this.state.bands) if (b.id > maxId) maxId = b.id;
            this.state.nextId = maxId + 1;
            this.state.activeId = this.state.bands.length ? this.state.bands[0].id : null;
            this._abSavedBands = null;
            this.updateFilters(false);
        }
        this.state.abCompare = false;
    }

    // ===== ЭКСПОРТ =====
    async exportProcessed(options = {}) {
        const { format = 'wav', bitrate = 192, onProgress, fileName = 'processed_audio' } = options;
        let buffer = this._fileBuffer || this._recordedBuffer;
        if (!buffer) throw new Error('No audio buffer loaded');

        const offlineCtx = new OfflineAudioContext(
            buffer.numberOfChannels,
            buffer.length,
            buffer.sampleRate
        );

        const source = offlineCtx.createBufferSource();
        source.buffer = buffer;

        // Копируем цепочку фильтров в offline-контекст
        const inGain = offlineCtx.createGain();
        inGain.gain.value = this.state.inputGain;
        source.connect(inGain);
        let node = inGain;

        const typeMap = {
            bell: 'peaking', lowshelf: 'lowshelf', highshelf: 'highshelf',
            lowcut: 'highpass', highcut: 'lowpass', notch: 'notch', bandpass: 'bandpass'
        };

        if (!this.state.bypassed) {
            for (const band of this.state.bands) {
                if (!this.state.isEffectivelyEnabled(band.id)) continue;
                // Упрощённая реализация для экспорта
                const mode = band.channelMode || 'stereo';
                const type = typeMap[band.type] || 'peaking';
                const freq = band.freq;
                const q = band.q;
                let gain = 0;
                if (mode === 'stereo') gain = band.gain || 0;
                else if (mode === 'mid') gain = band.midGain || 0;
                else if (mode === 'side') gain = band.sideGain || 0;
                else if (mode === 'left') gain = band.leftGain || 0;
                else if (mode === 'right') gain = band.rightGain || 0;
                if (BiquadMath.isGainlessType(band.type)) gain = 0;

                const f = offlineCtx.createBiquadFilter();
                f.type = type;
                f.frequency.value = freq;
                f.Q.value = q;
                f.gain.value = gain;
                node.connect(f);
                node = f;
            }
        }

        const outGain = offlineCtx.createGain();
        outGain.gain.value = this.state.outputGain;
        node.connect(outGain);
        node = outGain;

        if (this.state.autoGain) {
            const ag = offlineCtx.createGain();
            ag.gain.value = this._computeAutoGain();
            node.connect(ag);
            node = ag;
        }

        if (this.state.softClip) {
            const shaper = offlineCtx.createWaveShaper();
            shaper.curve = this._createSoftClipCurve();
            shaper.oversample = '4x';
            node.connect(shaper);
            node = shaper;
        }

        node.connect(offlineCtx.destination);
        source.start(0);

        const startTime = Date.now();
        const estimatedMs = buffer.length / buffer.sampleRate * 1000;
        const progressInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / estimatedMs, 0.95);
            if (onProgress) onProgress(progress);
        }, 100);

        const rendered = await offlineCtx.startRendering();
        clearInterval(progressInterval);
        if (onProgress) onProgress(1);

        let blob;
        if (format === 'mp3') {
            blob = await this._bufferToMp3(rendered, bitrate);
        } else {
            blob = this._bufferToWav(rendered);
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        return blob;
    }

    _bufferToWav(buffer) {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const length = buffer.length * numChannels * 2;
        const data = new ArrayBuffer(44 + length);
        const view = new DataView(data);
        const writeString = (view, offset, string) => {
            for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
        };
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + length, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numChannels * 2, true);
        view.setUint16(32, numChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, 'data');
        view.setUint32(40, length, true);

        const channelData = [];
        for (let ch = 0; ch < numChannels; ch++) channelData.push(buffer.getChannelData(ch));

        let offset = 44;
        for (let i = 0; i < buffer.length; i++) {
            for (let ch = 0; ch < numChannels; ch++) {
                const sample = Math.max(-1, Math.min(1, channelData[ch][i]));
                const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                view.setInt16(offset, int16, true);
                offset += 2;
            }
        }
        return new Blob([data], { type: 'audio/wav' });
    }

    async _bufferToMp3(buffer, bitrate = 192) {
        if (typeof lamejs === 'undefined') {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.all.min.js';
                script.crossOrigin = 'anonymous';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const encoder = new lamejs.Mp3Encoder(numChannels, sampleRate, bitrate);
        const channelData = [];
        for (let ch = 0; ch < numChannels; ch++) channelData.push(buffer.getChannelData(ch));
        const blockSize = 1152;
        const mp3Data = [];
        for (let i = 0; i < buffer.length; i += blockSize) {
            const end = Math.min(i + blockSize, buffer.length);
            const len = end - i;
            const samples = [];
            for (let ch = 0; ch < numChannels; ch++) {
                const channel = new Int16Array(len);
                const data = channelData[ch];
                for (let j = 0; j < len; j++) {
                    const s = Math.max(-1, Math.min(1, data[i + j]));
                    channel[j] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }
                samples.push(channel);
            }
            const mp3buf = numChannels === 1
                ? encoder.encodeBuffer(samples[0])
                : encoder.encodeBuffer(samples[0], samples[1]);
            if (mp3buf.length) mp3Data.push(mp3buf);
        }
        const endBuf = encoder.flush();
        if (endBuf.length) mp3Data.push(endBuf);
        return new Blob(mp3Data, { type: 'audio/mp3' });
    }

    getFrequencyBinCount() {
        return this.analyserOut ? this.analyserOut.frequencyBinCount : 0;
    }
}
