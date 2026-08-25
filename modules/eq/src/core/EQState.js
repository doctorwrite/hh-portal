// ================================================================
// EQ STATE — состояние эквалайзера (полосы, история, пресеты, слоты)
// ================================================================

export default class EQState {
    constructor(options = {}) {
    this.maxBands = options.maxBands || 8;
    this.bands = [];
    this.activeId = null;
    this.nextId = 1;
    this.history = [];
    this.historyIdx = -1;
    this.slots = { A: null, B: null };
    this.activeSlot = 'A';
    this.bypassed = false;
    this.inputGain = 1.0;
    this.outputGain = 1.0;
    this.softClip = false;
    this.theme = options.theme || 'dark';
    this._storageKey = options.storageKey || 'hheq_pro';
    this.resetOnLoad = options.resetOnLoad !== undefined ? options.resetOnLoad : false;
    this.midSide = false;
    this.linearPhase = false;
    this.peakHold = false;
    this.peakHoldDuration = 2.0;
    this.autoGain = false;
    this.showSpectrogram = false;
    this.deltaMode = false;
    this.abCompare = false;
    this.presets = {};
    this._callbacks = {
        onHistoryChange: null,
        onSlotChange: null,
        onPresetLoad: null,
        onPresetSave: null,
        onPresetDelete: null,
        onReset: null
    };
    this._loadPresets();
    this.filterTypes = {
        bell: 'Bell',
        lowshelf: 'LowSh',
        highshelf: 'HiSh',
        lowcut: 'L-Cut',
        highcut: 'H-Cut',
        notch: 'Notch',
        bandpass: 'Band'
    };
    this.channelModes = {
        'stereo': 'Stereo',
        'mid': 'Mid',
        'side': 'Side',
        'left': 'Left',
        'right': 'Right'
    };
    this.colors = ['#f5c542', '#4a9eff', '#50c878', '#ff6b6b', '#c77dff', '#ff8c42', '#00d4ff', '#ff69b4'];
    
    // ===== ИСПРАВЛЕНИЕ: Всегда сбрасываем настройки при загрузке =====
    this.resetToDefault();
    this._loadFromUrl();
}
    // ===== ЗАГРУЗКА ПРЕСЕТОВ С ОБРАБОТКОЙ ОШИБОК (исправлено) =====
    _loadPresets() {
        try {
            const saved = localStorage.getItem(this._storageKey + '_presets');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && typeof parsed === 'object') {
                    this.presets = parsed;
                }
            }
        } catch(e) {
            // Если данные повреждены — сбрасываем
            console.warn('Presets load error, resetting to defaults:', e);
            this.presets = {};
        }

        // Если пресетов нет — создаём дефолтные
        if (!this.presets || Object.keys(this.presets).length === 0 || !this.presets.Flat) {
            this.presets = {
                'Flat': [],
                'Voice': [
                    { type: 'lowcut', freq: 80, gain: 0, q: 0.7 },
                    { type: 'bell', freq: 250, gain: -3, q: 1.2 },
                    { type: 'bell', freq: 2500, gain: 5, q: 1.2 }
                ],
                'Bass Boost': [{ type: 'lowshelf', freq: 100, gain: 8, q: 0.7 }],
                'Treble Boost': [{ type: 'highshelf', freq: 5000, gain: 6, q: 0.7 }],
                'Rock': [
                    { type: 'lowshelf', freq: 80, gain: 5, q: 0.7 },
                    { type: 'bell', freq: 250, gain: -2, q: 1 },
                    { type: 'bell', freq: 4000, gain: 3, q: 1 },
                    { type: 'highshelf', freq: 8000, gain: 5, q: 0.7 }
                ],
                'Pop': [
                    { type: 'bell', freq: 150, gain: 3, q: 1 },
                    { type: 'bell', freq: 500, gain: 2, q: 1 },
                    { type: 'bell', freq: 2500, gain: 4, q: 1 }
                ],
                'Jazz': [
                    { type: 'bell', freq: 100, gain: 3, q: 0.8 },
                    { type: 'bell', freq: 800, gain: -1, q: 1 },
                    { type: 'bell', freq: 5000, gain: 2, q: 1 }
                ],
                'Mastering': [
                    { type: 'lowcut', freq: 30, gain: 0, q: 0.7 },
                    { type: 'bell', freq: 100, gain: 1.5, q: 0.8 },
                    { type: 'bell', freq: 3000, gain: 2, q: 1.2 },
                    { type: 'highshelf', freq: 10000, gain: 1.5, q: 0.7 }
                ]
            };
            this._savePresets();
        }
    }

    _savePresets() {
        try {
            localStorage.setItem(this._storageKey + '_presets', JSON.stringify(this.presets));
        } catch(e) {}
    }

    _loadFromUrl() {
        try {
            const hash = window.location.hash.slice(1);
            if (hash.startsWith('preset=')) {
                const encoded = hash.slice(7);
                const decoded = decodeURIComponent(escape(atob(encoded)));
                const data = JSON.parse(decoded);
                this.bands = [];
                this.activeId = null;
                for (const d of data) {
                    this.addBand(d);
                }
                if (this.bands.length) this.activeId = this.bands[0].id;
            }
        } catch(e) {}
    }

    resetToDefault() {
        this.bands = [];
        this.activeId = null;
        this.nextId = 1;
        this.history = [];
        this.historyIdx = -1;
        this.slots = { A: null, B: null };
        this.activeSlot = 'A';
        this.bypassed = false;
        this.inputGain = 1.0;
        this.outputGain = 1.0;
        this.softClip = false;
        this.peakHold = false;
        this.autoGain = false;
        this.deltaMode = false;
        this.addBand({ type: 'bell', freq: 1000, gain: 0, q: 1 });
        this.history = [];
        this.historyIdx = -1;
        this.save();
        if (this._callbacks.onReset) this._callbacks.onReset();
    }

    // ===== УПРАВЛЕНИЕ ПОЛОСАМИ =====
    addBand(o = {}) {
        if (this.bands.length >= this.maxBands) return null;
        const band = {
            id: this.nextId++,
            type: o.type || 'bell',
            freq: o.freq || 1000,
            gain: o.gain !== undefined ? o.gain : 0,
            q: o.q || 1,
            enabled: o.enabled !== undefined ? o.enabled : true,
            color: this.colors[this.bands.length % this.colors.length],
            muted: false,
            solo: false,
            channelMode: o.channelMode || 'stereo',
            midGain: o.midGain || 0,
            sideGain: o.sideGain || 0,
            leftGain: o.leftGain || 0,
            rightGain: o.rightGain || 0,
            dynamic: o.dynamic ? JSON.parse(JSON.stringify(o.dynamic)) : {
                enabled: false,
                threshold: -20,
                ratio: 4,
                attack: 10,
                release: 100
            },
            _balance: 0
        };
        this.bands.push(band);
        this.activeId = band.id;
        this.pushHistory();
        this.save();
        return band;
    }

    updateBand(id, updates) {
        const band = this.bands.find(b => b.id === id);
        if (!band) return false;
        Object.assign(band, updates);
        this.pushHistory();
        this.save();
        return true;
    }

    updateBandLive(id, updates) {
        const band = this.bands.find(b => b.id === id);
        if (!band) return false;
        Object.assign(band, updates);
        this.save();
        return true;
    }

    deleteBand(id) {
        this.bands = this.bands.filter(b => b.id !== id);
        if (this.activeId === id) {
            this.activeId = this.bands.length ? this.bands[0].id : null;
        }
        this.pushHistory();
        this.save();
    }

    getActive() {
        return this.bands.find(b => b.id === this.activeId) || null;
    }

    setActive(id) {
        if (this.bands.some(b => b.id === id)) {
            this.activeId = id;
        }
    }

    toggleBand(id) {
        const band = this.bands.find(b => b.id === id);
        if (band) {
            band.enabled = !band.enabled;
            this.pushHistory();
            this.save();
            return true;
        }
        return false;
    }

    muteBand(id) {
        const band = this.bands.find(b => b.id === id);
        if (band) {
            band.muted = !band.muted;
            this.pushHistory();
            this.save();
            return true;
        }
        return false;
    }

    soloBand(id) {
        const band = this.bands.find(b => b.id === id);
        if (!band) return false;
        const wasSolo = band.solo;
        for (const b of this.bands) b.solo = false;
        if (!wasSolo) band.solo = true;
        this.pushHistory();
        this.save();
        return true;
    }

    isEffectivelyEnabled(id) {
        const band = this.bands.find(b => b.id === id);
        if (!band) return false;
        if (band.muted) return false;
        const anySolo = this.bands.some(b => b.solo);
        if (anySolo) return band.solo;
        return band.enabled;
    }

    duplicateBand(id) {
        const band = this.bands.find(b => b.id === id);
        if (band && this.bands.length < this.maxBands) {
            return this.addBand({
                type: band.type,
                freq: Math.min(band.freq * 1.5, 20000),
                gain: band.gain,
                q: band.q,
                channelMode: band.channelMode,
                midGain: band.midGain,
                sideGain: band.sideGain,
                leftGain: band.leftGain,
                rightGain: band.rightGain,
                dynamic: JSON.parse(JSON.stringify(band.dynamic))
            });
        }
        return null;
    }

    resetBand(id) {
        const band = this.bands.find(b => b.id === id);
        if (band) {
            band.gain = 0;
            band.q = 1;
            band.midGain = 0;
            band.sideGain = 0;
            band.leftGain = 0;
            band.rightGain = 0;
            this.pushHistory();
            this.save();
            return true;
        }
        return false;
    }

    invertGain(id) {
        const band = this.bands.find(b => b.id === id);
        if (band) {
            band.gain = -band.gain;
            this.pushHistory();
            this.save();
            return true;
        }
        return false;
    }

    // ===== ИСТОРИЯ =====
    pushHistory() {
        this.history = this.history.slice(0, this.historyIdx + 1);
        this.history.push(JSON.stringify(this.bands));
        if (this.history.length > 50) this.history.shift();
        this.historyIdx = this.history.length - 1;
    }

    undo() {
        if (this.historyIdx > 0) {
            this.historyIdx--;
            this.bands = JSON.parse(this.history[this.historyIdx]);
            this.activeId = this.bands.length ? this.bands[0].id : null;
            let maxId = 0;
            for (const b of this.bands) if (b.id > maxId) maxId = b.id;
            this.nextId = maxId + 1;
            this.save();
            if (this._callbacks.onHistoryChange) this._callbacks.onHistoryChange();
            return true;
        }
        return false;
    }

    redo() {
        if (this.historyIdx < this.history.length - 1) {
            this.historyIdx++;
            this.bands = JSON.parse(this.history[this.historyIdx]);
            this.activeId = this.bands.length ? this.bands[0].id : null;
            let maxId = 0;
            for (const b of this.bands) if (b.id > maxId) maxId = b.id;
            this.nextId = maxId + 1;
            this.save();
            if (this._callbacks.onHistoryChange) this._callbacks.onHistoryChange();
            return true;
        }
        return false;
    }

    canUndo() { return this.historyIdx > 0; }
    canRedo() { return this.historyIdx < this.history.length - 1; }

    // ===== ПРЕСЕТЫ =====
    loadPreset(name) {
        if (!this.presets[name]) return false;
        this.pushHistory();
        this.bands = [];
        this.activeId = null;
        this.nextId = 1;
        for (const data of this.presets[name]) {
            this.addBand(data);
        }
        if (this.bands.length) this.activeId = this.bands[0].id;
        this.save();
        if (this._callbacks.onPresetLoad) this._callbacks.onPresetLoad();
        return true;
    }

    savePreset(name) {
        const data = this.bands.map(b => ({
            type: b.type,
            freq: b.freq,
            gain: b.gain,
            q: b.q,
            channelMode: b.channelMode || 'stereo',
            midGain: b.midGain || 0,
            sideGain: b.sideGain || 0,
            leftGain: b.leftGain || 0,
            rightGain: b.rightGain || 0,
            dynamic: b.dynamic ? {
                enabled: b.dynamic.enabled,
                threshold: b.dynamic.threshold,
                ratio: b.dynamic.ratio,
                attack: b.dynamic.attack,
                release: b.dynamic.release
            } : undefined
        }));
        this.presets[name] = data;
        this._savePresets();
        if (this._callbacks.onPresetSave) this._callbacks.onPresetSave(name);
    }

    deletePreset(name) {
        if (name === 'Flat') return false;
        delete this.presets[name];
        this._savePresets();
        if (this._callbacks.onPresetDelete) this._callbacks.onPresetDelete(name);
        return true;
    }

    getPresetNames() { return Object.keys(this.presets); }

    // ===== СЛОТЫ =====
    switchSlot(slot) {
        if (slot === this.activeSlot) return;
        this.slots[this.activeSlot] = JSON.stringify(this.bands);
        this.activeSlot = slot;
        if (this.slots[slot]) {
            this.bands = JSON.parse(this.slots[slot]);
            let maxId = 0;
            for (const b of this.bands) if (b.id > maxId) maxId = b.id;
            this.nextId = maxId + 1;
            this.activeId = this.bands.length ? this.bands[0].id : null;
        } else {
            this.bands = [];
            this.activeId = null;
            this.nextId = 1;
        }
        this.history = [];
        this.historyIdx = -1;
        this.save();
        if (this._callbacks.onSlotChange) this._callbacks.onSlotChange();
    }

    // ===== СОХРАНЕНИЕ/ЗАГРУЗКА (с исправлением ошибки 1) =====
    save() {
        try {
            localStorage.setItem(this._storageKey, JSON.stringify({
                bands: this.bands,
                activeId: this.activeId,
                nextId: this.nextId,
                slots: this.slots,
                activeSlot: this.activeSlot,
                inputGain: this.inputGain,
                outputGain: this.outputGain,
                softClip: this.softClip,
                theme: this.theme,
                midSide: this.midSide,
                linearPhase: this.linearPhase,
                autoGain: this.autoGain,
                showSpectrogram: this.showSpectrogram,
                peakHold: this.peakHold,
                peakHoldDuration: this.peakHoldDuration,
                deltaMode: this.deltaMode
            }));
        } catch(e) {}
    }

    // ===== ОСНОВНОЕ ИСПРАВЛЕНИЕ 1: Проверка band.dynamic при восстановлении =====
    restore() {
        try {
            const raw = localStorage.getItem(this._storageKey);
            if (!raw) return false;
            const data = JSON.parse(raw);
            
            this.bands = data.bands || [];
            
            // Восстанавливаем каждую полосу с проверкой всех полей
            for (const b of this.bands) {
                // Устанавливаем значения по умолчанию для отсутствующих полей
                if (b.muted === undefined) b.muted = false;
                if (b.solo === undefined) b.solo = false;
                if (b.channelMode === undefined) b.channelMode = 'stereo';
                if (b.midGain === undefined) b.midGain = 0;
                if (b.sideGain === undefined) b.sideGain = 0;
                if (b.leftGain === undefined) b.leftGain = 0;
                if (b.rightGain === undefined) b.rightGain = 0;
                if (b._balance === undefined) b._balance = 0;
                
                // ===== ИСПРАВЛЕНИЕ: Проверка dynamic =====
                if (!b.dynamic || typeof b.dynamic !== 'object') {
                    b.dynamic = {
                        enabled: false,
                        threshold: -20,
                        ratio: 4,
                        attack: 10,
                        release: 100
                    };
                }
                // Проверяем каждое поле dynamic
                if (b.dynamic.enabled === undefined) b.dynamic.enabled = false;
                if (b.dynamic.threshold === undefined) b.dynamic.threshold = -20;
                if (b.dynamic.ratio === undefined) b.dynamic.ratio = 4;
                if (b.dynamic.attack === undefined) b.dynamic.attack = 10;
                if (b.dynamic.release === undefined) b.dynamic.release = 100;

                // Исправляем старые режимы (mid_link и lr_link удалены)
                if (b.channelMode === 'mid_link' || b.channelMode === 'lr_link') {
                    b.channelMode = 'stereo';
                }
            }

            this.activeId = data.activeId || null;
            this.nextId = data.nextId || 1;
            this.slots = data.slots || { A: null, B: null };
            this.activeSlot = data.activeSlot || 'A';
            this.inputGain = data.inputGain !== undefined ? data.inputGain : 1.0;
            this.outputGain = data.outputGain !== undefined ? data.outputGain : 1.0;
            this.softClip = data.softClip || false;
            this.theme = data.theme || 'dark';
            this.midSide = data.midSide || false;
            this.linearPhase = data.linearPhase || false;
            this.autoGain = data.autoGain || false;
            this.showSpectrogram = data.showSpectrogram || false;
            this.peakHold = data.peakHold || false;
            this.peakHoldDuration = data.peakHoldDuration || 2.0;
            this.deltaMode = data.deltaMode || false;
            
            return true;
        } catch(e) {
            console.warn('Restore error, using defaults:', e);
            return false;
        }
    }

    reset() {
        this.bands = [];
        this.activeId = null;
        this.nextId = 1;
        this.history = [];
        this.historyIdx = -1;
        this.slots = { A: null, B: null };
        this.activeSlot = 'A';
        this.inputGain = 1.0;
        this.outputGain = 1.0;
        this.softClip = false;
        this.midSide = false;
        this.linearPhase = false;
        this.peakHold = false;
        this.autoGain = false;
        this.deltaMode = false;
        this.save();
    }

    // ===== КОЛБЭКИ =====
    set onHistoryChange(cb) { this._callbacks.onHistoryChange = cb; }
    set onSlotChange(cb) { this._callbacks.onSlotChange = cb; }
    set onPresetLoad(cb) { this._callbacks.onPresetLoad = cb; }
    set onPresetSave(cb) { this._callbacks.onPresetSave = cb; }
    set onPresetDelete(cb) { this._callbacks.onPresetDelete = cb; }
    set onReset(cb) { this._callbacks.onReset = cb; }
}
