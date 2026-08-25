// ================================================================
// EQ WIDGET EFFECTS — эффекты (fade, normalize, reverse, speed)
// ================================================================

export default {
    init: function() {
        this.effectsHistory = [];
        this.effectsHistoryIndex = -1;

        this._fxState = {
            fade: { fadeIn: 1, fadeOut: 1, fadeType: 'linear' },
            normalize: { normTarget: -3, normType: 'peak' },
            speed: { speedFactor: 1 }
        };

        this._originalBuffer = null;
        this._lastAppliedEffect = null;
        this._processing = false;
        
        // Панель для режимов
        this._fullscreenPanel = null;
        this._isFullscreenPanelVisible = false;
    },

    _restartPlayback: function(newBuffer) {
        if (!newBuffer) return;
        
        var currentTime = this.engine.getCurrentTime() || 0;
        var wasPlaying = this.engine.isPlaying();
        
        this.engine.stopSource();
        this.engine.playSource('file', newBuffer, currentTime);
        
        if (!wasPlaying) {
            this.engine.pause();
        }
    },

    _saveEffectState: function() {
        if (!this.engine._buffer) return;
        try {
            var buffer = this.engine._buffer;
            var clone = this.engine.ctx.createBuffer(
                buffer.numberOfChannels,
                buffer.length,
                buffer.sampleRate
            );
            for (var ch = 0; ch < buffer.numberOfChannels; ch++) {
                var src = buffer.getChannelData(ch);
                var dst = clone.getChannelData(ch);
                for (var i = 0; i < src.length; i++) dst[i] = src[i];
            }
            this.effectsHistory = this.effectsHistory.slice(0, this.effectsHistoryIndex + 1);
            this.effectsHistory.push(clone);
            if (this.effectsHistory.length > 20) this.effectsHistory.shift();
            this.effectsHistoryIndex = this.effectsHistory.length - 1;
        } catch(e) {
            console.warn('Save state error:', e);
        }
    },

    _saveOriginalBuffer: function() {
        if (!this.engine._buffer) return;
        if (this._originalBuffer) return;

        try {
            var buffer = this.engine._buffer;
            var clone = this.engine.ctx.createBuffer(
                buffer.numberOfChannels,
                buffer.length,
                buffer.sampleRate
            );
            for (var ch = 0; ch < buffer.numberOfChannels; ch++) {
                var src = buffer.getChannelData(ch);
                var dst = clone.getChannelData(ch);
                for (var i = 0; i < src.length; i++) dst[i] = src[i];
            }
            this._originalBuffer = clone;
        } catch(e) {
            console.warn('Save original error:', e);
        }
    },

    _restoreOriginalBuffer: function() {
        if (!this._originalBuffer) return false;
        try {
            this.engine._buffer = this._originalBuffer;
            this.engine._fileBuffer = this._originalBuffer;
            this.engine._duration = this._originalBuffer.duration;
            this._originalBuffer = null;
            this._lastAppliedEffect = null;
            
            this._restartPlayback(this.engine._buffer);
            
            this._render();
            this._updateTimeline(0);
            this._toast('↺ Возврат к исходному состоянию');
            return true;
        } catch(e) {
            console.warn('Restore original error:', e);
            return false;
        }
    },

    _undoEffect: function() {
        if (this.effectsHistoryIndex > 0) {
            this.effectsHistoryIndex--;
            this.engine._buffer = this.effectsHistory[this.effectsHistoryIndex];
            this.engine._fileBuffer = this.effectsHistory[this.effectsHistoryIndex];
            this.engine._duration = this.engine._buffer.duration;
            
            this._restartPlayback(this.engine._buffer);
            
            this._render();
            this._updateTimeline(0);
            this._toast('↶ Эффект отменён');
        }
    },

    _redoEffect: function() {
        if (this.effectsHistoryIndex < this.effectsHistory.length - 1) {
            this.effectsHistoryIndex++;
            this.engine._buffer = this.effectsHistory[this.effectsHistoryIndex];
            this.engine._fileBuffer = this.effectsHistory[this.effectsHistoryIndex];
            this.engine._duration = this.engine._buffer.duration;
            
            this._restartPlayback(this.engine._buffer);
            
            this._render();
            this._updateTimeline(0);
            this._toast('↷ Эффект повторён');
        }
    },

    _resetEffects: function() {
        if (this.effectsHistory.length > 0 && this.effectsHistory[0]) {
            this.engine._buffer = this.effectsHistory[0];
            this.engine._fileBuffer = this.effectsHistory[0];
            this.engine._duration = this.engine._buffer.duration;
            this.effectsHistory = [];
            this.effectsHistoryIndex = -1;
            this._originalBuffer = null;
            this._lastAppliedEffect = null;
            
            this._restartPlayback(this.engine._buffer);
            
            this._render();
            this._updateTimeline(0);
            this._toast('↺ Все эффекты сброшены');
        } else {
            this._toast('❌ Нет эффектов для сброса');
        }
    },

    _applyEffectWithState: function(effectFn, effectType, isNeutral) {
        isNeutral = isNeutral || false;
        var self = this;

        if (this._processing) {
            this._toast('⏳ Идёт обработка, подождите...');
            return;
        }

        try {
            if (!this.engine._buffer) {
                this._toast('❌ Сначала загрузите файл');
                return;
            }
            if (this.engine.ctx.state === 'suspended') {
                this.engine.ctx.resume();
            }

            if (isNeutral && this._originalBuffer) {
                if (this._lastAppliedEffect === effectType) {
                    this._restoreOriginalBuffer();
                    return;
                }
            }

            if (!this._originalBuffer) {
                this._saveOriginalBuffer();
            }

            if (this._lastAppliedEffect === effectType && this.effectsHistoryIndex > 0) {
                var prevState = this.effectsHistory[this.effectsHistoryIndex - 1];
                if (prevState) {
                    this.engine._buffer = prevState;
                    this.engine._fileBuffer = prevState;
                    this.engine._duration = prevState.duration;
                    this.effectsHistoryIndex--;
                    this.effectsHistory = this.effectsHistory.slice(0, this.effectsHistoryIndex + 1);
                }
            }

            this._saveEffectState();

            this.el.spinner.classList.add('active');
            this._toast('⏳ Обработка...');
            this._processing = true;

            setTimeout(function() {
                try {
                    effectFn();
                    self._processing = false;
                    self.el.spinner.classList.remove('active');
                    self._lastAppliedEffect = effectType;
                    
                    self._restartPlayback(self.engine._buffer);
                    
                    self._render();
                    self._updateTimeline(0);
                    self._updateTimelineVisibility();
                    if (self.trimMode) self.toggleTrimMode();
                } catch(e) {
                    self._processing = false;
                    self.el.spinner.classList.remove('active');
                    console.error('Effect error:', e);
                    self._toast('❌ Ошибка: ' + e.message);
                }
            }, 30);

        } catch(e) {
            this._processing = false;
            this.el.spinner.classList.remove('active');
            console.error('Effect error:', e);
            this._toast('❌ Ошибка: ' + e.message);
        }
    },

    // ===== ПОКАЗ ПАНЕЛИ (ВСЕГДА) =====
    _showEffectModal: function(effectType) {
        this._createFullscreenPanel(effectType);
    },

    // ===== ПАНЕЛЬ ПОВЕРХ ГРАФИКА (position: absolute) =====
    _createFullscreenPanel: function(effectType) {
        if (this._fullscreenPanel) {
            this._closeFullscreenPanel();
        }
        
        const self = this;
        const savedState = this._fxState[effectType] || {};
        
        const panel = document.createElement('div');
        panel.className = 'hh-fullscreen-panel';
        panel.style.cssText = `
            position: absolute;
            left: 8px;
            top: 8px;
            bottom: 8px;
            width: 260px;
            min-width: 180px;
            max-width: 40%;
            background: rgba(0,0,0,0.88);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.06);
            padding: 14px;
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            color: #fff;
            overflow-y: auto;
            z-index: 10;
            animation: panelSlideIn 0.25s ease;
            -webkit-animation: panelSlideIn 0.25s ease;
        `;
        
        const modals = {
            fade: {
                title: '🌊 Fade In/Out',
                html: `
                    <div class="fp-param-group">
                        <span class="fp-param-label">📈 Параметры затухания</span>
                        <div class="fp-param-row">
                            <span class="fp-icon">▶</span>
                            <label>Вход</label>
                            <input type="range" min="0" max="5" step="0.1" value="${savedState.fadeIn || 1}" data-fx-param="fadeIn">
                            <span class="fp-val" data-fx-val="fadeIn">${(savedState.fadeIn || 1).toFixed(1)}с</span>
                        </div>
                        <div class="fp-param-row">
                            <span class="fp-icon">◀</span>
                            <label>Выход</label>
                            <input type="range" min="0" max="5" step="0.1" value="${savedState.fadeOut || 1}" data-fx-param="fadeOut">
                            <span class="fp-val" data-fx-val="fadeOut">${(savedState.fadeOut || 1).toFixed(1)}с</span>
                        </div>
                        <div class="fp-param-row">
                            <span class="fp-icon">📐</span>
                            <label>Тип</label>
                            <select data-fx-param="fadeType">
                                <option value="linear" ${savedState.fadeType === 'linear' ? 'selected' : ''}>📏 Линейный</option>
                                <option value="exponential" ${savedState.fadeType === 'exponential' ? 'selected' : ''}>📈 Экспоненциальный</option>
                                <option value="sine" ${savedState.fadeType === 'sine' ? 'selected' : ''}>〰️ Синусоидальный</option>
                            </select>
                        </div>
                    </div>
                `,
                apply: function() {
                    var fadeIn = parseFloat(panel.querySelector('[data-fx-param="fadeIn"]').value);
                    var fadeOut = parseFloat(panel.querySelector('[data-fx-param="fadeOut"]').value);
                    var fadeType = panel.querySelector('[data-fx-param="fadeType"]').value;
                    self._fxState.fade = { fadeIn: fadeIn, fadeOut: fadeOut, fadeType: fadeType };
                    var isNeutral = fadeIn === 0 && fadeOut === 0;
                    self._applyEffectWithState(function() {
                        self.applyFade(fadeIn, fadeOut, fadeType);
                    }, 'fade', isNeutral);
                }
            },
            normalize: {
                title: '📊 Нормализация',
                html: `
                    <div class="fp-param-group">
                        <span class="fp-param-label">🎯 Целевой уровень</span>
                        <div class="fp-param-row">
                            <span class="fp-icon">🎯</span>
                            <label>Цель</label>
                            <input type="range" min="-24" max="0" step="0.5" value="${savedState.normTarget || -3}" data-fx-param="normTarget">
                            <span class="fp-val" data-fx-val="normTarget">${savedState.normTarget || -3}dB</span>
                        </div>
                        <div class="fp-param-row">
                            <span class="fp-icon">📐</span>
                            <label>Тип</label>
                            <select data-fx-param="normType">
                                <option value="peak" ${savedState.normType === 'peak' ? 'selected' : ''}>🔺 Пиковый</option>
                                <option value="rms" ${savedState.normType === 'rms' ? 'selected' : ''}>📊 RMS</option>
                            </select>
                        </div>
                    </div>
                `,
                apply: function() {
                    var target = parseFloat(panel.querySelector('[data-fx-param="normTarget"]').value);
                    var type = panel.querySelector('[data-fx-param="normType"]').value;
                    self._fxState.normalize = { normTarget: target, normType: type };
                    self._applyEffectWithState(function() {
                        self.applyNormalize(target, type);
                    }, 'normalize', false);
                }
            },
            speed: {
                title: '⏱️ Изменение скорости',
                html: `
                    <div class="fp-param-group">
                        <span class="fp-param-label">⚡ Параметры скорости</span>
                        <div class="fp-param-row">
                            <span class="fp-icon">🐢</span>
                            <label>Скорость</label>
                            <input type="range" min="0.25" max="3" step="0.05" value="${savedState.speedFactor || 1}" data-fx-param="speedFactor">
                            <span class="fp-val" data-fx-val="speedFactor">${(savedState.speedFactor || 1).toFixed(2)}x</span>
                        </div>
                        <div style="font-size:0.45rem;color:#666;text-align:center;padding-top:3px;opacity:0.6;">
                            ⚡ >1 = быстрее (тон выше) &nbsp;|&nbsp; &lt;1 = медленнее (тон ниже)
                        </div>
                    </div>
                `,
                apply: function() {
                    var factor = parseFloat(panel.querySelector('[data-fx-param="speedFactor"]').value);
                    self._fxState.speed = { speedFactor: factor };
                    var isNeutral = factor === 1;
                    self._applyEffectWithState(function() {
                        self.applySpeed(factor);
                    }, 'speed', isNeutral);
                }
            },
            reverse: {
                title: '🔄 Реверс аудио',
                html: `
                    <div class="fp-info-text">
                        🎵 Аудио будет воспроизведено в обратном порядке.
                    </div>
                `,
                apply: function() {
                    self._applyEffectWithState(function() {
                        self.applyReverse();
                    }, 'reverse', false);
                }
            },
            source: {
                title: '🎵 Источник звука',
                html: function() {
                    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                    const supportsSystemAudio = !isIOS && navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function';
                    return `
                        <div class="fp-source-card" data-source="mic">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <span class="fp-source-icon">🎤</span>
                                <div>
                                    <div class="fp-source-title">Микрофон</div>
                                    <div class="fp-source-desc">Звук с вашего микрофона</div>
                                </div>
                            </div>
                        </div>
                        <div class="fp-source-card" data-source="system" style="${supportsSystemAudio ? '' : 'opacity:0.4;cursor:not-allowed;'}">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <span class="fp-source-icon">🔊</span>
                                <div>
                                    <div class="fp-source-title">Системный звук</div>
                                    <div class="fp-source-desc">${supportsSystemAudio ? 'Звук из вкладки/окна браузера' : '❌ Недоступно'}</div>
                                </div>
                            </div>
                        </div>
                        <div class="fp-source-card" data-source="file">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <span class="fp-source-icon">📁</span>
                                <div>
                                    <div class="fp-source-title">Файл</div>
                                    <div class="fp-source-desc">Загрузить аудиофайл</div>
                                </div>
                            </div>
                        </div>
                    `;
                },
                apply: function() {
                    self._closeFullscreenPanel();
                }
            }
        };
        
        const modal = modals[effectType];
        if (!modal) return;
        
        const headerTitle = effectType === 'source' ? '🎵 Источник звука' : modal.title;
        const bodyHtml = typeof modal.html === 'function' ? modal.html() : modal.html;
        
        panel.innerHTML = `
            <div class="fp-header">
                <h3>${headerTitle}</h3>
                <button class="fp-close" data-fp-close>✕</button>
            </div>
            <div class="fp-body">${bodyHtml}</div>
            ${effectType !== 'source' ? `
            <div class="fp-actions">
                <button class="fp-btn fp-btn-primary" data-fp-apply>✅ Применить</button>
                <button class="fp-btn fp-btn-secondary" data-fp-close>✕ Отмена</button>
            </div>
            ` : ''}
        `;
        
        // Вставляем панель в .graph-inner
        const graphInner = this.el.inner;
        graphInner.style.position = 'relative';
        graphInner.appendChild(panel);
        
        // Обработчики слайдеров
        panel.querySelectorAll('input[type="range"]').forEach(function(slider) {
            var updateValue = function() {
                var val = parseFloat(slider.value);
                var display = slider.closest('.fp-param-row') ? slider.closest('.fp-param-row').querySelector('.fp-val') : null;
                if (display) {
                    var param = slider.dataset.fxParam;
                    if (param === 'fadeIn' || param === 'fadeOut') {
                        display.textContent = val.toFixed(1) + 'с';
                    } else if (param === 'speedFactor') {
                        display.textContent = val.toFixed(2) + 'x';
                    } else if (param === 'normTarget') {
                        display.textContent = val + 'dB';
                    }
                }
            };
            slider.addEventListener('input', updateValue);
            setTimeout(updateValue, 10);
        });
        
        // Кнопка "Применить"
        var applyBtn = panel.querySelector('[data-fp-apply]');
        if (applyBtn) {
            applyBtn.addEventListener('click', function() {
                modal.apply();
                self._closeFullscreenPanel();
            });
        }
        
        // Кнопка "Закрыть"
        panel.querySelectorAll('[data-fp-close]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self._closeFullscreenPanel();
            });
        });
        
        // Источники
        panel.querySelectorAll('.fp-source-card').forEach(function(card) {
            card.addEventListener('click', function() {
                const source = this.dataset.source;
                self._selectSource(source);
                self._closeFullscreenPanel();
            });
        });
        
        this._fullscreenPanel = panel;
        this._isFullscreenPanelVisible = true;
        
        // Escape
        var onEscape = function(e) {
            if (e.key === 'Escape' && self._isFullscreenPanelVisible) {
                self._closeFullscreenPanel();
                document.removeEventListener('keydown', onEscape);
            }
        };
        document.addEventListener('keydown', onEscape);
    },

    _closeFullscreenPanel: function() {
        if (!this._fullscreenPanel) return;
        this._fullscreenPanel.remove();
        this._fullscreenPanel = null;
        this._isFullscreenPanelVisible = false;
    },

    applyFade: function(fadeIn, fadeOut, type) {
        var buffer = this.engine._buffer;
        var duration = buffer.duration;
        var sampleRate = buffer.sampleRate;
        var newBuffer = this.engine.ctx.createBuffer(
            buffer.numberOfChannels,
            buffer.length,
            sampleRate
        );
        for (var ch = 0; ch < buffer.numberOfChannels; ch++) {
            var src = buffer.getChannelData(ch);
            var dst = newBuffer.getChannelData(ch);
            for (var i = 0; i < buffer.length; i++) {
                var time = i / sampleRate;
                var gain = 1;
                if (fadeIn > 0 && time < fadeIn) {
                    var t = time / fadeIn;
                    gain = this._fadeCurve(t, type);
                }
                if (fadeOut > 0 && time > duration - fadeOut) {
                    var t2 = (duration - time) / fadeOut;
                    gain *= this._fadeCurve(t2, type);
                }
                dst[i] = src[i] * gain;
            }
        }
        this.engine._buffer = newBuffer;
        this.engine._fileBuffer = newBuffer;
        this.engine._duration = newBuffer.duration;
        this._toast('🌊 Fade применён (In: ' + fadeIn + 's, Out: ' + fadeOut + 's)');
    },

    _fadeCurve: function(t, type) {
        switch (type) {
            case 'linear': return t;
            case 'exponential': return 1 - Math.pow(1 - t, 2);
            case 'sine': return Math.sin(t * Math.PI / 2);
            default: return t;
        }
    },

    applyNormalize: function(targetDb, type) {
        var buffer = this.engine._buffer;
        var maxVal = 0;
        var rmsSum = 0;
        for (var ch = 0; ch < buffer.numberOfChannels; ch++) {
            var data = buffer.getChannelData(ch);
            for (var i = 0; i < data.length; i++) {
                var abs = Math.abs(data[i]);
                if (abs > maxVal) maxVal = abs;
                rmsSum += data[i] * data[i];
            }
        }
        var rms = Math.sqrt(rmsSum / (buffer.length * buffer.numberOfChannels));
        var current = type === 'peak' ? maxVal : rms;
        var target = Math.pow(10, targetDb / 20);
        var gain = current > 0 ? target / current : 1;
        var newBuffer = this.engine.ctx.createBuffer(
            buffer.numberOfChannels,
            buffer.length,
            buffer.sampleRate
        );
        for (var ch2 = 0; ch2 < buffer.numberOfChannels; ch2++) {
            var src2 = buffer.getChannelData(ch2);
            var dst2 = newBuffer.getChannelData(ch2);
            for (var i2 = 0; i2 < src2.length; i2++) {
                dst2[i2] = Math.max(-1, Math.min(1, src2[i2] * gain));
            }
        }
        this.engine._buffer = newBuffer;
        this.engine._fileBuffer = newBuffer;
        this._toast('📊 Нормализация: ' + targetDb + 'dB (' + type + ')');
    },

    applyReverse: function() {
        var buffer = this.engine._buffer;
        var newBuffer = this.engine.ctx.createBuffer(
            buffer.numberOfChannels,
            buffer.length,
            buffer.sampleRate
        );
        for (var ch = 0; ch < buffer.numberOfChannels; ch++) {
            var src = buffer.getChannelData(ch);
            var dst = newBuffer.getChannelData(ch);
            for (var i = 0; i < src.length; i++) {
                dst[i] = src[src.length - 1 - i];
            }
        }
        this.engine._buffer = newBuffer;
        this.engine._fileBuffer = newBuffer;
        this.engine._duration = newBuffer.duration;
        this._toast('🔄 Реверс применён');
    },

    applySpeed: function(factor) {
        var buffer = this.engine._buffer;
        
        var newLength = Math.floor(buffer.length / factor);
        
        if (newLength < 10) {
            this._toast('❌ Слишком маленькая длина');
            return;
        }

        var newBuffer = this.engine.ctx.createBuffer(
            buffer.numberOfChannels,
            newLength,
            buffer.sampleRate
        );

        var step = factor;

        for (var ch = 0; ch < buffer.numberOfChannels; ch++) {
            var src = buffer.getChannelData(ch);
            var dst = newBuffer.getChannelData(ch);

            for (var i = 0; i < newLength; i++) {
                var pos = i * step;
                var idx = Math.floor(pos);
                var frac = pos - idx;

                if (idx < src.length - 1) {
                    dst[i] = src[idx] * (1 - frac) + src[idx + 1] * frac;
                } else {
                    dst[i] = src[src.length - 1] || 0;
                }
            }
        }

        this.engine._buffer = newBuffer;
        this.engine._fileBuffer = newBuffer;
        this.engine._duration = newBuffer.duration;
        
        var speedText = factor > 1 ? 'ускорение' : (factor < 1 ? 'замедление' : 'норма');
        this._toast('⏱️ Скорость: ' + factor.toFixed(2) + 'x (' + speedText + ', тон изменён)');
    }
};
