(function() {
    'use strict';

    const inlineCSS = `
        .bhw-overlay {
            position: fixed;
            inset: 0;
            background: var(--bhw-overlay, rgba(0,0,0,0.85));
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            backdrop-filter: blur(8px);
            font-family: var(--bhw-font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
            opacity: 0;
            transition: opacity 0.4s ease;
        }
        
        .bhw-overlay.show {
            opacity: 1;
        }
        
        .bhw-container {
            font-family: var(--bhw-font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
            max-width: var(--bhw-max-width, 420px);
            margin: var(--bhw-margin, 20px auto);
            width: min(90vw, 420px);
        }
        
        .bhw-widget {
            background: var(--bhw-bg, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
            border-radius: var(--bhw-radius, 20px);
            padding: var(--bhw-padding, 30px);
            color: var(--bhw-text-color, white);
            box-shadow: var(--bhw-shadow, 0 20px 60px rgba(102, 126, 234, 0.4));
            position: relative;
            overflow: hidden;
            transform: scale(0.85) translateY(30px);
            transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .bhw-overlay.show .bhw-widget {
            transform: scale(1) translateY(0);
        }
        
        .bhw-widget::before {
            content: '';
            position: absolute;
            inset: 0;
            background: var(--bhw-overlay, radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%));
            pointer-events: none;
        }
        
        .bhw-header {
            text-align: var(--bhw-header-align, center);
            margin-bottom: var(--bhw-header-margin-bottom, 25px);
            position: relative;
            z-index: 1;
        }
        
        .bhw-business-name {
            font-size: var(--bhw-name-size, 1.8em);
            font-weight: var(--bhw-name-weight, 800);
            margin-bottom: var(--bhw-name-margin-bottom, 8px);
            text-shadow: var(--bhw-name-shadow, 0 2px 8px rgba(0,0,0,0.3));
            color: var(--bhw-name-color, inherit);
            letter-spacing: -0.2px;
        }
        
        .bhw-status-badge {
            font-size: var(--bhw-badge-size, 1.05em);
            opacity: var(--bhw-badge-opacity, 0.9);
            font-weight: var(--bhw-badge-weight, 500);
            margin: 0 0 20px 0;
        }
        
        .bhw-hours-table {
            background: var(--bhw-table-bg, rgba(255, 255, 255, 0.95));
            border-radius: var(--bhw-table-radius, 15px);
            padding: var(--bhw-table-padding, 28px);
            color: var(--bhw-table-text, #333);
            margin: var(--bhw-table-margin, 20px 0);
            position: relative;
            z-index: 1;
            backdrop-filter: var(--bhw-table-backdrop-filter, blur(10px));
            text-align: center;
        }
        
        .bhw-hours-row {
            font-size: var(--bhw-row-size, 1.1em);
            line-height: 1.5;
            margin: 0 0 28px 0;
            color: var(--bhw-row-color, #555555);
        }
        
        .bhw-day-name {
            display: flex;
            gap: var(--bhw-day-gap, 12px);
            flex-direction: column;
        }
        
        .bhw-hours-time {
            padding: var(--bhw-time-padding, 16px 24px);
            border-radius: var(--bhw-time-radius, 12px);
            font-size: var(--bhw-time-size, 1.1em);
            font-weight: var(--bhw-time-weight, 700);
            border: none;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            font-family: var(--bhw-time-font, inherit);
            text-decoration: none;
            display: inline-block;
            width: 100%;
            box-sizing: border-box;
        }
        
        .bhw-hours-time::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(45deg, rgba(255,255,255,0.15) 0%, transparent 50%);
            pointer-events: none;
        }
        
        .bhw-hours-time.open {
            background: var(--bhw-open-color, #4ade80);
            color: var(--bhw-badge-text, white);
            order: 1;
        }
        
        .bhw-hours-time.open:hover {
            transform: translateY(-2px);
            box-shadow: var(--bhw-open-shadow, 0 8px 24px rgba(74, 222, 128, 0.4));
        }
        
        .bhw-hours-time.closed {
            background: var(--bhw-closed-color, #f1f5f9);
            color: var(--bhw-closed-text, #64748b);
            order: 2;
        }
        
        .bhw-hours-time.closed:hover {
            background: var(--bhw-closed-hover, #e2e8f0);
            transform: translateY(-1px);
        }
        
        .bhw-closing-info {
            background: var(--bhw-info-bg, rgba(255, 255, 255, 0.2));
            padding: var(--bhw-info-padding, 20px 28px 28px);
            border-radius: var(--bhw-info-radius, 10px);
            text-align: center;
            font-weight: var(--bhw-info-weight, 600);
            margin-bottom: var(--bhw-info-margin-bottom, 0);
            color: var(--bhw-info-color, inherit);
            position: relative;
            z-index: 1;
            font-size: var(--bhw-info-size, 0.85em);
            border-top: 1px solid rgba(255,255,255,0.2);
            margin-top: 20px;
        }
        
        .bhw-timezone-info {
            font-size: var(--bhw-tz-size, 3.5em);
            margin-bottom: 12px;
            display: block;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
            position: relative;
            z-index: 1;
        }
        
        .bhw-loading {
            text-align: center;
            padding: var(--bhw-loading-padding, 40px);
            position: relative;
            z-index: 1;
            color: var(--bhw-loading-text-color, white);
        }
        
        .bhw-spinner {
            width: 40px;
            height: 40px;
            border: var(--bhw-spinner-border, 3px solid rgba(255,255,255,0.3));
            border-top: var(--bhw-spinner-top-border, 3px solid white);
            border-radius: 50%;
            animation: bhw-spin 1s linear infinite;
            margin: var(--bhw-spinner-margin, 0 auto 15px);
        }
        
        .bhw-error {
            background: var(--bhw-error-bg, linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%));
            padding: var(--bhw-error-padding, 30px);
            border-radius: var(--bhw-error-radius, 16px);
            color: var(--bhw-error-text, white);
            text-align: center;
            box-shadow: var(--bhw-error-shadow, 0 15px 40px rgba(255,107,107,0.4));
        }
        
        @keyframes bhw-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 480px) {
            .bhw-container {
                width: min(95vw, 380px);
            }
            .bhw-widget {
                padding: var(--bhw-padding-mobile, 20px);
            }
            .bhw-hours-table {
                padding: var(--bhw-table-padding-mobile, 24px);
            }
            .bhw-business-name {
                font-size: var(--bhw-name-size-mobile, 1.6em);
            }
            .bhw-hours-row {
                font-size: var(--bhw-row-size-mobile, 1.05em);
            }
            .bhw-day-name {
                gap: var(--bhw-day-gap-mobile, 10px);
            }
        }
    `;

    try {
        const currentScript = document.currentScript || (function() {
            const scripts = document.getElementsByTagName('script');
            return scripts[scripts.length - 1];
        })();

        let clientId = currentScript.dataset.id;
        if (!clientId) {
            console.error('[BusinessHoursWidget] data-id обязателен');
            return;
        }

        // Убираем .js расширение
        if (clientId.endsWith('.js')) {
            clientId = clientId.slice(0, -3);
        }

        // Проверяем, не обработан ли уже этот конкретный скрипт
        if (currentScript.dataset.bhwMounted === '1') return;
        currentScript.dataset.bhwMounted = '1';

        console.log(`[BusinessHoursWidget] Normalized clientId: ${clientId}`);

        // Добавляем стили один раз
        if (!document.querySelector('#business-hours-widget-styles')) {
            const style = document.createElement('style');
            style.id = 'business-hours-widget-styles';
            style.textContent = inlineCSS;
            document.head.appendChild(style);
        }

        // Определяем baseUrl
        const baseUrl = currentScript.src ? 
            currentScript.src.replace(/\/[^\/]*$/, '') : 
            './';

        // Создаем контейнер с уникальным классом
        const uniqueClass = `bhw-${clientId}-${Date.now()}`;
        const container = createContainer(currentScript, clientId, uniqueClass);
        
        // Показываем загрузку
        showLoading(container);

        // Загружаем конфигурацию
        loadConfig(clientId, baseUrl)
            .then(config => {
                applyCustomStyles(container, config, uniqueClass);
                createBusinessHoursWidget(container, config, uniqueClass);
                console.log(`[BusinessHoursWidget] Виджет ${clientId} успешно создан`);
            })
            .catch(error => {
                console.error('[BusinessHoursWidget] Ошибка:', error);
                showError(container, clientId, error.message);
            });

    } catch (error) {
        console.error('[BusinessHoursWidget] Критическая ошибка:', error);
    }

    function createContainer(scriptElement, clientId, uniqueClass) {
        // Создаем overlay для age verification
        const overlay = document.createElement('div');
        overlay.className = `bhw-overlay ${uniqueClass}`;
        overlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(overlay);
        
        // Создаем контейнер внутри overlay
        const container = document.createElement('div');
        container.id = `business-hours-widget-${clientId}`;
        container.className = `bhw-container`;
        overlay.appendChild(container);
        
        // Возвращаем объект с обеими ссылками
        return { overlay, container };
    }

    function showLoading(containerObj) {
        containerObj.container.innerHTML = `
            <div class="bhw-widget">
                <div class="bhw-loading">
                    <div class="bhw-spinner"></div>
                    <div>Loading age verification...</div>
                </div>
            </div>
        `;
    }

    // Загрузка конфигурации
    async function loadConfig(clientId, baseUrl) {
        if (clientId === 'local') {
            const localScript = document.querySelector('#bhw-local-config');
            if (!localScript) {
                throw new Error('Локальный конфиг не найден на странице (#bhw-local-config)');
            }
            try {
                return JSON.parse(localScript.textContent);
            } catch (err) {
                throw new Error('Ошибка парсинга локального конфига: ' + err.message);
            }
        } else {
            const configUrl = `${baseUrl}/configs/${encodeURIComponent(clientId)}.json?v=${Date.now()}`;
            try {
                const response = await fetch(configUrl, { cache: 'no-cache', headers: { 'Accept': 'application/json' } });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return await response.json();
            } catch (error) {
                console.warn(`[BusinessHoursWidget] Основной конфиг недоступен, используем demo: ${error.message}`);
                const demoResponse = await fetch(`${baseUrl}/configs/demo.json?v=${Date.now()}`, {
                    cache: 'no-cache',
                    headers: { 'Accept': 'application/json' }
                });
                if (!demoResponse.ok) throw new Error('Конфигурация недоступна');
                return await demoResponse.json();
            }
        }
    }

    function applyCustomStyles(containerObj, config, uniqueClass) {
        const s = config.styling || {};
        
        const styleElement = document.createElement('style');
        styleElement.textContent = generateUniqueStyles(uniqueClass, s);
        containerObj.container.appendChild(styleElement);
    }

    function generateUniqueStyles(uniqueClass, styling) {
        const s = styling;
        const background = s.primaryColor && s.secondaryColor ? 
            `linear-gradient(135deg, ${s.primaryColor} 0%, ${s.secondaryColor} 100%)` : 
            (s.backgroundColor || 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)');

        return `
            .${uniqueClass} {
                font-family: ${s.fontFamily || 'inherit'};
            }
            
            .${uniqueClass} .bhw-widget {
                background: ${background};
                border-radius: ${s.borderRadius || '20px'};
                padding: ${s.padding || '30px'};
                color: ${s.textColor || 'white'};
            }
            
            .${uniqueClass} .bhw-business-name {
                font-size: ${s.businessNameSize || '1.8em'};
            }
            
            .${uniqueClass} .bhw-overlay {
                background: ${s.overlayColor || 'rgba(0,0,0,0.85)'};
            }
            
            @media (max-width: 480px) {
                .${uniqueClass} .bhw-widget {
                    padding: ${s.paddingMobile || '20px'};
                }
                .${uniqueClass} .bhw-business-name {
                    font-size: ${s.nameSizeMobile || '1.6em'};
                }
            }
        `;
    }

    function createBusinessHoursWidget(containerObj, config, uniqueClass) {
        const { overlay, container } = containerObj;
        
        // Безопасное отображение иконки
        const iconHtml = renderIcon(config);

        // Блокируем контент если включена опция
        if (config.blockContent) {
            document.body.style.overflow = 'hidden';
        }

        container.innerHTML = `
            <div class="bhw-widget" role="dialog" aria-modal="true">
                <div class="bhw-header">
                    <div class="bhw-timezone-info">${iconHtml}</div>
                    <h2 class="bhw-business-name">${escapeHtml(config.title || 'Age Verification')}</h2>
                    <p class="bhw-status-badge">${escapeHtml(config.subtitle || 'Restricted Content')}</p>
                </div>
                
                <div class="bhw-hours-table">
                    <p class="bhw-hours-row">${escapeHtml(config.message || 'You must be 18 or older to view this content.')}</p>
                    
                    <div class="bhw-day-name">
                        <button class="bhw-hours-time open" type="button">
                            ${escapeHtml(config.yesButtonText || "Yes, I'm 18+")}
                        </button>
                        <button class="bhw-hours-time closed" type="button">
                            ${escapeHtml(config.noButtonText || "No, I'm under 18")}
                        </button>
                    </div>
                </div>
                
                ${config.footerText ? `
                    <div class="bhw-closing-info">
                        ${escapeHtml(config.footerText)}
                    </div>
                ` : ''}
            </div>
        `;

        const widget = {
            overlay,
            container,
            config,
            clientId,
            isShown: false,
            
            show() {
                if (this.isShown || !shouldShowByFrequency(this.config.frequency, this.clientId)) return;
                
                this.overlay.style.display = 'flex';
                setTimeout(() => this.overlay.classList.add('show'), 10);
                this.overlay.setAttribute('aria-hidden', 'false');
                
                if (this.config.blockContent) {
                    document.body.style.overflow = 'hidden';
                }
                
                this.isShown = true;
            },
            
            hide() {
                if (!this.isShown) return;
                
                this.overlay.classList.remove('show');
                setTimeout(() => {
                    this.overlay.style.display = 'none';
                    if (this.config.blockContent) {
                        document.body.style.overflow = '';
                    }
                }, 400);
                this.overlay.setAttribute('aria-hidden', 'true');
                
                this.isShown = false;
            },
            
            approve() {
                markAccepted(this.config.frequency, this.clientId);
                this.hide();
            },
            
            decline() {
                if (this.config.redirectUrl) {
                    window.location.href = this.config.redirectUrl;
                } else {
                    this.hide();
                }
            }
        };

        // Обработчики событий
        setupEventHandlers(widget);
        
        // Глобальный доступ к виджету
        window.BusinessHoursWidgets = window.BusinessHoursWidgets || {};
        window.BusinessHoursWidgets[clientId] = widget;
        
        // Настройка триггеров (по умолчанию выключены для демо)
        setupTriggers(widget, config.triggers || {});
        
        // Применяем уникальные стили после создания HTML
        applyCustomStyles(containerObj, config, uniqueClass);
    }

    function setupEventHandlers(widget) {
        const { container } = widget;
        
        // Кнопка подтверждения возраста
        container.querySelector('.bhw-hours-time.open').addEventListener('click', () => {
            widget.approve();
        });
        
        // Кнопка отказа
        container.querySelector('.bhw-hours-time.closed').addEventListener('click', () => {
            widget.decline();
        });
    }

    // Система триггеров
    function setupTriggers(widget, triggers) {
        // Проверяем частоту показа
        if (!shouldShowByFrequency(widget.config.frequency, widget.clientId)) return;

        // Автопоказ при загрузке
        if (triggers.showOnLoad) {
            const delay = Math.max(0, Number(triggers.showDelay || 0));
            setTimeout(() => widget.show(), delay);
        }

        // Exit-intent триггер
        if (triggers.showOnExit) {
            let hasTriggered = false;
            document.addEventListener('mouseleave', (e) => {
                if (e.clientY <= 0 && !hasTriggered && !widget.isShown) {
                    widget.show();
                    hasTriggered = true;
                }
            });
        }

        // Триггер по скроллу
        if (triggers.showOnScroll > 0) {
            let hasTriggered = false;
            window.addEventListener('scroll', () => {
                const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                
                if (scrollPercent >= triggers.showOnScroll && !hasTriggered && !widget.isShown) {
                    widget.show();
                    hasTriggered = true;
                }
            });
        }
    }

    function shouldShowByFrequency(frequency, id) {
        if (frequency === 'always') return true;
        
        if (frequency === 'session') {
            return !sessionStorage.getItem(`bhw-accepted-${id}`);
        }
        
        const lastShown = parseInt(localStorage.getItem(`bhw-accepted-${id}`) || '0');
        const now = Date.now();
        const intervals = { 
            '24h': 24 * 60 * 60 * 1000, 
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000 
        };
        
        return (now - lastShown) > (intervals[frequency] || intervals['30d']);
    }

    function markAccepted(frequency, id) {
        if (frequency === 'session') {
            sessionStorage.setItem(`bhw-accepted-${id}`, '1');
        } else if (frequency !== 'always') {
            localStorage.setItem(`bhw-accepted-${id}`, Date.now().toString());
        }
    }

    function renderIcon(config) {
        if (config.iconHtml && config.iconHtml.trim()) {
            if (config.iconHtml.includes('&') || config.iconHtml.includes('<')) {
                return config.iconHtml;
            }
            return escapeHtml(config.iconHtml);
        }
        return '&#128286;'; // 🔞
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    function showError(containerObj, clientId, message) {
        containerObj.container.innerHTML = `
            <div class="bhw-widget bhw-error">
                <h3 style="margin: 0 0 15px 0;">🔞 Age verification unavailable</h3>
                <p style="margin: 0; opacity: 0.9; font-size: 0.9em;">ID: ${escapeHtml(clientId)}</p>
                <details style="margin-top: 15px;">
                    <summary style="cursor: pointer; opacity: 0.8;">Details</summary>
                    <p style="margin: 10px 0 0 0; font-size: 0.8em; opacity: 0.7;">${escapeHtml(message)}</p>
                </details>
            </div>
        `;
    }
})();
