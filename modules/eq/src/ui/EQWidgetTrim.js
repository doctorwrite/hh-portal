// ================================================================
// EQ WIDGET TRIM — обрезка аудио
// ================================================================

export default {
    init() {
        this.trimMode = false;
        this.trimStart = 0;
        this.trimEnd = 1;
        this.isTrimDragging = false;
        this.trimDragType = null;
        this._trimDragRect = null;
    },

    _showTrimButtons() {
        if (this.el.trimApply) this.el.trimApply.style.display = 'inline-flex';
        if (this.el.trimCancel) this.el.trimCancel.style.display = 'inline-flex';
        if (this.el.trimToggle) {
            this.el.trimToggle.style.borderColor = 'rgba(245,197,66,0.4)';
            this.el.trimToggle.style.color = '#f5c542';
            this.el.trimToggle.style.background = 'rgba(245,197,66,0.1)';
        }
    },

    _hideTrimButtons() {
        if (this.el.trimApply) this.el.trimApply.style.display = 'none';
        if (this.el.trimCancel) this.el.trimCancel.style.display = 'none';
        if (this.el.trimToggle) {
            this.el.trimToggle.style.borderColor = 'rgba(74,158,255,0.3)';
            this.el.trimToggle.style.color = '#4a9eff';
            this.el.trimToggle.style.background = '';
        }
    },

    toggleTrimMode() {
        this.trimMode = !this.trimMode;
        const startMarker = this.el.trimStart;
        const endMarker = this.el.trimEnd;
        const region = this.el.trimRegion;
        const info = this.el.trimInfo;

        if (this.trimMode) {
            startMarker.classList.add('active');
            endMarker.classList.add('active');
            region.classList.add('active');
            info.classList.add('active');
            info.textContent = '🔵 Перетащите маркеры';
            this.trimStart = 0;
            this.trimEnd = 1;
            this._updateTrimMarkers();
            this._showTrimButtons();
            this._toast('✂️ Режим обрезки включён');
        } else {
            startMarker.classList.remove('active');
            endMarker.classList.remove('active');
            region.classList.remove('active');
            info.classList.remove('active');
            this._hideTrimButtons();
        }
    },

    _updateTrimMarkers() {
        const start = this.trimStart * 100;
        const end = this.trimEnd * 100;
        this.el.trimStart.style.left = start + '%';
        this.el.trimEnd.style.left = end + '%';
        this.el.trimRegion.style.left = start + '%';
        this.el.trimRegion.style.width = (end - start) + '%';
        const total = this.engine.getDuration() || 0;
        const selDuration = (this.trimEnd - this.trimStart) * total;
        this.el.trimInfo.textContent = `✂️ ${this._formatTime(selDuration)} выделено`;
    },

    applyTrim() {
        if (!this.engine._buffer) {
            this._toast('❌ Сначала загрузите файл');
            return;
        }
        if (this.trimStart >= this.trimEnd) {
            this._toast('❌ Начало не может быть позже конца');
            return;
        }
        this._saveEffectState();
        const buffer = this.engine._buffer;
        const startSample = Math.floor(this.trimStart * buffer.length);
        const endSample = Math.floor(this.trimEnd * buffer.length);
        const newLength = endSample - startSample;
        if (newLength <= 0) {
            this._toast('❌ Слишком маленькая область');
            return;
        }
        const newBuffer = this.engine.ctx.createBuffer(
            buffer.numberOfChannels,
            newLength,
            buffer.sampleRate
        );
        for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
            const src = buffer.getChannelData(ch);
            const dst = newBuffer.getChannelData(ch);
            for (let i = 0; i < newLength; i++) {
                dst[i] = src[startSample + i];
            }
        }
        this.engine._buffer = newBuffer;
        this.engine._fileBuffer = newBuffer;
        this.engine._duration = newBuffer.duration;
        this._render();
        this._updateTimeline(0);
        this._updateTimelineVisibility();
        this.toggleTrimMode();
        this._toast(`✅ Обрезано! ${newBuffer.duration.toFixed(2)}с`);
    }
};