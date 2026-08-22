// ================================================================
// EQ WIDGET PANEL — панель полос
// ================================================================

export default {
    init() {
        this._panelHandler = null;
    },

    _renderBandPanel() {
        const panel = this.el.panel;
        if (this.state.bands.length === 0) {
            panel.innerHTML = `<div style="padding:10px;color:var(--text3);font-size:.6rem">Нет полос. Кликните на график.</div>`;
            return;
        }
        let html = '';
        for (let i = 0; i < this.state.bands.length; i++) {
            const band = this.state.bands[i];
            const isActive = band.id === this.state.activeId;
            const freqText = band.freq >= 1000 ? (band.freq / 1000).toFixed(2) + 'k' : Math.round(band.freq);
            const noGain = this._isGainless(band.type);
            const dynOn = band.dynamic && band.dynamic.enabled;
            const mode = band.channelMode || 'stereo';
            const reduction = this.engine.getDynamicReduction(band.id);
            let gainValue = 0;
            if (mode === 'stereo') gainValue = band.gain || 0;
            else if (mode === 'mid') gainValue = band.midGain || 0;
            else if (mode === 'side') gainValue = band.sideGain || 0;
            else if (mode === 'left') gainValue = band.leftGain || 0;
            else if (mode === 'right') gainValue = band.rightGain || 0;

            html += `<div class="band-row ${isActive ? 'active' : ''} ${dynOn ? 'dynamic-active' : ''}" data-id="${band.id}">
                <div class="br-top">
                    <span class="br-dot" style="background:${band.color}"></span>
                    <span class="br-id">${i+1}</span>
                    <select data-action="type" class="band-type-select">
                        ${Object.entries(this.state.filterTypes).map(([k, v]) => `<option value="${k}"${band.type === k ? ' selected' : ''}>${v}</option>`).join('')}
                    </select>
                    <select class="br-mode band-mode-select" data-action="mode">
                        ${Object.entries(this.state.channelModes).map(([k, v]) => `<option value="${k}"${mode === k ? ' selected' : ''}>${v}</option>`).join('')}
                    </select>
                    <div class="br-actions">
                        <button class="br-btn dyn ${dynOn ? 'on' : ''}" data-action="dyn">D</button>
                        <button class="br-btn mute ${band.muted ? 'on' : ''}" data-action="mute">M</button>
                        <button class="br-btn solo ${band.solo ? 'on' : ''}" data-action="solo">S</button>
                        <button class="br-btn del" data-action="del">✕</button>
                    </div>
                    <span class="gr-display ${dynOn && reduction > 0.5 ? 'active' : ''}">${dynOn && reduction > 0.5 ? `-${reduction.toFixed(1)}dB` : (dynOn ? '○' : '')}</span>
                </div>
                <div class="br-params">
                    <div class="br-param">
                        <label>F</label>
                        <input type="range" min="0" max="1" step="0.001" value="${this._fToSlider(band.freq)}" data-action="freq">
                        <span class="br-val" style="color:#4a9eff">${freqText}</span>
                    </div>
                    <div class="br-param">
                        <label>G</label>
                        <input type="range" min="-20" max="20" step="0.5" value="${gainValue}" data-action="gain" ${noGain ? 'disabled' : ''}>
                        <span class="br-val" style="color:#f5c542">${noGain ? '—' : gainValue.toFixed(1)}</span>
                    </div>
                    <div class="br-param">
                        <label>Q</label>
                        <input type="range" min="0.1" max="10" step="0.1" value="${band.q}" data-action="q">
                        <span class="br-val" style="color:#50c878">${band.q.toFixed(1)}</span>
                    </div>
                </div>
                ${dynOn ? `
                <div class="br-dyn-params visible" data-dyn="${band.id}">
                    <div class="br-param">
                        <label>Th</label>
                        <input type="range" min="-60" max="0" step="1" value="${band.dynamic.threshold}" data-action="d-th">
                        <span class="br-val" style="color:#c77dff">${band.dynamic.threshold}dB</span>
                    </div>
                    <div class="br-param">
                        <label>R</label>
                        <input type="range" min="1" max="20" step="0.1" value="${band.dynamic.ratio}" data-action="d-r">
                        <span class="br-val" style="color:#c77dff">${band.dynamic.ratio}:1</span>
                    </div>
                    <div class="br-param">
                        <label>A</label>
                        <input type="range" min="1" max="100" step="1" value="${band.dynamic.attack}" data-action="d-a">
                        <span class="br-val" style="color:#c77dff">${band.dynamic.attack}ms</span>
                    </div>
                    <div class="br-param">
                        <label>Rel</label>
                        <input type="range" min="10" max="1000" step="10" value="${band.dynamic.release}" data-action="d-rel">
                        <span class="br-val" style="color:#c77dff">${band.dynamic.release}ms</span>
                    </div>
                </div>
                ` : ''}
            </div>`;
        }
        html += `<button class="bp-add" data-action="add">+ Добавить полосу</button>`;
        panel.innerHTML = html;

        // ===== ОБРАБОТЧИК ДЛЯ ВЫБОРА ТИПА ФИЛЬТРА =====
        panel.querySelectorAll('.band-type-select').forEach(select => {
            select.addEventListener('change', (e) => {
                e.stopPropagation();
                const row = select.closest('.band-row');
                if (!row) return;
                const id = parseInt(row.dataset.id);
                const newType = select.value;
                
                this.state.updateBand(id, { type: newType });
                this.engine.updateFilters(true);
                this._renderCurves();
                this._renderDots();
                this._updateBandRowValues(id);
                this.state.save();
                this._toast(`Тип: ${this.state.filterTypes[newType]}`);
            });
            
            select.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });

        // ===== ОБРАБОТЧИК ДЛЯ ВЫБОРА РЕЖИМА КАНАЛА =====
        panel.querySelectorAll('.band-mode-select').forEach(select => {
            select.addEventListener('change', (e) => {
                e.stopPropagation();
                const row = select.closest('.band-row');
                if (!row) return;
                const id = parseInt(row.dataset.id);
                const mode = select.value;
                
                const band = this.state.bands.find(b => b.id === id);
                if (!band) return;
                
                const oldMode = band.channelMode || 'stereo';
                let currentGain = 0;
                if (oldMode === 'stereo') currentGain = band.gain || 0;
                else if (oldMode === 'mid') currentGain = band.midGain || 0;
                else if (oldMode === 'side') currentGain = band.sideGain || 0;
                else if (oldMode === 'left') currentGain = band.leftGain || 0;
                else if (oldMode === 'right') currentGain = band.rightGain || 0;
                
                const updates = { channelMode: mode };
                if (mode === 'stereo') updates.gain = currentGain;
                else if (mode === 'mid') updates.midGain = currentGain;
                else if (mode === 'side') updates.sideGain = currentGain;
                else if (mode === 'left') updates.leftGain = currentGain;
                else if (mode === 'right') updates.rightGain = currentGain;
                
                this.state.updateBand(id, updates);
                this.engine.updateFilters(true);
                this._renderCurves();
                this._renderDots();
                this._updateBandRowValues(id);
                this.state.save();
                this._toast(`Режим: ${this.state.channelModes[mode]}`);
            });
            
            select.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });

        // Удаляем старый обработчик
        if (this._panelHandler) {
            panel.removeEventListener('click', this._panelHandler);
            this._panelHandler = null;
        }

        // ===== СОЗДАЁМ НОВЫЙ ОБРАБОТЧИК =====
        this._panelHandler = (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            if (target.tagName === 'SELECT') return;

            const row = target.closest('.band-row');
            if (!row) {
                if (target.dataset.action === 'add') {
                    if (this.state.bands.length >= this.state.maxBands) {
                        this._toast('⚠️ Максимум ' + this.state.maxBands + ' полос');
                        return;
                    }
                    const newBand = this.state.addBand({ freq: 1000, gain: 0 });
                    if (newBand) {
                        this.engine.updateFilters(false);
                        this._render();
                        this._toast('✅ Полоса добавлена');
                    }
                }
                return;
            }
            const id = parseInt(row.dataset.id);
            const action = target.dataset.action;

            if (action === 'type' || action === 'mode') {
                return;
            }

            switch (action) {
                case 'mute': {
                    this.state.muteBand(id);
                    this.engine.updateFilters(false);
                    this._render();
                    break;
                }
                case 'solo': {
                    this.state.soloBand(id);
                    this.engine.updateFilters(false);
                    this._render();
                    break;
                }
                case 'dyn': {
                    const band = this.state.bands.find(b => b.id === id);
                    band.dynamic.enabled = !band.dynamic.enabled;
                    this.state.pushHistory();
                    this.state.save();
                    this.engine.updateFilters(false);
                    this._render();
                    this._toast(band.dynamic.enabled ? '🎛 Dynamic ON' : '🎛 Dynamic OFF');
                    break;
                }
                case 'del': {
                    this.engine.deleteBand(id);
                    this._render();
                    break;
                }
                default:
                    if (!e.target.closest('button') && !e.target.closest('select') && !e.target.closest('input')) {
                        this.state.setActive(id);
                        this._render();
                    }
            }
        };
        panel.addEventListener('click', this._panelHandler);

        // ===== ПОЛЗУНКИ =====
        panel.querySelectorAll('input[type="range"]').forEach(input => {
            input.addEventListener('input', (e) => {
                const row = input.closest('.band-row');
                if (!row) return;
                const id = parseInt(row.dataset.id);
                const val = parseFloat(e.target.value);
                const action = input.dataset.action;

                switch (action) {
                    case 'freq': {
                        const freq = this._sliderToF(val);
                        this.state.updateBandLive(id, { freq });
                        this.engine.updateFilters();
                        this._updateDotLive(id);
                        this._renderCurves();
                        this._updateBandRowValues(id);
                        this._checkClipping();
                        break;
                    }
                    case 'gain': {
                        const band = this.state.bands.find(b => b.id === id);
                        if (!band) return;
                        const mode = band.channelMode || 'stereo';
                        const updates = {};
                        if (mode === 'stereo') updates.gain = val;
                        else if (mode === 'mid') updates.midGain = val;
                        else if (mode === 'side') updates.sideGain = val;
                        else if (mode === 'left') updates.leftGain = val;
                        else if (mode === 'right') updates.rightGain = val;
                        this.state.updateBandLive(id, updates);
                        this.engine.updateFilters();
                        this._updateDotLive(id);
                        this._renderCurves();
                        this._updateBandRowValues(id);
                        this._checkClipping();
                        break;
                    }
                    case 'q': {
                        this.state.updateBandLive(id, { q: val });
                        this.engine.updateFilters();
                        this._renderCurves();
                        this._updateBandRowValues(id);
                        this._checkClipping();
                        break;
                    }
                    case 'd-th': {
                        const band = this.state.bands.find(b => b.id === id);
                        band.dynamic.threshold = val;
                        const valDisplay = row.querySelector('[data-action="d-th"] + .br-val');
                        if (valDisplay) valDisplay.textContent = val + 'dB';
                        this.engine.updateFilters(true);
                        this._renderCurves();
                        break;
                    }
                    case 'd-r': {
                        const band = this.state.bands.find(b => b.id === id);
                        band.dynamic.ratio = val;
                        const valDisplay = row.querySelector('[data-action="d-r"] + .br-val');
                        if (valDisplay) valDisplay.textContent = val.toFixed(1) + ':1';
                        this.engine.updateFilters(true);
                        this._renderCurves();
                        break;
                    }
                    case 'd-a': {
                        const band = this.state.bands.find(b => b.id === id);
                        band.dynamic.attack = val;
                        const valDisplay = row.querySelector('[data-action="d-a"] + .br-val');
                        if (valDisplay) valDisplay.textContent = val + 'ms';
                        this.engine.updateFilters(true);
                        break;
                    }
                    case 'd-rel': {
                        const band = this.state.bands.find(b => b.id === id);
                        band.dynamic.release = val;
                        const valDisplay = row.querySelector('[data-action="d-rel"] + .br-val');
                        if (valDisplay) valDisplay.textContent = val + 'ms';
                        this.engine.updateFilters(true);
                        break;
                    }
                }
            });

            input.addEventListener('change', () => {
                const row = input.closest('.band-row');
                if (!row) return;
                const id = parseInt(row.dataset.id);
                this._commitBand(id);
            });
        });
    }
};
