// ================================================================
// EQ WIDGET DOM — построение DOM-структуры
// ================================================================

export default {
    init() {
        this.effectsHistory = [];
        this.effectsHistoryIndex = -1;
        this.trimMode = false;
        this.trimStart = 0;
        this.trimEnd = 1;
        this.isTrimDragging = false;
        this.trimDragType = null;
        this._trimDragRect = null;
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
        this._abState = 'A';
        this._dotRefs = {};
    },

    _buildDOM() {
        this.container.classList.add('hh-eq');
        this.container.innerHTML = `
        <div class="eq-header">
            <div class="eq-logo"><b>HH</b>Records · EQ Pro</div>
            <div class="hdr-right">
                <div style="display:flex;align-items:center;gap:3px;position:relative">
                    <select class="hdr-sel" data-r="preset"><option value="">💾 Пресеты</option></select>
                </div>
                <div class="effects-dropdown">
                    <button class="hdr-btn effects-toggle" data-r="effectsToggle">🎛️ Эффекты ▾</button>
                    <div class="effects-menu" data-r="effectsMenu">
                        <button data-action="trim">✂️ Обрезка</button>
                        <button data-action="fade">🌊 Fade In/Out</button>
                        <button data-action="normalize">📊 Нормализация</button>
                        <button data-action="reverse">🔄 Реверс</button>
                        <button data-action="speed">⏱️ Скорость</button>
                        <div class="menu-sep"></div>
                        <button data-action="undoFx">↶ Отменить эффект</button>
                        <button data-action="redoFx">↷ Повторить эффект</button>
                        <button data-action="resetFx" style="color:#ff5050;">↺ Сбросить все эффекты</button>
                    </div>
                </div>
                <button class="hdr-btn" data-r="undo" disabled>↶</button>
                <button class="hdr-btn" data-r="redo" disabled>↷</button>
                <button class="hdr-btn" data-r="bypass">⊘</button>
                <button class="hdr-btn" data-r="ab">A</button>
                <button class="hdr-btn theme-toggle" data-r="theme">☀</button>
                <button class="hdr-btn" data-r="fs">⛶</button>
                <div class="settings-wrap">
                    <button class="hdr-btn" data-r="setbtn">⚙</button>
                    <div class="settings-menu" data-r="setmenu">
                        <button data-a="reset">⬜ Сбросить всё</button>
                        <div class="menu-sep"></div>
                        <button data-a="delta">🌀 Delta: ${this.state.deltaMode ? 'Вкл' : 'Выкл'}</button>
                        <button data-a="spec">📊 Спектр</button>
                        <button data-a="peakh">📈 Peak Hold</button>
                        <button data-a="grid">📐 Сетка</button>
                        <button data-a="autogain">🎯 Auto-Gain: ${this.state.autoGain ? 'Вкл' : 'Выкл'}</button>
                        <div class="menu-sep"></div>
                        <button data-a="clip">🔇 Soft Clip: ${this.state.softClip ? 'Вкл' : 'Выкл'}</button>
                        <button data-a="exportWav">💾 Сохранить WAV</button>
                        <button data-a="exportMp3">💾 Сохранить MP3</button>
                        <button data-a="shortcuts">⌨️ Горячие клавиши</button>
                        <div class="menu-sep"></div>
                        <button data-a="playRecorded">▶ Воспроизвести запись</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="eq-graph-wrapper">
            <div class="vu-side" data-vu="in">
                <div class="vu-scale"><span>+3</span><span>0</span><span>-10</span><span>-20</span></div>
                <div class="vu-bar">
                    <div class="vu-fill" data-r="vuInFill"></div>
                    <div class="vu-clip" data-r="vuInClip"></div>
                </div>
                <span class="vu-label">Вход</span>
            </div>
            <div class="eq-graph">
                <div class="graph-inner" data-r="inner">
                    <canvas class="spec-canvas" data-r="canvas"></canvas>
                    <svg data-r="svg" viewBox="0 0 900 400" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="#f5c542" stop-opacity=".15"/>
                                <stop offset="100%" stop-color="#f5c542" stop-opacity=".01"/>
                            </linearGradient>
                        </defs>
                        <g data-r="grid"></g>
                        <polygon data-r="fill" class="main-curve-fill" fill="url(#fg)"/>
                        <g data-r="bcurves"></g>
                        <polyline data-r="curve" class="main-curve"/>
                        <g data-r="dots"></g>
                        <line data-r="hline" class="hover-line" style="display:none"/>
                        <text data-r="hfreq" class="hover-text" style="display:none"></text>
                        <text data-r="hgain" class="hover-text" style="display:none" fill="#f5c542"></text>
                        <g data-r="labels"></g>
                    </svg>
                    <div data-r="tooltip" class="graph-tooltip"></div>
                    <div class="loading-spinner" data-r="spinner"></div>
                </div>
            </div>
            <div class="vu-side" data-vu="out">
                <div class="vu-scale"><span>+3</span><span>0</span><span>-10</span><span>-20</span></div>
                <div class="vu-bar">
                    <div class="vu-fill" data-r="vuOutFill"></div>
                    <div class="vu-clip" data-r="vuOutClip"></div>
                </div>
                <span class="vu-label">Выход</span>
            </div>
        </div>
        <div class="eq-timeline" data-r="timeline">
            <div class="tl-track" data-r="tltrack">
                <div class="tl-fill" data-r="tlfill"></div>
                <div class="tl-head" data-r="tlhead"></div>
                <div class="trim-marker trim-start" data-r="trimStart"></div>
                <div class="trim-marker trim-end" data-r="trimEnd"></div>
                <div class="trim-region" data-r="trimRegion"></div>
            </div>
            <div class="tl-info-row">
                <span class="tl-time" data-r="tltime">0:00 / 0:00</span>
                <span class="trim-info" data-r="trimInfo"></span>
            </div>
        </div>
        <div class="eq-demo-row" data-r="demoRow">
            <div class="demo-controls">
                <label>Волна:</label>
                <select data-r="demoWave">
                    <option value="sine">Синус</option>
                    <option value="square">Квадрат</option>
                    <option value="sawtooth">Пила</option>
                    <option value="triangle">Треугольник</option>
                    <option value="noise">Белый шум</option>
                </select>
                <label>Freq:</label>
                <input type="range" data-r="demoFreq" min="0" max="1" step="0.001" value="0.3">
                <span class="demo-val" data-r="demoFreqVal">220 Hz</span>
            </div>
        </div>
        <div data-r="panel" class="eq-band-panel"></div>
        <div class="eq-transport">
            <button class="play-btn" data-r="play">▶ Play</button>
            <button class="src-btn active" data-src="source">🎵 Источник</button>
            <button class="src-btn" data-src="demo">🔊 Демо</button>
            <input type="file" accept="audio/*" class="hidden-input" data-r="file">
            <button class="src-btn" data-src="recorded" id="recordedBtn" style="display:none">📼 Запись</button>
            <button class="hdr-btn" data-r="trimApply" style="display:none;color:#50c878;border-color:rgba(80,200,120,0.3);">
                ✅ Применить
            </button>
            <button class="hdr-btn" data-r="trimCancel" style="display:none;color:#ff5050;border-color:rgba(255,80,80,0.3);">
                ✕ Отмена
            </button>
            <div class="vol-controls">
                <div class="vol-item" data-r="inVolItem">
                    <label>⬅</label>
                    <input type="range" data-r="inGain" min="0" max="2" step="0.01" value="${this.state.inputGain}">
                    <span class="vol-val" data-r="inGainVal">${Math.round(this.state.inputGain*100)}%</span>
                </div>
                <div class="vol-item" data-r="outVolItem">
                    <label>➡</label>
                    <input type="range" data-r="outGain" min="0" max="2" step="0.01" value="${this.state.outputGain}">
                    <span class="vol-val" data-r="outGainVal">${Math.round(this.state.outputGain*100)}%</span>
                </div>
            </div>
            <span class="status-txt" data-r="status"></span>
        </div>
        <div class="source-controls" id="sourceControls">
            <span class="source-name" style="font-weight:600;font-size:.65rem;min-width:100px;">🎤 Микрофон</span>
            <span class="source-status" style="font-size:.5rem;color:var(--accent2);">▶ Воспроизведение</span>
            <span class="source-timer" data-r="captureStatus" style="display:none;color:#ff5050;font-size:.5rem;font-weight:600;">⏺ 0:00</span>
            <div style="margin-left:auto;display:flex;gap:4px;flex-wrap:wrap;">
                <button class="hdr-btn sound-on" data-action="toggle-eq" style="font-size:.55rem;padding:0 10px;min-width:70px;">🎛️ EQ ВКЛ</button>
                <button class="hdr-btn" data-action="toggle-record" style="font-size:.55rem;padding:0 10px;min-width:70px;">⏺ Запись</button>
                <button class="hdr-btn" data-action="save-capture" style="display:none;font-size:.55rem;padding:0 10px;min-width:70px;color:var(--accent);">💾 Сохранить</button>
            </div>
        </div>
        <div class="ctx-menu" data-r="ctx">
            <button data-a="mute">🔇 Mute</button>
            <button data-a="solo">S Solo</button>
            <button data-a="dynamic">🎛 Dynamic EQ</button>
            <button data-a="ms">🎧 Mid/Side</button>
            <button data-a="duplicate">⧉ Дублировать</button>
            <button data-a="reset">⟳ Сброс</button>
            <button data-a="invert">↕ Инверт</button>
            <button data-a="delete" class="danger">✕ Удалить</button>
        </div>
        `;

        // Собираем ссылки на элементы
        this.el = {};
        for (const el of this.container.querySelectorAll('[data-r]')) {
            this.el[el.dataset.r] = el;
        }
        this.el.effectsToggle = this.container.querySelector('[data-r="effectsToggle"]');
        this.el.effectsMenu = this.container.querySelector('[data-r="effectsMenu"]');
        this.el.trimApply = this.container.querySelector('[data-r="trimApply"]');
        this.el.trimCancel = this.container.querySelector('[data-r="trimCancel"]');

        this.canvas = this.el.canvas;
        this.cctx = this.canvas.getContext('2d');

        this._buildPresetSelect();
        this._updateTransport();
        this._updateTimelineVisibility();
        this._renderBandPanel();

        // ===== ИСПРАВЛЕНИЕ: ЛОГАРИФМИЧЕСКАЯ ШКАЛА ДЛЯ ДЕМО-ЧАСТОТЫ =====
        this.el.demoWave.addEventListener('change', (e) => {
            const freq = this._sliderToFreq(parseFloat(this.el.demoFreq.value));
            this.engine.setDemoParams(e.target.value, freq);
        });
        
        this.el.demoFreq.addEventListener('input', (e) => {
            const t = parseFloat(e.target.value);
            const freq = this._sliderToFreq(t);
            const freqText = freq >= 1000 ? (freq / 1000).toFixed(2) + ' kHz' : Math.round(freq) + ' Hz';
            this.el.demoFreqVal.textContent = freqText;
            this.engine.setDemoParams(this.el.demoWave.value, freq);
        });

        // Устанавливаем начальное значение
        const initialFreq = this._sliderToFreq(parseFloat(this.el.demoFreq.value));
        const initialText = initialFreq >= 1000 ? (initialFreq / 1000).toFixed(2) + ' kHz' : Math.round(initialFreq) + ' Hz';
        this.el.demoFreqVal.textContent = initialText;

        // ===== ФИКС ТРАНСПОРТА (ПРЯМО В JS) =====
        const transport = this.container.querySelector('.eq-transport');
        if (transport) {
            transport.style.display = 'flex';
            transport.style.alignItems = 'center';
            transport.style.justifyContent = 'flex-start';
            transport.style.gap = '6px';
            transport.style.flexWrap = 'wrap';
            
            const playBtn = transport.querySelector('.play-btn');
            if (playBtn) {
                playBtn.style.marginRight = 'auto';
            }
            
            const volControls = transport.querySelector('.vol-controls');
            if (volControls) {
                volControls.style.marginLeft = 'auto';
            }
        }
    },

    // ===== ПРЕОБРАЗОВАНИЕ ДЛЯ ЛОГАРИФМИЧЕСКОЙ ШКАЛЫ =====
    _freqToSlider: function(freq) {
        const minFreq = 20;
        const maxFreq = 20000;
        return (Math.log10(freq) - Math.log10(minFreq)) / (Math.log10(maxFreq) - Math.log10(minFreq));
    },

    _sliderToFreq: function(t) {
        const minFreq = 20;
        const maxFreq = 20000;
        return Math.round(Math.pow(10, Math.log10(minFreq) + t * (Math.log10(maxFreq) - Math.log10(minFreq))));
    },

    // ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ =====
    _svgEl(tag, attrs) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
        return el;
    },

    _fToX(f) {
        return this.L + ((Math.log10(f) - Math.log10(this.FMIN)) / (Math.log10(this.FMAX) - Math.log10(this.FMIN))) * (this.R - this.L);
    },

    _xToF(x) {
        return Math.pow(10, Math.log10(this.FMIN) + ((x - this.L) / (this.R - this.L)) * (Math.log10(this.FMAX) - Math.log10(this.FMIN)));
    },

    _dbToY(db) {
        const c = Math.max(this.GMIN, Math.min(this.GMAX, db));
        return this.B - ((c - this.GMIN) / (this.GMAX - this.GMIN)) * (this.B - this.T);
    },

    _yToDb(y) {
        return this.GMIN + (1 - ((y - this.T) / (this.B - this.T))) * (this.GMAX - this.GMIN);
    },

    _fToSlider(f) {
        return (Math.log10(f) - Math.log10(this.FMIN)) / (Math.log10(this.FMAX) - Math.log10(this.FMIN));
    },

    _sliderToF(v) {
        return Math.pow(10, Math.log10(this.FMIN) + v * (Math.log10(this.FMAX) - Math.log10(this.FMIN)));
    },

    _isGainless(type) {
        return type === 'lowcut' || type === 'highcut' || type === 'notch' || type === 'bandpass';
    },

    _displayGain(band) {
        const mode = band.channelMode || 'stereo';
        let gain = 0;
        if (mode === 'stereo') gain = band.gain || 0;
        else if (mode === 'mid') gain = band.midGain || 0;
        else if (mode === 'side') gain = band.sideGain || 0;
        else if (mode === 'left') gain = band.leftGain || 0;
        else if (mode === 'right') gain = band.rightGain || 0;
        return this._isGainless(band.type) ? 0 : gain;
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

    _formatTime(seconds) {
        if (!seconds || seconds === Infinity) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    _toast(message) {
        let t = document.querySelector('.hh-toast');
        if (!t) {
            t = document.createElement('div');
            t.className = 'hh-toast';
            document.body.appendChild(t);
        }
        t.textContent = message;
        t.classList.add('show');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
    },

    // ===== ПРЕСЕТЫ =====
    _buildPresetSelect() {
        const s = this.el.preset;
        const current = s.value;
        s.innerHTML = '<option value="">💾 Пресеты</option>';
        const names = this.state.getPresetNames();
        names.sort((a, b) => {
            if (a === 'Flat') return -1;
            if (b === 'Flat') return 1;
            return a.localeCompare(b);
        });
        for (const name of names) {
            const o = document.createElement('option');
            o.value = name;
            o.textContent = name;
            s.appendChild(o);
        }
        const sep = document.createElement('option');
        sep.disabled = true;
        sep.textContent = '──────────';
        s.appendChild(sep);
        const saveOpt = document.createElement('option');
        saveOpt.value = '__save';
        saveOpt.textContent = '💾 Сохранить как...';
        s.appendChild(saveOpt);
        const deleteOpt = document.createElement('option');
        deleteOpt.value = '__delete';
        deleteOpt.textContent = '🗑️ Удалить пресет...';
        s.appendChild(deleteOpt);
        if (current && names.includes(current)) s.value = current;
        if (!s.dataset.bound) {
            s.dataset.bound = '1';
            s.addEventListener('change', (e) => {
                const val = e.target.value;
                if (val === '__save') {
                    const name = prompt('Название пресета:', 'Мой пресет');
                    if (name && name.trim()) {
                        const trimmed = name.trim();
                        if (this.state.presets[trimmed] && !confirm(`Пресет "${trimmed}" уже существует. Перезаписать?`)) return;
                        this.state.savePreset(trimmed);
                        this._buildPresetSelect();
                        this.el.preset.value = trimmed;
                        this._toast(`💾 Пресет "${trimmed}" сохранён`);
                    }
                    return;
                }
                if (val === '__delete') {
                    const names = this.state.getPresetNames().filter(n => n !== 'Flat');
                    if (names.length === 0) {
                        this._toast('❌ Нет пресетов для удаления');
                        return;
                    }
                    const select = document.createElement('select');
                    select.innerHTML = '<option value="">Выберите пресет для удаления</option>';
                    for (const n of names) {
                        const opt = document.createElement('option');
                        opt.value = n;
                        opt.textContent = n;
                        select.appendChild(opt);
                    }
                    const modal = document.createElement('div');
                    modal.className = 'hh-modal open';
                    modal.style.display = 'flex';
                    modal.innerHTML = `
                        <div class="hh-modal-content" style="max-width:350px;">
                            <h3 style="font-size:.9rem;color:var(--text);">🗑️ Удалить пресет</h3>
                            <p style="font-size:.7rem;color:var(--text2);margin:8px 0;">Выберите пресет для удаления:</p>
                            <div style="margin:10px 0;"></div>
                            <div style="display:flex;gap:6px;margin-top:8px;">
                                <button class="hdr-btn" data-action="confirm-delete" style="color:#ff5050;padding:4px 16px;">Удалить</button>
                                <button class="hdr-btn" data-action="cancel-delete" style="padding:4px 16px;">Отмена</button>
                            </div>
                        </div>
                    `;
                    const container = modal.querySelector('.hh-modal-content > div:not(:last-child)');
                    container.appendChild(select);
                    document.body.appendChild(modal);
                    let selected = '';
                    select.addEventListener('change', () => { selected = select.value; });
                    modal.querySelector('[data-action="confirm-delete"]').addEventListener('click', () => {
                        if (selected) {
                            if (this.state.deletePreset(selected)) {
                                this._buildPresetSelect();
                                this.el.preset.value = '';
                                this._toast(`🗑️ Пресет "${selected}" удалён`);
                            }
                            modal.classList.remove('open');
                            setTimeout(() => modal.remove(), 300);
                        } else {
                            this._toast('❌ Выберите пресет');
                        }
                    });
                    modal.querySelector('[data-action="cancel-delete"]').addEventListener('click', () => {
                        modal.classList.remove('open');
                        setTimeout(() => modal.remove(), 300);
                    });
                    modal.addEventListener('click', (e) => {
                        if (e.target === modal) {
                            modal.classList.remove('open');
                            setTimeout(() => modal.remove(), 300);
                        }
                    });
                    return;
                }
                if (val) {
                    if (this.state.loadPreset(val)) {
                        this.engine.updateFilters(false);
                        this._render();
                        this._toast('🎵 ' + val);
                    }
                }
            });
        }
    },

    // ===== ИСТОЧНИК ЗВУКА (С DIALOG) =====
    _showSourceSelector() {
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        const supportsSystemAudio = !isIOS && navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function';
        
        const oldDialog = document.querySelector('.hh-source-dialog');
        if (oldDialog) oldDialog.remove();

        const dialog = document.createElement('dialog');
        dialog.className = 'hh-source-dialog';
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg2, #111118);
            border: 1px solid var(--border, rgba(255,255,255,.06));
            border-radius: 14px;
            padding: 24px;
            max-width: 420px;
            width: 90%;
            color: var(--text, #fff);
            box-shadow: 0 20px 60px rgba(0,0,0,0.6);
            z-index: 999999;
            border: none;
            margin: 0;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .hh-source-dialog::backdrop {
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
            }
        `;
        document.head.appendChild(style);

        dialog.innerHTML = `
            <h3 style="margin-bottom:12px;color:var(--accent, #f5c542);font-size:1rem;margin-top:0;">🎵 Источник звука</h3>
            <p style="font-size:.7rem;color:var(--text2, #999);margin-bottom:16px;">Выберите источник звука:</p>
            <div class="source-card" data-source="mic" style="background:var(--bg3, #1a1a24);border:2px solid var(--border, rgba(255,255,255,.06));border-radius:8px;padding:14px;margin-bottom:8px;cursor:pointer;transition:all .2s;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:1.5rem;">🎤</span>
                    <div><div style="font-weight:600;font-size:.8rem;">Микрофон</div><div style="font-size:.6rem;color:var(--text2, #999);">Звук с вашего микрофона</div></div>
                </div>
            </div>
            <div class="source-card" data-source="system" style="${supportsSystemAudio ? '' : 'opacity:0.4;cursor:not-allowed;'}background:var(--bg3, #1a1a24);border:2px solid var(--border, rgba(255,255,255,.06));border-radius:8px;padding:14px;margin-bottom:8px;cursor:${supportsSystemAudio ? 'pointer' : 'default'};transition:all .2s;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:1.5rem;">🔊</span>
                    <div><div style="font-weight:600;font-size:.8rem;">Системный звук</div><div style="font-size:.6rem;color:var(--text2, #999);">${supportsSystemAudio ? 'Звук из вкладки/окна браузера' : '❌ Недоступно'}</div></div>
                </div>
            </div>
            <div class="source-card" data-source="file" style="background:var(--bg3, #1a1a24);border:2px solid var(--border, rgba(255,255,255,.06));border-radius:8px;padding:14px;margin-bottom:8px;cursor:pointer;transition:all .2s;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:1.5rem;">📁</span>
                    <div><div style="font-weight:600;font-size:.8rem;">Файл</div><div style="font-size:.6rem;color:var(--text2, #999);">Загрузить аудиофайл</div></div>
                </div>
            </div>
            <button class="modal-close-btn" style="margin-top:16px;background:var(--btn-bg, rgba(255,255,255,.04));color:var(--text2, #999);border:1px solid var(--border, rgba(255,255,255,.06));padding:8px 16px;border-radius:6px;font-size:.7rem;cursor:pointer;width:100%;">✕ Закрыть</button>
        `;

        document.body.appendChild(dialog);
        dialog.showModal();

        dialog.querySelectorAll('.source-card').forEach(card => {
            card.addEventListener('click', () => {
                const source = card.dataset.source;
                dialog.close();
                dialog.remove();
                style.remove();
                this._selectSource(source);
            });
        });

        dialog.querySelector('.modal-close-btn').addEventListener('click', () => {
            dialog.close();
            dialog.remove();
            style.remove();
        });

        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.close();
                dialog.remove();
                style.remove();
            }
        });

        dialog.addEventListener('close', () => {
            setTimeout(() => {
                dialog.remove();
                style.remove();
            }, 100);
        });
    },

    _selectSource(source) {
        if (source === 'mic') {
            if (this.engine._isRecording) {
                this._toast('Идёт запись, остановите через кнопку');
                return;
            }
            this.engine.stopSource();
            this.engine.playSource('mic');
            this._showSourceControls('mic');
            this._toast('🎤 Микрофон активирован');
        } else if (source === 'system') {
            const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (isIOS) {
                this._toast('📱 Захват системного звука недоступен на iOS');
                return;
            }
            if (!navigator.mediaDevices || typeof navigator.mediaDevices.getDisplayMedia !== 'function') {
                this._toast('❌ Ваш браузер не поддерживает захват системного звука');
                return;
            }
            this.engine.stopSource();
            this.el.spinner.classList.add('active');
            this.engine.captureSystemAudio()
                .then((success) => {
                    this.el.spinner.classList.remove('active');
                    if (success) {
                        this._showSourceControls('system');
                        this._toast('🔊 Системный звук активирован');
                    } else {
                        this._toast('❌ Ошибка захвата');
                    }
                })
                .catch((err) => {
                    this.el.spinner.classList.remove('active');
                    this._toast('❌ Ошибка: ' + err.message);
                });
        } else if (source === 'file') {
            this.el.file.click();
        }
    },

    _showSourceControls(type) {
        const controls = document.getElementById('sourceControls');
        if (!controls) return;
        controls.style.display = 'flex';
        const sourceName = controls.querySelector('.source-name');
        if (sourceName) {
            const names = { mic: '🎤 Микрофон', system: '🔊 Системный звук', file: '📁 Файл' };
            sourceName.textContent = names[type] || 'Источник';
        }
        const eqBtn = controls.querySelector('[data-action="toggle-eq"]');
        if (eqBtn) {
            eqBtn.textContent = '🎛️ EQ ВКЛ';
            eqBtn.className = 'hdr-btn sound-on';
            eqBtn.dataset.eq = 'on';
        }
        const recordBtn = controls.querySelector('[data-action="toggle-record"]');
        if (recordBtn) {
            recordBtn.style.display = (type === 'file') ? 'none' : 'inline-block';
            recordBtn.textContent = '⏺ Запись';
            recordBtn.className = 'hdr-btn';
            recordBtn.dataset.recording = 'off';
        }
        const saveBtn = controls.querySelector('[data-action="save-capture"]');
        if (saveBtn) saveBtn.style.display = 'none';
        const status = controls.querySelector('.source-status');
        if (status) {
            status.textContent = '▶ Воспроизведение';
            status.style.color = 'var(--accent2)';
        }
        const timer = controls.querySelector('.source-timer');
        if (timer) timer.style.display = 'none';
    },

    _saveCapturedFile(audioBuffer) {
        try {
            const wavBlob = this.engine._bufferToWav(audioBuffer);
            if (!wavBlob || wavBlob.size === 0) {
                this._toast('❌ Ошибка: пустой файл');
                return false;
            }
            const url = URL.createObjectURL(wavBlob);
            const a = document.createElement('a');
            a.href = url;
            const date = new Date();
            const timestamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}-${String(date.getMinutes()).padStart(2, '0')}-${String(date.getSeconds()).padStart(2, '0')}`;
            a.download = `captured_audio_${timestamp}.wav`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 10000);
            this._toast('✅ Файл сохранен на диск!');
            return true;
        } catch(e) {
            this._toast('❌ Ошибка сохранения: ' + e.message);
            return false;
        }
    },

    _renderCurves() {
        const zeroY = this._dbToY(0);
        const pts = [];
        const fillPts = [];
        const steps = this.isMobile ? 120 : 250;
        for (let i = 0; i <= steps; i++) {
            const f = Math.pow(10, Math.log10(this.FMIN) + (i / steps) * (Math.log10(this.FMAX) - Math.log10(this.FMIN)));
            const x = this._fToX(f);
            const y = this._dbToY(this.engine.calcTotal(f));
            pts.push(x.toFixed(1) + ',' + y.toFixed(1));
            fillPts.push(x.toFixed(1) + ',' + y.toFixed(1));
        }
        this.el.curve.setAttribute('points', pts.join(' '));
        fillPts.push(this.R + ',' + zeroY);
        fillPts.push(this.L + ',' + zeroY);
        this.el.fill.setAttribute('points', fillPts.join(' '));

        const cg = this.el.bcurves;
        const existing = {};
        for (const el of cg.querySelectorAll('polyline, polygon')) existing[el.dataset.band] = el;
        const used = {};
        for (const band of this.state.bands) {
            if (!this.state.isEffectivelyEnabled(band.id)) continue;
            used[band.id] = true;
            const mode = band.channelMode || 'stereo';
            const bsteps = this.isMobile ? 60 : 120;
            let gain = 0;
            if (mode === 'stereo') gain = band.gain || 0;
            else if (mode === 'mid') gain = band.midGain || 0;
            else if (mode === 'side') gain = band.sideGain || 0;
            else if (mode === 'left') gain = band.leftGain || 0;
            else if (mode === 'right') gain = band.rightGain || 0;
            const bp = [];
            for (let i = 0; i <= bsteps; i++) {
                const f = Math.pow(10, Math.log10(this.FMIN) + (i / bsteps) * (Math.log10(this.FMAX) - Math.log10(this.FMIN)));
                const g = this.engine.calcFilter(band.type, f, band.freq, gain, band.q);
                bp.push(this._fToX(f).toFixed(1) + ',' + this._dbToY(g).toFixed(1));
            }
            let el = existing[band.id];
            if (el && el.tagName === 'polyline') {
                el.setAttribute('points', bp.join(' '));
                el.setAttribute('class', 'band-curve' + (band.id === this.state.activeId ? ' active' : ''));
                el.setAttribute('stroke', band.color);
            } else {
                const polyline = this._svgEl('polyline', {
                    points: bp.join(' '),
                    class: 'band-curve' + (band.id === this.state.activeId ? ' active' : ''),
                    stroke: band.color,
                    'data-band': band.id
                });
                cg.appendChild(polyline);
                el = polyline;
            }
            const isDyn = band.dynamic && band.dynamic.enabled && !this.state.bypassed;
            if (isDyn) {
                const reduction = this.engine.getDynamicReduction(band.id);
                const currentGain = gain - reduction;
                const minBp = [];
                for (let i = 0; i <= bsteps; i++) {
                    const f = Math.pow(10, Math.log10(this.FMIN) + (i / bsteps) * (Math.log10(this.FMAX) - Math.log10(this.FMIN)));
                    const gainAtF = this.engine.calcFilter(band.type, f, band.freq, currentGain, band.q);
                    minBp.push(this._fToX(f).toFixed(1) + ',' + this._dbToY(gainAtF).toFixed(1));
                }
                const minId = band.id + '_min';
                let minCurve = existing[minId];
                if (minCurve) {
                    minCurve.setAttribute('points', minBp.join(' '));
                } else {
                    minCurve = this._svgEl('polyline', {
                        points: minBp.join(' '),
                        class: 'band-curve dyn-min',
                        stroke: band.color,
                        'data-band': minId,
                        'stroke-dasharray': '4,4',
                        opacity: 0.5,
                        'stroke-width': 1.2
                    });
                    cg.appendChild(minCurve);
                }
                used[minId] = true;
                const areaId = band.id + '_area';
                const areaPoints = bp.concat(minBp.slice().reverse());
                let area = existing[areaId];
                if (area) {
                    area.setAttribute('points', areaPoints.join(' '));
                } else {
                    area = this._svgEl('polygon', {
                        points: areaPoints.join(' '),
                        class: 'band-curve dyn-area',
                        fill: band.color,
                        'fill-opacity': 0.15,
                        'data-band': areaId
                    });
                    cg.appendChild(area);
                }
                used[areaId] = true;
            }
        }
        for (const id in existing) {
            if (!used[id]) existing[id].remove();
        }
    },

    _renderDots() {
        const dg = this.el.dots;
        dg.innerHTML = '';
        this._dotRefs = {};
        for (let i = 0; i < this.state.bands.length; i++) {
            const band = this.state.bands[i];
            const isActive = band.id === this.state.activeId;
            const num = i + 1;
            const mode = band.channelMode || 'stereo';
            const gain = this._displayGain(band);
            const cx = this._fToX(band.freq);
            const cy = this._dbToY(gain);
            const effectiveEnabled = this.state.isEffectivelyEnabled(band.id);
            const dot = this._svgEl('circle', {
                cx,
                cy,
                r: isActive ? 14 : 9,
                fill: band.color,
                'fill-opacity': effectiveEnabled ? (isActive ? 1 : 0.7) : 0.25,
                stroke: isActive ? '#f5c542' : (effectiveEnabled ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.1)'),
                'stroke-width': isActive ? 3 : 2,
                class: 'band-dot' + (isActive ? ' active-dot' : '')
            });
            const hit = this._svgEl('circle', {
                cx,
                cy,
                r: 40,
                class: 'dot-hit',
                'data-band': band.id,
                'data-channel': 'main',
                fill: 'rgba(0,0,0,0.001)',
                'pointer-events': 'all'
            });
            const txt = this._svgEl('text', { x: cx, y: cy + 3, 'text-anchor': 'middle', class: 'band-num' });
            txt.textContent = num > 9 ? '•' : num;
            const label = this._svgEl('text', { x: cx, y: cy + 16, 'text-anchor': 'middle', class: 'band-label' });
            const modeLabels = { 'stereo': 'S', 'mid': 'M', 'side': 'S', 'left': 'L', 'right': 'R' };
            label.textContent = modeLabels[mode] || 'S';
            dg.appendChild(dot);
            dg.appendChild(hit);
            dg.appendChild(txt);
            dg.appendChild(label);
            this._dotRefs[band.id] = { dot, hit, num: txt, label: label };
        }
    },

    _updateDotLive(id) {
        const band = this.state.bands.find(b => b.id === id);
        if (!band) return;
        const refs = this._dotRefs[id];
        if (!refs) return;
        const mode = band.channelMode || 'stereo';
        const gain = this._displayGain(band);
        const cx = this._fToX(band.freq);
        const cy = this._dbToY(gain);
        refs.dot.setAttribute('cx', cx);
        refs.dot.setAttribute('cy', cy);
        refs.hit.setAttribute('cx', cx);
        refs.hit.setAttribute('cy', cy);
        if (refs.num) {
            refs.num.setAttribute('x', cx);
            refs.num.setAttribute('y', cy + 3);
        }
        if (refs.label) {
            refs.label.setAttribute('x', cx);
            refs.label.setAttribute('y', cy + 16);
        }
    },

    _updateBandRowValues(id) {
        const band = this.state.bands.find(b => b.id === id);
        if (!band) return;
        const row = this.el.panel.querySelector(`.band-row[data-id="${id}"]`);
        if (!row) return;
        
        const freqText = band.freq >= 1000 ? (band.freq / 1000).toFixed(2) + 'k' : Math.round(band.freq);
        const fs = row.querySelector('[data-action="freq"]');
        if (fs) fs.value = this._fToSlider(band.freq);
        const fv = row.querySelector('[data-action="freq"] + .br-val');
        if (fv) fv.textContent = freqText;

        const modeSelect = row.querySelector('[data-action="mode"]');
        if (modeSelect) {
            const currentMode = band.channelMode || 'stereo';
            modeSelect.value = currentMode;
        }

        const mode = band.channelMode || 'stereo';
        let gainValue = 0;
        if (mode === 'stereo') gainValue = band.gain || 0;
        else if (mode === 'mid') gainValue = band.midGain || 0;
        else if (mode === 'side') gainValue = band.sideGain || 0;
        else if (mode === 'left') gainValue = band.leftGain || 0;
        else if (mode === 'right') gainValue = band.rightGain || 0;
        
        const gs = row.querySelector('[data-action="gain"]');
        if (gs) gs.value = gainValue;
        const gv = row.querySelector('[data-action="gain"] + .br-val');
        if (gv) gv.textContent = this._isGainless(band.type) ? '—' : gainValue.toFixed(1);

        const qs = row.querySelector('[data-action="q"]');
        if (qs) qs.value = band.q;
        const qv = row.querySelector('[data-action="q"] + .br-val');
        if (qv) qv.textContent = band.q.toFixed(1);

        const typeSelect = row.querySelector('[data-action="type"]');
        if (typeSelect) {
            typeSelect.value = band.type;
        }
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

    _resize() {
        const rect = this.el.inner.getBoundingClientRect();
        if (rect.width < 10 || rect.height < 10) return;
        const aspect = rect.width / rect.height;
        const W = Math.max(700, Math.min(1800, Math.round(400 * aspect)));
        this.VW = W;
        this.R = W - 25;
        this.el.svg.setAttribute('viewBox', `0 0 ${W} 400`);
        this.canvas.width = W;
        this.canvas.height = 400;
        this._dragRectDirty = true;
        this.el.grid.innerHTML = '';
        this.el.labels.innerHTML = '';
        this._buildGrid();
        this._render();
    },

    _buildGrid() {
        const grid = this.el.grid;
        const labels = this.el.labels;
        grid.innerHTML = '';
        labels.innerHTML = '';
        const freqs = [20, 30, 50, 70, 100, 200, 300, 500, 700, 1000, 2000, 3000, 5000, 7000, 10000, 15000, 20000];
        for (const f of freqs) {
            const x = this._fToX(f);
            const isMajor = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000].includes(f);
            grid.appendChild(this._svgEl('line', { x1: x, y1: this.T, x2: x, y2: this.B, class: isMajor ? 'grid-line-major' : 'grid-line' }));
            if (isMajor) {
                const t = this._svgEl('text', { x, y: this.B + 16, class: 'axis-label', 'text-anchor': 'middle' });
                t.textContent = f >= 1000 ? (f / 1000) + 'k' : f;
                labels.appendChild(t);
            }
        }
        for (let db = -20; db <= 20; db += 5) {
            const y = this._dbToY(db);
            const cls = db === 0 ? 'zero-line' : (Math.abs(db) % 10 === 0 ? 'grid-line-major' : 'grid-line');
            grid.appendChild(this._svgEl('line', { x1: this.L, y1: y, x2: this.R, y2: y, class: cls }));
            const t = this._svgEl('text', { x: this.L - 8, y: y + 3, class: 'axis-label', 'text-anchor': 'end' });
            t.textContent = (db > 0 ? '+' : '') + db;
            labels.appendChild(t);
        }
        grid.appendChild(this._svgEl('line', { x1: this.L, y1: this.B, x2: this.R, y2: this.B, class: 'axis-line' }));
        grid.appendChild(this._svgEl('line', { x1: this.L, y1: this.B, x2: this.L, y2: this.T, class: 'axis-line' }));
    },

    _updateScrollIndicator: function() {
        var panel = this.el.panel;
        if (!panel) return;
        var hasScroll = panel.scrollHeight > panel.clientHeight;
        panel.classList.toggle('has-scroll', hasScroll);
        
        if (hasScroll && !panel.querySelector('.scroll-indicator')) {
            var indicator = document.createElement('div');
            indicator.className = 'scroll-indicator';
            indicator.textContent = '⬇ Прокрутите вниз ⬇';
            panel.appendChild(indicator);
        } else if (!hasScroll) {
            var existing = panel.querySelector('.scroll-indicator');
            if (existing) existing.remove();
        }
    }
};
