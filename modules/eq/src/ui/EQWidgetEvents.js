// ================================================================
// EQ WIDGET EVENTS — обработка событий (мышь, тач, клавиатура)
// ================================================================

export default {
    init() {},

    _bindEvents() {
        const self = this;
        const svg = this.el.svg;
        const tooltip = this.el.tooltip;
        const wrap = this.el.inner;

        // ==== МЕНЮ ЭФФЕКТОВ ====
        if (this.el.effectsToggle) {
            this.el.effectsToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.el.effectsMenu.classList.toggle('open');
                this.el.effectsToggle.classList.toggle('active');
            });
        }
        document.addEventListener('click', (e) => {
            if (this.el.effectsMenu && !e.target.closest('.effects-dropdown') && this.el.effectsMenu.classList.contains('open')) {
                this.el.effectsMenu.classList.remove('open');
                this.el.effectsToggle.classList.remove('active');
            }
        });
        if (this.el.effectsMenu) {
            this.el.effectsMenu.querySelectorAll('[data-action]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.dataset.action;
                    this.el.effectsMenu.classList.remove('open');
                    this.el.effectsToggle.classList.remove('active');
                    switch (action) {
                        case 'trim':
                            this.toggleTrimMode();
                            break;
                        case 'fade':
                            this._showEffectModal('fade');
                            break;
                        case 'normalize':
                            this._showEffectModal('normalize');
                            break;
                        case 'reverse':
                            this._showEffectModal('reverse');
                            break;
                        case 'speed':
                            this._showEffectModal('speed');
                            break;
                        case 'undoFx':
                            this._undoEffect();
                            break;
                        case 'redoFx':
                            this._redoEffect();
                            break;
                        case 'resetFx':
                            if (confirm('Сбросить все эффекты? Операцию нельзя будет отменить.')) {
                                this._resetEffects();
                            }
                            break;
                    }
                });
            });
        }

        // ==== КНОПКИ ОБРЕЗКИ ====
        if (this.el.trimApply) {
            this.el.trimApply.addEventListener('click', () => {
                this.applyTrim();
            });
        }
        if (this.el.trimCancel) {
            this.el.trimCancel.addEventListener('click', () => {
                this.trimStart = 0;
                this.trimEnd = 1;
                this._updateTrimMarkers();
                this.toggleTrimMode();
                this._toast('✕ Отменено');
            });
        }

        // ==== ГРАФИК ====
        this.el.inVolItem.addEventListener('dblclick', () => this._resetVolumeTo100('in'));
        this.el.outVolItem.addEventListener('dblclick', () => this._resetVolumeTo100('out'));

        svg.addEventListener('contextmenu', (e) => e.preventDefault());
        svg.addEventListener('mousedown', (e) => {
            self._dragRect = svg.getBoundingClientRect();
            self._dragRectDirty = false;
            const bid = self._bandFromTarget(e.target);
            const pos = self._getPos(e);
            if (bid !== null) {
                self._dragId = bid;
                self.state.setActive(bid);
                const target = e.target;
                if (target.classList && target.classList.contains('dot-hit')) {
                    self._dragMode = target.dataset.channel || 'main';
                } else {
                    self._dragMode = 'main';
                }
                self._render();
                e.preventDefault();
                return;
            }
            if (pos.x >= self.L && pos.x <= self.R && pos.y >= self.T && pos.y <= self.B) {
                const freq = self._xToF(pos.x);
                const gain = Math.max(self.GMIN, Math.min(self.GMAX, self._yToDb(pos.y)));
                const newBand = self.state.addBand({ freq, gain, type: 'bell' });
                if (newBand) {
                    self._dragId = newBand.id;
                    self._dragMode = 'main';
                    self.engine.updateFilters(false);
                    self._render();
                    self._updateUndoRedo();
                }
                e.preventDefault();
            }
        });
        
        window.addEventListener('mousemove', (e) => {
            if (self._dragId !== null) {
                const pos = self._getPos(e);
                const band = self.state.bands.find(b => b.id === self._dragId);
                if (!band) return;
                const gain = Math.max(self.GMIN, Math.min(self.GMAX, self._yToDb(pos.y)));
                const freq = Math.max(self.FMIN, Math.min(self.FMAX, self._xToF(pos.x)));
                const mode = band.channelMode || 'stereo';
                const gainless = self._isGainless(band.type);
                
                const currentType = band.type || 'bell';
                const updates = { freq, type: currentType };
                
                if (gainless) {
                } else {
                    if (mode === 'stereo') updates.gain = gain;
                    else if (mode === 'mid') updates.midGain = gain;
                    else if (mode === 'side') updates.sideGain = gain;
                    else if (mode === 'left') updates.leftGain = gain;
                    else if (mode === 'right') updates.rightGain = gain;
                }
                
                self.state.updateBandLive(self._dragId, updates);
                self.engine.updateFilters();
                self._updateDotLive(self._dragId);
                self._renderCurves();
                self._updateBandRowValues(self._dragId);
                self._checkClipping();
                self._needsRender = true;
                const ft = band.freq >= 1000 ? (band.freq / 1000).toFixed(1) + 'k' : Math.round(band.freq);
                const g = gainless ? 0 : gain;
                tooltip.textContent = `${ft} Hz · ${g.toFixed(1)} dB · Q ${band.q.toFixed(1)} · ${band.type}`;
                tooltip.style.display = 'block';
                const r = wrap.getBoundingClientRect();
                tooltip.style.left = ((self._fToX(band.freq) / self.VW) * r.width + 12) + 'px';
                tooltip.style.top = ((self._dbToY(g) / self.VH) * r.height - 25) + 'px';
            } else if (e.target.closest && e.target.closest('svg') === svg) {
                const pos = self._getPos(e);
                self._showHover(pos);
            }
        });
        
        window.addEventListener('mouseup', () => {
            if (self._dragId !== null) {
                self._commitBand(self._dragId);
                self._dragId = null;
                tooltip.style.display = 'none';
                self._dragRectDirty = true;
            }
        });
        svg.addEventListener('mouseleave', () => self._hideHover());
        svg.addEventListener('dblclick', (e) => {
            const bid = self._bandFromTarget(e.target);
            if (bid !== null) {
                self.engine.deleteBand(bid);
                self._render();
            }
        });
        svg.addEventListener('wheel', (e) => {
            const bid = self._bandFromTarget(e.target);
            if (bid !== null) {
                e.preventDefault();
                const band = self.state.bands.find(b => b.id === bid);
                if (band) {
                    band.q = Math.max(0.1, Math.min(10, band.q + (e.deltaY > 0 ? -0.2 : 0.2)));
                    self.state.updateBand(bid, { q: band.q });
                    self.engine.updateFilters();
                    self._render();
                    self._updateBandRowValues(bid);
                }
            }
        }, { passive: false });

        // ===== TOUCH =====
        let touch = { id: null, startX: 0, startY: 0, moved: false, dragging: false, longPressTimer: null, startTime: 0, channel: 'main' };
        const clearTimers = () => {
            if (touch.longPressTimer) {
                clearTimeout(touch.longPressTimer);
                touch.longPressTimer = null;
            }
        };
        svg.addEventListener('touchstart', (e) => {
            e.preventDefault();
            self._dragRect = svg.getBoundingClientRect();
            self._dragRectDirty = false;
            const pos = self._getPos(e);
            const bid = self._bandFromTarget(e.target);
            const target = e.target;
            touch.startX = pos.x;
            touch.startY = pos.y;
            touch.moved = false;
            touch.dragging = false;
            touch.id = bid;
            touch.startTime = Date.now();
            touch.channel = 'main';
            if (target.classList && target.classList.contains('dot-hit')) {
                touch.channel = target.dataset.channel || 'main';
            }
            clearTimers();
            if (bid !== null) {
                touch.longPressTimer = setTimeout(() => {
                    if (!touch.moved) {
                        self.state.setActive(bid);
                        self._render();
                        const menu = self.el.ctx;
                        menu.style.display = 'block';
                        const t = e.touches[0] || e.changedTouches[0];
                        menu.style.left = t.clientX + 'px';
                        menu.style.top = t.clientY + 'px';
                        menu.dataset.bandId = bid;
                        touch.dragging = false;
                        touch.id = null;
                    }
                }, 500);
            } else if (pos.x >= self.L && pos.x <= self.R && pos.y >= self.T && pos.y <= self.B) {
                touch.longPressTimer = setTimeout(() => {
                    if (!touch.moved) {
                        const freq = self._xToF(pos.x);
                        const gain = Math.max(self.GMIN, Math.min(self.GMAX, self._yToDb(pos.y)));
                        const newBand = self.state.addBand({ freq, gain, type: 'bell' });
                        if (newBand) {
                            touch.id = newBand.id;
                            touch.dragging = true;
                            self._dragId = newBand.id;
                            self.engine.updateFilters(false);
                            self._render();
                        }
                    }
                }, 300);
            }
        }, { passive: false });
        
        svg.addEventListener('touchmove', (e) => {
            const pos = self._getPos(e);
            const dx = pos.x - touch.startX;
            const dy = pos.y - touch.startY;
            const dist = Math.hypot(dx, dy);
            if (dist > 3) {
                touch.moved = true;
                clearTimers();
                if (touch.id !== null && !touch.dragging) {
                    touch.dragging = true;
                    self._dragId = touch.id;
                    self._dragMode = touch.channel;
                    self.state.setActive(touch.id);
                    self.el.panel.querySelectorAll('.band-row').forEach(row => {
                        row.classList.toggle('active', parseInt(row.dataset.id) === touch.id);
                    });
                }
                if (touch.dragging) {
                    e.preventDefault();
                    const band = self.state.bands.find(b => b.id === touch.id);
                    if (!band) return;
                    const gain = Math.max(self.GMIN, Math.min(self.GMAX, self._yToDb(pos.y)));
                    const freq = Math.max(self.FMIN, Math.min(self.FMAX, self._xToF(pos.x)));
                    const mode = band.channelMode || 'stereo';
                    const gainless = self._isGainless(band.type);
                    
                    const currentType = band.type || 'bell';
                    const updates = { freq, type: currentType };
                    
                    if (gainless) {
                    } else {
                        if (mode === 'stereo') updates.gain = gain;
                        else if (mode === 'mid') updates.midGain = gain;
                        else if (mode === 'side') updates.sideGain = gain;
                        else if (mode === 'left') updates.leftGain = gain;
                        else if (mode === 'right') updates.rightGain = gain;
                    }
                    
                    self.state.updateBandLive(touch.id, updates);
                    self.engine.updateFilters();
                    self._checkClipping();
                    if (!self._touchRafPending) {
                        self._touchRafPending = true;
                        requestAnimationFrame(() => {
                            self._touchRafPending = false;
                            self._updateDotLive(touch.id);
                            self._renderCurves();
                            self._updateBandRowValues(touch.id);
                        });
                    }
                }
            }
        }, { passive: false });
        
        svg.addEventListener('touchend', (e) => {
            const elapsed = Date.now() - touch.startTime;
            if (!touch.moved && elapsed < 300 && touch.id !== null) {
                self.state.setActive(touch.id);
                self._render();
            }
            if (touch.dragging && touch.id !== null) {
                self._commitBand(touch.id);
                tooltip.style.display = 'none';
            }
            clearTimers();
            self._dragId = null;
            touch.id = null;
            touch.dragging = false;
            touch.moved = false;
            self._dragRectDirty = true;
            self._touchRafPending = false;
        }, { passive: true });
        
        svg.addEventListener('touchcancel', () => {
            clearTimers();
            self._dragId = null;
            touch.id = null;
            touch.dragging = false;
            tooltip.style.display = 'none';
            self._touchRafPending = false;
        });
        
        svg.addEventListener('contextmenu', (e) => {
            const bid = self._bandFromTarget(e.target);
            if (bid !== null) {
                e.preventDefault();
                self.state.setActive(bid);
                self._render();
                const menu = self.el.ctx;
                menu.style.display = 'block';
                menu.style.left = e.clientX + 'px';
                menu.style.top = e.clientY + 'px';
                menu.dataset.bandId = bid;
            }
        });
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.ctx-menu')) self.el.ctx.style.display = 'none';
            if (!e.target.closest('.settings-wrap')) self.el.setmenu.classList.remove('open');
        });

        // ===== ТАЙМЛАЙН =====
        const tl = this.el.tltrack;
        const startSeek = (clientX) => {
            this._seekDragging = true;
            this._seekTo(clientX);
        };
        const moveSeek = (clientX) => {
            if (this._seekDragging) this._seekTo(clientX);
        };
        const endSeek = () => {
            this._seekDragging = false;
        };
        tl.addEventListener('mousedown', (e) => { startSeek(e.clientX); });
        tl.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startSeek(e.touches[0].clientX);
        }, { passive: false });
        tl.addEventListener('touchmove', (e) => {
            e.preventDefault();
            moveSeek(e.touches[0].clientX);
        }, { passive: false });
        window.addEventListener('mousemove', (e) => { moveSeek(e.clientX); });
        window.addEventListener('mouseup', () => { endSeek(); });
        tl.addEventListener('touchend', () => { endSeek(); });

        // ===== ТРАНСПОРТ =====
        this.el.play.addEventListener('click', () => {
            if (self.engine._isCapturing) {
                self._toast('⏺ Идет запись! Нажмите "Остановить" для остановки');
                return;
            }
            if (self.engine.isPlaying()) {
                self.engine.pause();
            } else if (self.engine.isPaused()) {
                self.engine.resume();
            } else {
                const buffer = self.engine._fileBuffer || self.engine._recordedBuffer;
                if (buffer && (self.engine._sourceType === 'file' || self.engine._sourceType === 'recorded' || self.engine._fileEnded)) {
                    self.engine._fileEnded = false;
                    self.engine.playSource(self.engine._sourceType === 'recorded' ? 'recorded' : 'file', buffer, 0);
                    return;
                }
                const activeSrc = self.container.querySelector('.src-btn.active');
                const src = activeSrc ? activeSrc.dataset.src : 'demo';
                if (src === 'file') {
                    if (self.engine.getBuffer()) {
                        self.engine.playSource('file', self.engine.getBuffer(), 0);
                    } else {
                        self._toast('❌ Файл не загружен');
                    }
                } else if (src === 'mic') {
                    self.engine.playSource('mic');
                } else if (src === 'system') {
                    self.engine.playSource('system');
                } else if (src === 'recorded') {
                    if (self.engine.getRecordedBuffer()) {
                        self.engine.playSource('recorded', self.engine.getRecordedBuffer(), 0);
                    } else {
                        self._toast('❌ Нет записи');
                    }
                } else {
                    self.engine.playSource('demo');
                }
            }
        });
        const srcBtns = this.container.querySelectorAll('.src-btn');
        for (const btn of srcBtns) {
            btn.addEventListener('click', async () => {
                const src = btn.dataset.src;
                if (src === 'file') {
                    self.el.file.click();
                    return;
                }
                if (src === 'source') {
                    self._showSourceSelector();
                    return;
                }
                if (src === 'demo') {
                    self.engine.stopSource();
                    self.engine.playSource('demo');
                    self._updateTimelineVisibility();
                    const controls = document.getElementById('sourceControls');
                    if (controls) controls.style.display = 'none';
                    self.container.querySelectorAll('.src-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    return;
                }
                if (src === 'recorded') {
                    if (self.engine.getRecordedBuffer()) {
                        self.engine.stopSource();
                        self.engine.playSource('recorded', self.engine.getRecordedBuffer(), 0);
                        self.container.querySelectorAll('.src-btn').forEach(b => b.classList.toggle('active', b === btn));
                        self._updateTimelineVisibility();
                    } else {
                        self._toast('❌ Нет записи');
                    }
                    return;
                }
            });
        }
        this.el.file.addEventListener('change', async (e) => {
            if (!e.target.files.length) return;
            const file = e.target.files[0];
            self.el.spinner.classList.add('active');
            try {
                self.engine.stopSource();
                await self.engine.playSource('file', file);
                self._toast('🎵 ' + file.name);
                self._showSourceControls('file');
                self.container.querySelectorAll('.src-btn').forEach(b => b.classList.toggle('active', b.dataset.src === 'file'));
                self._updateTimelineVisibility();
            } catch (err) {
                self._toast('❌ Ошибка загрузки');
            }
            self.el.spinner.classList.remove('active');
            e.target.value = '';
        });
        this.el.inGain.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            self.engine.setInputGain(v);
            self.el.inGainVal.textContent = Math.round(v * 100) + '%';
            self._checkClipping();
            self._needsRender = true;
        });
        this.el.outGain.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            self.engine.setOutputGain(v);
            self.el.outGainVal.textContent = Math.round(v * 100) + '%';
            self._checkClipping();
            self._needsRender = true;
        });

        // ===== ШАПКА =====
        this.el.undo.addEventListener('click', () => {
            if (self.state.undo()) {
                self.engine.updateFilters(false);
                self._render();
                self._updateUndoRedo();
                self._toast('↶ Отменено');
            }
        });
        this.el.redo.addEventListener('click', () => {
            if (self.state.redo()) {
                self.engine.updateFilters(false);
                self._render();
                self._updateUndoRedo();
                self._toast('↷ Повторено');
            }
        });
        this.el.bypass.addEventListener('click', () => {
            self.state.bypassed = !self.state.bypassed;
            self.engine.setBypass(self.state.bypassed);
            self.el.bypass.classList.toggle('bypass-on', self.state.bypassed);
            self._render();
            self._toast(self.state.bypassed ? 'Обход ВКЛ' : 'Обход ВЫКЛ');
        });
        this.el.ab.addEventListener('click', () => {
            if (this._abState === 'A') {
                this.state.switchSlot('B');
                this.engine.updateFilters(false);
                this._abState = 'B';
                this.el.ab.textContent = 'B';
                this.el.ab.classList.add('active-slot');
                this.el.ab.classList.remove('ab-active');
                this._toast('Слот B');
                this._render();
                this._updateUI();
            } else if (this._abState === 'B') {
                this.engine.startABCompare(2000);
                this._abState = 'AB';
                this.el.ab.textContent = 'A/B';
                this.el.ab.classList.add('ab-active');
                this.el.ab.classList.remove('active-slot');
                this._toast('A/B сравнение каждые 2с');
            } else if (this._abState === 'AB') {
                this.engine.stopABCompare();
                this.state.switchSlot('A');
                this.engine.updateFilters(false);
                this._abState = 'A';
                this.el.ab.textContent = 'A';
                this.el.ab.classList.remove('ab-active', 'active-slot');
                this._toast('Слот A');
                this._render();
                this._updateUI();
            }
        });
        this.el.theme.addEventListener('click', () => {
            self.state.theme = self.state.theme === 'dark' ? 'light' : 'dark';
            self.state.save();
            self._applyTheme();
        });

        this.el.fs.addEventListener('click', async () => {
            const el = self.container;
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                try {
                    await el.requestFullscreen?.();
                    if (self.isMobile && screen.orientation && screen.orientation.lock) {
                        try {
                            await screen.orientation.lock('landscape');
                        } catch (e) {}
                    }
                } catch (err) {
                    self._toast('❌ Не удалось войти в полноэкранный режим');
                }
            }
        });

        // ===== НАСТРОЙКИ =====
        this.el.setbtn.addEventListener('click', (e) => {
            e.stopPropagation();
            self.el.setmenu.classList.toggle('open');
        });
        this.el.setmenu.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = e.target.dataset.a;
            if (!action) return;
            switch (action) {
                case 'reset': {
                    self.state.resetToDefault();
                    self.engine.updateFilters(false);
                    self._render();
                    self._updateUndoRedo();
                    self._buildPresetSelect();
                    self.state.save();
                    self._toast('⬜ Сброшено');
                    break;
                }
                case 'delta': {
                    const on = !self.state.deltaMode;
                    self.state.deltaMode = on;
                    self.engine.setDeltaMode(on);
                    e.target.textContent = `🌀 Delta: ${on ? 'Вкл' : 'Выкл'}`;
                    self._toast(`🌀 Delta режим ${on ? 'ВКЛ' : 'ВЫКЛ'}`);
                    self._render();
                    break;
                }
                case 'spec': {
                    const canvas = self.el.canvas;
                    const hidden = canvas.style.display === 'none';
                    canvas.style.display = hidden ? 'block' : 'none';
                    break;
                }
                case 'peakh': {
                    self.state.peakHold = !self.state.peakHold;
                    self.state.save();
                    if (!self.state.peakHold) self._peakHoldData = [];
                    e.target.textContent = `📈 Peak Hold: ${self.state.peakHold ? 'Вкл' : 'Выкл'}`;
                    self._toast(`Peak Hold ${self.state.peakHold ? 'ВКЛ' : 'ВЫКЛ'}`);
                    break;
                }
                case 'grid': {
                    const grid = self.el.grid;
                    grid.style.display = grid.style.display === 'none' ? 'block' : 'none';
                    break;
                }
                case 'autogain': {
                    self.state.autoGain = !self.state.autoGain;
                    self.state.save();
                    self.engine.updateAutoGain();
                    e.target.textContent = `🎯 Auto-Gain: ${self.state.autoGain ? 'Вкл' : 'Выкл'}`;
                    self._toast(`Auto-Gain ${self.state.autoGain ? 'ВКЛ' : 'ВЫКЛ'}`);
                    break;
                }
                case 'clip': {
                    const on = !self.state.softClip;
                    self.engine.setSoftClip(on);
                    e.target.textContent = `🔇 Soft Clip: ${on ? 'Вкл' : 'Выкл'}`;
                    self._toast(`Soft Clip ${on ? 'ВКЛ' : 'ВЫКЛ'}`);
                    break;
                }
                case 'exportWav': {
                    self._exportAudio('wav');
                    break;
                }
                case 'exportMp3': {
                    self._exportAudio('mp3');
                    break;
                }
                case 'shortcuts': {
                    document.getElementById('shortcutsModal').classList.add('open');
                    break;
                }
                case 'playRecorded': {
                    const buf = self.engine.getRecordedBuffer();
                    if (buf) {
                        self.engine.stopSource();
                        self.engine.playSource('recorded', buf, 0);
                        self._updateTimelineVisibility();
                    } else {
                        self._toast('❌ Нет записи');
                    }
                    break;
                }
            }
            self.el.setmenu.classList.remove('open');
        });

        // ===== КОНТЕКСТНОЕ МЕНЮ =====
        this.el.ctx.addEventListener('click', (e) => {
            const action = e.target.dataset.a;
            const bid = parseInt(this.el.ctx.dataset.bandId);
            if (!action || !bid) return;
            const band = this.state.bands.find(b => b.id === bid);
            if (!band) return;
            switch (action) {
                case 'mute':
                    self.state.muteBand(bid);
                    break;
                case 'solo':
                    self.state.soloBand(bid);
                    break;
                case 'dynamic':
                    band.dynamic.enabled = !band.dynamic.enabled;
                    self.state.pushHistory();
                    self.state.save();
                    break;
                case 'ms':
                    band.channelMode = band.channelMode === 'mid' ? 'side' : 'mid';
                    self.state.pushHistory();
                    self.state.save();
                    break;
                case 'duplicate':
                    self.state.duplicateBand(bid);
                    break;
                case 'reset':
                    self.state.resetBand(bid);
                    break;
                case 'invert':
                    self.state.invertGain(bid);
                    break;
                case 'delete':
                    self.engine.deleteBand(bid);
                    self.el.ctx.style.display = 'none';
                    self._render();
                    return;
            }
            self.engine.updateFilters(false);
            self._render();
            self.el.ctx.style.display = 'none';
        });

        // ===== ИСТОЧНИКИ КОНТРОЛЫ =====
        this.container.querySelector('[data-action="toggle-eq"]')?.addEventListener('click', function() {
            const isEqOn = this.dataset.eq !== 'off';
            self.state.bypassed = isEqOn;
            self.engine.setBypass(self.state.bypassed);
            self.el.bypass.classList.toggle('bypass-on', self.state.bypassed);
            this.textContent = isEqOn ? '🎛️ EQ ВЫКЛ' : '🎛️ EQ ВКЛ';
            this.className = 'hdr-btn ' + (isEqOn ? 'sound-off' : 'sound-on');
            this.dataset.eq = isEqOn ? 'off' : 'on';
            self._render();
            self._toast(isEqOn ? '🎛️ EQ выключен (чистый звук)' : '🎛️ EQ включен');
        });
        this.container.querySelector('[data-action="toggle-record"]')?.addEventListener('click', function() {
            const isRecording = this.dataset.recording === 'on';
            if (isRecording) {
                self.engine.stopCapture();
                this.textContent = '⏺ Запись';
                this.className = 'hdr-btn';
                this.dataset.recording = 'off';
                const timer = self.container.querySelector('.source-timer');
                if (timer) timer.style.display = 'none';
                self._toast('⏹ Запись остановлена, обработка...');
                return;
            }
            if (!self.engine.isPlaying()) {
                self._toast('❌ Сначала запустите воспроизведение источника');
                return;
            }
            self.engine.startCaptureWithMonitoring(true, 'eq')
                .then(() => {
                    this.textContent = '⏹ Остановить';
                    this.className = 'hdr-btn recording-active';
                    this.dataset.recording = 'on';
                    const timer = self.container.querySelector('.source-timer');
                    if (timer) timer.style.display = 'inline-block';
                    self._toast('⏺ Запись обработанного звука начата');
                })
                .catch((err) => {
                    self._toast('❌ ' + (err.message || 'Ошибка записи'));
                });
        });
        this.container.querySelector('[data-action="save-capture"]')?.addEventListener('click', function() {
            if (self.engine._fileBuffer) {
                self._saveCapturedFile(self.engine._fileBuffer);
            } else {
                self._toast('❌ Нет файла для сохранения');
            }
        });

        // ===== DRAG МАРКЕРОВ ОБРЕЗКИ =====
        const startTrimDrag = (e, type) => {
            if (!this.trimMode) return;
            this.isTrimDragging = true;
            this.trimDragType = type;
            this._trimDragRect = this.el.tltrack.getBoundingClientRect();
            e.preventDefault();
        };
        const moveTrimDrag = (e) => {
            if (!this.isTrimDragging || !this.trimDragType || !this.trimMode) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const rect = this._trimDragRect || this.el.tltrack.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            if (this.trimDragType === 'start') {
                this.trimStart = Math.min(percent, this.trimEnd - 0.01);
            } else {
                this.trimEnd = Math.max(percent, this.trimStart + 0.01);
            }
            this._updateTrimMarkers();
        };
        const endTrimDrag = () => {
            if (this.isTrimDragging) {
                this.isTrimDragging = false;
                this.trimDragType = null;
            }
        };
        this.el.trimStart.addEventListener('mousedown', (e) => startTrimDrag(e, 'start'));
        this.el.trimEnd.addEventListener('mousedown', (e) => startTrimDrag(e, 'end'));
        this.el.trimStart.addEventListener('touchstart', (e) => startTrimDrag(e, 'start'), { passive: true });
        this.el.trimEnd.addEventListener('touchstart', (e) => startTrimDrag(e, 'end'), { passive: true });
        document.addEventListener('mousemove', moveTrimDrag);
        document.addEventListener('touchmove', moveTrimDrag, { passive: true });
        document.addEventListener('mouseup', endTrimDrag);
        document.addEventListener('touchend', endTrimDrag, { passive: true });

        this.el.tltrack.addEventListener('click', (e) => {
            if (!this.trimMode) return;
            const rect = this.el.tltrack.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const distStart = Math.abs(percent - this.trimStart);
            const distEnd = Math.abs(percent - this.trimEnd);
            if (distStart < distEnd) {
                this.trimStart = Math.min(percent, this.trimEnd - 0.01);
            } else {
                this.trimEnd = Math.max(percent, this.trimStart + 0.01);
            }
            this._updateTrimMarkers();
        });

        // ==== КЛАВИАТУРА =====
        window.addEventListener('orientationchange', () => setTimeout(() => this._resize(), 100));
        document.addEventListener('fullscreenchange', () => {
            this.el.fs.textContent = document.fullscreenElement ? '⊡' : '⛶';
            this._resize();
        });
        document.addEventListener('keydown', (e) => this._onKey(e));
    },

    _onKey(e) {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            this._undoEffect();
            return;
        }
        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            this._redoEffect();
            return;
        }
        if (e.key === 'r' || e.key === 'R') {
            e.preventDefault();
            this.toggleTrimMode();
            return;
        }

        const band = this.state.getActive();
        switch (e.key) {
            case ' ':
                e.preventDefault();
                this.el.play.click();
                break;
            case 'b':
            case 'B':
                this.el.bypass.click();
                break;
            case 'a':
            case 'A':
                this.el.ab.click();
                break;
            case 's':
            case 'S': {
                const sourceBtn = this.container.querySelector('[data-src="source"]');
                if (sourceBtn) sourceBtn.click();
                break;
            }
            case 'p':
            case 'P':
                this.state.peakHold = !this.state.peakHold;
                this.state.save();
                if (!this.state.peakHold) this._peakHoldData = [];
                this._toast(`Peak Hold ${this.state.peakHold ? 'ВКЛ' : 'ВЫКЛ'}`);
                break;
            case 'f':
            case 'F':
                if (!e.ctrlKey) {
                    for (const b of this.state.bands) {
                        b.gain = 0;
                        b.midGain = 0;
                        b.sideGain = 0;
                        b.leftGain = 0;
                        b.rightGain = 0;
                    }
                    this.engine.updateFilters();
                    this.state.pushHistory();
                    this.state.save();
                    this._render();
                    this._toast('⬜ Сброшено');
                }
                break;
            case 'Delete':
                if (this.state.activeId) {
                    this.engine.deleteBand(this.state.activeId);
                    this._render();
                }
                break;
            case '?':
                document.getElementById('shortcutsModal').classList.add('open');
                break;
            case 'Escape':
                this.el.ctx.style.display = 'none';
                this.el.setmenu.classList.remove('open');
                this.el.effectsMenu.classList.remove('open');
                this.el.effectsToggle.classList.remove('active');
                document.getElementById('shortcutsModal').classList.remove('open');
                if (this.trimMode) this.toggleTrimMode();
                break;
            case '[':
                if (band) {
                    band.q = Math.max(0.1, band.q - (e.shiftKey ? 0.1 : 0.5));
                    this.state.updateBandLive(band.id, { q: band.q });
                    this.engine.updateFilters();
                    this._render();
                    this._updateBandRowValues(band.id);
                    this._commitBand(band.id);
                }
                break;
            case ']':
                if (band) {
                    band.q = Math.min(10, band.q + (e.shiftKey ? 0.1 : 0.5));
                    this.state.updateBandLive(band.id, { q: band.q });
                    this.engine.updateFilters();
                    this._render();
                    this._updateBandRowValues(band.id);
                    this._commitBand(band.id);
                }
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8': {
                const idx = parseInt(e.key) - 1;
                if (this.state.bands[idx]) {
                    this.state.setActive(this.state.bands[idx].id);
                    this._render();
                }
                break;
            }
            default:
                if (band) {
                    const shift = e.shiftKey;
                    const mode = band.channelMode || 'stereo';
                    const gainless = this._isGainless(band.type);
                    const currentType = band.type || 'bell';
                    
                    switch (e.key) {
                        case 'ArrowLeft':
                            e.preventDefault();
                            band.freq = Math.max(this.FMIN, band.freq * (shift ? 0.99 : 0.95));
                            this.state.updateBandLive(band.id, { freq: band.freq, type: currentType });
                            this.engine.updateFilters();
                            this._updateDotLive(band.id);
                            this._updateBandRowValues(band.id);
                            this._renderCurves();
                            this._commitBand(band.id);
                            break;
                        case 'ArrowRight':
                            e.preventDefault();
                            band.freq = Math.min(this.FMAX, band.freq * (shift ? 1.01 : 1.05));
                            this.state.updateBandLive(band.id, { freq: band.freq, type: currentType });
                            this.engine.updateFilters();
                            this._updateDotLive(band.id);
                            this._updateBandRowValues(band.id);
                            this._renderCurves();
                            this._commitBand(band.id);
                            break;
                        case 'ArrowUp':
                            e.preventDefault();
                            if (gainless) break;
                            if (mode === 'stereo') {
                                band.gain = Math.min(this.GMAX, band.gain + (shift ? 0.1 : 0.5));
                                this.state.updateBandLive(band.id, { gain: band.gain, type: currentType });
                            } else if (mode === 'mid') {
                                band.midGain = Math.min(this.GMAX, (band.midGain || 0) + (shift ? 0.1 : 0.5));
                                this.state.updateBandLive(band.id, { midGain: band.midGain, type: currentType });
                            } else if (mode === 'side') {
                                band.sideGain = Math.min(this.GMAX, (band.sideGain || 0) + (shift ? 0.1 : 0.5));
                                this.state.updateBandLive(band.id, { sideGain: band.sideGain, type: currentType });
                            } else if (mode === 'left') {
                                band.leftGain = Math.min(this.GMAX, (band.leftGain || 0) + (shift ? 0.1 : 0.5));
                                this.state.updateBandLive(band.id, { leftGain: band.leftGain, type: currentType });
                            } else if (mode === 'right') {
                                band.rightGain = Math.min(this.GMAX, (band.rightGain || 0) + (shift ? 0.1 : 0.5));
                                this.state.updateBandLive(band.id, { rightGain: band.rightGain, type: currentType });
                            }
                            this.engine.updateFilters();
                            this._updateDotLive(band.id);
                            this._updateBandRowValues(band.id);
                            this._renderCurves();
                            this._commitBand(band.id);
                            break;
                        case 'ArrowDown':
                            e.preventDefault();
                            if (gainless) break;
                            if (mode === 'stereo') {
                                band.gain = Math.max(this.GMIN, band.gain - (shift ? 0.1 : 0.5));
                                this.state.updateBandLive(band.id, { gain: band.gain, type: currentType });
                            } else if (mode === 'mid') {
                                band.midGain = Math.max(this.GMIN, (band.midGain || 0) - (shift ? 0.1 : 0.5));
                                this.state.updateBandLive(band.id, { midGain: band.midGain, type: currentType });
                            } else if (mode === 'side') {
                                band.sideGain = Math.max(this.GMIN, (band.sideGain || 0) - (shift ? 0.1 : 0.5));
                                this.state.updateBandLive(band.id, { sideGain: band.sideGain, type: currentType });
                            } else if (mode === 'left') {
                                band.leftGain = Math.max(this.GMIN, (band.leftGain || 0) - (shift ? 0.1 : 0.5));
                                this.state.updateBandLive(band.id, { leftGain: band.leftGain, type: currentType });
                            } else if (mode === 'right') {
                                band.rightGain = Math.max(this.GMIN, (band.rightGain || 0) - (shift ? 0.1 : 0.5));
                                this.state.updateBandLive(band.id, { rightGain: band.rightGain, type: currentType });
                            }
                            this.engine.updateFilters();
                            this._updateDotLive(band.id);
                            this._updateBandRowValues(band.id);
                            this._renderCurves();
                            this._commitBand(band.id);
                            break;
                    }
                }
        }
    }
};
