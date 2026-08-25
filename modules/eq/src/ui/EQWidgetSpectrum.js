// ================================================================
// EQ WIDGET SPECTRUM — спектр и VU-метры
// ================================================================

export default {
    init() {},

    _renderSpectrum() {
        this._specFrameCounter++;
        if (this.isMobile && this._specFrameCounter % 4 !== 0) return;
        const c = this.cctx;
        c.clearRect(0, 0, this.VW, this.VH);
        if (!this.engine.isPlaying()) return;
        const steps = this.SPEC_STEPS;
        const levels = [];
        this._specFreqs = [];
        const data = this.engine.getFrequencyData();
        if (!data) return;
        const nyq = this.engine.ctx.sampleRate / 2;
        for (let i = 0; i <= steps; i++) {
            const f = Math.pow(10, Math.log10(this.FMIN) + (i / steps) * (Math.log10(this.FMAX) - Math.log10(this.FMIN)));
            this._specFreqs.push(f);
            const bin = Math.floor((f / nyq) * data.length);
            levels.push(bin < data.length ? data[bin] / 255 : 0);
        }
        this._specLevels = levels;
        const eqLv = levels;
        const now = Date.now();
        const dt = this._lastSpecDecay ? Math.min(0.1, (now - this._lastSpecDecay) / 1000) : 0.016;
        this._lastSpecDecay = now;
        if (this.state.peakHold) {
            for (let i = 0; i <= steps; i++) {
                if (!this._peakHoldData[i] || eqLv[i] > this._peakHoldData[i]) {
                    this._peakHoldData[i] = eqLv[i];
                    this._peakHoldTime[i] = now;
                }
            }
            for (let i = 0; i <= steps; i++) {
                if (this._peakHoldData[i] && (now - this._peakHoldTime[i]) > this.state.peakHoldDuration * 1000) {
                    this._peakHoldData[i] *= Math.exp(-dt / 1.8);
                    if (this._peakHoldData[i] < 0.01) this._peakHoldData[i] = 0;
                }
            }
        } else {
            for (let i = 0; i <= steps; i++) {
                if (eqLv[i] > (this._peakHoldData[i] || 0)) this._peakHoldData[i] = eqLv[i];
            }
            for (let i = 0; i <= steps; i++) {
                if (this._peakHoldData[i]) {
                    this._peakHoldData[i] *= Math.exp(-dt / 3.0);
                    if (this._peakHoldData[i] < 0.01) this._peakHoldData[i] = 0;
                }
            }
        }
        const maxLv = Math.max(0.15, Math.max(...eqLv)) * 1.15;
        const bw = (this.R - this.L) / steps;
        if (this.isMobile) {
            c.fillStyle = 'rgba(74,158,255,.6)';
            for (let i = 0; i <= steps; i++) {
                const x = this._fToX(this._specFreqs[i]);
                const h = (eqLv[i] / maxLv) * (this.B - this.T) * 0.85;
                c.fillRect(x - bw * 0.375, this.B - h, bw * 0.75, Math.max(h, 0));
            }
        } else {
            const grad = c.createLinearGradient(0, this.B, 0, this.T);
            grad.addColorStop(0, 'rgba(26,58,106,.85)');
            grad.addColorStop(0.4, 'rgba(42,122,191,.8)');
            grad.addColorStop(0.75, 'rgba(80,200,120,.75)');
            grad.addColorStop(1, 'rgba(245,197,66,.85)');
            for (let i = 0; i <= steps; i++) {
                const x = this._fToX(this._specFreqs[i]);
                const h = (eqLv[i] / maxLv) * (this.B - this.T) * 0.85;
                c.fillStyle = grad;
                c.globalAlpha = 0.8;
                c.fillRect(x - bw * 0.375, this.B - h, bw * 0.75, Math.max(h, 0));
            }
            c.globalAlpha = 1;
        }
        if (this.state.peakHold) {
            c.strokeStyle = 'rgba(245,197,66,.7)';
            c.lineWidth = 2;
            c.setLineDash([4, 4]);
            c.beginPath();
            for (let i = 0; i <= steps; i++) {
                const px = this._fToX(this._specFreqs[i]);
                const py = this.B - ((this._peakHoldData[i] || 0) / maxLv) * (this.B - this.T) * 0.85;
                if (i === 0) c.moveTo(px, py);
                else c.lineTo(px, py);
            }
            c.stroke();
            c.setLineDash([]);
        } else {
            c.strokeStyle = 'rgba(74,158,255,.4)';
            c.lineWidth = 1;
            c.beginPath();
            for (let i = 0; i <= steps; i++) {
                const px = this._fToX(this._specFreqs[i]);
                const py = this.B - ((this._peakHoldData[i] || 0) / maxLv) * (this.B - this.T) * 0.85;
                if (i === 0) c.moveTo(px, py);
                else c.lineTo(px, py);
            }
            c.stroke();
        }
    },

    _updateVU() {
        const inLevel = this.engine.getInputLevel();
        const outLevel = this.engine.getOutputLevel();
        this.el.vuInFill.style.height = (inLevel * 100) + '%';
        this.el.vuOutFill.style.height = (outLevel * 100) + '%';
    }
};