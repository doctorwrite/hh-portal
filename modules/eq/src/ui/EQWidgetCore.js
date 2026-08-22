// ================================================================
// EQ WIDGET CORE — основные методы (_render, _loop, _update)
// ================================================================

export default {
    init() {
        // Параметры графика
        this.L = 55;
        this.R = 875;
        this.T = 20;
        this.B = 365;
        this.VW = 900;
        this.VH = 400;
        this.FMIN = 20;
        this.FMAX = 20000;
        this.GMIN = -20;
        this.GMAX = 20;
        this.isMobile = window.innerWidth < 768;
        this.SPEC_STEPS = this.isMobile ? 30 : 80;
        
        // Состояние рендеринга
        this._dragId = null;
        this._dragMode = 'main';
        this._specFrameCounter = 0;
        this._lastSpecDecay = 0;
        this._peakHoldData = [];
        this._peakHoldTime = {};
        this._specFreqs = [];
        this._specLevels = [];
        this._dragRect = null;
        this._dragRectDirty = true;
        this._lastCommittedState = null;
        this._loopRunning = false;
        this._needsRender = true;
        this._lastFrameTime = 0;
        this._targetFps = this.isMobile ? 30 : 60;
        this._frameInterval = 1000 / this._targetFps;
        this._touchRafPending = false;
        this._seekDragging = false;
        this._abState = 'A';
        this._captureTimer = null;
        this._lastDynUpdate = 0;
        this._panelHandler = null;
        this._isDestroyed = false;
        
        // Колбэки
        this.state.onHistoryChange = () => {
            this._lastCommittedState = null;
            this._render();
            this._updateUndoRedo();
        };
        this.state.onSlotChange = () => {
            this.engine.updateFilters(false);
            this._render();
            this._updateUI();
        };
        this.state.onPresetLoad = () => {
            this.engine.updateFilters(false);
            this._render();
            this._buildPresetSelect();
        };
        this.state.onPresetSave = (name) => {
            this._buildPresetSelect();
            if (this.el.preset) this.el.preset.value = name;
            this._toast(`💾 Пресет "${name}" сохранён`);
        };
        this.state.onPresetDelete = () => {
            this._buildPresetSelect();
        };
        this.state.onReset = () => {
            this._lastCommittedState = null;
            this.engine.updateFilters(false);
            this._render();
            this._updateUndoRedo();
            this._buildPresetSelect();
        };

        // Колбэки движка
        this.engine._onPlayChange = (type, data) => {
            this._updateTransport();
            if (type === 'timeupdate') {
                if (!this._seekDragging) this._updateTimeline(data);
            }
            if (type === 'recorded') {
                this._toast('✅ Запись сохранена');
                this._enableRecorded();
            }
            if (type === 'recording') this._toast('🎤 Идёт запись...');
            if (type === 'recording-stopped') {
                const btn = this.container.querySelector('[data-a="recordMic"]');
                if (btn) btn.textContent = '🎙 Запись микрофона';
            }
            if (type === 'system-captured') this._toast('🔊 Системный звук активирован');
            if (type === 'ab-switch') {
                this._toast(`A/B: Слот ${data}`);
                this._render();
                this._updateUI();
                this._updateUndoRedo();
            }
            if (type === 'error') this._toast('❌ ' + data);
            if (type === 'ended') {
                const playBtn = this.el.play;
                if (playBtn) {
                    playBtn.textContent = '▶ Play';
                    playBtn.className = 'play-btn';
                }
            }
            if (type === 'capture-start') {
                const timer = this.container.querySelector('.source-timer');
                if (timer) {
                    timer.style.display = 'inline-block';
                    timer.textContent = '⏺ 0:00';
                }
                if (this._captureTimer) clearInterval(this._captureTimer);
                let seconds = 0;
                this._captureTimer = setInterval(() => {
                    seconds++;
                    const mins = Math.floor(seconds / 60);
                    const secs = seconds % 60;
                    const timerEl = this.container.querySelector('.source-timer');
                    if (timerEl) timerEl.textContent = `⏺ ${mins}:${secs.toString().padStart(2, '0')}`;
                }, 1000);
            }
            if (type === 'capture-stopping' || type === 'capture-done') {
                if (this._captureTimer) {
                    clearInterval(this._captureTimer);
                    this._captureTimer = null;
                }
                const timer = this.container.querySelector('.source-timer');
                if (timer) timer.style.display = 'none';
            }
            if (type === 'capture-done') {
                const buffer = data;
                if (buffer && buffer.length > 0) {
                    this.engine._buffer = buffer;
                    this.engine._fileBuffer = buffer;
                    this.engine._sourceType = 'recorded';
                    this._updateTransport();
                    const saveBtn = this.container.querySelector('[data-action="save-capture"]');
                    if (saveBtn) saveBtn.style.display = 'inline-block';
                    const duration = buffer.duration;
                    const minutes = Math.floor(duration / 60);
                    const seconds = Math.floor(duration % 60);
                    this._toast(`✅ Запись сохранена! Длительность: ${minutes}:${seconds.toString().padStart(2, '0')}`);
                } else {
                    this._toast('❌ Запись пуста или повреждена');
                }
            }
            this._updateTimelineVisibility();
        };
    },

    _render() {
        this._renderCurves();
        this._renderDots();
        this._renderBandPanel();
        this._checkClipping();
        this._updateUI();
        this._updateUndoRedo();
        this._needsRender = true;
        this._updateDynamicIndicators();
    },

    _startLoop() {
        if (this._loopRunning) return;
        this._loopRunning = true;
        this._loop();
    },

    _loop() {
        if (!this._loopRunning || this._isDestroyed) return;
        const now = performance.now();
        const delta = now - this._lastFrameTime;
        if (delta >= this._frameInterval) {
            this._lastFrameTime = now;
            this._updateVU();
            if (this.engine.isPlaying() && !this._seekDragging) {
                const time = this.engine.getCurrentTime();
                this._updateTimeline(time);
            }
            if (this.engine.isPlaying() || this._needsRender) {
                this._renderSpectrum();
                this._needsRender = false;
            } else {
                if (this._specFrameCounter > 0) {
                    this.cctx.clearRect(0, 0, this.VW, this.VH);
                    this._specFrameCounter = 0;
                    if (!this.state.peakHold) this._peakHoldData = [];
                }
            }
            this._updateDynamicIndicators();
        }
        requestAnimationFrame(() => this._loop());
    },

    _updateUI() {
        if (this._abState === 'A') {
            this.el.ab.textContent = 'A';
            this.el.ab.classList.remove('active-slot', 'ab-active');
        } else if (this._abState === 'B') {
            this.el.ab.textContent = 'B';
            this.el.ab.classList.add('active-slot');
            this.el.ab.classList.remove('ab-active');
        } else if (this._abState === 'AB') {
            this.el.ab.textContent = 'A/B';
            this.el.ab.classList.add('ab-active');
            this.el.ab.classList.remove('active-slot');
        }
        if (this.state.activeSlot === 'A') {
            this._abState = 'A';
        } else if (this.state.activeSlot === 'B') {
            this._abState = 'B';
        }
    },

    _updateUndoRedo() {
        this.el.undo.disabled = !this.state.canUndo();
        this.el.redo.disabled = !this.state.canRedo();
    },

    _applyTheme() {
        const isLight = this.state.theme === 'light';
        this.container.classList.toggle('light', isLight);
        if (this.el && this.el.theme) this.el.theme.textContent = isLight ? '☀' : '☽';
    },

    _enableRecorded() {
        const btn = document.getElementById('recordedBtn');
        if (btn) btn.style.display = 'inline-block';
    },

    _resetVolumeTo100(type) {
        if (type === 'in') {
            this.engine.setInputGain(1.0);
            this.el.inGain.value = 1.0;
            this.el.inGainVal.textContent = '100%';
        } else {
            this.engine.setOutputGain(1.0);
            this.el.outGain.value = 1.0;
            this.el.outGainVal.textContent = '100%';
        }
        this._toast('✅ Громкость 100%');
    },

    _updateTransport() {
        const btn = this.el.play;
        if (this.engine._isCapturing) {
            btn.textContent = '⏺ Запись...';
            btn.className = 'play-btn recording';
        } else if (this.engine.isPlaying()) {
            btn.textContent = '⏸ Пауза';
            btn.className = 'play-btn';
        } else if (this.engine.isPaused()) {
            btn.textContent = '▶ Play';
            btn.className = 'play-btn paused';
        } else {
            btn.textContent = '▶ Play';
            btn.className = 'play-btn';
        }
        this.el.bypass.classList.toggle('bypass-on', this.state.bypassed);
        this._updateTimelineVisibility();
    },

    _updateTimelineVisibility() {
        const src = this.engine._sourceType;
        const timeline = this.el.timeline;
        const demoRow = this.el.demoRow;
        if (src === 'demo') {
            timeline.classList.remove('visible');
            demoRow.classList.add('visible');
        } else if (src === 'system' || src === 'mic') {
            timeline.classList.add('visible');
            demoRow.classList.remove('visible');
            this.el.tltime.textContent = '∞ / ∞';
            this.el.tlfill.style.width = '0%';
            this.el.tlhead.style.left = '0%';
        } else if (src === 'file' || src === 'recorded') {
            timeline.classList.add('visible');
            demoRow.classList.remove('visible');
        } else {
            timeline.classList.remove('visible');
            demoRow.classList.remove('visible');
        }
    },

    _updateTimeline(time) {
        if (this._seekDragging) return;
        const dur = this.engine.getDuration();
        if (!dur || dur === Infinity || dur === 0) {
            const timeStr = this._formatTime(time);
            this.el.tltime.textContent = timeStr + ' / ∞';
            if (this.engine.isPlaying() && this.engine._sourceType === 'demo') {
                const pulse = (time % 2) / 2;
                this.el.tlfill.style.width = (pulse * 100) + '%';
                this.el.tlhead.style.left = (pulse * 100) + '%';
            } else {
                this.el.tlfill.style.width = '0%';
                this.el.tlhead.style.left = '0%';
            }
            return;
        }
        const ratio = Math.min(1, time / dur);
        const percent = (ratio * 100) + '%';
        this.el.tlfill.style.width = percent;
        this.el.tlhead.style.left = percent;
        this.el.tltime.textContent = this._formatTime(time) + ' / ' + this._formatTime(dur);
    },

    _checkClipping() {
        const peak = this.engine.getOutputPeak();
        this.el.vuOutClip.classList.toggle('on', peak >= 0.98);
        let maxGain = 0;
        for (let i = 0; i <= 100; i++) {
            const f = Math.pow(10, Math.log10(this.FMIN) + (i / 100) * (Math.log10(this.FMAX) - Math.log10(this.FMIN)));
            const g = this.engine.calcTotal(f);
            if (g > maxGain) maxGain = g;
        }
        this.el.vuInClip.classList.toggle('on', maxGain > 6 && this.state.inputGain > 0.8);
    },

    _updateDynamicIndicators() {
        const now = Date.now();
        if (now - this._lastDynUpdate < 200) return;
        this._lastDynUpdate = now;
        for (const dyn of this.engine._dynamicsControllers) {
            const reduction = dyn.controller.getReduction() || 0;
            const band = this.state.bands.find(b => b.id === dyn.bandId);
            if (!band) continue;
            const row = this.el.panel.querySelector(`.band-row[data-id="${band.id}"]`);
            if (!row) continue;
            const display = row.querySelector('.gr-display');
            if (display) {
                if (reduction > 0.5) {
                    display.textContent = `-${reduction.toFixed(1)}dB`;
                    display.className = 'gr-display active';
                    display.style.color = 'var(--dyn-reduction)';
                } else {
                    display.textContent = '○';
                    display.className = 'gr-display';
                    display.style.color = 'var(--text3)';
                    display.style.opacity = '0.5';
                }
            }
        }
    },

    // ================================================================
    // ===== ИСПРАВЛЕННЫЙ _commitBand (сохраняет channelMode) =====
    // ================================================================
    _commitBand(id) {
        const band = id !== undefined ? this.state.bands.find(b => b.id === id) : this.state.getActive();
        if (!band) return;
        const last = this._lastCommittedState;
        const changed = !last || last.id !== band.id ||
            Math.abs(band.freq - last.freq) > 1 ||
            Math.abs(band.gain - last.gain) > 0.1 ||
            Math.abs(band.q - last.q) > 0.05 ||
            Math.abs((band.midGain || 0) - (last.midGain || 0)) > 0.1 ||
            Math.abs((band.sideGain || 0) - (last.sideGain || 0)) > 0.1 ||
            Math.abs((band.leftGain || 0) - (last.leftGain || 0)) > 0.1 ||
            Math.abs((band.rightGain || 0) - (last.rightGain || 0)) > 0.1 ||
            // ===== ИСПРАВЛЕНИЕ: проверяем channelMode =====
            (band.channelMode || 'stereo') !== (last.channelMode || 'stereo');
        if (changed) {
            this.state.pushHistory();
            this.state.save();
            this._lastCommittedState = {
                id: band.id,
                freq: band.freq,
                gain: band.gain,
                q: band.q,
                midGain: band.midGain,
                sideGain: band.sideGain,
                leftGain: band.leftGain,
                rightGain: band.rightGain,
                // ===== ИСПРАВЛЕНИЕ: сохраняем channelMode =====
                channelMode: band.channelMode || 'stereo'
            };
            this._updateUndoRedo();
        }
    }
};