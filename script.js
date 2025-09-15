/**
 * SysFX Website Script
 * Version: 2.2 (Performance Optimizations)
 * Author: sysfx (Revised by AI Assistant)
 *
 * Purpose: Manages dynamic interactions, animations, and third-party
 * library integrations for the sysfx website.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // --- Configuration & Feature Flags ---
    const CONFIG = {
        SCROLLSPY_THROTTLE_MS: 150,
        RESIZE_DEBOUNCE_MS: 250, // Slightly faster debounce
        TYPING_SPEED_MS: 85,
        TYPING_DELETE_SPEED_MS: 40,
        TYPING_PAUSE_MS: 2500,
        CAROUSEL_INTERVAL_MS: 6000,
        FORM_STATUS_TIMEOUT_MS: 6000,
        PRELOADER_TIMEOUT_MS: 2500, // Reduced timeout
        MUSIC_FADE_DURATION_MS: 600,
        MODAL_CLOSE_SCROLL_DELAY_MS: 350, // Delay for scroll after modal close (match CSS transition)
        TAGLINES: [
            "Your Partner in Tech Solutions.",
            "Expert Computer Repair Services.",
            "Robust Cybersecurity Solutions.",
            "Custom Web Development.",
            "Reliable Networking & IT Support.",
            "Serving Clinton, CT and Beyond."
        ],
        TECH_TRIVIA: [
            "The first computer mouse, invented by Doug Engelbart in 1964, was made of wood.",
            "An estimated 90% of the world's data has been created in just the last few years.",
            "The QWERTY keyboard layout was initially designed to slow typists down.",
            "On average, a smartphone user checks their device over 150 times per day.",
            "Registering a domain name was free until 1995.",
            "The first 1GB hard drive (1980) weighed over 500 pounds.",
            "The term 'bug' originated from a real moth in the Harvard Mark II computer (1947)."
        ],
        // Map Settings
        MAP_COORDS: [41.2793, -72.4310], // Clinton, CT (Approx)
        MAP_ZOOM: 14,
        MAP_MAX_ZOOM: 18,
        MAP_MIN_ZOOM: 8
    };

    const FEATURE_FLAGS = {
        enableParticles: true,
        enableCustomCursor: true,
        enableEasterEgg: true,
        enableBackgroundMusic: true,
        enableFormspree: true // Set to false if not using a service like Formspree
    };

    // --- Utility Functions ---
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => { clearTimeout(timeout); func.apply(this, args); };
            clearTimeout(timeout); timeout = setTimeout(later, wait);
        };
    };

    const throttle = (func, limit) => {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args); inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    const logError = (message, error = '') => console.error(`[SysFX Script Error] ${message}`, error);
    const logWarn = (message) => console.warn(`[SysFX Script Warn] ${message}`);
    const logInfo = (message) => console.info(`[SysFX Script Info] ${message}`);

    const selectElement = (selector, context = document) => {
        try { return context.querySelector(selector); } catch (e) { logError(`Invalid selector: ${selector}`, e); return null; }
    };
    const selectElements = (selector, context = document) => {
        try { return Array.from(context.querySelectorAll(selector)); } catch (e) { logError(`Invalid selector: ${selector}`, e); return []; } // Return empty array
    };

    const loadScript = (src, attributes = {}) => new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement('script');
        Object.assign(script, { src, ...attributes });
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.append(script);
    });

    const loadStyle = (href) => new Promise((resolve, reject) => {
        if (document.querySelector(`link[href="${href}"]`)) return resolve();
        const link = document.createElement('link');
        Object.assign(link, { rel: 'stylesheet', href });
        link.onload = resolve;
        link.onerror = () => reject(new Error(`Failed to load style: ${href}`));
        document.head.append(link);
    });


    // --- State Variables ---
    let headerHeight = 0;
    let currentTaglineIndex = 0;
    let isTypingPaused = false;
    let currentTestimonialIndex = 0;
    let testimonialInterval = null;
    let musicPlaying = false;
    let mapInstance = null;
    let activeModal = null;
    let activeLightboxTarget = null;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let audioFadeInterval = null;
    let cursorXQuickTo = null;
    let cursorYQuickTo = null;

    // --- Element Selectors Cache ---
    const ELEMENTS = (() => {
        const selectors = {
            html: 'html', body: 'body', preloader: '#preloader',
            header: '#main-header',
            darkModeToggle: '#darkModeToggle',
            darkModeToggleIconContainer: '#darkModeToggle .icon-container',
            darkModeToggleText: '#darkModeToggle .mode-button-text',
            hamburgerButton: '#hamburger-button',
            mobileNav: '#mobile-navigation',
            mobileNavClose: '.mobile-nav-close',
            mobileNavOverlay: '#mobile-nav-overlay',
            navLinks: '.main-nav .nav-link[href^="#"]',
            scrollProgress: '.scroll-progress',
            currentTimeDisplay: '#current-time',
            typingEffectElement: '#typing-effect', mapElement: '#map',
            serviceCards: '.service[data-modal-target]',
            modalContainer: '.modal-container', modals: '.modal',
            modalScrollButtons: '.modal-action[data-scroll-target]',
            galleryItems: '.gallery-item[data-src]',
            lightbox: '#lightbox', lightboxImage: '#lightbox-image',
            lightboxAltText: '#lightbox-alt-text', lightboxClose: '.lightbox-close',
            testimonialSlider: '.testimonial-slider', testimonials: '.testimonial',
            testimonialLiveRegion: '#testimonial-live-region',
            carouselPrev: '.carousel-prev', carouselNext: '.carousel-next',
            statsNumbers: '.stat-number[data-target]',
            animatedSections: '.section-animation', footer: '.main-footer',
            triviaTextElement: '#trivia-text', musicToggle: '#music-toggle',
            backgroundMusic: '#background-music', scrollTopButton: '#scroll-top-button',
            easterEggTrigger: '.easter-egg-trigger',
            customCursor: '.cursor',
            form: '.contact-form', formStatus: '#form-status', skipLink: '.skip-link',
            mainContent: '#main-content',
            sectionsForScrollspy: 'main section[id]'
        };
        const elements = {};
        for (const key in selectors) {
            const multiple = ['modals', 'navLinks', 'serviceCards', 'modalScrollButtons', 'galleryItems', 'testimonials', 'statsNumbers', 'animatedSections', 'sectionsForScrollspy'].includes(key);
            elements[key] = multiple ? selectElements(selectors[key]) : selectElement(selectors[key]);
        }
        if (!elements.body) console.error("FATAL: Body element not found!");
        if (!elements.header) logWarn("Header element not found, layout adjustments might fail.");
        if (!elements.mainContent) logWarn("Main content element (#main-content) not found, inert attribute cannot be applied.");
        return elements;
    })();


    // --- Core Functions ---

    const initializeDarkMode = () => {
        if (!ELEMENTS.body || !ELEMENTS.darkModeToggle) return;
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');
        const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
        ELEMENTS.body.classList.toggle('dark-mode', isDark);
        updateDarkModeButton(isDark);
        setTimeout(() => ELEMENTS.body?.classList.add('theme-transitions-active'), 100);
    };

    const updateDarkModeButton = (isDarkMode) => {
        if (!ELEMENTS.darkModeToggle || !ELEMENTS.darkModeToggleIconContainer || !ELEMENTS.darkModeToggleText) return;
        const icon = selectElement('i', ELEMENTS.darkModeToggleIconContainer);
        ELEMENTS.darkModeToggle.setAttribute('aria-pressed', String(isDarkMode));
        if (isDarkMode) {
            icon?.classList.replace('fa-sun', 'fa-moon');
            ELEMENTS.darkModeToggleText.textContent = 'Dark Mode';
            ELEMENTS.darkModeToggle.setAttribute('aria-label', 'Switch to light mode');
        } else {
            icon?.classList.replace('fa-moon', 'fa-sun');
            ELEMENTS.darkModeToggleText.textContent = 'Light Mode';
            ELEMENTS.darkModeToggle.setAttribute('aria-label', 'Switch to dark mode');
        }
    };

    const toggleDarkMode = () => {
        if (!ELEMENTS.body) return;
        const isDark = ELEMENTS.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateDarkModeButton(isDark);
        if (mapInstance) initializeMapMarker();
        if (typeof particlesJS !== 'undefined' && FEATURE_FLAGS.enableParticles) ReInitializeParticles();
    };

    const ReInitializeParticles = () => {
        if (!FEATURE_FLAGS.enableParticles || prefersReducedMotion || typeof particlesJS === 'undefined') return;
        const particlesElement = selectElement('#particles-js');
        if (particlesElement) {
            const existingCanvas = selectElement('canvas.particles-js-canvas-el', particlesElement);
            if (existingCanvas) existingCanvas.remove();
            window.pJSDom?.[0]?.pJS?.fn?.vendors?.destroypJS();
            window.pJSDom = [];
            initializeParticles();
        } else { logWarn("Could not re-initialize particles: Container #particles-js not found."); }
    };

    const adjustLayoutPadding = debounce(() => {
        if (!ELEMENTS.header || !ELEMENTS.body || !ELEMENTS.html) return;
        headerHeight = ELEMENTS.header.offsetHeight;
        ELEMENTS.body.style.paddingTop = `${headerHeight}px`;
        const scrollPaddingOffset = 20;
        ELEMENTS.html.style.scrollPaddingTop = `${headerHeight + scrollPaddingOffset}px`;
        logInfo(`Layout padding adjusted. Header height: ${headerHeight}px`);
    }, CONFIG.RESIZE_DEBOUNCE_MS);

    let lastScrollTop = 0;
    const handleHeaderShrink = () => {
        if (!ELEMENTS.header) return;
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        const shrinkThreshold = 100;
        if (currentScroll > lastScrollTop && currentScroll > shrinkThreshold) {
            ELEMENTS.header.classList.add('header-shrunk');
        } else if (currentScroll < lastScrollTop || currentScroll <= shrinkThreshold) {
            ELEMENTS.header.classList.remove('header-shrunk');
        }
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    };

    const updateScrollProgress = throttle(() => {
        if (!ELEMENTS.scrollProgress || !ELEMENTS.html) return;
        const scrollableHeight = ELEMENTS.html.scrollHeight - window.innerHeight;
        const scrolled = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
        ELEMENTS.scrollProgress.style.width = `${Math.min(scrolled, 100)}%`;
        ELEMENTS.scrollProgress.setAttribute('aria-valuenow', String(Math.round(scrolled)));
    }, 50);

    const displayTime = () => {
        if (!ELEMENTS.currentTimeDisplay) return;
        try {
            const now = new Date();
            const timeZone = 'America/New_York';
            const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: true, timeZone };
            const optionsDate = { weekday: 'short', month: 'short', day: 'numeric', timeZone };
            const timeString = now.toLocaleTimeString('en-US', optionsTime);
            const dateString = now.toLocaleDateString('en-US', optionsDate);

            ELEMENTS.currentTimeDisplay.textContent = '';
            const dateIcon = document.createElement('i'); dateIcon.className = 'far fa-calendar-alt'; dateIcon.setAttribute('aria-hidden', 'true');
            const timeIcon = document.createElement('i'); timeIcon.className = 'far fa-clock'; timeIcon.setAttribute('aria-hidden', 'true');
            ELEMENTS.currentTimeDisplay.append(dateIcon, ` ${dateString} \u00A0\u00A0 `, timeIcon, ` ${timeString}`);
        } catch (e) { logError('Failed to display time', e); ELEMENTS.currentTimeDisplay.textContent = 'Could not load time.'; }
    };

    const typeEffectHandler = async () => {
        if (!ELEMENTS.typingEffectElement) return;
        if (prefersReducedMotion) {
            if (CONFIG.TAGLINES.length > 0) ELEMENTS.typingEffectElement.textContent = CONFIG.TAGLINES[0];
            else ELEMENTS.typingEffectElement.innerHTML = ' ';
            return;
        }
        if (ELEMENTS.typingEffectElement.textContent.trim() === '') ELEMENTS.typingEffectElement.innerHTML = ' ';
        while (true) {
            if (isTypingPaused) { await new Promise(resolve => setTimeout(resolve, 500)); continue; }
            const currentText = CONFIG.TAGLINES[currentTaglineIndex];
            for (let i = 0; i <= currentText.length; i++) {
                if (isTypingPaused) break;
                ELEMENTS.typingEffectElement.textContent = currentText.substring(0, i) || '\u00A0';
                await new Promise(resolve => setTimeout(resolve, CONFIG.TYPING_SPEED_MS));
            }
            if (isTypingPaused) continue;
            await new Promise(resolve => setTimeout(resolve, CONFIG.TYPING_PAUSE_MS));
            if (isTypingPaused) continue;
            for (let i = currentText.length; i >= 0; i--) {
                if (isTypingPaused) break;
                ELEMENTS.typingEffectElement.textContent = currentText.substring(0, i) || '\u00A0';
                await new Promise(resolve => setTimeout(resolve, CONFIG.TYPING_DELETE_SPEED_MS));
            }
            if (isTypingPaused) continue;
            await new Promise(resolve => setTimeout(resolve, CONFIG.TYPING_DELETE_SPEED_MS * 3));
            currentTaglineIndex = (currentTaglineIndex + 1) % CONFIG.TAGLINES.length;
        }
    };

    const initializeParticles = () => {
        const particlesContainerId = 'particles-js';
        if (!FEATURE_FLAGS.enableParticles || prefersReducedMotion || typeof particlesJS === 'undefined') {
            logInfo('ParticlesJS skipped (disabled, reduced motion, or library missing).');
            selectElement(`#${particlesContainerId}`)?.style.setProperty('display', 'none', 'important');
            return;
        }
        if (!selectElement(`#${particlesContainerId}`)) { logWarn(`Particles container #${particlesContainerId} not found.`); return; }
        try {
            const isDark = ELEMENTS.body?.classList.contains('dark-mode');
            const baseConfig = {
                interactivity: { detect_on: "canvas", events: { resize: true }, modes: { repulse: { distance: 80, duration: 0.4 }, push: { particles_nb: 4 }, grab: { distance: 140, line_opacity: 0.7 }, bubble: { distance: 200, size: 6, duration: 0.3 } } }, retina_detect: true
            };
            let themeConfig;
            if (isDark) {
                themeConfig = { particles: { number: { value: 100, density: { enable: true, value_area: 800 } }, color: { value: "#4CAF50" }, shape: { type: "circle" }, opacity: { value: 0.45, random: true, anim: { enable: true, speed: 0.8, opacity_min: 0.1, sync: false } }, size: { value: 3, random: true }, line_linked: { enable: true, distance: 130, color: "#444444", opacity: 0.5, width: 1 }, move: { enable: true, speed: 1.5, direction: "none", random: true, straight: false, out_mode: "out", bounce: false } }, interactivity: { ...baseConfig.interactivity, events: { ...baseConfig.interactivity.events, onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "bubble" } } } };
            } else {
                themeConfig = { particles: { number: { value: 80, density: { enable: true, value_area: 900 } }, color: { value: "#00a000" }, shape: { type: "circle" }, opacity: { value: 0.35, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } }, size: { value: 3, random: true }, line_linked: { enable: true, distance: 150, color: "#cccccc", opacity: 0.4, width: 1 }, move: { enable: true, speed: 2, direction: "none", random: false, straight: false, out_mode: "out", bounce: false } }, interactivity: { ...baseConfig.interactivity, events: { ...baseConfig.interactivity.events, onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" } } } };
            }
            particlesJS(particlesContainerId, themeConfig, () => { logInfo(`Particles.js initialized (${isDark ? 'dark' : 'light'} theme).`); });
        } catch (error) { logError("Error initializing particles.js", error); selectElement(`#${particlesContainerId}`)?.style.setProperty('display', 'none', 'important'); }
    };

    const initializeMap = () => {
        if (typeof L === 'undefined') { logWarn('Leaflet library (L) not found.'); if (ELEMENTS.mapElement) ELEMENTS.mapElement.innerHTML = '<p>Map library failed to load.</p>'; return; }
        if (!ELEMENTS.mapElement) { logWarn('Map element (#map) not found.'); return; }
        try {
            if (mapInstance) mapInstance.remove();
            mapInstance = L.map(ELEMENTS.mapElement, { scrollWheelZoom: false, attributionControl: false }).setView(CONFIG.MAP_COORDS, CONFIG.MAP_ZOOM);
            mapInstance.on('focus', () => mapInstance?.scrollWheelZoom.enable());
            mapInstance.on('blur', () => mapInstance?.scrollWheelZoom.disable());
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: CONFIG.MAP_MAX_ZOOM, minZoom: CONFIG.MAP_MIN_ZOOM }).addTo(mapInstance);
            L.control.attribution({ prefix: false, position: 'bottomright' }).addAttribution('© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors').addTo(mapInstance);
            initializeMapMarker();
            logInfo('Leaflet map initialized.');
        } catch (error) { logError("Error initializing Leaflet map", error); if (ELEMENTS.mapElement) ELEMENTS.mapElement.innerHTML = '<p>Map could not be loaded.</p>'; mapInstance = null; }
    };

    const setupMapObserver = () => {
        if (!ELEMENTS.mapElement) return;
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    obs.unobserve(entry.target);
                    logInfo("Map section in view. Loading Leaflet...");
                    Promise.all([
                        loadStyle('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'),
                        loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', { integrity: 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=', crossOrigin: 'anonymous' })
                    ])
                    .then(() => {
                        logInfo("Leaflet loaded.");
                        initializeMap();
                    })
                    .catch(error => logError("Failed to load Leaflet library", error));
                }
            });
        }, { rootMargin: '200px', threshold: 0.01 });
        observer.observe(ELEMENTS.mapElement);
    };

    const initializeMapMarker = () => {
        if (!mapInstance || typeof L === 'undefined' || !ELEMENTS.body) return;
        mapInstance.eachLayer((layer) => { if (layer instanceof L.Marker || (layer.options && layer.options.icon instanceof L.DivIcon)) { try { mapInstance.removeLayer(layer); } catch (e) { logWarn("Could not remove previous map marker.", e); } } });
        try {
            const computedStyle = getComputedStyle(ELEMENTS.body);
            const markerColor = ELEMENTS.body.classList.contains('dark-mode') ? (computedStyle.getPropertyValue('--secondary-color').trim() || '#4CAF50') : (computedStyle.getPropertyValue('--primary-color').trim() || '#00a000');
            const borderColor = ELEMENTS.body.classList.contains('dark-mode') ? (computedStyle.getPropertyValue('--text-dark').trim() || '#212529') : (computedStyle.getPropertyValue('--text-light').trim() || '#f8f9fa');
            const pulseColor = markerColor + '80';
            const pulseEndColor = markerColor + '00';
            const keyframes = `@keyframes pulseMarker { 0% { box-shadow: 0 0 0 0 ${pulseColor}; } 70% { box-shadow: 0 0 0 15px ${pulseEndColor}; } 100% { box-shadow: 0 0 0 0 ${pulseEndColor}; } }`;
            const styleId = 'map-marker-keyframes';
            let styleElement = document.getElementById(styleId);
            if (!styleElement) { styleElement = document.createElement('style'); styleElement.id = styleId; document.head.appendChild(styleElement); }
            styleElement.textContent = keyframes;
            const pulsingIcon = L.divIcon({
                className: 'custom-map-marker',
                html: `<div style="background-color: ${markerColor}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid ${borderColor}; animation: pulseMarker 2s infinite; transition: background-color 0.3s ease, border-color 0.3s ease;"></div>`,
                iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -15]
            });
            L.marker(CONFIG.MAP_COORDS, { icon: pulsingIcon, title: 'sysfx Location' })
                .addTo(mapInstance)
                .bindPopup("<b>sysfx HQ</b><br>123 Main Street<br>Clinton, CT 06413");
        } catch (error) { logError("Failed to create map marker", error); }
    };

    const handleModals = () => {
        if (ELEMENTS.serviceCards.length === 0 && ELEMENTS.modals.length === 0) return;
        ELEMENTS.serviceCards?.forEach(card => {
            const modalId = card.getAttribute('data-modal-target'); if (!modalId) return;
            const modal = selectElement(`#${modalId}`); if (!modal) return;
            card.addEventListener('click', () => openModal(modal, card));
            card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(modal, card); } });
        });
        ELEMENTS.modals?.forEach(modal => {
            selectElements('.modal-close, .modal-close-alt', modal).forEach(button => button.addEventListener('click', () => closeModal(modal)));
            modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(modal); });
            selectElements('.modal-action[data-scroll-target]', modal).forEach(button => {
                button.addEventListener('click', () => {
                    const targetSelector = button.getAttribute('data-scroll-target');
                    closeModal(modal, true);
                    setTimeout(() => {
                        const targetElement = selectElement(targetSelector);
                        if (targetElement) {
                            targetElement.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                            targetElement.focus({ preventScroll: true });
                            logInfo(`Scrolled to ${targetSelector} after modal close.`);
                        } else {
                            logWarn(`Scroll target '${targetSelector}' not found.`);
                        }
                    }, CONFIG.MODAL_CLOSE_SCROLL_DELAY_MS);
                });
            });
        });
        document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && activeModal) closeModal(activeModal); });
    };

    const openModal = (modal, triggerElement = null) => {
        if (!modal || modal === activeModal) return;
        activeModal = modal;
        if (triggerElement) activeModal.triggerElement = triggerElement;
        modal.style.display = 'flex';
        const reflow = modal.offsetHeight;
        requestAnimationFrame(() => {
            modal.classList.add('active');
            ELEMENTS.body?.classList.add('no-scroll');
            ELEMENTS.mainContent?.setAttribute('inert', '');
            ELEMENTS.footer?.setAttribute('inert', '');
            modal.setAttribute('aria-hidden', 'false');
            const firstFocusable = selectElement('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal) || modal;
            setTimeout(() => firstFocusable.focus(), 100);
        });
    };

    const closeModal = (modal, skipFocusReturn = false) => {
        if (!modal || modal !== activeModal || !modal.classList.contains('active')) return;
        const triggerElement = activeModal.triggerElement;
        activeModal.triggerElement = null;
        activeModal = null;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        ELEMENTS.mainContent?.removeAttribute('inert');
        ELEMENTS.footer?.removeAttribute('inert');
        let transitionEnded = false;
        const onTransitionEnd = (event) => {
            if (event.target !== modal || !['opacity', 'transform'].includes(event.propertyName)) return;
            transitionEnded = true;
            modal.style.display = 'none';
            ELEMENTS.body?.classList.remove('no-scroll');
            if (!skipFocusReturn) {
                triggerElement?.focus();
            }
            modal.removeEventListener('transitionend', onTransitionEnd);
        };
        modal.addEventListener('transitionend', onTransitionEnd);
        setTimeout(() => {
            if (!transitionEnded) {
                logWarn(`Modal transitionEnd fallback triggered: ${modal.id}`);
                modal.removeEventListener('transitionend', onTransitionEnd);
                modal.style.display = 'none';
                ELEMENTS.body?.classList.remove('no-scroll');
                if (!skipFocusReturn) {
                    triggerElement?.focus();
                }
            }
        }, 500);
    };

    const handleLightbox = () => {
        if (!ELEMENTS.lightbox || !ELEMENTS.lightboxImage || !ELEMENTS.lightboxClose || !ELEMENTS.lightboxAltText) return;
        const openLightbox = (item) => {
            activeLightboxTarget = item;
            const highResSrc = item.getAttribute('data-src');
            const altText = item.getAttribute('data-alt') || selectElement('img', item)?.alt || 'Gallery image';
            if (!highResSrc) { logWarn("Gallery item has no data-src.", item); return; }
            ELEMENTS.lightboxImage.setAttribute('src', highResSrc);
            ELEMENTS.lightboxImage.setAttribute('alt', altText);
            ELEMENTS.lightboxAltText.textContent = altText;
            ELEMENTS.lightbox.style.display = 'flex';
            const reflow = ELEMENTS.lightbox.offsetHeight;
            requestAnimationFrame(() => {
                ELEMENTS.lightbox.classList.add('active');
                ELEMENTS.body?.classList.add('no-scroll');
                ELEMENTS.mainContent?.setAttribute('inert', ''); ELEMENTS.footer?.setAttribute('inert', '');
                ELEMENTS.lightbox.setAttribute('aria-hidden', 'false');
                setTimeout(() => ELEMENTS.lightboxClose.focus(), 100);
            });
        };
        const closeLightbox = () => {
            if (!ELEMENTS.lightbox.classList.contains('active')) return;
            const trigger = activeLightboxTarget;
            activeLightboxTarget = null;
            ELEMENTS.lightbox.classList.remove('active');
            ELEMENTS.lightbox.setAttribute('aria-hidden', 'true');
            ELEMENTS.mainContent?.removeAttribute('inert'); ELEMENTS.footer?.removeAttribute('inert');
            let transitionEnded = false;
            const onTransitionEnd = (event) => {
                if (event.target !== ELEMENTS.lightbox || !['opacity', 'transform'].includes(event.propertyName)) return;
                transitionEnded = true;
                ELEMENTS.lightbox.style.display = 'none';
                ELEMENTS.lightboxImage.setAttribute('src', '');
                ELEMENTS.lightboxImage.setAttribute('alt', '');
                ELEMENTS.lightboxAltText.textContent = '';
                ELEMENTS.body?.classList.remove('no-scroll');
                trigger?.focus();
                ELEMENTS.lightbox.removeEventListener('transitionend', onTransitionEnd);
            };
            ELEMENTS.lightbox.addEventListener('transitionend', onTransitionEnd);
            setTimeout(() => {
                if (!transitionEnded) {
                    logWarn(`Lightbox transitionEnd fallback.`);
                    ELEMENTS.lightbox.removeEventListener('transitionend', onTransitionEnd);
                    ELEMENTS.lightbox.style.display = 'none'; ELEMENTS.lightboxImage.src = ''; ELEMENTS.lightboxImage.alt = '';
                    ELEMENTS.lightboxAltText.textContent = ''; ELEMENTS.body?.classList.remove('no-scroll');
                    trigger?.focus();
                }
            }, 500);
        };
        ELEMENTS.galleryItems?.forEach(item => {
            item.addEventListener('click', () => openLightbox(item));
            item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(item); } });
        });
        ELEMENTS.lightboxClose.addEventListener('click', closeLightbox);
        ELEMENTS.lightbox.addEventListener('click', (event) => { if (event.target === ELEMENTS.lightbox) closeLightbox(); });
        document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && ELEMENTS.lightbox.classList.contains('active')) closeLightbox(); });
    };

    const handleTestimonialCarousel = () => {
        if (!ELEMENTS.testimonialSlider || ELEMENTS.testimonials.length === 0) {
            selectElement('.carousel-container')?.style.setProperty('display', 'none'); return;
        }
        const totalTestimonials = ELEMENTS.testimonials.length;
        const container = ELEMENTS.testimonialSlider.parentElement;
        const showTestimonial = (index) => {
            currentTestimonialIndex = (index + totalTestimonials) % totalTestimonials;
            ELEMENTS.testimonials.forEach((testimonial, i) => testimonial.setAttribute('aria-hidden', String(i !== currentTestimonialIndex)));
            if (ELEMENTS.testimonialLiveRegion) ELEMENTS.testimonialLiveRegion.textContent = `Showing testimonial ${currentTestimonialIndex + 1} of ${totalTestimonials}.`;
        };
        const nextTestimonial = () => showTestimonial(currentTestimonialIndex + 1);
        const prevTestimonial = () => showTestimonial(currentTestimonialIndex - 1);
        const stopInterval = () => clearInterval(testimonialInterval);
        const startInterval = () => { stopInterval(); if (!prefersReducedMotion) testimonialInterval = setInterval(nextTestimonial, CONFIG.CAROUSEL_INTERVAL_MS); };
        const resetInterval = () => { stopInterval(); startInterval(); };
        ELEMENTS.carouselNext?.addEventListener('click', () => { nextTestimonial(); resetInterval(); });
        ELEMENTS.carouselPrev?.addEventListener('click', () => { prevTestimonial(); resetInterval(); });
        [ELEMENTS.carouselPrev, ELEMENTS.carouselNext].forEach((btn, i) => btn?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (i === 0 ? prevTestimonial : nextTestimonial)(); resetInterval(); } }));
        if (container) { container.addEventListener('mouseenter', stopInterval); container.addEventListener('mouseleave', startInterval); container.addEventListener('focusin', stopInterval); container.addEventListener('focusout', startInterval); }
        showTestimonial(0);
        startInterval();
    };

    const animateStats = () => {
        if (ELEMENTS.statsNumbers.length === 0) return;
        const runFallback = () => ELEMENTS.statsNumbers?.forEach(n => n.textContent = (parseInt(n.dataset.target || '0')).toLocaleString());
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || prefersReducedMotion) { logInfo('GSAP/ScrollTrigger missing or reduced motion. Using fallback for stats.'); runFallback(); return; }
        gsap.registerPlugin(ScrollTrigger);
        ELEMENTS.statsNumbers.forEach(statNum => {
            const target = parseInt(statNum.dataset.target || '0');
            let proxy = { val: 0 };
            ScrollTrigger.create({
                trigger: statNum,
                start: "top 90%",
                once: true,
                onEnter: () => gsap.to(proxy, {
                    val: target,
                    duration: 2.5,
                    ease: "power2.out",
                    onUpdate: () => { statNum.textContent = Math.round(proxy.val).toLocaleString(); },
                    onComplete: () => { statNum.textContent = target.toLocaleString(); }
                })
            });
        });
    };

    const revealSections = () => {
        if (ELEMENTS.animatedSections.length === 0 && !ELEMENTS.footer) return;
        const runFallback = () => { ELEMENTS.animatedSections?.forEach(s => { s.style.opacity = '1'; s.style.transform = 'none'; }); ELEMENTS.footer?.classList.add('visible'); };
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || prefersReducedMotion) { logInfo('GSAP/ScrollTrigger missing or reduced motion. Using fallback for reveals.'); runFallback(); return; }
        gsap.registerPlugin(ScrollTrigger);
        ELEMENTS.animatedSections?.forEach((section, index) => gsap.fromTo(section,
            { opacity: 0, y: 60 },
            {
                opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
                scrollTrigger: { trigger: section, start: "top 88%", toggleActions: "play none none none" },
                delay: index * 0.05
            }
        ));
        if (ELEMENTS.footer) ScrollTrigger.create({
            trigger: ELEMENTS.footer,
            start: "top 95%",
            onEnter: () => ELEMENTS.footer.classList.add('visible'),
            onLeaveBack: () => ELEMENTS.footer.classList.remove('visible')
        });
    };

    const displayTechTrivia = () => {
        if (!ELEMENTS.triviaTextElement) return;
        if (CONFIG.TECH_TRIVIA && CONFIG.TECH_TRIVIA.length > 0) {
            const randomIndex = Math.floor(Math.random() * CONFIG.TECH_TRIVIA.length);
            ELEMENTS.triviaTextElement.textContent = CONFIG.TECH_TRIVIA[randomIndex];
        } else { ELEMENTS.triviaTextElement.textContent = 'Tech insights loading...'; }
    };

    const toggleMusic = () => {
        if (!FEATURE_FLAGS.enableBackgroundMusic || !ELEMENTS.backgroundMusic || !ELEMENTS.musicToggle) return;
        const audio = ELEMENTS.backgroundMusic; const button = ELEMENTS.musicToggle;
        const fadeDurationSeconds = CONFIG.MUSIC_FADE_DURATION_MS / 1000;
        if (audioFadeInterval) clearInterval(audioFadeInterval);
        if (gsap) gsap.killTweensOf(audio);
        if (musicPlaying) {
            if (typeof gsap !== 'undefined') { gsap.to(audio, { volume: 0, duration: fadeDurationSeconds, ease: "linear", onComplete: () => audio.pause() }); }
            else { let vol = audio.volume; audioFadeInterval = setInterval(() => { vol -= 0.1 / (fadeDurationSeconds * 10); if (vol <= 0) { audio.volume = 0; audio.pause(); clearInterval(audioFadeInterval); } else { audio.volume = vol; } }, 100); }
            musicPlaying = false; button.classList.add('muted'); button.setAttribute('aria-pressed', 'false'); button.setAttribute('aria-label', 'Play background music');
        } else {
            audio.volume = 0;
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    if (typeof gsap !== 'undefined') { gsap.to(audio, { volume: 1, duration: fadeDurationSeconds, ease: "linear" }); } 
                    else { let vol = 0; audioFadeInterval = setInterval(() => { vol += 0.1 / (fadeDurationSeconds * 10); if (vol >= 1) { audio.volume = 1; clearInterval(audioFadeInterval); } else { audio.volume = vol; } }, 100); }
                    musicPlaying = true; button.classList.remove('muted'); button.setAttribute('aria-pressed', 'true'); button.setAttribute('aria-label', 'Pause background music');
                }).catch(error => { logWarn("Music playback failed (user interaction likely needed).", error); button.classList.add('muted'); button.setAttribute('aria-pressed', 'false'); musicPlaying = false; });
            } else {
                logWarn("Audio play() did not return a promise.");
                if (typeof gsap !== 'undefined') { gsap.to(audio, { volume: 1, duration: fadeDurationSeconds, ease: "linear" }); } else { audio.volume = 1; }
                musicPlaying = true; button.classList.remove('muted'); button.setAttribute('aria-pressed', 'true'); button.setAttribute('aria-label', 'Pause background music');
            }
        }
    };

    const handleScrollTopButton = throttle(() => {
        if (!ELEMENTS.scrollTopButton) return;
        const scrollThreshold = window.innerHeight * 0.4;
        const shouldBeVisible = window.scrollY > scrollThreshold;
        const isVisible = parseFloat(ELEMENTS.scrollTopButton.style.opacity || '0') > 0;
        if (shouldBeVisible && !isVisible) {
            ELEMENTS.scrollTopButton.style.display = 'flex';
            requestAnimationFrame(() => {
                gsap?.to(ELEMENTS.scrollTopButton, { opacity: 1, scale: 1, duration: 0.3, ease: 'power1.out' }) || (ELEMENTS.scrollTopButton.style.opacity = '1', ELEMENTS.scrollTopButton.style.transform = 'scale(1)');
            });
        } else if (!shouldBeVisible && isVisible) {
            const onComplete = () => { if (window.scrollY <= scrollThreshold) ELEMENTS.scrollTopButton.style.display = 'none'; };
            gsap?.to(ELEMENTS.scrollTopButton, { opacity: 0, scale: 0.8, duration: 0.3, ease: 'power1.in', onComplete }) || (ELEMENTS.scrollTopButton.style.opacity = '0', ELEMENTS.scrollTopButton.style.transform = 'scale(0.8)', onComplete());
        }
    }, 200);

    const scrollToTop = () => {
        ELEMENTS.html?.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    };

    const handleCustomCursor = () => {
        if (!FEATURE_FLAGS.enableCustomCursor || !ELEMENTS.customCursor || prefersReducedMotion || typeof gsap === 'undefined') {
            ELEMENTS.customCursor?.remove();
            ELEMENTS.body?.classList.remove('cursor-ready');
            logInfo("Custom cursor disabled (flag, element missing, reduced motion, or GSAP missing).");
            return;
        }
        ELEMENTS.body?.classList.add('cursor-ready');
        gsap.set(ELEMENTS.customCursor, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
        cursorXQuickTo = gsap.quickTo(ELEMENTS.customCursor, "x", { duration: 0.4, ease: "power3.out" });
        cursorYQuickTo = gsap.quickTo(ELEMENTS.customCursor, "y", { duration: 0.4, ease: "power3.out" });
        const moveCursor = (e) => {
            cursorXQuickTo(e.clientX);
            cursorYQuickTo(e.clientY);
        };
        const addClickEffect = () => ELEMENTS.customCursor?.classList.add('click');
        const removeClickEffect = () => ELEMENTS.customCursor?.classList.remove('click');
        const addHoverEffect = () => ELEMENTS.customCursor?.classList.add('hover');
        const removeHoverEffect = () => ELEMENTS.customCursor?.classList.remove('hover');
        window.addEventListener('mousemove', moveCursor, { passive: true });
        document.addEventListener('mousedown', addClickEffect);
        document.addEventListener('mouseup', removeClickEffect);
        const interactiveSelector = 'a[href], button, input, textarea, select, .card-hover, [role="button"], [tabindex]:not([tabindex="-1"]), .gallery-item, .modal-close, .lightbox-close, .carousel-control';
        ELEMENTS.body?.addEventListener('mouseover', (e) => { if (e.target?.closest(interactiveSelector)) addHoverEffect(); }, true);
        ELEMENTS.body?.addEventListener('mouseout', (e) => { if (e.target?.closest(interactiveSelector)) removeHoverEffect(); }, true);
        document.addEventListener('focusin', (e) => { if (e.target?.closest(interactiveSelector)) addHoverEffect(); });
        document.addEventListener('focusout', (e) => { if (e.target?.closest(interactiveSelector)) removeHoverEffect(); });
        document.addEventListener('mouseleave', () => gsap.to(ELEMENTS.customCursor, { opacity: 0, scale: 0.5, duration: 0.2, overwrite: 'auto' }));
        document.addEventListener('mouseenter', () => gsap.to(ELEMENTS.customCursor, { opacity: 1, scale: 1, duration: 0.2, overwrite: 'auto' }));
        logInfo("Custom cursor initialized with GSAP quickTo.");
    };

    const handleMobileNav = () => {
        if (!ELEMENTS.hamburgerButton || !ELEMENTS.mobileNav || !ELEMENTS.body || !ELEMENTS.mobileNavOverlay || !ELEMENTS.mobileNavClose) return;
        const mainContent = ELEMENTS.mainContent; const footerContent = ELEMENTS.footer;
        const overlay = ELEMENTS.mobileNavOverlay; const nav = ELEMENTS.mobileNav;
        const toggleNav = (forceClose = false) => {
            const isActive = ELEMENTS.body.classList.contains('nav-active');
            const openNav = !isActive && !forceClose;
            ELEMENTS.body.classList.toggle('nav-active', openNav);
            ELEMENTS.hamburgerButton.classList.toggle('is-active', openNav);
            ELEMENTS.hamburgerButton.setAttribute('aria-expanded', String(openNav));
            nav.setAttribute('aria-hidden', String(!openNav));
            if (openNav) {
                mainContent?.setAttribute('inert', ''); footerContent?.setAttribute('inert', '');
                overlay.setAttribute('aria-hidden', 'false');
                const firstFocusable = selectElement('a[href], button', nav) || nav;
                setTimeout(() => firstFocusable.focus(), 50);
            } else {
                mainContent?.removeAttribute('inert'); footerContent?.removeAttribute('inert');
                overlay.setAttribute('aria-hidden', 'true');
                if (ELEMENTS.hamburgerButton.offsetParent !== null) ELEMENTS.hamburgerButton.focus();
            }
        };
        ELEMENTS.hamburgerButton.addEventListener('click', () => toggleNav());
        ELEMENTS.mobileNavClose.addEventListener('click', () => toggleNav(true));
        overlay.addEventListener('click', () => { if (ELEMENTS.body.classList.contains('nav-active')) toggleNav(true); });
        selectElements('.main-nav .nav-link', nav).forEach(link => link.addEventListener('click', () => toggleNav(true)));
        document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && ELEMENTS.body.classList.contains('nav-active')) toggleNav(true); });
    };
    
    const handleScrollspy = () => {
        if (!('IntersectionObserver' in window)) {
            logWarn("IntersectionObserver not supported. Using fallback scroll-based scrollspy.");
            window.addEventListener('scroll', throttle(() => {
                const allNavLinks = selectElements('.main-nav .nav-link[data-section-id]');
                if (allNavLinks.length === 0) return;
                let currentSectionId = null;
                const adjustedHeaderHeight = ELEMENTS.header?.offsetHeight || 0;
                const scrollPosition = window.scrollY + adjustedHeaderHeight + 60;
                const sections = selectElements('main section[id]');
                for (let i = sections.length - 1; i >= 0; i--) {
                    if (sections[i].offsetTop <= scrollPosition) {
                        currentSectionId = sections[i].id;
                        break;
                    }
                }
                allNavLinks.forEach(link => {
                    const isActive = link.getAttribute('href') === `#${currentSectionId}`;
                    link.classList.toggle('active', isActive);
                    link.setAttribute('aria-current', isActive ? 'page' : 'false');
                });
            }, CONFIG.SCROLLSPY_THROTTLE_MS), { passive: true });
            return;
        }

        const sections = ELEMENTS.sectionsForScrollspy;
        if (sections.length === 0) return;

        const updateActiveLink = (id) => {
            ELEMENTS.navLinks?.forEach(link => {
                const linkHref = link.getAttribute('href');
                const isActive = linkHref === `#${id}`;
                link.classList.toggle('active', isActive);
                link.setAttribute('aria-current', isActive ? 'page' : 'false');
            });
        };

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateActiveLink(entry.target.id);
                }
            });
        };
        
        const observerOptions = {
            rootMargin: `-${(ELEMENTS.header?.offsetHeight || 80) + 60}px 0px -40% 0px`,
            threshold: 0
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        sections.forEach(section => observer.observe(section));
        logInfo("Scrollspy initialized with IntersectionObserver.");
    };

    const handleEasterEgg = () => {
        if (!FEATURE_FLAGS.enableEasterEgg || !ELEMENTS.easterEggTrigger || prefersReducedMotion) return;

        const runConfetti = () => {
            if (typeof confetti === 'undefined') {
                logWarn('Confetti script not ready.');
                return;
            }
            const duration = 4 * 1000; const animationEnd = Date.now() + duration;
            const colors = ['#00a000', '#4CAF50', '#ffdd00', '#ffffff', '#dddddd'];
            const zIndex = parseInt(getComputedStyle(ELEMENTS.html).getPropertyValue('--z-lightbox-content'), 10) + 10 || 1320;
            const randomInRange = (min, max) => Math.random() * (max - min) + min;
            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now(); if (timeLeft <= 0) return clearInterval(interval);
                const particleCount = Math.max(10, 50 * (timeLeft / duration));
                confetti({ startVelocity: 30, spread: 360, ticks: 60, zIndex: zIndex, particleCount: particleCount, origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 }, colors: colors, disableForReducedMotion: true });
            }, 200);
            logInfo("🎉 Confetti!");
        };

        ELEMENTS.easterEggTrigger.addEventListener('click', () => {
            if (typeof confetti === 'function') {
                runConfetti();
            } else {
                logInfo('Loading confetti script for the first time...');
                loadScript('https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js', { defer: true })
                    .then(() => {
                        logInfo('Confetti script loaded successfully.');
                        runConfetti();
                    })
                    .catch(err => logError('Could not load confetti script', err));
            }
        });
    };

    const validateForm = () => {
        if (!ELEMENTS.form) return true; let isValid = true;
        selectElements('.form-error', ELEMENTS.form).forEach(el => el.textContent = '');
        selectElements('.invalid', ELEMENTS.form).forEach(el => el.classList.remove('invalid'));
        selectElements('[required]', ELEMENTS.form).forEach(input => {
            const group = input.closest('.form-group'); if (!group) return;
            const errorElement = selectElement('.form-error', group); let errorMessage = '';
            if (input.type === 'email' && (!input.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()))) { errorMessage = 'Please enter a valid email address.'; }
            else if (input.type === 'checkbox' && !input.checked) { errorMessage = 'This field must be checked.'; }
            else if (input.value.trim() === '') { errorMessage = 'This field is required.'; }
            if (errorMessage) { isValid = false; input.classList.add('invalid'); if (errorElement) errorElement.textContent = errorMessage; }
        });
        if (!isValid) selectElement('.invalid', ELEMENTS.form)?.focus();
        return isValid;
    };

    const handleFormSubmission = () => {
        if (!FEATURE_FLAGS.enableFormspree || !ELEMENTS.form || !ELEMENTS.form.action || !ELEMENTS.form.action.includes('formspree.io')) {
            if (ELEMENTS.form && (!ELEMENTS.form.action || !ELEMENTS.form.action.includes('formspree.io'))) { logWarn('Form action does not point to Formspree or is missing. Submission disabled.'); }
            return;
        }
        ELEMENTS.form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!validateForm()) { updateFormStatus('Please correct the errors above.', 'error'); return; }
            const formData = new FormData(ELEMENTS.form);
            const submitButton = selectElement('button[type="submit"]', ELEMENTS.form);
            const originalButtonContent = submitButton?.innerHTML;
            updateFormStatus('Sending message...', 'loading');
            if (submitButton) { submitButton.disabled = true; submitButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending...'; }
            try {
                const response = await fetch(ELEMENTS.form.action, { method: 'POST', body: formData, headers: { 'Accept': 'application/json' } });
                if (response.ok) {
                    updateFormStatus('Message sent successfully! We\\'be in touch.', 'success');
                    ELEMENTS.form.reset();
                    selectElements('.invalid', ELEMENTS.form).forEach(el => el.classList.remove('invalid'));
                    setTimeout(() => updateFormStatus('', 'idle'), CONFIG.FORM_STATUS_TIMEOUT_MS);
                } else {
                    const data = await response.json().catch(() => ({}));
                    let errorMsg = data?.errors?.map(e => e.message).join('. ') || response.statusText || 'Submission failed.';
                    throw new Error(errorMsg);
                }
            } catch (error) {
                logError('Form submission error', error);
                updateFormStatus(`Error: ${error.message || 'Could not send message.'}`, 'error');
            }
            finally {
                if (submitButton) { submitButton.disabled = false; submitButton.innerHTML = originalButtonContent; }
            }
        });
    };

    const updateFormStatus = (message, state = 'idle') => {
        if (!ELEMENTS.formStatus) return;
        ELEMENTS.formStatus.textContent = message;
        ELEMENTS.formStatus.className = `form-status ${state}`;
        ELEMENTS.formStatus.style.display = (state === 'idle' || !message) ? 'none' : 'block';
        ELEMENTS.formStatus.setAttribute('role', (state === 'error' || state === 'success') ? 'alert' : 'status');
        ELEMENTS.formStatus.setAttribute('aria-live', (state === 'error' || state === 'success') ? 'assertive' : 'polite');
    };

    const hidePreloader = () => {
        if (!ELEMENTS.preloader) { ELEMENTS.body?.classList.remove('preload'); return; }
        const removePreloader = () => {
            ELEMENTS.preloader?.remove();
            ELEMENTS.body?.classList.remove('preload');
            logInfo("Preloader removed.");
        };
        const fallbackTimeout = setTimeout(() => {
            logWarn("Preloader fallback timeout reached.");
            removePreloader();
        }, CONFIG.PRELOADER_TIMEOUT_MS);
        window.addEventListener('load', () => {
            clearTimeout(fallbackTimeout);
            if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
                gsap.to(ELEMENTS.preloader, { opacity: 0, duration: 0.6, ease: 'power1.inOut', onComplete: removePreloader });
            } else {
                ELEMENTS.preloader.style.transition = 'opacity 0.5s ease-out';
                ELEMENTS.preloader.style.opacity = '0';
                let removed = false;
                const transitionEndHandler = () => { if (!removed) { removed = true; removePreloader(); } };
                ELEMENTS.preloader.addEventListener('transitionend', transitionEndHandler, { once: true });
                setTimeout(() => { if (!removed) { logWarn("Preloader transitionEnd fallback."); transitionEndHandler(); } }, 700);
            }
        }, { once: true });
    };

    // --- Initialization Function ---
    const initialize = () => {
        logInfo(`Initializing SysFX Script v2.2...`);
        hidePreloader();
        initializeDarkMode();
        adjustLayoutPadding();
        displayTime(); setInterval(displayTime, 60000);
        displayTechTrivia();
        handleMobileNav();
        handleScrollTopButton();
        handleModals();
        handleLightbox();
        handleTestimonialCarousel();
        if (FEATURE_FLAGS.enableFormspree) handleFormSubmission();

        requestAnimationFrame(() => {
            initializeParticles();
            setupMapObserver(); // Changed from initializeMap()
            animateStats();
            revealSections();
            if (FEATURE_FLAGS.enableCustomCursor) handleCustomCursor();
            if (FEATURE_FLAGS.enableEasterEgg) handleEasterEgg();
            if (!prefersReducedMotion) typeEffectHandler();
        });

        setTimeout(handleScrollspy, 300);

        logInfo("SysFX Script Initialized.");
    };

    // --- Global Event Listeners ---
    ELEMENTS.darkModeToggle?.addEventListener('click', toggleDarkMode);
    if (FEATURE_FLAGS.enableBackgroundMusic) ELEMENTS.musicToggle?.addEventListener('click', toggleMusic);
    ELEMENTS.scrollTopButton?.addEventListener('click', scrollToTop);
    ELEMENTS.skipLink?.addEventListener('blur', () => { if (ELEMENTS.skipLink) ELEMENTS.skipLink.style.left = '-9999px'; });

    window.addEventListener('resize', adjustLayoutPadding);

    window.addEventListener('scroll', throttle(() => {
        updateScrollProgress();
        handleScrollTopButton();
        handleHeaderShrink();
    }, 100), { passive: true });

    // --- Start Initialization ---
    if (ELEMENTS.body) {
        initialize();
    } else {
        console.error("FATAL: Body element not found. SysFX Script initialization cancelled.");
    }

});