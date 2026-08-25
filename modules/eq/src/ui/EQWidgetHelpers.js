// ================================================================
// EQ WIDGET HELPERS — вспомогательные методы
// ================================================================

export default {
    init() {},

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

    _bandFromTarget(target) {
        if (target && target.classList && target.classList.contains('dot-hit')) {
            return parseInt(target.dataset.band);
        }
        return null;
    },

    _getPos(e) {
        if (this._dragRectDirty || !this._dragRect) {
            this._dragRect = this.el.svg.getBoundingClientRect();
            this._dragRectDirty = false;
        }
        const rect = this._dragRect;
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: (cx - rect.left) * (this.VW / rect.width),
            y: (cy - rect.top) * (this.VH / rect.height)
        };
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

    _showHover(pos) {
        const hl = this.el.hline,
            hf = this.el.hfreq,
            hg = this.el.hgain;
        if (pos.x < this.L || pos.x > this.R || pos.y < this.T || pos.y > this.B) {
            this._hideHover();
            return;
        }
        const f = this._xToF(pos.x);
        const g = this.engine.calcTotal(f);
        hl.setAttribute('x1', pos.x);
        hl.setAttribute('x2', pos.x);
        hl.setAttribute('y1', this.T);
        hl.setAttribute('y2', this.B);
        hl.style.display = 'block';
        const fText = f >= 1000 ? (f / 1000).toFixed(1) + 'k' : Math.round(f);
        hf.textContent = fText + ' Hz';
        hf.setAttribute('x', Math.min(pos.x + 5, this.R - 60));
        hf.setAttribute('y', this.T + 12);
        hf.style.display = 'block';
        hg.textContent = g.toFixed(1) + ' dB';
        hg.setAttribute('x', Math.min(pos.x + 5, this.R - 60));
        hg.setAttribute('y', this.T + 24);
        hg.style.display = 'block';
    },

    _hideHover() {
        this.el.hline.style.display = 'none';
        this.el.hfreq.style.display = 'none';
        this.el.hgain.style.display = 'none';
    },

    _seekTo(clientX) {
        const buffer = this.engine.getBuffer();
        if (!buffer) {
            this._toast('❌ Нет аудио для перемотки');
            return;
        }
        const rect = this.el.tltrack.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const dur = this.engine.getDuration();
        if (!dur || dur === Infinity || dur === 0) return;
        const time = ratio * dur;
        if (buffer && (this.engine._sourceType === 'file' || this.engine._sourceType === 'recorded')) {
            this._updateTimeline(time);
            if (this.engine.isPlaying()) {
                this.engine.stopSource();
                this.engine.playSource(this.engine._sourceType, buffer, time);
            } else {
                this.engine._currentTime = time;
                this.engine._sourceOffset = time;
            }
        }
    },

    // ===== ИСПРАВЛЕННЫЙ _resize() — ИСХОДНАЯ ВЕРСИЯ =====
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

    _svgEl(tag, attrs) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
        return el;
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

    _exportAudio: async function(format = 'wav') {
        const buffer = this.engine.getBuffer();
        if (!buffer) {
            this._toast('❌ Сначала загрузите файл');
            return;
        }
        const progressEl = document.querySelector('[data-r="exportProgress"]');
        const barEl = document.querySelector('[data-r="exportBar"]');
        const labelEl = document.querySelector('[data-r="exportLabel"]');
        progressEl.style.display = 'block';
        barEl.style.width = '0%';
        labelEl.textContent = 'Обработка... 0%';
        try {
            await this.engine.exportProcessed({
                format: format,
                onProgress: (p) => {
                    const perc = Math.round(p * 100);
                    barEl.style.width = Math.min(perc, 100) + '%';
                    labelEl.textContent = `Обработка... ${Math.min(perc, 100)}%`;
                },
                fileName: `processed_audio_${format}`
            });
            this._toast(`✅ Сохранено (${format.toUpperCase()})`);
        } catch (e) {
            console.error(e);
            this._toast('❌ Ошибка экспорта');
        } finally {
            progressEl.style.display = 'none';
        }
    }
};
