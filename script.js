/**
 * SysFX Website Script
 * Version: 1.8 (Professional Refinements & Integration Fixes)
 * Author: sysfx (Revised by Gemini)
 *
 * Purpose: Manages dynamic interactions, animations, and third-party
 *          library integrations for the sysfx website.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // --- Configuration & Feature Flags ---
    const CONFIG = {
        SCROLLSPY_THROTTLE_MS: 150,
        RESIZE_DEBOUNCE_MS: 250, // Standard debounce
        TYPING_SPEED_MS: 85, // Slightly faster
        TYPING_DELETE_SPEED_MS: 40, // Slightly faster
        TYPING_PAUSE_MS: 2000,
        CAROUSEL_INTERVAL_MS: 5500,
        FORM_STATUS_TIMEOUT_MS: 6000,
        PRELOADER_FADE_DURATION_MS: 600,
        PRELOADER_MAX_WAIT_MS: 5000, // Max time before forcing removal
        MODAL_SCROLL_DELAY_MS: 150, // Delay before scrolling after modal close action
        AUDIO_FADE_DURATION_MS: 500, // Music fade duration
        TAGLINES: [
            "Your Partner in Tech Solutions.",
            "Expert Computer Repair Services.",
            "Robust Cybersecurity Solutions.",
            "Custom Web Development.",
            "Reliable Networking & IT Support.",
            "Serving Clinton, CT and Beyond."
        ],
        TECH_TRIVIA: [ // Keep local trivia for reliability
            "The first computer mouse, invented by Doug Engelbart in 1964, was made of wood.",
            "An estimated 90% of the world's data has been created in just the last few years.",
            "The QWERTY keyboard layout was designed to slow typists down on early typewriters.",
            "On average, a smartphone user checks their device over 150 times per day.",
            "Registering a domain name was free until 1995.",
            "The first 1GB hard drive (IBM 3380, 1980) weighed over 500 pounds and cost $40,000.",
            "The term 'bug' originated when a moth caused a malfunction in the Harvard Mark II computer in 1947."
        ],
        // Map Settings
        MAP_COORDS: [41.2793, -72.5210], // Adjusted slightly based on Clinton center
        MAP_ZOOM: 14,
        MAP_MAX_ZOOM: 18,
        MAP_MIN_ZOOM: 8
    };

    const FEATURE_FLAGS = {
        enableParticles: true,
        enableCustomCursor: true,
        enableFormspree: true, // Set to false if not using Formspree
        enableBackgroundMusic: true,
        enableEasterEgg: true,
        // Disabled features (can be re-enabled if implemented)
        enableStickyNote: false,
        enableChatBubble: false,
    };

    // --- Utility Functions ---
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    const throttle = (func, limit) => {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    const logError = (message, error = '') => {
        console.error(`[SysFX Script Error] ${message}`, error);
    };
    const logWarn = (message) => { console.warn(`[SysFX Script Warn] ${message}`); };
    const logInfo = (message) => { console.info(`[SysFX Script Info] ${message}`); };

    const selectElement = (selector, context = document) => {
        try {
            const element = context.querySelector(selector);
            // No warning needed for potentially missing optional elements
            return element;
        } catch (e) { logError(`Invalid selector: ${selector}`, e); return null; }
    };
    const selectElements = (selector, context = document) => {
        try {
            return context.querySelectorAll(selector);
        } catch (e) { logError(`Invalid selector: ${selector}`, e); return document.querySelectorAll('.non-existent'); }
    };

    // --- State Variables ---
    let headerHeight = 0;
    let currentTaglineIndex = 0;
    let isTypingPaused = false;
    let currentTestimonialIndex = 0;
    let testimonialInterval = null;
    let musicPlaying = false;
    let audioFadeInterval = null; // For music fade
    let mapInstance = null;
    let particlesJSInstance = null; // Store pJS instance
    let activeModal = null;
    let activeLightboxTrigger = null; // Use consistent naming
    let isDarkMode = false; // Track theme state
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Element Selectors Cache ---
    const ELEMENTS = (() => {
        const selectors = {
            html: 'html', body: 'body', preloader: '#preloader', header: '#main-header',
            darkModeToggle: '#darkModeToggle', hamburgerButton: '#hamburger-button',
            mobileNav: '#main-navigation', navLinks: '.nav-link[data-section-id]',
            scrollProgress: '.scroll-progress', currentTimeDisplay: '#current-time',
            typingEffectElement: '#typing-effect', mapElement: '#map',
            serviceCards: '.service[data-modal-target]', modalContainer: '.modal-container',
            modals: '.modal', galleryItems: '.gallery-item[data-src]',
            lightbox: '#lightbox', lightboxImage: '.lightbox-image', lightboxCaption: '#lightbox-caption',
            lightboxClose: '.lightbox-close', testimonialSlider: '.testimonial-slider',
            testimonials: '.testimonial', carouselPrev: '.carousel-prev', carouselNext: '.carousel-next',
            testimonialLiveRegion: '#testimonial-live-region',
            statsNumbers: '.stat-number[data-target]', animatedSections: '.section-animation',
            footer: '.main-footer', triviaTextElement: '#trivia-text',
            musicToggle: '#music-toggle', backgroundMusic: '#background-music',
            scrollTopButton: '#scroll-top-button', easterEggTrigger: '.easter-egg-trigger',
            customCursor: '.cursor', form: '.contact-form', formStatus: '#form-status',
            skipLink: '.skip-link', mainContent: '#main-content'
        };
        const elements = {};
        for (const key in selectors) {
            elements[key] = key.endsWith('s') || key === 'navLinks' ? selectElements(selectors[key]) : selectElement(selectors[key]);
        }
        if (!elements.body) console.error("FATAL: Body element not found!");
        return elements;
    })();

    // --- Core Functions ---

    const initializeDarkMode = () => {
        if (!ELEMENTS.body || !ELEMENTS.darkModeToggle) return;
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');
        isDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark); // Update global state

        ELEMENTS.body.classList.toggle('dark-mode', isDarkMode);
        updateDarkModeButton(); // Pass no argument, uses global isDarkMode

        setTimeout(() => ELEMENTS.body.classList.add('theme-transitions-active'), 150);
    };

    const updateDarkModeButton = () => {
        if (!ELEMENTS.darkModeToggle) return;
        const icon = selectElement('i', ELEMENTS.darkModeToggle);
        const text = selectElement('.mode-button-text', ELEMENTS.darkModeToggle); // Text exists, hidden by CSS

        ELEMENTS.darkModeToggle.setAttribute('aria-pressed', String(isDarkMode));
        if (icon) {
            icon.classList.toggle('fa-moon', !isDarkMode);
            icon.classList.toggle('fa-sun', isDarkMode);
        }
        if (text) text.textContent = isDarkMode ? ' Light Mode' : ' Dark Mode';
        ELEMENTS.darkModeToggle.setAttribute('aria-label', isDarkMode ? 'Switch to light mode' : 'Switch to dark mode');
    };

    const toggleDarkMode = () => {
        if (!ELEMENTS.body) return;
        isDarkMode = !isDarkMode; // Toggle global state
        ELEMENTS.body.classList.toggle('dark-mode', isDarkMode);
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        updateDarkModeButton();
        if (mapInstance) initializeMapMarker(); // Update map marker color
        if (FEATURE_FLAGS.enableParticles) ReInitializeParticles(); // Re-init particles with new config
    };

    const adjustLayoutPadding = debounce(() => {
        if (!ELEMENTS.header || !ELEMENTS.body || !ELEMENTS.html) return;
        headerHeight = ELEMENTS.header.offsetHeight;
        ELEMENTS.body.style.paddingTop = `${headerHeight}px`;
        ELEMENTS.html.style.scrollPaddingTop = `${headerHeight + 20}px`;
    }, 100);

    let lastScrollTop = 0;
    const handleHeaderShrink = throttle(() => { // Throttle this expensive check
        if (!ELEMENTS.header) return;
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        const shrinkThreshold = 80;

        if (currentScroll > lastScrollTop && currentScroll > shrinkThreshold) {
            ELEMENTS.header.classList.add('header-shrunk');
        } else if (currentScroll < lastScrollTop || currentScroll <= shrinkThreshold) {
            ELEMENTS.header.classList.remove('header-shrunk');
        }
        lastScrollTop = Math.max(0, currentScroll);
        // Adjust layout padding *after* shrink/expand animation might start
        // Use a slightly delayed debounce if needed, or rely on the existing resize debounce
        // adjustLayoutPadding(); // Call debounced version
    }, 100); // Throttle check frequency


    const updateScrollProgress = throttle(() => {
        if (!ELEMENTS.scrollProgress) return;
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
        const progress = Math.min(scrolled, 100);
        ELEMENTS.scrollProgress.style.width = `${progress}%`;
        ELEMENTS.scrollProgress.setAttribute('aria-valuenow', String(Math.round(progress)));
    }, 50);

    const displayTime = () => {
        if (!ELEMENTS.currentTimeDisplay) return;
        try {
            const now = new Date();
            const optionsTime = { hour: 'numeric', minute: '2-digit', hour12: true };
            const optionsDate = { weekday: 'short', month: 'short', day: 'numeric' };
            const timeString = now.toLocaleTimeString(navigator.language || 'en-US', optionsTime);
            const dateString = now.toLocaleDateString(navigator.language || 'en-US', optionsDate);
            ELEMENTS.currentTimeDisplay.innerHTML = `<i class="far fa-calendar-alt" aria-hidden="true"></i> ${dateString}    <i class="far fa-clock" aria-hidden="true"></i> ${timeString}`;
        } catch (e) { logError('Failed to display time', e); ELEMENTS.currentTimeDisplay.textContent = 'Time unavailable'; }
    };

    const typeEffectHandler = async () => {
        if (!ELEMENTS.typingEffectElement || prefersReducedMotion || CONFIG.TAGLINES.length === 0) {
            if (ELEMENTS.typingEffectElement && CONFIG.TAGLINES.length > 0) {
                ELEMENTS.typingEffectElement.textContent = CONFIG.TAGLINES[0]; // Set first tagline statically
            }
            return;
        }

        const type = async (text) => {
            for (let i = 0; i <= text.length; i++) {
                if (isTypingPaused) return false; // Indicate pause requested
                ELEMENTS.typingEffectElement.textContent = text.substring(0, i);
                await new Promise(res => setTimeout(res, CONFIG.TYPING_SPEED_MS));
            }
            return true; // Indicate completion
        };
        const del = async (text) => {
            for (let i = text.length; i >= 0; i--) {
                if (isTypingPaused) return false;
                ELEMENTS.typingEffectElement.textContent = text.substring(0, i);
                await new Promise(res => setTimeout(res, CONFIG.TYPING_DELETE_SPEED_MS));
            }
            return true;
        };

        while (true) {
            if (isTypingPaused) { await new Promise(res => setTimeout(res, 500)); continue; }

            const currentText = CONFIG.TAGLINES[currentTaglineIndex];
            if (!await type(currentText)) continue; // Restart if paused during typing
            await new Promise(res => setTimeout(res, CONFIG.TYPING_PAUSE_MS));
            if (isTypingPaused) continue;
            if (!await del(currentText)) continue; // Restart if paused during deleting
            await new Promise(res => setTimeout(res, CONFIG.TYPING_DELETE_SPEED_MS * 2)); // Brief pause before next
            currentTaglineIndex = (currentTaglineIndex + 1) % CONFIG.TAGLINES.length;
        }
    };

    const getParticlesConfig = () => {
        // Get CSS variable values safely
        const computedStyle = getComputedStyle(ELEMENTS.body);
        const primaryColor = computedStyle.getPropertyValue('--sysfx-green-primary').trim() || '#00a000';
        const secondaryColor = computedStyle.getPropertyValue('--sysfx-green-secondary').trim() || '#4CAF50';
        const lightLineColor = computedStyle.getPropertyValue('--border-color-light').trim() || '#cccccc';
        const darkLineColor = computedStyle.getPropertyValue('--border-color-dark').trim() || '#444444';

        const commonConfig = {
            interactivity: {
                detect_on: "window", // More reliable than canvas sometimes
                events: { resize: true },
                modes: { // Define all modes used
                    repulse: { distance: 80, duration: 0.4 },
                    push: { particles_nb: 4 },
                    grab: { distance: 120, line_linked: { opacity: 0.7 } }, // Use line_linked here
                    bubble: { distance: 150, size: 6, duration: 0.3 }
               }
            },
            retina_detect: true
        };

        const lightConfig = {
            ...commonConfig,
            particles: {
                number: { value: 70, density: { enable: true, value_area: 800 } },
                color: { value: primaryColor },
                shape: { type: "circle" },
                opacity: { value: 0.4, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
                size: { value: 2.5, random: true },
                line_linked: { enable: true, distance: 140, color: lightLineColor, opacity: 0.4, width: 1 },
                move: { enable: true, speed: 2, direction: "none", random: false, straight: false, out_mode: "out", bounce: false }
            },
            interactivity: { ...commonConfig.interactivity, events: { ...commonConfig.interactivity.events, onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" } } }
        };

        const darkConfig = {
            ...commonConfig,
            particles: {
                number: { value: 90, density: { enable: true, value_area: 800 } },
                color: { value: secondaryColor },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: true, anim: { enable: true, speed: 0.8, opacity_min: 0.15, sync: false } },
                size: { value: 3, random: true },
                line_linked: { enable: true, distance: 120, color: darkLineColor, opacity: 0.5, width: 1 },
                move: { enable: true, speed: 1.5, direction: "none", random: true, straight: false, out_mode: "out", bounce: false }
            },
            interactivity: { ...commonConfig.interactivity, events: { ...commonConfig.interactivity.events, onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "bubble" } } }
        };

        return isDarkMode ? darkConfig : lightConfig;
    };

    const initializeParticles = () => {
        if (!FEATURE_FLAGS.enableParticles || prefersReducedMotion || typeof particlesJS === 'undefined') {
            logInfo('ParticlesJS skipped (disabled, reduced motion, or library missing).');
            const particlesContainer = selectElement('#particles-js');
            if (particlesContainer) particlesContainer.style.display = 'none';
            return;
        }

        const particlesElementId = 'particles-js';
        const particlesContainer = selectElement(`#${particlesElementId}`);
        if (!particlesContainer) {
            logWarn(`Particles container #${particlesElementId} not found.`);
            return;
        }
        particlesContainer.style.display = 'block'; // Ensure visible

        try {
            const currentConfig = getParticlesConfig();
            // Store the instance for potential destruction
            particlesJS(particlesElementId, currentConfig, () => {
                logInfo('Particles.js initialized successfully.');
                if (window.pJSDom && window.pJSDom.length > 0 && window.pJSDom[0].pJS) {
                    particlesJSInstance = window.pJSDom[0].pJS; // Capture instance
                }
            });
        } catch (error) {
            logError("Error initializing particles.js", error);
            if (particlesContainer) particlesContainer.style.display = 'none';
        }
    };

    // Function to destroy and re-initialize particles (e.g., on theme change)
    const ReInitializeParticles = () => {
        if (particlesJSInstance && particlesJSInstance.pJS && particlesJSInstance.pJS.fn && particlesJSInstance.pJS.fn.vendors && particlesJSInstance.pJS.fn.vendors.destory) {
             particlesJSInstance.pJS.fn.vendors.destory(); // Correct typo in library if needed: destroy
             particlesJSInstance = null; // Clear instance
             logInfo("Destroyed previous ParticlesJS instance.");
             // Use requestAnimationFrame to ensure DOM cleanup before re-init
             requestAnimationFrame(initializeParticles);
        } else if (window.pJSDom && window.pJSDom.length > 0) {
            // Fallback if instance wasn't captured correctly but pJSDom exists
             try {
                window.pJSDom[0].pJS.fn.vendors.destory();
                window.pJSDom.splice(0, 1); // Remove from global array
                logInfo("Destroyed previous ParticlesJS instance via pJSDom.");
             } catch(e) {
                logWarn("Could not destroy ParticlesJS instance via pJSDom.", e);
             }
             requestAnimationFrame(initializeParticles);
        }
        else {
            // If no instance found, just try initializing
            initializeParticles();
        }
    };


    const initializeMap = () => {
        if (typeof L === 'undefined') { logWarn('Leaflet library (L) not found.'); if (ELEMENTS.mapElement) ELEMENTS.mapElement.innerHTML = '<p>Map library failed to load.</p>'; return; }
        if (!ELEMENTS.mapElement) { logWarn('Map element (#map) not found.'); return; }

        try {
            if (mapInstance && mapInstance.remove) mapInstance.remove();

            mapInstance = L.map(ELEMENTS.mapElement, { scrollWheelZoom: false, attributionControl: false })
                .setView(CONFIG.MAP_COORDS, CONFIG.MAP_ZOOM);

            mapInstance.on('focus', () => mapInstance.scrollWheelZoom.enable());
            mapInstance.on('blur', () => mapInstance.scrollWheelZoom.disable());

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: CONFIG.MAP_MAX_ZOOM, minZoom: CONFIG.MAP_MIN_ZOOM
            }).addTo(mapInstance);

            L.control.attribution({ prefix: false, position: 'bottomright' })
                .addAttribution('© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OSM</a>')
                .addTo(mapInstance);

            initializeMapMarker();
            logInfo('Leaflet map initialized.');

        } catch (error) { logError("Error initializing Leaflet map", error); ELEMENTS.mapElement.innerHTML = '<p>Map could not be loaded.</p>'; mapInstance = null; }
    };

    const initializeMapMarker = () => {
        if (!mapInstance || typeof L === 'undefined') return;

        // Clear previous markers more robustly
        mapInstance.eachLayer((layer) => {
            if (layer instanceof L.Marker || (layer.options && layer.options.icon instanceof L.DivIcon)) { // Check for marker or divIcon marker
                try { mapInstance.removeLayer(layer); } catch (e) { logWarn("Could not remove previous map marker layer.", e); }
            }
        });

        try {
            const computedStyle = getComputedStyle(ELEMENTS.body);
            const primaryColor = computedStyle.getPropertyValue('--sysfx-green-primary').trim() || '#00a000';
            const secondaryColor = computedStyle.getPropertyValue('--sysfx-green-secondary').trim() || '#4CAF50';
            const lightBg = computedStyle.getPropertyValue('--bg-surface-light').trim() || '#ffffff';
            const darkBg = computedStyle.getPropertyValue('--bg-surface-dark').trim() || '#1e1e1e';

            const markerColor = isDarkMode ? secondaryColor : primaryColor;
            const pulseColor = isDarkMode ? 'rgba(76, 175, 80, 0.5)' : 'rgba(0, 160, 0, 0.5)';
            const pulseEndColor = isDarkMode ? 'rgba(76, 175, 80, 0)' : 'rgba(0, 160, 0, 0)';
            const borderColor = isDarkMode ? darkBg : lightBg; // Use surface bg for border contrast

            // Keyframes for pulsing animation
            const keyframes = `@keyframes pulseMarker { 0% { box-shadow: 0 0 0 0 ${pulseColor}; } 70% { box-shadow: 0 0 0 15px ${pulseEndColor}; } 100% { box-shadow: 0 0 0 0 ${pulseEndColor}; } }`;
            const styleExists = document.getElementById('pulseMarkerKeyframes');
            if (!styleExists) {
                 const styleSheet = document.createElement("style");
                 styleSheet.id = 'pulseMarkerKeyframes';
                 styleSheet.innerText = keyframes;
                 document.head.appendChild(styleSheet);
            }

            const pulsingIcon = L.divIcon({
                className: 'custom-map-marker',
                html: `<div style="
                           background-color: ${markerColor};
                           width: 18px; height: 18px; border-radius: 50%;
                           border: 3px solid ${borderColor};
                           box-shadow: 0 0 0 ${pulseColor};
                           animation: pulseMarker 2s infinite cubic-bezier(0.455, 0.03, 0.515, 0.955);
                           transition: background-color 0.3s ease, border-color 0.3s ease;
                       "></div>`,
                iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -15]
            });

            L.marker(CONFIG.MAP_COORDS, { icon: pulsingIcon, title: 'sysfx Location', alt: 'Map marker for sysfx Location' }) // Added alt text
                .addTo(mapInstance)
                .bindPopup("<b>sysfx HQ</b><br>123 Main Street<br>Clinton, CT 06413");

        } catch (error) { logError("Failed to create/update map marker", error); }
    };

    const handleModals = () => {
        if (ELEMENTS.serviceCards.length === 0 && ELEMENTS.modals.length === 0) return;

        const openModal = (modal, triggerElement = null) => {
            if (!modal || modal === activeModal) return;
            activeModal = modal;
            if (triggerElement) activeModal.triggerElement = triggerElement;

            modal.style.display = 'flex';
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const reflow = modal.offsetHeight; // Force reflow for transition

            requestAnimationFrame(() => {
                modal.classList.add('active');
                ELEMENTS.body?.classList.add('no-scroll');
                modal.setAttribute('aria-hidden', 'false');
                ELEMENTS.mainContent?.setAttribute('inert', ''); // Make background content inert
                ELEMENTS.footer?.setAttribute('inert', '');

                const focusable = selectElements('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal);
                const firstFocusable = focusable[0] || modal; // Fallback to modal itself
                setTimeout(() => firstFocusable.focus(), 100); // Delay focus
            });
        };

        const closeModal = (modal) => {
            if (!modal || modal !== activeModal || !modal.classList.contains('active')) return;
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');

            const trigger = activeModal.triggerElement;
            activeModal.triggerElement = null;
            activeModal = null;

            const onTransitionEnd = (event) => {
                if (event.target !== modal || !['opacity', 'transform'].includes(event.propertyName)) return;
                modal.style.display = 'none';
                if (!activeModal) { // Only remove if no *other* modal became active
                    ELEMENTS.body?.classList.remove('no-scroll');
                    ELEMENTS.mainContent?.removeAttribute('inert');
                    ELEMENTS.footer?.removeAttribute('inert');
                }
                trigger?.focus(); // Return focus
                modal.removeEventListener('transitionend', onTransitionEnd);
            };
            modal.addEventListener('transitionend', onTransitionEnd);

            // Fallback timeout
            setTimeout(() => {
                if (!activeModal && modal.style.display !== 'none') {
                    logWarn(`TransitionEnd fallback for modal: ${modal.id}`);
                    modal.removeEventListener('transitionend', onTransitionEnd);
                    modal.style.display = 'none';
                    ELEMENTS.body?.classList.remove('no-scroll');
                    ELEMENTS.mainContent?.removeAttribute('inert');
                    ELEMENTS.footer?.removeAttribute('inert');
                    trigger?.focus();
                }
            }, 500); // Match CSS + buffer
        };

        ELEMENTS.serviceCards?.forEach(card => {
            const modalId = card.dataset.modalTarget;
            if (!modalId) return;
            const modal = selectElement(`#${modalId}`);
            if (!modal) return;
            const openTrigger = () => openModal(modal, card);
            card.addEventListener('click', openTrigger);
            card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openTrigger(); } });
        });

        ELEMENTS.modals?.forEach(modal => {
            selectElements('.modal-close, .modal-close-alt', modal).forEach(btn => btn.addEventListener('click', () => closeModal(modal)));
            modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });

            // Handle modal actions (scrolling after close)
            selectElements('.modal-action[data-link]', modal).forEach(button => {
                button.addEventListener('click', () => {
                    const targetSelector = button.dataset.link;
                    const targetElement = selectElement(targetSelector);
                    closeModal(modal); // Close first

                    // Scroll to target *after* modal close transition + delay
                    setTimeout(() => {
                        if (targetElement) {
                            targetElement.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                            // Optionally focus target
                            // targetElement.focus({ preventScroll: true });
                        } else { logWarn(`Modal action target not found: ${targetSelector}`); }
                    }, CONFIG.MODAL_SCROLL_DELAY_MS + 400); // Delay = scroll delay + modal transition estimate
                });
            });
        });

        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && activeModal) closeModal(activeModal); });
    };

    const handleLightbox = () => {
        if (!ELEMENTS.lightbox || !ELEMENTS.lightboxImage || !ELEMENTS.lightboxClose || !ELEMENTS.lightboxCaption) return;

        const openLightbox = (triggerElement) => {
            activeLightboxTrigger = triggerElement;
            const highResSrc = triggerElement.dataset.src;
            const altText = triggerElement.dataset.alt || selectElement('img', triggerElement)?.alt || 'Gallery image';

            if (!highResSrc) { logWarn("Gallery item missing data-src.", triggerElement); return; }

            ELEMENTS.lightboxImage.setAttribute('src', highResSrc);
            ELEMENTS.lightboxImage.setAttribute('alt', altText);
            ELEMENTS.lightboxCaption.textContent = altText; // Set screen reader caption
            ELEMENTS.lightbox.style.display = 'flex';
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const reflow = ELEMENTS.lightbox.offsetHeight;

            requestAnimationFrame(() => {
                ELEMENTS.lightbox.classList.add('active');
                ELEMENTS.body?.classList.add('no-scroll');
                ELEMENTS.lightbox.setAttribute('aria-hidden', 'false');
                ELEMENTS.mainContent?.setAttribute('inert', '');
                ELEMENTS.footer?.setAttribute('inert', '');
                setTimeout(() => ELEMENTS.lightboxClose.focus(), 100);
            });
        };

        const closeLightbox = () => {
            if (!ELEMENTS.lightbox.classList.contains('active')) return;
            ELEMENTS.lightbox.classList.remove('active');
            ELEMENTS.lightbox.setAttribute('aria-hidden', 'true');
            const trigger = activeLightboxTrigger;
            activeLightboxTrigger = null;

            const onTransitionEnd = (e) => {
                if (e.target !== ELEMENTS.lightbox || e.propertyName !== 'opacity') return;
                ELEMENTS.lightbox.style.display = 'none';
                ELEMENTS.lightboxImage.src = ''; ELEMENTS.lightboxImage.alt = ''; ELEMENTS.lightboxCaption.textContent = '';
                if (!activeModal) { // Don't remove if a modal is still open
                    ELEMENTS.body?.classList.remove('no-scroll');
                    ELEMENTS.mainContent?.removeAttribute('inert');
                    ELEMENTS.footer?.removeAttribute('inert');
                }
                trigger?.focus();
                ELEMENTS.lightbox.removeEventListener('transitionend', onTransitionEnd);
            };
            ELEMENTS.lightbox.addEventListener('transitionend', onTransitionEnd);

            // Fallback
            setTimeout(() => {
                if (ELEMENTS.lightbox.style.display !== 'none' && !activeLightboxTrigger) {
                    logWarn(`TransitionEnd fallback for lightbox.`);
                    ELEMENTS.lightbox.removeEventListener('transitionend', onTransitionEnd);
                    ELEMENTS.lightbox.style.display = 'none';
                    ELEMENTS.lightboxImage.src = ''; ELEMENTS.lightboxImage.alt = ''; ELEMENTS.lightboxCaption.textContent = '';
                     if (!activeModal) { ELEMENTS.body?.classList.remove('no-scroll'); ELEMENTS.mainContent?.removeAttribute('inert'); ELEMENTS.footer?.removeAttribute('inert'); }
                    trigger?.focus();
                }
            }, 500);
        };

        ELEMENTS.galleryItems?.forEach(item => {
            // Changed to button in HTML, listener remains
            item.addEventListener('click', () => openLightbox(item));
            item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(item); } });
        });

        ELEMENTS.lightboxClose.addEventListener('click', closeLightbox);
        ELEMENTS.lightbox.addEventListener('click', (e) => { if (e.target === ELEMENTS.lightbox) closeLightbox(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && ELEMENTS.lightbox.classList.contains('active')) closeLightbox(); });
    };


    const handleTestimonialCarousel = () => {
        if (!ELEMENTS.testimonialSlider || ELEMENTS.testimonials.length === 0) {
            if (ELEMENTS.carouselPrev) ELEMENTS.carouselPrev.style.display = 'none';
            if (ELEMENTS.carouselNext) ELEMENTS.carouselNext.style.display = 'none';
            return;
        }
        const totalTestimonials = ELEMENTS.testimonials.length;
        const container = ELEMENTS.testimonialSlider.parentElement;

        const showTestimonial = (index) => {
            if (index < 0 || index >= totalTestimonials) index = 0;
            ELEMENTS.testimonials.forEach((t, i) => t.setAttribute('aria-hidden', String(i !== index)));
            currentTestimonialIndex = index;
            if (ELEMENTS.testimonialLiveRegion) ELEMENTS.testimonialLiveRegion.textContent = `Showing testimonial ${index + 1} of ${totalTestimonials}.`;
        };
        const nextTestimonial = () => showTestimonial((currentTestimonialIndex + 1) % totalTestimonials);
        const prevTestimonial = () => showTestimonial((currentTestimonialIndex - 1 + totalTestimonials) % totalTestimonials);

        const stopInterval = () => clearInterval(testimonialInterval);
        const startInterval = () => { stopInterval(); if (!prefersReducedMotion) testimonialInterval = setInterval(nextTestimonial, CONFIG.CAROUSEL_INTERVAL_MS); };
        const resetInterval = () => { stopInterval(); startInterval(); };

        ELEMENTS.carouselNext?.addEventListener('click', () => { nextTestimonial(); resetInterval(); });
        ELEMENTS.carouselPrev?.addEventListener('click', () => { prevTestimonial(); resetInterval(); });
        [ELEMENTS.carouselPrev, ELEMENTS.carouselNext].forEach((btn, i) => btn?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (i === 0 ? prevTestimonial : nextTestimonial)(); resetInterval(); } }));

        if (container) { ['mouseenter', 'focusin'].forEach(e => container.addEventListener(e, stopInterval)); ['mouseleave', 'focusout'].forEach(e => container.addEventListener(e, startInterval)); }
        showTestimonial(0);
        startInterval();
    };

    const animateStats = () => {
        const runFallback = () => ELEMENTS.statsNumbers?.forEach(n => n.textContent = parseInt(n.dataset.target || '0').toLocaleString());
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || prefersReducedMotion || ELEMENTS.statsNumbers.length === 0) { if (ELEMENTS.statsNumbers.length > 0) runFallback(); return; }

        gsap.registerPlugin(ScrollTrigger);
        ELEMENTS.statsNumbers.forEach(statNum => {
            const target = parseInt(statNum.dataset.target, 10) || 0;
            let proxy = { val: 0 };
            ScrollTrigger.create({
                trigger: statNum, start: "top 90%", once: true,
                onEnter: () => gsap.to(proxy, {
                    val: target, duration: 2, ease: "power2.out",
                    onUpdate: () => statNum.textContent = Math.round(proxy.val).toLocaleString(),
                    onComplete: () => statNum.textContent = target.toLocaleString() // Ensure final value
                })
            });
        });
    };

    const revealSections = () => {
        const runFallback = () => {
            ELEMENTS.animatedSections?.forEach(s => { s.style.opacity = '1'; s.style.transform = 'translateY(0)'; });
            ELEMENTS.footer?.classList.add('visible');
        };
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || prefersReducedMotion || (ELEMENTS.animatedSections.length === 0 && !ELEMENTS.footer)) { runFallback(); return; }

        gsap.registerPlugin(ScrollTrigger);
        ELEMENTS.animatedSections?.forEach((section, index) => {
            gsap.set(section, { opacity: 0, y: 50 }); // Consistent initial state
            gsap.to(section, {
                opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: index * 0.05,
                scrollTrigger: { trigger: section, start: "top 88%", toggleActions: "play none none none" }
            });
        });
        if (ELEMENTS.footer) {
            ScrollTrigger.create({
                trigger: ELEMENTS.footer, start: "top 95%",
                onEnter: () => ELEMENTS.footer.classList.add('visible'),
                onLeaveBack: () => ELEMENTS.footer.classList.remove('visible')
            });
        }
    };

    const displayTechTrivia = () => {
        if (!ELEMENTS.triviaTextElement || CONFIG.TECH_TRIVIA.length === 0) return;
        const randomIndex = Math.floor(Math.random() * CONFIG.TECH_TRIVIA.length);
        ELEMENTS.triviaTextElement.textContent = CONFIG.TECH_TRIVIA[randomIndex];
    };

    const fadeAudio = (audioElement, targetVolume, duration) => {
        clearInterval(audioFadeInterval); // Clear any existing fade
        const startVolume = audioElement.volume;
        const volumeChange = targetVolume - startVolume;
        if (Math.abs(volumeChange) < 0.01) { // Already at target
             audioElement.volume = targetVolume;
             if (targetVolume === 0) audioElement.pause();
             return;
        }
        const stepTime = 30; // Milliseconds per step
        const steps = duration / stepTime;
        const volumeStep = volumeChange / steps;
        let currentStep = 0;

        audioFadeInterval = setInterval(() => {
            currentStep++;
            const newVolume = startVolume + (volumeStep * currentStep);

            if ((volumeChange > 0 && newVolume >= targetVolume) || (volumeChange < 0 && newVolume <= targetVolume) || currentStep >= steps) {
                 clearInterval(audioFadeInterval);
                 audioElement.volume = targetVolume; // Ensure final value
                 if (targetVolume === 0) audioElement.pause(); // Pause only after fade out completes
                 logInfo(`Audio fade complete. Target: ${targetVolume}`);
            } else {
                audioElement.volume = newVolume;
            }
        }, stepTime);
    };

    const toggleMusic = async () => { // Mark as async
        if (!FEATURE_FLAGS.enableBackgroundMusic || !ELEMENTS.backgroundMusic || !ELEMENTS.musicToggle) return;

        try {
            if (musicPlaying) {
                // Fade out
                fadeAudio(ELEMENTS.backgroundMusic, 0, CONFIG.AUDIO_FADE_DURATION_MS);
                musicPlaying = false;
            } else {
                // Ensure volume is 0 before starting play if previously faded out
                ELEMENTS.backgroundMusic.volume = 0;
                // Play returns a promise
                try {
                    await ELEMENTS.backgroundMusic.play();
                    // If play() succeeds, start fade in
                    fadeAudio(ELEMENTS.backgroundMusic, 1, CONFIG.AUDIO_FADE_DURATION_MS); // Fade to full volume (1)
                    musicPlaying = true;
                 } catch (error) {
                    logWarn("Background music autoplay failed.", error);
                    // User interaction needed, keep UI muted
                    musicPlaying = false; // Ensure state reflects failure
                 }
            }
            // Update button state regardless of play success (user *intended* to toggle)
            ELEMENTS.musicToggle.classList.toggle('muted', !musicPlaying);
            ELEMENTS.musicToggle.setAttribute('aria-pressed', String(musicPlaying));
            ELEMENTS.musicToggle.setAttribute('aria-label', musicPlaying ? 'Pause background music' : 'Play background music');
        } catch (e) {
            logError("Error toggling music", e);
            musicPlaying = false; // Reset state on error
            ELEMENTS.musicToggle.classList.add('muted');
            ELEMENTS.musicToggle.setAttribute('aria-pressed', 'false');
            ELEMENTS.musicToggle.setAttribute('aria-label', 'Play background music');
        }
    };


    const handleScrollTopButton = throttle(() => {
        if (!ELEMENTS.scrollTopButton) return;
        const scrollThreshold = window.innerHeight * 0.3; // Show button a bit earlier
        const shouldBeVisible = window.scrollY > scrollThreshold;
        const isVisible = parseFloat(ELEMENTS.scrollTopButton.style.opacity || '0') > 0;

        if (shouldBeVisible && !isVisible) {
            ELEMENTS.scrollTopButton.style.display = 'flex'; // Ensure display is correct before animating
            gsap?.to(ELEMENTS.scrollTopButton, { opacity: 1, scale: 1, duration: 0.3, ease: 'power1.out' }) || (ELEMENTS.scrollTopButton.style.opacity = '1');
        } else if (!shouldBeVisible && isVisible) {
            gsap?.to(ELEMENTS.scrollTopButton, {
                opacity: 0, scale: 0.8, duration: 0.3, ease: 'power1.in',
                onComplete: () => { if (window.scrollY <= scrollThreshold) ELEMENTS.scrollTopButton.style.display = 'none'; }
            }) || (() => { ELEMENTS.scrollTopButton.style.opacity = '0'; ELEMENTS.scrollTopButton.style.display = 'none'; })();
        }
    }, 200);

    const scrollToTop = () => {
        ELEMENTS.html?.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    };

    const handleCustomCursor = () => {
        if (!FEATURE_FLAGS.enableCustomCursor || !ELEMENTS.customCursor || prefersReducedMotion || typeof gsap === 'undefined') { ELEMENTS.customCursor?.remove(); return; }
        ELEMENTS.body?.classList.add('cursor-ready');
        const xTo = gsap.quickTo(ELEMENTS.customCursor, "x", { duration: 0.4, ease: "power2.out" });
        const yTo = gsap.quickTo(ELEMENTS.customCursor, "y", { duration: 0.4, ease: "power2.out" });
        const moveCursor = e => { xTo(e.clientX); yTo(e.clientY); };
        const addClick = () => ELEMENTS.customCursor.classList.add('click');
        const removeClick = () => ELEMENTS.customCursor.classList.remove('click');
        const addHover = () => ELEMENTS.customCursor.classList.add('hover');
        const removeHover = () => ELEMENTS.customCursor.classList.remove('hover');
        window.addEventListener('mousemove', moveCursor, { passive: true });
        document.addEventListener('mousedown', addClick); document.addEventListener('mouseup', removeClick);
        const interactiveSelector = 'a, button, .service, .gallery-item, .card-hover, .social-links a, .floating-action-button, .hamburger, input, textarea, select, [role="button"], [tabindex="0"]';
        ELEMENTS.body.addEventListener('mouseover', e => { if (e.target.closest(interactiveSelector)) addHover(); else removeHover(); });
        ELEMENTS.body.addEventListener('mouseout', e => { if (e.target.closest(interactiveSelector)) removeHover(); });
        document.addEventListener('mouseleave', () => gsap.to(ELEMENTS.customCursor, { opacity: 0, duration: 0.2 }));
        document.addEventListener('mouseenter', () => gsap.to(ELEMENTS.customCursor, { opacity: 1, duration: 0.2 }));
    };

    const handleMobileNav = () => {
        if (!ELEMENTS.hamburgerButton || !ELEMENTS.mobileNav) return;
        const main = ELEMENTS.mainContent; const footer = ELEMENTS.footer;

        const toggleNav = (forceClose = false) => {
            const isActive = ELEMENTS.body.classList.contains('nav-active');
            const openNav = !isActive && !forceClose;
            ELEMENTS.body.classList.toggle('nav-active', openNav);
            ELEMENTS.hamburgerButton.classList.toggle('is-active', openNav);
            ELEMENTS.hamburgerButton.setAttribute('aria-expanded', String(openNav));
            ELEMENTS.mobileNav.setAttribute('aria-hidden', String(!openNav));
            if (openNav) {
                main?.setAttribute('inert', ''); footer?.setAttribute('inert', '');
                const firstFocusable = selectElement('a[href], button', ELEMENTS.mobileNav) || ELEMENTS.mobileNav;
                setTimeout(() => firstFocusable.focus(), 100);
            } else {
                main?.removeAttribute('inert'); footer?.removeAttribute('inert');
                ELEMENTS.hamburgerButton.focus();
            }
        };
        ELEMENTS.hamburgerButton.addEventListener('click', () => toggleNav());
        ELEMENTS.mobileNav.addEventListener('click', (e) => { if (e.target.closest('a')) toggleNav(true); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && ELEMENTS.body.classList.contains('nav-active')) toggleNav(true); });
        document.addEventListener('click', (e) => { // Close on overlay click
            if (ELEMENTS.body.classList.contains('nav-active') && !ELEMENTS.mobileNav.contains(e.target) && !ELEMENTS.hamburgerButton.contains(e.target) && e.target !== ELEMENTS.hamburgerButton) {
                toggleNav(true);
            }
        });
    };

    const handleScrollspy = throttle(() => {
        if (ELEMENTS.navLinks.length === 0) return;
        let currentSectionId = null;
        const scrollPosition = window.scrollY + headerHeight + 80; // Adjusted offset buffer
        const sections = selectElements('main section[id]');

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const isPotentiallyVisible = rect.top < window.innerHeight && rect.bottom >= 0;
            if (isPotentiallyVisible) {
                const sectionTop = section.offsetTop;
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + section.offsetHeight) {
                    currentSectionId = section.id;
                }
            }
        });
        // Fallbacks
        if (!currentSectionId) {
            if (window.scrollY < window.innerHeight * 0.3) currentSectionId = 'home';
            else if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 150) {
                const lastSection = sections[sections.length - 1]; if (lastSection) currentSectionId = lastSection.id;
            }
        }
        // Update links
        ELEMENTS.navLinks.forEach(link => {
            const href = link.getAttribute('href'); if (!href || !href.startsWith('#') || href.length === 1) return;
            const linkSectionId = href.substring(1);
            const isActive = linkSectionId === currentSectionId;
            link.classList.toggle('active', isActive);
            link.setAttribute('aria-current', isActive ? 'section' : 'false'); // Use 'false' when not current
        });
    }, CONFIG.SCROLLSPY_THROTTLE_MS);

    const handleEasterEgg = () => {
        if (!FEATURE_FLAGS.enableEasterEgg || !ELEMENTS.easterEggTrigger || typeof confetti === 'undefined' || prefersReducedMotion) return;
        ELEMENTS.easterEggTrigger.addEventListener('click', () => {
            const duration = 4 * 1000; const animationEnd = Date.now() + duration;
            const colors = ['#00a000', '#4CAF50', '#ffdd00', '#ffffff', '#dddddd'];
            const zIndex = parseInt(getComputedStyle(ELEMENTS.html).getPropertyValue('--z-modal-content'), 10) + 50 || 1500;
            const randomInRange = (min, max) => Math.random() * (max - min) + min;
            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now(); if (timeLeft <= 0) return clearInterval(interval);
                const particleCount = 50 * (timeLeft / duration);
                confetti({ startVelocity: 30, spread: 360, ticks: 60, zIndex, particleCount, origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 }, colors: colors });
            }, 200);
            logInfo("Easter egg triggered!");
        }, { once: true }); // Trigger only once per load
    };

    const validateForm = () => {
        if (!ELEMENTS.form) return true;
        let isValid = true;
        selectElements('.form-group .form-error', ELEMENTS.form).forEach(el => el.textContent = '');
        selectElements('.form-input.invalid, .form-textarea.invalid', ELEMENTS.form).forEach(el => el.classList.remove('invalid'));
        selectElements('[required]', ELEMENTS.form).forEach(input => {
            const group = input.closest('.form-group'); if (!group) return;
            const errorElement = selectElement('.form-error', group); let msg = '';
            if (input.type === 'email' && (!input.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()))) msg = 'Valid email required.';
            else if (input.type === 'checkbox' && !input.checked) msg = 'This field must be checked.';
            else if (input.value.trim() === '') msg = 'This field is required.';
            if (msg) { isValid = false; input.classList.add('invalid'); if (errorElement) errorElement.textContent = msg; }
        });
        if (!isValid) {
             const firstInvalid = selectElement('.form-input.invalid, .form-textarea.invalid', ELEMENTS.form);
             firstInvalid?.focus(); // Focus first invalid field
        }
        return isValid;
    };

    const handleFormSubmission = () => {
        if (!FEATURE_FLAGS.enableFormspree || !ELEMENTS.form) return;
        if (!ELEMENTS.form.action || !ELEMENTS.form.action.includes('formspree.io')) { logWarn('Formspree action URL missing.'); return; }
        ELEMENTS.form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!validateForm()) { updateFormStatus('Please correct the errors.', 'error'); return; }
            const formData = new FormData(ELEMENTS.form);
            const submitButton = selectElement('button[type="submit"]', ELEMENTS.form);
            const originalButtonContent = submitButton?.innerHTML;
            updateFormStatus('Sending...', 'loading');
            if (submitButton) { submitButton.disabled = true; submitButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending...'; }
            try {
                const response = await fetch(ELEMENTS.form.action, { method: 'POST', body: formData, headers: { 'Accept': 'application/json' } });
                if (response.ok) {
                    updateFormStatus('Message sent successfully!', 'success');
                    ELEMENTS.form.reset();
                    setTimeout(() => updateFormStatus('', 'idle'), CONFIG.FORM_STATUS_TIMEOUT_MS);
                } else {
                    const data = await response.json().catch(() => ({}));
                    const errorMsg = data?.errors?.map(e => e.message || String(e)).join('. ') || response.statusText || 'Submission failed.';
                    throw new Error(errorMsg);
                }
            } catch (error) { logError('Form submission error', error); updateFormStatus(`Error: ${error.message}`, 'error'); }
            finally { if (submitButton) { submitButton.disabled = false; submitButton.innerHTML = originalButtonContent; } }
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
        const removePreloader = () => { ELEMENTS.preloader.remove(); ELEMENTS.body?.classList.remove('preload'); logInfo("Preloader removed."); };
        const fallbackTimeout = setTimeout(() => { logWarn("Preloader fallback timeout."); removePreloader(); }, CONFIG.PRELOADER_MAX_WAIT_MS);
        window.addEventListener('load', () => {
            clearTimeout(fallbackTimeout);
            if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
                gsap.to(ELEMENTS.preloader, { opacity: 0, duration: CONFIG.PRELOADER_FADE_DURATION_MS / 1000, ease: 'power1.inOut', onComplete: removePreloader });
            } else {
                ELEMENTS.preloader.style.transition = `opacity ${CONFIG.PRELOADER_FADE_DURATION_MS}ms ease-out`;
                ELEMENTS.preloader.style.opacity = '0';
                setTimeout(removePreloader, CONFIG.PRELOADER_FADE_DURATION_MS + 50); // Ensure removal after transition
            }
        }, { once: true });
    };

    // --- Initialization Function ---
    const initialize = () => {
        logInfo("Initializing SysFX Script v1.8...");
        hidePreloader(); // Starts process, waits for load event
        initializeDarkMode();
        adjustLayoutPadding();
        displayTime(); setInterval(displayTime, 60000);
        displayTechTrivia();
        handleMobileNav();
        handleScrollTopButton();
        handleModals();
        handleLightbox();
        handleTestimonialCarousel();

        // Defer library-dependent or animation tasks
        requestAnimationFrame(() => {
            initializeMap(); // Map init needs accurate dimensions
             if (FEATURE_FLAGS.enableParticles) initializeParticles(); // Moved after Map
            if (FEATURE_FLAGS.enableFormspree) handleFormSubmission();
            if (!prefersReducedMotion) {
                typeEffectHandler();
                animateStats();
                revealSections();
                if (FEATURE_FLAGS.enableCustomCursor) handleCustomCursor();
                if (FEATURE_FLAGS.enableEasterEgg) handleEasterEgg();
                // Disabled features:
                // if(FEATURE_FLAGS.enableStickyNote) showStickyNote();
                // if(FEATURE_FLAGS.enableChatBubble) showChatBubble();
            } else {
                // Apply final states directly for reduced motion
                ELEMENTS.animatedSections?.forEach(s => { s.style.opacity = '1'; s.style.transform = 'none'; });
                ELEMENTS.footer?.classList.add('visible');
                ELEMENTS.statsNumbers?.forEach(n => n.textContent = parseInt(n.dataset.target || '0').toLocaleString());
                if (ELEMENTS.typingEffectElement && CONFIG.TAGLINES.length > 0) ELEMENTS.typingEffectElement.textContent = CONFIG.TAGLINES[0];
            }
        });

        setTimeout(handleScrollspy, 200); // Initial scrollspy check after layout settles
        logInfo("SysFX Script Initialized.");
    };

    // --- Global Event Listeners ---
    ELEMENTS.darkModeToggle?.addEventListener('click', toggleDarkMode);
    if (FEATURE_FLAGS.enableBackgroundMusic) ELEMENTS.musicToggle?.addEventListener('click', toggleMusic);
    ELEMENTS.scrollTopButton?.addEventListener('click', scrollToTop);
    window.addEventListener('scroll', () => { updateScrollProgress(); handleScrollspy(); handleScrollTopButton(); handleHeaderShrink(); }, { passive: true });
    window.addEventListener('resize', debounce(() => { adjustLayoutPadding(); handleScrollspy(); }, CONFIG.RESIZE_DEBOUNCE_MS));
    ELEMENTS.skipLink?.addEventListener('focus', () => ELEMENTS.skipLink.style.left = '0');
    ELEMENTS.skipLink?.addEventListener('blur', () => ELEMENTS.skipLink.style.left = '-999em');

    // --- Start Initialization ---
    if (ELEMENTS.body) initialize();
    else console.error("FATAL: Body element not found. SysFX script cannot initialize.");

}); // End DOMContentLoaded
