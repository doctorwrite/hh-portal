// ================================================================
// DYNAMIC EQ CONTROLLER — динамическое управление полосой
// ================================================================

export default class DynamicEQController {
    constructor(ctx, filter, bandId, state, options = {}) {
        this.ctx = ctx;
        this.filter = filter;
        this.bandId = bandId;
        this.state = state;
        this.running = true;
        this._frameId = null;
        this.threshold = options.threshold ?? -20;
        this.ratio = options.ratio ?? 4;
        this.attack = options.attack ?? 0.01;
        this.release = options.release ?? 0.1;
        this._currentReduction = 0;
        this._rms = -60;
        this._lastUpdate = ctx ? ctx.currentTime : 0;
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.value = 1.0;
        this.gainNodes = [this.gainNode];
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.6;
        this._data = new Float32Array(this.analyser.fftSize);
        this._tap = this.ctx.createGain();
        this._tap.gain.value = 1;
        if (this.filter) {
            try {
                this.filter.connect(this._tap);
                this._tap.connect(this.analyser);
            } catch(e) {}
        }
        this._startLoop();
    }

    setGainNodes(nodes) {
        this.gainNodes = Array.isArray(nodes) ? nodes : [nodes];
        if (this.gainNodes.length) this.gainNode = this.gainNodes[0];
    }

    _startLoop() {
        if (this._frameId) cancelAnimationFrame(this._frameId);
        this._loop();
    }

    _loop() {
        if (!this.running || !this.ctx) {
            this._frameId = null;
            return;
        }
        try {
            const now = this.ctx.currentTime;
            if (now - this._lastUpdate >= 0.05) {
                this._updateGain(now);
                this._lastUpdate = now;
            }
        } catch(e) {}
        this._frameId = requestAnimationFrame(() => this._loop());
    }

    _updateGain(now) {
        try {
            this.analyser.getFloatTimeDomainData(this._data);
            let sum = 0;
            for (let i = 0; i < this._data.length; i++) {
                sum += this._data[i] * this._data[i];
            }
            const rms = Math.sqrt(sum / this._data.length);
            this._rms = 20 * Math.log10(Math.max(rms, 1e-10));
            
            let reduction = 0;
            if (this._rms > this.threshold) {
                reduction = (this._rms - this.threshold) * (1 - 1 / Math.max(1, this.ratio));
            }
            reduction = Math.min(reduction, 20);
            
            const dt = 0.05;
            const tau = reduction > this._currentReduction
                ? Math.max(0.003, this.attack)
                : Math.max(0.01, this.release);
            const factor = 1 - Math.exp(-dt / tau);
            this._currentReduction += (reduction - this._currentReduction) * factor;
            if (this._currentReduction < 0.01) this._currentReduction = 0;
            
            const gainValue = Math.pow(10, -this._currentReduction / 20);
            for (const gn of this.gainNodes) {
                if (gn) {
                    try {
                        gn.gain.setTargetAtTime(gainValue, now, 0.02);
                    } catch(e) {}
                }
            }
        } catch(e) {}
    }

    getReduction() {
        return this._currentReduction || 0;
    }

    getRmsDb() {
        return this._rms;
    }

    getGainNode() {
        return this.gainNode;
    }

    updateParams(params) {
        if (params.threshold !== undefined) this.threshold = params.threshold;
        if (params.ratio !== undefined) this.ratio = params.ratio;
        if (params.attack !== undefined) this.attack = params.attack;
        if (params.release !== undefined) this.release = params.release;
    }

    // ===== ОСНОВНОЕ ИСПРАВЛЕНИЕ: Полное уничтожение =====
    destroy() {
        // Останавливаем анимационный цикл
        this.running = false;
        if (this._frameId) {
            cancelAnimationFrame(this._frameId);
            this._frameId = null;
        }

        // Отключаем все узлы
        try {
            if (this._tap) {
                this._tap.disconnect();
                this._tap = null;
            }
            if (this.analyser) {
                this.analyser.disconnect();
                this.analyser = null;
            }
            if (this.gainNode) {
                this.gainNode.disconnect();
                this.gainNode = null;
            }
        } catch(e) {}

        // Очищаем массивы
        this.gainNodes = [];
        this._data = null;
        
        // Обнуляем ссылки
        this.filter = null;
        this.ctx = null;
        this.state = null;
    }
}