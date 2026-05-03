/**
 * SysFX Website Script
 * Version: 3.2 (Optimized with OnePageNav, Debian Boot & Terminal Mode)
 * Author: sysfx 
 *
 * Purpose: Manages dynamic interactions, animations, and third-party
 * library integrations for the sysfx website.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // --- Configuration & Feature Flags ---
    const CONFIG = {
        RESIZE_DEBOUNCE_MS: 250,
        TYPING_SPEED_MS: 85,
        TYPING_DELETE_SPEED_MS: 40,
        TYPING_PAUSE_MS: 2500,
        CAROUSEL_INTERVAL_MS: 6000,
        FORM_STATUS_TIMEOUT_MS: 6000,
        PRELOADER_TIMEOUT_MS: 2500,
        MUSIC_FADE_DURATION_MS: 600,
        MODAL_CLOSE_SCROLL_DELAY_MS: 350,
        CURSOR_QUICKTO_DURATION: 0.15,
        TAGLINES: [
            "Your Partner in Tech Solutions.",
            "Expert Computer Repair Services.",
            "Robust Cybersecurity Solutions.",
            "Custom Web Architecture.",
            "Enterprise Networking.",
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
        MAP_COORDS: [41.2793, -72.4310], // Clinton, CT
        MAP_ZOOM: 14,
        MAP_MAX_ZOOM: 18,
        MAP_MIN_ZOOM: 8
    };

    const FEATURE_FLAGS = {
        enableParticles: true,
        enableCustomCursor: true,
        enableEasterEgg: true,
        enableBackgroundMusic: true,
        enableFormspree: true
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

    const selectElement = (selector, context = document) => {
        try { return context.querySelector(selector); } catch (e) { logError(`Invalid selector: ${selector}`, e); return null; }
    };
    const selectElements = (selector, context = document) => {
        try { return Array.from(context.querySelectorAll(selector)); } catch (e) { logError(`Invalid selector: ${selector}`, e); return []; }
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
            mainContent: '#main-content'
        };
        const elements = {};
        for (const key in selectors) {
            // Include legacy selectors to prevent errors if you ever add those sections back
            const multiple = ['modals', 'serviceCards', 'modalScrollButtons', 'galleryItems', 'testimonials', 'statsNumbers', 'animatedSections'].includes(key);
            elements[key] = multiple ? selectElements(selectors[key]) : selectElement(selectors[key]);
        }
        if (!elements.body) console.error("FATAL: Body element not found!");
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
        }
    };

    const adjustLayoutPadding = debounce(() => {
        if (!ELEMENTS.header || !ELEMENTS.body || !ELEMENTS.html) return;
        headerHeight = ELEMENTS.header.offsetHeight;
        ELEMENTS.body.style.paddingTop = `${headerHeight}px`;
        ELEMENTS.html.style.scrollPaddingTop = `${headerHeight + 20}px`;
    }, CONFIG.RESIZE_DEBOUNCE_MS);

    let lastScrollTop = 0;
    const handleHeaderShrink = () => {
        if (!ELEMENTS.header) return;
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        if (currentScroll > lastScrollTop && currentScroll > 100) {
            ELEMENTS.header.classList.add('header-shrunk');
        } else if (currentScroll < lastScrollTop || currentScroll <= 100) {
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
            const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone });
            const dateString = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone });

            ELEMENTS.currentTimeDisplay.textContent = '';
            const dateIcon = document.createElement('i'); dateIcon.className = 'far fa-calendar-alt'; dateIcon.setAttribute('aria-hidden', 'true');
            const timeIcon = document.createElement('i'); timeIcon.className = 'far fa-clock'; timeIcon.setAttribute('aria-hidden', 'true');
            ELEMENTS.currentTimeDisplay.append(dateIcon, ` ${dateString}    `, timeIcon, ` ${timeString}`);
        } catch (e) { logError('Failed to display time', e); ELEMENTS.currentTimeDisplay.textContent = 'Could not load time.'; }
    };

    const typeEffectHandler = async () => {
        if (!ELEMENTS.typingEffectElement) return;
        if (prefersReducedMotion) {
            ELEMENTS.typingEffectElement.textContent = CONFIG.TAGLINES[0] || ' ';
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
        if (!FEATURE_FLAGS.enableParticles || prefersReducedMotion || typeof particlesJS === 'undefined') {
            selectElement('#particles-js')?.style.setProperty('display', 'none', 'important');
            return;
        }
        try {
            particlesJS('particles-js', {
                particles: {
                    number: { value: 100, density: { enable: true, value_area: 800 } },
                    color: { value: "#0dcaf0" },
                    shape: { type: "circle" },
                    opacity: { value: 0.35, random: true, anim: { enable: true, speed: 0.8, opacity_min: 0.1, sync: false } },
                    size: { value: 3, random: true },
                    line_linked: { enable: true, distance: 130, color: "#6f42c1", opacity: 0.3, width: 1 },
                    move: { enable: true, speed: 1.5, direction: "none", random: true, straight: false, out_mode: "out", bounce: false }
                },
                interactivity: {
                    detect_on: "canvas", events: { resize: true, onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "bubble" } },
                    modes: { repulse: { distance: 80, duration: 0.4 }, push: { particles_nb: 4 }, grab: { distance: 140, line_opacity: 0.7 }, bubble: { distance: 200, size: 6, duration: 0.3 } }
                }, retina_detect: true
            });
        } catch (error) { selectElement('#particles-js')?.style.setProperty('display', 'none', 'important'); }
    };

    const initializeMap = () => {
        if (typeof L === 'undefined' || !ELEMENTS.mapElement) return;
        try {
            if (mapInstance) mapInstance.remove();
            mapInstance = L.map(ELEMENTS.mapElement, { scrollWheelZoom: false, attributionControl: false }).setView(CONFIG.MAP_COORDS, CONFIG.MAP_ZOOM);
            mapInstance.on('focus', () => mapInstance?.scrollWheelZoom.enable());
            mapInstance.on('blur', () => mapInstance?.scrollWheelZoom.disable());
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: CONFIG.MAP_MAX_ZOOM, minZoom: CONFIG.MAP_MIN_ZOOM }).addTo(mapInstance);
            L.control.attribution({ prefix: false, position: 'bottomright' }).addAttribution('© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors').addTo(mapInstance);
            initializeMapMarker();
        } catch (error) { logError("Error initializing Leaflet map", error); ELEMENTS.mapElement.innerHTML = '<p>Map could not be loaded.</p>'; }
    };

    const setupMapObserver = () => {
        if (!ELEMENTS.mapElement) return;
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    obs.unobserve(entry.target);
                    Promise.all([
                        loadStyle('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'),
                        loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', { integrity: 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=', crossOrigin: 'anonymous' })
                    ]).then(() => initializeMap()).catch(error => logError("Failed to load Leaflet", error));
                }
            });
        }, { rootMargin: '200px', threshold: 0.01 });
        observer.observe(ELEMENTS.mapElement);
    };

    const initializeMapMarker = () => {
        if (!mapInstance || typeof L === 'undefined' || !ELEMENTS.body) return;
        mapInstance.eachLayer((layer) => { if (layer instanceof L.Marker || (layer.options && layer.options.icon instanceof L.DivIcon)) mapInstance.removeLayer(layer); });
        try {
            const computedStyle = getComputedStyle(ELEMENTS.body);
            const markerColor = ELEMENTS.body.classList.contains('dark-mode') ? (computedStyle.getPropertyValue('--tertiary-color').trim() || '#0d6efd') : (computedStyle.getPropertyValue('--primary-color').trim() || '#058743');
            const borderColor = ELEMENTS.body.classList.contains('dark-mode') ? '#212529' : '#f8f9fa';
            
            const styleId = 'map-marker-keyframes';
            let styleElement = document.getElementById(styleId);
            if (!styleElement) { 
                styleElement = document.createElement('style'); 
                styleElement.id = styleId; 
                document.head.appendChild(styleElement); 
            }
            styleElement.textContent = `@keyframes pulseMarker { 0% { box-shadow: 0 0 0 0 ${markerColor}80; } 70% { box-shadow: 0 0 0 15px ${markerColor}00; } 100% { box-shadow: 0 0 0 0 ${markerColor}00; } }`;
            
            const pulsingIcon = L.divIcon({
                className: 'custom-map-marker',
                html: `<div style="background-color: ${markerColor}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid ${borderColor}; animation: pulseMarker 2s infinite; transition: all 0.3s ease;"></div>`,
                iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -15]
            });
            L.marker(CONFIG.MAP_COORDS, { icon: pulsingIcon, title: 'sysfx Location' })
                .addTo(mapInstance)
                .bindPopup("<b>sysfx HQ</b><br>123 Main Street<br>Clinton, CT 06413");
        } catch (error) { logError("Failed to create map marker", error); }
    };

    const handleModals = () => {
        if (ELEMENTS.serviceCards.length === 0 && ELEMENTS.modals.length === 0) return;
        
        ELEMENTS.serviceCards.forEach(card => {
            const modalId = card.getAttribute('data-modal-target'); 
            const modal = selectElement(`#${modalId}`);
            if (!modal) return;
            
            card.addEventListener('click', () => openModal(modal, card));
            card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(modal, card); } });
        });
        
        ELEMENTS.modals.forEach(modal => {
            selectElements('.modal-close, .modal-close-alt', modal).forEach(btn => btn.addEventListener('click', () => closeModal(modal)));
            modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });
            
            selectElements('.modal-action[data-scroll-target]', modal).forEach(btn => {
                btn.addEventListener('click', () => {
                    const targetSelector = btn.getAttribute('data-scroll-target');
                    closeModal(modal, true);
                    setTimeout(() => {
                        const target = selectElement(targetSelector);
                        if (target) {
                            target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                            target.focus({ preventScroll: true });
                        }
                    }, CONFIG.MODAL_CLOSE_SCROLL_DELAY_MS);
                });
            });
        });
        
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && activeModal) closeModal(activeModal); });
    };

    const openModal = (modal, triggerElement = null) => {
        if (!modal || modal === activeModal) return;
        activeModal = modal;
        if (triggerElement) activeModal.triggerElement = triggerElement;
        
        modal.style.display = 'flex';
        modal.offsetHeight; // Force reflow
        requestAnimationFrame(() => {
            modal.classList.add('active');
            ELEMENTS.body?.classList.add('no-scroll');
            ELEMENTS.mainContent?.setAttribute('inert', '');
            ELEMENTS.footer?.setAttribute('inert', '');
            modal.setAttribute('aria-hidden', 'false');
            setTimeout(() => (selectElement('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal) || modal).focus(), 100);
        });
    };

    const closeModal = (modal, skipFocusReturn = false) => {
        if (!modal || modal !== activeModal || !modal.classList.contains('active')) return;
        const triggerElement = activeModal.triggerElement;
        activeModal = null;
        
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        ELEMENTS.mainContent?.removeAttribute('inert');
        ELEMENTS.footer?.removeAttribute('inert');
        
        const finalizeClose = () => {
            modal.style.display = 'none';
            ELEMENTS.body?.classList.remove('no-scroll');
            if (!skipFocusReturn) triggerElement?.focus();
            modal.removeEventListener('transitionend', onTransitionEnd);
        };
        
        const onTransitionEnd = (e) => { if (e.target === modal && ['opacity', 'transform'].includes(e.propertyName)) finalizeClose(); };
        modal.addEventListener('transitionend', onTransitionEnd);
        setTimeout(finalizeClose, 500); // Fallback
    };

    const handleLightbox = () => {
        if (!ELEMENTS.lightbox || ELEMENTS.galleryItems.length === 0) return;
        const openLightbox = (item) => {
            activeLightboxTarget = item;
            ELEMENTS.lightboxImage.src = item.getAttribute('data-src');
            ELEMENTS.lightboxAltText.textContent = item.getAttribute('data-alt') || 'Gallery image';
            ELEMENTS.lightboxImage.alt = ELEMENTS.lightboxAltText.textContent;
            
            ELEMENTS.lightbox.style.display = 'flex';
            ELEMENTS.lightbox.offsetHeight; // reflow
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
            
            const finalizeClose = () => {
                ELEMENTS.lightbox.style.display = 'none';
                ELEMENTS.lightboxImage.src = '';
                ELEMENTS.body?.classList.remove('no-scroll');
                trigger?.focus();
                ELEMENTS.lightbox.removeEventListener('transitionend', onTransitionEnd);
            };
            const onTransitionEnd = (e) => { if (e.target === ELEMENTS.lightbox) finalizeClose(); };
            ELEMENTS.lightbox.addEventListener('transitionend', onTransitionEnd);
            setTimeout(finalizeClose, 500);
        };

        ELEMENTS.galleryItems.forEach(item => {
            item.addEventListener('click', () => openLightbox(item));
            item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(item); } });
        });
        ELEMENTS.lightboxClose.addEventListener('click', closeLightbox);
        ELEMENTS.lightbox.addEventListener('click', (e) => { if (e.target === ELEMENTS.lightbox) closeLightbox(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && ELEMENTS.lightbox.classList.contains('active')) closeLightbox(); });
    };

    const handleTestimonialCarousel = () => {
        if (!ELEMENTS.testimonialSlider || ELEMENTS.testimonials.length === 0) return;
        const total = ELEMENTS.testimonials.length;
        const show = (index) => {
            currentTestimonialIndex = (index + total) % total;
            ELEMENTS.testimonials.forEach((t, i) => t.setAttribute('aria-hidden', String(i !== currentTestimonialIndex)));
            if (ELEMENTS.testimonialLiveRegion) ELEMENTS.testimonialLiveRegion.textContent = `Showing testimonial ${currentTestimonialIndex + 1} of ${total}.`;
        };
        const next = () => show(currentTestimonialIndex + 1);
        const prev = () => show(currentTestimonialIndex - 1);
        const start = () => { clearInterval(testimonialInterval); if (!prefersReducedMotion) testimonialInterval = setInterval(next, CONFIG.CAROUSEL_INTERVAL_MS); };
        
        ELEMENTS.carouselNext?.addEventListener('click', () => { next(); start(); });
        ELEMENTS.carouselPrev?.addEventListener('click', () => { prev(); start(); });
        
        const container = ELEMENTS.testimonialSlider.parentElement;
        container?.addEventListener('mouseenter', () => clearInterval(testimonialInterval));
        container?.addEventListener('mouseleave', start);
        show(0); start();
    };

    const animateStats = () => {
        if (ELEMENTS.statsNumbers.length === 0) return;
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || prefersReducedMotion) { 
            ELEMENTS.statsNumbers.forEach(n => n.textContent = parseInt(n.dataset.target || '0').toLocaleString()); 
            return; 
        }
        gsap.registerPlugin(ScrollTrigger);
        ELEMENTS.statsNumbers.forEach(stat => {
            const target = parseInt(stat.dataset.target || '0');
            let proxy = { val: 0 };
            ScrollTrigger.create({
                trigger: stat, start: "top 90%", once: true,
                onEnter: () => gsap.to(proxy, { val: target, duration: 2.5, ease: "power2.out", onUpdate: () => stat.textContent = Math.round(proxy.val).toLocaleString() })
            });
        });
    };

    const revealSections = () => {
        if (ELEMENTS.animatedSections.length === 0 && !ELEMENTS.footer) return;
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || prefersReducedMotion) { 
            ELEMENTS.animatedSections.forEach(s => { s.style.opacity = '1'; s.style.transform = 'none'; }); 
            ELEMENTS.footer?.classList.add('visible'); 
            return; 
        }
        gsap.registerPlugin(ScrollTrigger);
        ELEMENTS.animatedSections.forEach((section, index) => gsap.fromTo(section, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: section, start: "top 88%", toggleActions: "play none none none" }, delay: index * 0.05 }));
        if (ELEMENTS.footer) ScrollTrigger.create({ trigger: ELEMENTS.footer, start: "top 95%", onEnter: () => ELEMENTS.footer.classList.add('visible') });
    };

    const displayTechTrivia = () => {
        if (ELEMENTS.triviaTextElement && CONFIG.TECH_TRIVIA.length > 0) {
            ELEMENTS.triviaTextElement.textContent = CONFIG.TECH_TRIVIA[Math.floor(Math.random() * CONFIG.TECH_TRIVIA.length)];
        }
    };

    const toggleMusic = () => {
        if (!FEATURE_FLAGS.enableBackgroundMusic || !ELEMENTS.backgroundMusic || !ELEMENTS.musicToggle) return;
        const audio = ELEMENTS.backgroundMusic; 
        const btn = ELEMENTS.musicToggle;
        
        if (musicPlaying) {
            gsap?.to(audio, { volume: 0, duration: CONFIG.MUSIC_FADE_DURATION_MS/1000, onComplete: () => audio.pause() }) || (audio.volume = 0, audio.pause());
            musicPlaying = false; btn.classList.add('muted'); btn.setAttribute('aria-pressed', 'false');
        } else {
            audio.volume = 0;
            audio.play().then(() => {
                gsap?.to(audio, { volume: 1, duration: CONFIG.MUSIC_FADE_DURATION_MS/1000 }) || (audio.volume = 1);
                musicPlaying = true; btn.classList.remove('muted'); btn.setAttribute('aria-pressed', 'true');
            }).catch(e => logWarn("Music playback requires user interaction.", e));
        }
    };

    const handleScrollTopButton = throttle(() => {
        if (!ELEMENTS.scrollTopButton) return;
        const shouldBeVisible = window.scrollY > window.innerHeight * 0.4;
        const isVisible = ELEMENTS.scrollTopButton.style.display === 'flex';
        
        if (shouldBeVisible && !isVisible) {
            ELEMENTS.scrollTopButton.style.display = 'flex';
            gsap?.to(ELEMENTS.scrollTopButton, { opacity: 1, scale: 1, duration: 0.3 }) || (ELEMENTS.scrollTopButton.style.opacity = '1', ELEMENTS.scrollTopButton.style.transform = 'scale(1)');
        } else if (!shouldBeVisible && isVisible) {
            gsap?.to(ELEMENTS.scrollTopButton, { opacity: 0, scale: 0.8, duration: 0.3, onComplete: () => ELEMENTS.scrollTopButton.style.display = 'none' }) || (ELEMENTS.scrollTopButton.style.display = 'none');
        }
    }, 200);

    const handleCustomCursor = () => {
        if (!FEATURE_FLAGS.enableCustomCursor || !ELEMENTS.customCursor || prefersReducedMotion || typeof gsap === 'undefined') {
            ELEMENTS.customCursor?.remove(); ELEMENTS.body?.classList.remove('cursor-ready'); return;
        }
        ELEMENTS.body.classList.add('cursor-ready');
        gsap.set(ELEMENTS.customCursor, { x: window.innerWidth / 2, y: window.innerHeight / 2 });

        cursorXQuickTo = gsap.quickTo(ELEMENTS.customCursor, "x", { duration: CONFIG.CURSOR_QUICKTO_DURATION, ease: "power3.out" });
        cursorYQuickTo = gsap.quickTo(ELEMENTS.customCursor, "y", { duration: CONFIG.CURSOR_QUICKTO_DURATION, ease: "power3.out" });

        window.addEventListener('mousemove', e => { cursorXQuickTo(e.clientX); cursorYQuickTo(e.clientY); }, { passive: true });
        
        const selectors = 'a[href], button, input, textarea, select, .card-hover, [role="button"], [tabindex]:not([tabindex="-1"]), .gallery-item, .modal-close, .lightbox-close, .carousel-control';
        
        ELEMENTS.body.addEventListener('mouseover', e => e.target.closest(selectors) && ELEMENTS.customCursor.classList.add('hover'), true);
        ELEMENTS.body.addEventListener('mouseout', e => e.target.closest(selectors) && ELEMENTS.customCursor.classList.remove('hover'), true);
        
        document.addEventListener('mousedown', () => ELEMENTS.customCursor.classList.add('click'));
        document.addEventListener('mouseup', () => ELEMENTS.customCursor.classList.remove('click'));
        
        document.addEventListener('mouseleave', () => gsap.to(ELEMENTS.customCursor, { opacity: 0, scale: 0.5, duration: 0.2 }));
        document.addEventListener('mouseenter', () => gsap.to(ELEMENTS.customCursor, { opacity: 1, scale: 1, duration: 0.2 }));
    };

    const handleMobileNavToggle = (forceClose = false) => {
        if (!ELEMENTS.hamburgerButton || !ELEMENTS.mobileNav) return;
        const openNav = !ELEMENTS.body.classList.contains('nav-active') && !forceClose;
        ELEMENTS.body.classList.toggle('nav-active', openNav);
        ELEMENTS.hamburgerButton.classList.toggle('is-active', openNav);
        ELEMENTS.hamburgerButton.setAttribute('aria-expanded', String(openNav));
        ELEMENTS.mobileNav.setAttribute('aria-hidden', String(!openNav));
        ELEMENTS.mobileNavOverlay.setAttribute('aria-hidden', String(!openNav));
        
        if (openNav) {
            ELEMENTS.mainContent?.setAttribute('inert', ''); ELEMENTS.footer?.setAttribute('inert', '');
            setTimeout(() => (selectElement('a[href], button', ELEMENTS.mobileNav) || ELEMENTS.mobileNav).focus(), 50);
        } else {
            ELEMENTS.mainContent?.removeAttribute('inert'); ELEMENTS.footer?.removeAttribute('inert');
            ELEMENTS.hamburgerButton.focus();
        }
    };

    const setupMobileNavListeners = () => {
        ELEMENTS.hamburgerButton?.addEventListener('click', () => handleMobileNavToggle());
        ELEMENTS.mobileNavClose?.addEventListener('click', () => handleMobileNavToggle(true));
        ELEMENTS.mobileNavOverlay?.addEventListener('click', () => handleMobileNavToggle(true));
    };

    // --- OnePageNav Initialization ---
    const initializeOnePageNav = () => {
        if (typeof $ === 'undefined' || !$.fn.onePageNav) {
            logWarn("jQuery or OnePageNav plugin is missing. Smooth scrolling disabled.");
            return;
        }

        const navOptions = {
            currentClass: 'current',
            changeHash: false,
            scrollSpeed: 750,
            scrollThreshold: 0.5,
            filter: '',
            easing: 'swing',
            begin: function() {
                // Ensure mobile nav closes smoothly when a link is clicked
                if (ELEMENTS.body.classList.contains('nav-active')) {
                    handleMobileNavToggle(true);
                }
            }
        };

        $('#desktop-navigation .nav-list').onePageNav(navOptions);
        $('#mobile-navigation .nav-list').onePageNav(navOptions);
    };

    const handleEasterEgg = () => {
        if (!FEATURE_FLAGS.enableEasterEgg || !ELEMENTS.easterEggTrigger || prefersReducedMotion) return;
        ELEMENTS.easterEggTrigger.addEventListener('click', () => {
            if (typeof confetti === 'function') {
                confetti({ particleCount: 150, spread: 180, origin: { y: 0.8 }, zIndex: 1400 });
            } else {
                loadScript('https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js').then(() => {
                    confetti({ particleCount: 150, spread: 180, origin: { y: 0.8 }, zIndex: 1400 });
                });
            }
        });
    };

    const handleFormSubmission = () => {
        if (!FEATURE_FLAGS.enableFormspree || !ELEMENTS.form || !ELEMENTS.form.action.includes('formspree.io')) return;
        
        const updateStatus = (msg, state) => {
            ELEMENTS.formStatus.textContent = msg;
            ELEMENTS.formStatus.className = `form-status ${state}`;
            ELEMENTS.formStatus.style.display = state === 'idle' ? 'none' : 'block';
        };
        
        ELEMENTS.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = selectElement('button[type="submit"]', ELEMENTS.form);
            const originalContent = submitBtn?.innerHTML;
            
            // Basic validity check (browser required flags cover most)
            if (!ELEMENTS.form.checkValidity()) {
                updateStatus('Please fill out all required fields.', 'error');
                return;
            }
            
            if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = 'Sending...'; }
            updateStatus('Sending message...', 'loading');
            
            try {
                const res = await fetch(ELEMENTS.form.action, { method: 'POST', body: new FormData(ELEMENTS.form), headers: { 'Accept': 'application/json' } });
                if (res.ok) {
                    updateStatus('Message sent successfully!', 'success');
                    ELEMENTS.form.reset();
                    setTimeout(() => updateStatus('', 'idle'), CONFIG.FORM_STATUS_TIMEOUT_MS);
                } else {
                    throw new Error('Submission failed.');
                }
            } catch (err) {
                updateStatus('Error: Could not send message. Please try again.', 'error');
            } finally {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = originalContent; }
            }
        });
    };

    const hidePreloader = () => {
        if (!ELEMENTS.preloader) { ELEMENTS.body?.classList.remove('preload'); return; }
        const remove = () => { ELEMENTS.preloader.remove(); ELEMENTS.body?.classList.remove('preload'); };
        
        window.addEventListener('load', () => {
            if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
                gsap.to(ELEMENTS.preloader, { opacity: 0, duration: 0.6, onComplete: remove });
            } else {
                ELEMENTS.preloader.style.opacity = '0';
                setTimeout(remove, 500);
            }
        }, { once: true });
        
        setTimeout(remove, CONFIG.PRELOADER_TIMEOUT_MS); // Safety fallback
    };

    // --- Cool Feature 1: Debian Boot Console Log ---
    const runDebianBootSequence = () => {
        const styleOk = "color: #0f0; font-weight: bold;";
        const styleInfo = "color: #0dcaf0; font-weight: bold;";
        const styleBase = "color: #ccc;";
        
        console.log("%c[  OK  ] %cStarted sysfx web services.", styleOk, styleBase);
        setTimeout(() => console.log("%c[  OK  ] %cReached target Network is Online.", styleOk, styleBase), 200);
        setTimeout(() => console.log("%c[ INFO ] %cMounting /dev/sda1...", styleInfo, styleBase), 450);
        setTimeout(() => console.log("%c[  OK  ] %cMounted /var/www/html.", styleOk, styleBase), 600);
        setTimeout(() => console.log("%c[  OK  ] %cStarted Docker Application Container Engine.", styleOk, styleBase), 800);
        setTimeout(() => console.log("%c[  OK  ] %cStarted Debian system initialization.", styleOk, styleBase), 1100);
        setTimeout(() => {
            console.log("%c\nWelcome to sysfx terminal. All systems nominal.", "color: #00d062; font-size: 14px; font-weight: bold;");
            console.log("%c(Hint: Press the '~' key for terminal mode)\n", "color: #6c757d; font-style: italic;");
        }, 1500);
    };

    // --- Cool Feature 2: Terminal Mode Hotkey ---
    const handleEasterEggHotkeys = () => {
        document.addEventListener('keydown', (e) => {
            // Toggle terminal mode when the tilde (~) key is pressed
            if (e.key === '`' || e.key === '~') {
                // Prevent toggling if user is typing in a form field
                if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    ELEMENTS.body.classList.toggle('terminal-mode');
                    
                    if (ELEMENTS.body.classList.contains('terminal-mode')) {
                        console.log("%c> Terminal mode activated. UI stripped.", "color: #0f0;");
                    } else {
                        console.log("%c> Terminal mode deactivated. UI restored.", "color: #0f0;");
                    }
                }
            }
        });
    };

    // --- Initialization ---
    const initialize = () => {
        hidePreloader();
        initializeDarkMode();
        adjustLayoutPadding();
        displayTime(); setInterval(displayTime, 60000);
        displayTechTrivia();
        setupMobileNavListeners();
        initializeOnePageNav(); 
        handleScrollTopButton();
        handleModals();
        handleLightbox();
        handleTestimonialCarousel();
        handleFormSubmission();
        
        // Execute the new Easter Egg functions
        runDebianBootSequence();
        handleEasterEggHotkeys();

        // Dynamically update the copyright year in the footer
        const currentYearSpan = selectElement('#current-year');
        if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();

        requestAnimationFrame(() => {
            initializeParticles();
            setupMapObserver();
            animateStats();
            revealSections();
            handleCustomCursor();
            handleEasterEgg();
            typeEffectHandler();
        });
    };

    // --- Global Listeners ---
    ELEMENTS.darkModeToggle?.addEventListener('click', toggleDarkMode);
    ELEMENTS.musicToggle?.addEventListener('click', toggleMusic);
    ELEMENTS.scrollTopButton?.addEventListener('click', () => ELEMENTS.html.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));
    
    window.addEventListener('resize', adjustLayoutPadding);
    window.addEventListener('scroll', throttle(() => {
        updateScrollProgress();
        handleScrollTopButton();
        handleHeaderShrink();
    }, 100), { passive: true });

    if (ELEMENTS.body) initialize();

});