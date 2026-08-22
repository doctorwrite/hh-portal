// ================================================================
// EQ WIDGET — главный файл (исправленная версия)
// ================================================================

import EQState from '../core/EQState.js';
import EQEngine from '../core/EQEngine.js';

// Импортируем все части как объекты с методами
import Core from './EQWidgetCore.js';
import DOM from './EQWidgetDOM.js';
import Events from './EQWidgetEvents.js';
import Effects from './EQWidgetEffects.js';
import Trim from './EQWidgetTrim.js';
import Spectrum from './EQWidgetSpectrum.js';
import Panel from './EQWidgetPanel.js';
import Helpers from './EQWidgetHelpers.js';

// Собираем всё в один класс
class EQWidget {
    constructor(container, options = {}) {
        // Инициализация базовых свойств
        this.container = container;
        this.options = options;
        
        // Создаём состояние и движок
        this.state = new EQState({
            resetOnLoad: false,
            storageKey: 'hheq_pro',
            theme: options.theme || 'dark'
        });
        this.engine = new EQEngine(this.state);

        // ===== КОПИРУЕМ ВСЕ МЕТОДЫ ИЗ ЧАСТЕЙ В this =====
        // Core
        Object.assign(this, Core);
        // DOM
        Object.assign(this, DOM);
        // Events
        Object.assign(this, Events);
        // Effects
        Object.assign(this, Effects);
        // Trim
        Object.assign(this, Trim);
        // Spectrum
        Object.assign(this, Spectrum);
        // Panel
        Object.assign(this, Panel);
        // Helpers
        Object.assign(this, Helpers);

        // Инициализируем все части (вызываем их init)
        if (Core.init) Core.init.call(this);
        if (DOM.init) DOM.init.call(this);
        if (Events.init) Events.init.call(this);
        if (Effects.init) Effects.init.call(this);
        if (Trim.init) Trim.init.call(this);
        if (Spectrum.init) Spectrum.init.call(this);
        if (Panel.init) Panel.init.call(this);
        if (Helpers.init) Helpers.init.call(this);

        // Строим DOM
        this._buildDOM();
        this._applyTheme();
        this._buildGrid();
        this._bindEvents();
        this._render();
        this._startLoop();

        // Ресайз
        let resizeTimer;
        window.addEventListener('resize', () => {
            if (resizeTimer) cancelAnimationFrame(resizeTimer);
            resizeTimer = requestAnimationFrame(() => {
                this.isMobile = window.innerWidth < 768;
                this.SPEC_STEPS = this.isMobile ? 30 : 80;
                this._targetFps = this.isMobile ? 30 : 60;
                this._frameInterval = 1000 / this._targetFps;
                this._resize();
            });
        });
        setTimeout(() => this._resize(), 50);
    }

    // Деструктор
    destroy() {
        this._isDestroyed = true;
        this._loopRunning = false;
        if (this._panelHandler) {
            this.el.panel.removeEventListener('click', this._panelHandler);
            this._panelHandler = null;
        }
        if (this._captureTimer) {
            clearInterval(this._captureTimer);
            this._captureTimer = null;
        }
        this.engine.stopSource();
        this.engine._onPlayChange = null;
        this.container.innerHTML = '';
    }
}

export default EQWidget;