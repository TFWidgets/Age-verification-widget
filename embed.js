/*!
 * TF Widgets — Age Verification v2
 * Встраивание: <script src=".../embed.js" data-id="CLIENT_ID"></script>
 * Конфиг клиента: configs/CLIENT_ID.json (формат v1 поддерживается, все новые поля необязательные)
 * Классы и CSS-переменные: префикс bhw- (общий для всех виджетов TF Widgets)
 */
(function () {
    'use strict';
    var VERSION = '2.0.0';
    var LOG = '[TFW Age]';
    // Где работает живое превью BHWAgeVerification.render() (конфигуратор на сайте)
    var PREVIEW_DOMAINS = ['tf-widgets.com', '*.tf-widgets.com', '9ac5za-h1.myshopify.com'];

    /* =========================================================
       БАЗОВЫЕ СТИЛИ (один раз на страницу). Все значения — из CSS-переменных --bhw-*
       ========================================================= */
    var inlineCSS = `
        .bhw-age-overlay {
            position: fixed; inset: 0; z-index: 2147483000;
            display: none; align-items: center; justify-content: center;
            padding: 20px; overflow-y: auto; -webkit-overflow-scrolling: touch;
            background: var(--bhw-overlay, rgba(8,8,10,0.72));
            -webkit-backdrop-filter: blur(var(--bhw-overlay-blur, 14px)) saturate(120%);
            backdrop-filter: blur(var(--bhw-overlay-blur, 14px)) saturate(120%);
            font-family: var(--bhw-font, 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif);
            -webkit-font-smoothing: antialiased;
            opacity: 0; transition: opacity .4s ease;
            box-sizing: border-box;
        }
        .bhw-age-overlay *, .bhw-age-overlay *::before, .bhw-age-overlay *::after { box-sizing: border-box; }
        .bhw-age-overlay.show { opacity: 1; }
        .bhw-age-overlay.bhw-age-inline { position: absolute; z-index: 1; }

        .bhw-age-card {
            position: relative; overflow: hidden; margin: auto;
            width: 100%; max-width: var(--bhw-card-width, 420px);
            background: var(--bhw-bg, #111214);
            color: var(--bhw-content-text-color, #f5f5f5);
            border: 1px solid var(--bhw-card-border, rgba(255,255,255,0.08));
            border-radius: var(--bhw-widget-radius, 22px);
            box-shadow: var(--bhw-shadow, 0 30px 80px -20px rgba(0,0,0,0.6));
            transform: translateY(18px) scale(.97);
            transition: transform .55s cubic-bezier(.2,.8,.2,1);
            text-align: center;
        }
        .bhw-age-overlay.show .bhw-age-card { transform: none; }

        /* шапка: в "minimal" прозрачная, в "banner" — цветная полоса (как в v1) */
        .bhw-age-header {
            position: relative;
            padding: var(--bhw-padding, 36px 28px 0);
            background: var(--bhw-header-bg, transparent);
            color: var(--bhw-text-color, inherit);
        }
        .bhw-age-layout-banner .bhw-age-header { padding: var(--bhw-padding-banner, 32px 28px); }
        .bhw-age-layout-banner .bhw-age-header::before {
            content: ''; position: absolute; inset: 0; pointer-events: none;
            background: radial-gradient(circle at 20% 20%, rgba(255,255,255,.16) 0%, transparent 55%);
        }

        .bhw-age-logo { display: block; max-width: 140px; max-height: 44px; margin: 0 auto 18px; object-fit: contain; }

        /* знак возраста "18+" */
        .bhw-age-badge {
            position: relative; z-index: 1;
            display: inline-grid; place-items: center;
            width: var(--bhw-badge-size, 76px); height: var(--bhw-badge-size, 76px);
            margin: 0 auto 18px; border-radius: 50%;
            border: 2px solid var(--bhw-accent, #d6b36a);
            color: var(--bhw-accent, #d6b36a);
            font-family: var(--bhw-value-font, inherit);
            font-size: calc(var(--bhw-badge-size, 76px) * .36); font-weight: 800; letter-spacing: -.03em; line-height: 1;
            box-shadow: 0 0 0 6px color-mix(in srgb, var(--bhw-accent, #d6b36a) 12%, transparent);
        }
        .bhw-age-layout-banner .bhw-age-badge { border-color: currentColor; color: var(--bhw-text-color, #fff); box-shadow: 0 0 0 6px rgba(255,255,255,.1); }
        .bhw-age-badge sup { font-size: .5em; margin-left: 1px; top: -.55em; position: relative; }
        .bhw-age-icon {
            position: relative; z-index: 1; display: block;
            font-size: var(--bhw-icon-size, 52px); line-height: 1; margin: 0 0 14px;
        }
        .bhw-age-title {
            position: relative; z-index: 1;
            margin: 0 0 6px; padding: 0;
            font-family: inherit; font-size: var(--bhw-title-size, 1.6em); font-weight: 800;
            letter-spacing: -.025em; line-height: 1.15;
            text-shadow: var(--bhw-text-shadow, none);
        }
        .bhw-age-subtitle {
            position: relative; z-index: 1;
            margin: 0; font-size: var(--bhw-subtitle-size, .8em); font-weight: 700;
            letter-spacing: .1em; text-transform: uppercase; opacity: .6;
        }

        .bhw-age-content { padding: var(--bhw-content-padding, 18px 28px 28px); }
        .bhw-age-layout-banner .bhw-age-content { padding-top: 24px; }
        .bhw-age-card:focus { outline: none; }
        .bhw-age-message {
            margin: 0 auto 24px; max-width: 34ch;
            font-size: var(--bhw-message-size, .98em); line-height: 1.55;
            color: var(--bhw-message-color, rgba(255,255,255,.66));
        }
        .bhw-age-buttons { display: flex; flex-direction: column; gap: var(--bhw-gap, 10px); }
        .bhw-age-btn {
            position: relative; display: flex; align-items: center; justify-content: center;
            width: 100%; margin: 0; min-height: 50px;
            padding: var(--bhw-btn-padding, 14px 22px);
            border: 0; border-radius: var(--bhw-btn-radius, 14px);
            font-family: inherit; font-size: var(--bhw-btn-size, 1em); font-weight: 700; line-height: 1.2;
            cursor: pointer; text-decoration: none;
            transition: transform .2s, filter .2s, background .2s, box-shadow .2s;
            -webkit-tap-highlight-color: transparent;
        }
        .bhw-age-btn:focus-visible { outline: 2px solid var(--bhw-accent, #d6b36a); outline-offset: 3px; }
        .bhw-age-btn-yes {
            background: var(--bhw-btn-yes-bg, #d6b36a); color: var(--bhw-btn-yes-color, #1a1407);
            order: 1;
        }
        .bhw-age-btn-yes:hover { transform: translateY(-1px); box-shadow: var(--bhw-btn-yes-shadow, 0 10px 26px -8px rgba(214,179,106,.55)); filter: brightness(1.04); }
        .bhw-age-btn-no {
            background: var(--bhw-btn-no-bg, transparent); color: var(--bhw-btn-no-color, rgba(255,255,255,.6));
            font-weight: 600; order: 2;
        }
        .bhw-age-btn-no:hover { background: var(--bhw-btn-no-bg-hover, rgba(255,255,255,.06)); }

        /* ввод даты рождения */
        .bhw-age-dob { margin: 0 0 16px; padding: 0; border: 0; min-width: 0; }
        .bhw-age-dob legend { display: block; width: 100%; padding: 0; margin: 0 0 10px; font-size: .82em; font-weight: 600; opacity: .75; }
        .bhw-age-dob-row { display: grid; grid-template-columns: 1fr 1fr 1.5fr; gap: 8px; }
        .bhw-age-dob-field {
            width: 100%; min-width: 0; height: 54px; margin: 0; padding: 0 8px;
            border-radius: calc(var(--bhw-btn-radius, 14px) - 2px);
            border: 1px solid var(--bhw-field-border, rgba(255,255,255,.14));
            background: var(--bhw-field-bg, rgba(255,255,255,.04));
            color: inherit; font-family: var(--bhw-value-font, inherit);
            font-size: 1.25em; font-weight: 700; text-align: center; letter-spacing: .04em;
            outline: none; -webkit-appearance: none; appearance: none; box-shadow: none;
            transition: border-color .2s, box-shadow .2s;
        }
        /* поле даты защищено от стилей сайта (темы часто красят все input) */
        .bhw-age-overlay input.bhw-age-dob-field {
            width: 100% !important; height: 54px !important; min-height: 0 !important; margin: 0 !important; padding: 0 8px !important;
            border: 1px solid var(--bhw-field-border, rgba(255,255,255,.14)) !important;
            border-radius: calc(var(--bhw-btn-radius, 14px) - 2px) !important;
            background: var(--bhw-field-bg, rgba(255,255,255,.04)) !important;
            color: var(--bhw-content-text-color, #f5f5f5) !important;
            font-family: var(--bhw-value-font, inherit) !important; font-size: 1.25em !important; line-height: normal !important;
            text-align: center !important; box-shadow: none !important;
        }
        .bhw-age-overlay input.bhw-age-dob-field:focus { border-color: var(--bhw-accent, #d6b36a) !important; box-shadow: 0 0 0 3px color-mix(in srgb, var(--bhw-accent, #d6b36a) 22%, transparent) !important; }
        .bhw-age-overlay .bhw-age-has-error input.bhw-age-dob-field { border-color: var(--bhw-error, #f87171) !important; }
        .bhw-age-dob-field::placeholder { color: currentColor; opacity: .38; font-weight: 600; }
        .bhw-age-dob-field:focus { border-color: var(--bhw-accent, #d6b36a); box-shadow: 0 0 0 3px color-mix(in srgb, var(--bhw-accent, #d6b36a) 22%, transparent); }
        .bhw-age-error { display: none; margin: 10px 0 0; font-size: .85em; font-weight: 600; color: var(--bhw-error, #f87171); }
        .bhw-age-has-error .bhw-age-error { display: block; }
        .bhw-age-has-error .bhw-age-dob-field { border-color: var(--bhw-error, #f87171); }
        .bhw-age-shake { animation: bhw-age-shake .4s cubic-bezier(.36,.07,.19,.97); }

        /* отказ */
        .bhw-age-denied { display: none; padding: 8px 0 4px; }
        .bhw-age-denied-title { margin: 0 0 8px; font-size: 1.15em; font-weight: 800; }
        .bhw-age-denied-text { margin: 0; font-size: .95em; line-height: 1.5; color: var(--bhw-message-color, rgba(255,255,255,.66)); }
        .bhw-age-state-denied .bhw-age-gate { display: none; }
        .bhw-age-state-denied .bhw-age-denied { display: block; }

        .bhw-age-footer {
            padding: var(--bhw-footer-padding, 16px 28px 22px);
            font-size: var(--bhw-footer-size, .76em); line-height: 1.5;
            color: var(--bhw-footer-color, rgba(255,255,255,.42));
            border-top: 1px solid var(--bhw-divider, rgba(255,255,255,.07));
        }
        .bhw-age-footer:empty { display: none; }

        @keyframes bhw-age-shake { 10%,90%{transform:translateX(-1px)} 20%,80%{transform:translateX(2px)} 30%,50%,70%{transform:translateX(-4px)} 40%,60%{transform:translateX(4px)} }

        @media (max-width: 480px) {
            .bhw-age-overlay { padding: 14px; align-items: flex-end; }
            .bhw-age-overlay:not(.bhw-age-inline) .bhw-age-card { margin: auto auto 0; }
            .bhw-age-header { padding: var(--bhw-padding-mobile, 30px 22px 0); }
            .bhw-age-layout-banner .bhw-age-header { padding: var(--bhw-padding-banner-mobile, 26px 22px); }
            .bhw-age-content { padding: var(--bhw-content-padding-mobile, 16px 22px 22px); }
            .bhw-age-title { font-size: var(--bhw-title-size-mobile, 1.4em); }
            .bhw-age-footer { padding: 14px 22px 18px; }
        }
        @media (prefers-reduced-motion: reduce) {
            .bhw-age-overlay, .bhw-age-card { transition: none !important; }
            .bhw-age-shake { animation: none !important; }
        }

        /* защита от тем сайта, которые красят весь текст через color: ... !important */
        .bhw-age-overlay .bhw-age-card { color: var(--bhw-content-text-color, #f5f5f5) !important; }
        .bhw-age-overlay .bhw-age-card *:not(.bhw-age-btn) { color: inherit !important; }
        .bhw-age-overlay .bhw-age-card .bhw-age-header { color: var(--bhw-text-color, inherit) !important; }
        .bhw-age-overlay .bhw-age-card .bhw-age-badge { color: var(--bhw-accent, #d6b36a) !important; }
        .bhw-age-overlay.bhw-age-layout-banner .bhw-age-card .bhw-age-badge { color: var(--bhw-text-color, #fff) !important; }
        .bhw-age-overlay .bhw-age-card .bhw-age-message,
        .bhw-age-overlay .bhw-age-card .bhw-age-denied-text { color: var(--bhw-message-color, rgba(255,255,255,.66)) !important; }
        .bhw-age-overlay .bhw-age-card .bhw-age-footer { color: var(--bhw-footer-color, rgba(255,255,255,.42)) !important; }
        .bhw-age-overlay .bhw-age-card .bhw-age-error { color: var(--bhw-error, #f87171) !important; }
        .bhw-age-overlay .bhw-age-card .bhw-age-btn-yes { color: var(--bhw-btn-yes-color, #1a1407) !important; }
        .bhw-age-overlay .bhw-age-card .bhw-age-btn-no { color: var(--bhw-btn-no-color, rgba(255,255,255,.6)) !important; }
    `;

    /* =========================================================
       ПУБЛИЧНЫЕ API
       ========================================================= */
    // v1-совместимость: window.BusinessHoursWidgets.ageVerification[id].show()
    window.BusinessHoursWidgets = window.BusinessHoursWidgets || {};
    window.BusinessHoursWidgets.ageVerification = window.BusinessHoursWidgets.ageVerification || {};

    // Живое превью для конфигуратора: BHWAgeVerification.render(container, config) -> { destroy, update, setState }
    var api = window.BHWAgeVerification = window.BHWAgeVerification || {};
    api.version = VERSION;
    api.defaults = getDefaultConfig;
    api.checkAccess = bhwCheckAccess;
    api.render = function (container, config) {
        var noop = { destroy: function () {}, update: function () {}, setState: function () {} };
        if (!bhwCheckAccess({ domains: PREVIEW_DOMAINS }).ok) { console.warn(LOG, 'preview is only available on tf-widgets.com'); return noop; }
        injectBaseStyles();
        if (container._bhwAgeDestroy) container._bhwAgeDestroy();
        var cls = container.__bhwAgeClass || (container.__bhwAgeClass = 'bhw-age-preview-' + Math.random().toString(36).slice(2, 8));
        var widget = null;
        function build(cfg, instant) {
            if (widget) widget.destroy();
            widget = createWidget(normalizeConfig(cfg || {}), cls, 'preview', { inline: container, instant: instant });
            widget.show(true);
        }
        build(config, false);
        var ctrl = {
            update: function (cfg) { build(cfg, true); },
            setState: function (st) { if (widget) widget.setState(st); },
            destroy: function () { if (widget) widget.destroy(); widget = null; var s = document.getElementById('bhw-age-style-' + cls); if (s) s.remove(); container._bhwAgeDestroy = null; }
        };
        container._bhwAgeDestroy = ctrl.destroy;
        return ctrl;
    };

    /* =========================================================
       АВТОЗАПУСК ПО <script data-id="...">
       ========================================================= */
    try {
        var currentScript = document.currentScript || (function () {
            var scripts = document.getElementsByTagName('script');
            return scripts[scripts.length - 1];
        })();

        if (currentScript && currentScript.dataset && currentScript.dataset.id && currentScript.dataset.bhwMounted !== '1') {
            currentScript.dataset.bhwMounted = '1';
            var debug = currentScript.dataset.debug === '1';
            var clientId = normalizeId(currentScript.dataset.id);
            var baseUrl = getBasePath(currentScript.src);

            loadConfig(clientId, baseUrl)
                .then(function (fetched) {
                    var access = bhwCheckAccess(fetched);
                    if (!access.ok) {
                        console.warn(LOG, 'widget "' + clientId + '" is not active on ' + (location.hostname || 'this page') + ': ' + access.reason);
                        return;
                    }
                    injectBaseStyles();
                    var cfg = normalizeConfig(fetched);
                    if (debug) console.log(LOG, 'config "' + clientId + '":', cfg);
                    var mount = function () {
                        var widget = createWidget(cfg, 'bhw-age-' + clientId.replace(/[^a-z0-9_-]/gi, '') + '-' + Date.now(), clientId, {});
                        window.BusinessHoursWidgets.ageVerification[clientId] = widget;
                        setupTriggers(widget, cfg.triggers || {});
                    };
                    if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
                })
                .catch(function (error) {
                    // Нет конфига = нет виджета
                    console.warn(LOG, 'config "' + clientId + '" not loaded:', error.message);
                });
        }
    } catch (error) {
        console.error(LOG, 'critical error:', error);
    }

    /* =========================================================
       ФУНКЦИИ
       ========================================================= */
    function injectBaseStyles() {
        if (!document.getElementById('business-hours-age-verification-widget-styles')) {
            var style = document.createElement('style');
            style.id = 'business-hours-age-verification-widget-styles';
            style.textContent = inlineCSS;
            (document.head || document.documentElement).appendChild(style);
        }
    }

    /* ---------------------------------------------------------
       ДОСТУП (общий блок для всех виджетов TF Widgets — копировать без изменений)
       В конфиге клиента:
         "active": true,                       // false = виджет выключен (например, подписка отменена)
         "domains": ["client.com", "client-shop.myshopify.com", "*.client.com"]
       "client.com" разрешает client.com и www.client.com,
       "*.client.com" — любые поддомены (shop.client.com и т.д.).
       Без списка domains виджет не запускается.
       На localhost и при открытии файла с компьютера работает всегда (для тестов).
       --------------------------------------------------------- */
    function bhwCheckAccess(config) {
        config = config || {};
        if (config.active === false) return { ok: false, reason: 'widget is switched off ("active": false)' };
        var host = String(location.hostname || '').toLowerCase().replace(/^www\./, '');
        if (!host || host === 'localhost' || host === '127.0.0.1' || location.protocol === 'file:') return { ok: true };
        var list = config.domains;
        if (typeof list === 'string') list = list.split(/[\s,]+/);
        if (!Array.isArray(list) || !list.length) return { ok: false, reason: 'no "domains" in config' };
        for (var i = 0; i < list.length; i++) {
            var d = String(list[i] || '').trim().toLowerCase()
                .replace(/^[a-z]+:\/\//, '').replace(/[\/:].*$/, '').replace(/^www\./, '');
            if (!d) continue;
            if (d.indexOf('*.') === 0) {
                var base = d.slice(2);
                if (host === base || host.slice(-(base.length + 1)) === '.' + base) return { ok: true };
            } else if (host === d) {
                return { ok: true };
            }
        }
        return { ok: false, reason: 'domain is not in "domains"' };
    }

    function normalizeId(id) { return String(id || 'demo').replace(/\.(json|js)$/i, ''); }

    function getBasePath(src) {
        if (!src) return './';
        try {
            var url = new URL(src, location.href);
            return url.origin + url.pathname.replace(/\/[^\/]*$/, '/');
        } catch (error) { return './'; }
    }

    function loadConfig(clientId, baseUrl) {
        if (clientId === 'local') {
            var el = document.querySelector('#bhw-age-local-config');
            if (!el) return Promise.reject(new Error('#bhw-age-local-config not found'));
            try { return Promise.resolve(JSON.parse(el.textContent)); } catch (e) { return Promise.reject(e); }
        }
        var url = baseUrl + 'configs/' + encodeURIComponent(clientId) + '.json?v=' + Date.now();
        return fetch(url, { cache: 'no-store', headers: { 'Accept': 'application/json' } })
            .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
    }

    function getDefaultConfig() {
        return {
            // "confirm" — кнопки Да/Нет; "birthdate" — ввод даты рождения
            mode: 'confirm',
            minAge: 18,
            // "minimal" — чистая карточка; "banner" — цветная шапка (вид v1)
            layout: 'minimal',
            dateOrder: 'DMY',                // DMY (Европа) или MDY (США)
            logoUrl: '',
            iconHtml: '',                    // если пусто — показываем знак "18+"
            title: 'Are you over 18?',
            subtitle: 'Age verification',
            message: 'This website contains age-restricted products. Please confirm your age to continue.',
            dobLabel: 'Enter your date of birth',
            errorText: 'Please enter a valid date.',
            yesButtonText: 'Yes, I am 18 or older',
            noButtonText: 'No, leave the site',
            continueButtonText: 'Enter site',
            deniedTitle: 'Sorry, you can\'t enter',
            deniedMessage: 'You must be of legal age to view this website.',
            footerText: 'By entering this site you confirm that you are of legal age in your country.',
            redirectUrl: '',
            blockContent: true,
            frequency: '30d',                // session | 24h | 7d | 30d | always
            triggers: { showOnLoad: true, showDelay: 0, showOnExit: false, showOnScroll: 0 },
            style: {
                fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
                valueFontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
                overlayBlur: 14,
                colors: {
                    background: '#111214',
                    overlay: 'rgba(8, 8, 10, 0.72)',
                    headerBackground: 'transparent',
                    text: '#ffffff',
                    contentText: '#f5f5f5',
                    messageText: 'rgba(255, 255, 255, 0.66)',
                    footerText: 'rgba(255, 255, 255, 0.42)',
                    accent: '#d6b36a',
                    border: 'rgba(255, 255, 255, 0.08)',
                    btnYes: '#d6b36a',
                    btnYesText: '#1a1407',
                    btnNo: 'transparent',
                    btnNoText: 'rgba(255, 255, 255, 0.6)',
                    btnNoHover: 'rgba(255, 255, 255, 0.06)'
                },
                borderRadius: { widget: 22, buttons: 14 },
                sizes: { fontSize: 1, width: 420, padding: 36, contentPadding: 28, footerPadding: 16, gap: 10, iconSize: 52, badgeSize: 76 },
                shadow: {
                    widget: '0 30px 80px -20px rgba(0, 0, 0, 0.6)',
                    text: 'none',
                    btnYesHover: '0 10px 26px -8px rgba(214, 179, 106, 0.55)'
                }
            }
        };
    }

    /* v1-конфиг (с красной шапкой и эмодзи) продолжает выглядеть как задумано: layout "banner" */
    function normalizeConfig(raw) {
        raw = raw || {};
        var cfg = mergeDeep(getDefaultConfig(), raw);
        var rawColors = (raw.style && raw.style.colors) || {};
        if (!raw.layout && rawColors.headerBackground && rawColors.headerBackground !== 'transparent') cfg.layout = 'banner';
        // v1 не задавал accent — берём цвет кнопки "Да", если это обычный цвет
        if (!rawColors.accent && rawColors.btnYes && /^#|^rgb/i.test(rawColors.btnYes)) cfg.style.colors.accent = rawColors.btnYes;
        if (!rawColors.accent && rawColors.btnYes && /gradient/i.test(rawColors.btnYes)) {
            var m = String(rawColors.btnYes).match(/#[0-9a-f]{3,8}|rgba?\([^)]+\)/i);
            if (m) cfg.style.colors.accent = m[0];
        }
        cfg.minAge = Math.max(1, Math.min(99, parseInt(cfg.minAge, 10) || 18));
        return cfg;
    }

    function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }
    function mergeDeep(base, over) {
        var out = {};
        Object.keys(base || {}).forEach(function (k) { out[k] = isObj(base[k]) ? mergeDeep(base[k], {}) : base[k]; });
        Object.keys(over || {}).forEach(function (k) {
            var v = over[k];
            if (isObj(v) && isObj(out[k])) out[k] = mergeDeep(out[k], v);
            else if (v !== undefined) out[k] = v;
        });
        return out;
    }

    function cssValue(v, fallback) {
        if (v === undefined || v === null || v === '') return fallback;
        return String(v).replace(/[;{}<>]/g, '');
    }
    function num(v, fallback) { var n = Number(v); return isFinite(n) && v !== '' && v !== null ? n : fallback; }

    function safeUrl(url) {
        var u = String(url || '').trim();
        if (!u) return '';
        if (/^https?:/i.test(u) || /^\/(?!\/)/.test(u)) return u;
        if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(u)) return 'https://' + u;
        return '';
    }

    function escapeHtml(text) {
        return String(text == null ? '' : text).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    // иконка: только HTML-сущности вида &#128286; или обычный текст/эмодзи — без тегов
    function renderIcon(icon) {
        var s = String(icon || '').trim();
        if (!s) return '';
        if (/^(&#?[a-z0-9]+;\s*)+$/i.test(s)) return s;
        return escapeHtml(s.slice(0, 8));
    }

    function applyCustomStyles(uniqueClass, style) {
        var id = 'bhw-age-style-' + uniqueClass;
        var el = document.getElementById(id);
        if (!el) { el = document.createElement('style'); el.id = id; (document.head || document.documentElement).appendChild(el); }
        el.textContent = generateUniqueStyles(uniqueClass, style);
    }

    function generateUniqueStyles(uniqueClass, style) {
        var s = style || {}, c = s.colors || {}, z = s.sizes || {}, r = s.borderRadius || {}, sh = s.shadow || {};
        var fs = num(z.fontSize, 1);
        var pad = num(z.padding, 36), cpad = num(z.contentPadding, 28);
        return '.' + uniqueClass + '{' +
            '--bhw-font:' + cssValue(s.fontFamily, "'Inter', system-ui, sans-serif") + ';' +
            '--bhw-value-font:' + cssValue(s.valueFontFamily, 'inherit') + ';' +
            '--bhw-overlay:' + cssValue(c.overlay, 'rgba(8,8,10,0.72)') + ';' +
            '--bhw-overlay-blur:' + num(s.overlayBlur, 14) + 'px;' +
            '--bhw-bg:' + cssValue(c.background, '#111214') + ';' +
            '--bhw-card-border:' + cssValue(c.border, 'rgba(255,255,255,0.08)') + ';' +
            '--bhw-card-width:' + num(z.width, 420) + 'px;' +
            '--bhw-header-bg:' + cssValue(c.headerBackground, 'transparent') + ';' +
            '--bhw-text-color:' + cssValue(c.text, 'inherit') + ';' +
            '--bhw-content-text-color:' + cssValue(c.contentText, '#f5f5f5') + ';' +
            '--bhw-message-color:' + cssValue(c.messageText, 'rgba(255,255,255,0.66)') + ';' +
            '--bhw-footer-color:' + cssValue(c.footerText, 'rgba(255,255,255,0.42)') + ';' +
            '--bhw-accent:' + cssValue(c.accent, '#d6b36a') + ';' +
            '--bhw-error:' + cssValue(c.error, '#f87171') + ';' +
            '--bhw-divider:color-mix(in srgb, ' + cssValue(c.contentText, '#f5f5f5') + ' 9%, transparent);' +
            '--bhw-field-border:color-mix(in srgb, ' + cssValue(c.contentText, '#f5f5f5') + ' 26%, transparent);' +
            '--bhw-field-bg:color-mix(in srgb, ' + cssValue(c.contentText, '#f5f5f5') + ' 6%, transparent);' +
            '--bhw-widget-radius:' + num(r.widget, 22) + 'px;' +
            '--bhw-btn-radius:' + num(r.buttons, 14) + 'px;' +
            '--bhw-padding:' + pad + 'px 28px 0;' +
            '--bhw-padding-mobile:' + Math.round(pad * .85) + 'px 22px 0;' +
            '--bhw-padding-banner:' + Math.round(pad * .85) + 'px 28px;' +
            '--bhw-padding-banner-mobile:' + Math.round(pad * .75) + 'px 22px;' +
            '--bhw-content-padding:' + Math.round(cpad * .65) + 'px 28px ' + cpad + 'px;' +
            '--bhw-content-padding-mobile:' + Math.round(cpad * .55) + 'px 22px ' + Math.round(cpad * .8) + 'px;' +
            '--bhw-footer-padding:' + num(z.footerPadding, 16) + 'px 28px ' + Math.round(num(z.footerPadding, 16) * 1.35) + 'px;' +
            '--bhw-gap:' + num(z.gap, 10) + 'px;' +
            '--bhw-icon-size:' + Math.round(num(z.iconSize, 52) * fs) + 'px;' +
            '--bhw-badge-size:' + Math.round(num(z.badgeSize, 76) * fs) + 'px;' +
            '--bhw-title-size:' + (1.6 * fs).toFixed(3) + 'em;' +
            '--bhw-title-size-mobile:' + (1.4 * fs).toFixed(3) + 'em;' +
            '--bhw-subtitle-size:' + (0.8 * fs).toFixed(3) + 'em;' +
            '--bhw-message-size:' + (0.98 * fs).toFixed(3) + 'em;' +
            '--bhw-footer-size:' + (0.76 * fs).toFixed(3) + 'em;' +
            '--bhw-btn-size:' + (1 * fs).toFixed(3) + 'em;' +
            '--bhw-btn-padding:' + Math.round(14 * fs) + 'px ' + Math.round(22 * fs) + 'px;' +
            '--bhw-btn-yes-bg:' + cssValue(c.btnYes, '#d6b36a') + ';' +
            '--bhw-btn-yes-color:' + cssValue(c.btnYesText, '#1a1407') + ';' +
            '--bhw-btn-yes-shadow:' + cssValue(sh.btnYesHover, 'none') + ';' +
            '--bhw-btn-no-bg:' + cssValue(c.btnNo, 'transparent') + ';' +
            '--bhw-btn-no-color:' + cssValue(c.btnNoText, 'rgba(255,255,255,0.6)') + ';' +
            '--bhw-btn-no-bg-hover:' + cssValue(c.btnNoHover, 'rgba(255,255,255,0.06)') + ';' +
            '--bhw-shadow:' + cssValue(sh.widget, '0 30px 80px -20px rgba(0,0,0,0.6)') + ';' +
            '--bhw-text-shadow:' + cssValue(sh.text, 'none') + ';' +
            '}';
    }

    /* ---------------- построение виджета ---------------- */
    function createWidget(config, uniqueClass, id, opts) {
        opts = opts || {};
        var inline = opts.inline || null;
        var uid = 'bhw-age-' + Math.random().toString(36).slice(2, 8);
        var overlay = document.createElement('div');
        overlay.className = 'bhw-age-overlay bhw-age-layout-' + (config.layout === 'banner' ? 'banner' : 'minimal') + ' ' + uniqueClass + (inline ? ' bhw-age-inline' : '');
        overlay.setAttribute('aria-hidden', 'true');
        applyCustomStyles(uniqueClass, config.style);

        var minAge = config.minAge;
        var fill = function (t) { return escapeHtml(String(t || '').replace(/\{age\}/g, minAge)); };
        var logo = safeUrl(config.logoUrl);
        var icon = renderIcon(config.iconHtml);
        var top = logo ? '<img class="bhw-age-logo" src="' + escapeHtml(logo) + '" alt="">' : '';
        top += icon ? '<span class="bhw-age-icon" aria-hidden="true">' + icon + '</span>'
                    : '<span class="bhw-age-badge" aria-hidden="true"><span>' + minAge + '<sup>+</sup></span></span>';

        var order = config.dateOrder === 'MDY' ? ['m', 'd', 'y'] : ['d', 'm', 'y'];
        var ph = { d: 'DD', m: 'MM', y: 'YYYY' }, lab = { d: 'Day', m: 'Month', y: 'Year' };
        var dobFields = order.map(function (k) {
            return '<input class="bhw-age-dob-field" data-part="' + k + '" type="text" inputmode="numeric" autocomplete="bday-' + (k === 'd' ? 'day' : k === 'm' ? 'month' : 'year') + '" maxlength="' + (k === 'y' ? 4 : 2) + '" placeholder="' + ph[k] + '" aria-label="' + lab[k] + '">';
        }).join('');

        var gate = config.mode === 'birthdate'
            ? '<form class="bhw-age-form" novalidate>' +
                '<fieldset class="bhw-age-dob"><legend>' + fill(config.dobLabel) + '</legend>' +
                '<div class="bhw-age-dob-row">' + dobFields + '</div>' +
                '<p class="bhw-age-error" id="' + uid + '-err" role="alert"></p></fieldset>' +
                '<div class="bhw-age-buttons"><button class="bhw-age-btn bhw-age-btn-yes" type="submit">' + fill(config.continueButtonText) + '</button></div>' +
              '</form>'
            : '<div class="bhw-age-buttons">' +
                '<button class="bhw-age-btn bhw-age-btn-yes" type="button">' + fill(config.yesButtonText) + '</button>' +
                '<button class="bhw-age-btn bhw-age-btn-no" type="button">' + fill(config.noButtonText) + '</button>' +
              '</div>';

        overlay.innerHTML =
            '<div class="bhw-age-card" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="' + uid + '-t" aria-describedby="' + uid + '-m">' +
                '<div class="bhw-age-header">' + top +
                    '<h2 class="bhw-age-title" id="' + uid + '-t">' + fill(config.title) + '</h2>' +
                    (config.subtitle ? '<p class="bhw-age-subtitle">' + fill(config.subtitle) + '</p>' : '') +
                '</div>' +
                '<div class="bhw-age-content">' +
                    '<div class="bhw-age-gate">' +
                        '<p class="bhw-age-message" id="' + uid + '-m">' + fill(config.message) + '</p>' + gate +
                    '</div>' +
                    '<div class="bhw-age-denied" role="status">' +
                        '<p class="bhw-age-denied-title">' + fill(config.deniedTitle) + '</p>' +
                        '<p class="bhw-age-denied-text">' + fill(config.deniedMessage) + '</p>' +
                    '</div>' +
                '</div>' +
                '<div class="bhw-age-footer">' + fill(config.footerText) + '</div>' +
            '</div>';

        (inline || document.body).appendChild(overlay);
        var card = overlay.querySelector('.bhw-age-card');
        var inerted = [], lastFocus = null, keyHandler = null;

        var widget = {
            overlay: overlay, config: config, id: id, isShown: false,
            show: function (force) {
                if (this.isShown) return;
                if (!force && !shouldShowByFrequency(config.frequency, id)) return;
                overlay.style.display = 'flex';
                overlay.setAttribute('aria-hidden', 'false');
                if (opts.instant) { overlay.classList.add('show'); opts.instant = false; }  // превью: без анимации при каждом изменении
                else requestAnimationFrame(function () { requestAnimationFrame(function () { overlay.classList.add('show'); }); });
                this.isShown = true;
                if (inline) return;
                if (config.blockContent) {
                    document.documentElement.style.overflow = 'hidden';
                    // всё остальное на странице недоступно, пока не подтверждён возраст
                    [].forEach.call(document.body.children, function (el) {
                        if (el !== overlay && !el.hasAttribute('inert') && el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE') { el.setAttribute('inert', ''); inerted.push(el); }
                    });
                }
                lastFocus = document.activeElement;
                setTimeout(function () { var f = card.querySelector('.bhw-age-dob-field') || card; f.focus({ preventScroll: true }); }, 60);
                keyHandler = function (e) { if (e.key === 'Tab') trapFocus(e, card); };
                document.addEventListener('keydown', keyHandler, true);
            },
            hide: function () {
                if (!this.isShown) return;
                overlay.classList.remove('show');
                overlay.setAttribute('aria-hidden', 'true');
                this.isShown = false;
                setTimeout(function () { overlay.style.display = 'none'; }, 400);
                if (inline) return;
                document.documentElement.style.overflow = '';
                inerted.forEach(function (el) { el.removeAttribute('inert'); }); inerted = [];
                if (keyHandler) document.removeEventListener('keydown', keyHandler, true);
                if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
            },
            approve: function () {
                if (inline) { this.hide(); var self = this; setTimeout(function () { self.show(true); }, 1400); return; }
                markAccepted(config.frequency, id); this.hide();
            },
            decline: function () {
                var url = safeUrl(config.redirectUrl);
                if (url && !inline) { window.location.href = url; return; }
                this.setState('denied');
            },
            setState: function (st) {
                card.classList.toggle('bhw-age-state-denied', st === 'denied');
                var form = card.querySelector('.bhw-age-form');
                if (form) form.classList.toggle('bhw-age-has-error', st === 'error');
                if (st === 'error') card.querySelector('.bhw-age-error').textContent = fill(config.errorText);
            },
            destroy: function () {
                if (inline) { overlay.remove(); this.isShown = false; return; }
                this.hide();
                overlay.remove();
                if (!inline) { var s = document.getElementById('bhw-age-style-' + uniqueClass); if (s) s.remove(); }
            }
        };

        // обработчики
        var yes = card.querySelector('button.bhw-age-btn-yes[type="button"]');
        var no = card.querySelector('.bhw-age-btn-no');
        if (yes) yes.addEventListener('click', function () { widget.approve(); });
        if (no) no.addEventListener('click', function () { widget.decline(); });
        var form = card.querySelector('.bhw-age-form');
        if (form) setupBirthdate(form, widget, config);

        return widget;
    }

    function trapFocus(e, card) {
        var f = [].filter.call(card.querySelectorAll('button, input, a[href]'), function (el) { return el.offsetParent !== null && !el.disabled; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (!card.contains(document.activeElement)) { e.preventDefault(); first.focus(); return; }
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    function setupBirthdate(form, widget, config) {
        var fields = [].slice.call(form.querySelectorAll('.bhw-age-dob-field'));
        var err = form.querySelector('.bhw-age-error');
        fields.forEach(function (f, i) {
            f.addEventListener('input', function () {
                f.value = f.value.replace(/\D/g, '').slice(0, f.maxLength);
                form.classList.remove('bhw-age-has-error');
                if (f.value.length === f.maxLength && fields[i + 1]) fields[i + 1].focus();
            });
            f.addEventListener('keydown', function (e) {
                if (e.key === 'Backspace' && !f.value && fields[i - 1]) { fields[i - 1].focus(); }
            });
        });
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var v = {}; fields.forEach(function (f) { v[f.dataset.part] = parseInt(f.value, 10); });
            var now = new Date();
            var valid = v.y >= 1900 && v.y <= now.getFullYear() && v.m >= 1 && v.m <= 12 && v.d >= 1 && v.d <= 31;
            var dob = valid ? new Date(v.y, v.m - 1, v.d) : null;
            if (!dob || dob.getMonth() !== v.m - 1 || dob > now) {
                err.textContent = String(config.errorText || '');
                form.classList.add('bhw-age-has-error');
                form.classList.remove('bhw-age-shake'); void form.offsetWidth; form.classList.add('bhw-age-shake');
                var bad = fields.filter(function (f) { return !f.value; })[0] || fields[0];
                bad.focus();
                return;
            }
            var age = now.getFullYear() - v.y - ((now.getMonth() < v.m - 1 || (now.getMonth() === v.m - 1 && now.getDate() < v.d)) ? 1 : 0);
            if (age >= config.minAge) widget.approve(); else widget.decline();
        });
    }

    /* ---------------- триггеры и память ---------------- */
    function setupTriggers(widget, triggers) {
        if (!shouldShowByFrequency(widget.config.frequency, widget.id)) return;
        if (triggers.showOnLoad !== false) {
            setTimeout(function () { widget.show(); }, Math.max(0, num(triggers.showDelay, 0)));
        }
        if (triggers.showOnExit) {
            document.addEventListener('mouseleave', function h(e) {
                if (e.clientY <= 0 && !widget.isShown) { widget.show(); document.removeEventListener('mouseleave', h); }
            });
        }
        if (num(triggers.showOnScroll, 0) > 0) {
            window.addEventListener('scroll', function h() {
                var p = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight) * 100;
                if (p >= triggers.showOnScroll && !widget.isShown) { widget.show(); window.removeEventListener('scroll', h); }
            }, { passive: true });
        }
    }

    function storage(kind) { try { var s = window[kind]; var k = '__bhw'; s.setItem(k, '1'); s.removeItem(k); return s; } catch (e) { return null; } }

    function shouldShowByFrequency(frequency, id) {
        if (frequency === 'always') return true;
        var key = 'bhw-age-accepted-' + id;
        if (frequency === 'session') { var ss = storage('sessionStorage'); return !(ss && ss.getItem(key)); }
        var ls = storage('localStorage');
        var last = parseInt((ls && ls.getItem(key)) || '0', 10);
        var H = 3600000, intervals = { '24h': 24 * H, '7d': 7 * 24 * H, '30d': 30 * 24 * H };
        return (Date.now() - last) > (intervals[frequency] || intervals['30d']);
    }

    function markAccepted(frequency, id) {
        var key = 'bhw-age-accepted-' + id;
        if (frequency === 'session') { var ss = storage('sessionStorage'); if (ss) ss.setItem(key, '1'); }
        else if (frequency !== 'always') { var ls = storage('localStorage'); if (ls) ls.setItem(key, String(Date.now())); }
    }
})();
