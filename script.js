/**
 * SysFX Website Script
 * Version: 1.8 (Final Revisions incorporating user feedback)
 * Author: sysfx (Revised by Professional Web Developer - Gemini)
 *
 * Purpose: Manages dynamic interactions, animations, and third-party
 *          library integrations for the sysfx website.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // --- Configuration & Feature Flags ---
    const CONFIG = {
        SCROLLSPY_THROTTLE_MS: 150,
        RESIZE_DEBOUNCE_MS: 300,
        TYPING_SPEED_MS: 85,            // Slightly adjusted
        TYPING_DELETE_SPEED_MS: 40,     // Slightly adjusted
        TYPING_PAUSE_MS: 2500,          // Slightly longer pause
        CAROUSEL_INTERVAL_MS: 6000,     // Slightly longer interval
        STICKY_NOTE_DELAY_MS: 8000,
        CHAT_BUBBLE_DELAY_MS: 12000,
        FORM_STATUS_TIMEOUT_MS: 6000,
        PRELOADER_TIMEOUT_MS: 4000,
        MUSIC_FADE_DURATION_MS: 600,    // Duration for music fade
        TAGLINES: [
            "Your Partner in Tech Solutions.",
            "Expert Computer Repair Services.",
            "Robust Cybersecurity Solutions.",
            "Custom Web Development.",
            "Reliable Networking & IT Support.",
            "Serving Clinton, CT and Beyond."
        ],
        TECH_TRIVIA: [ // Using local array as requested
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
        enableStickyNote: false, // Disabled as per previous context/refinement
        enableChatBubble: false, // Disabled as per previous context/refinement
        enableEasterEgg: true,
        enableBackgroundMusic: true,
        enableFormspree: true // Set to false if not using a service like Formspree
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
            // No warning needed here, function designed to return null if not found
            return element;
        } catch (e) {
            logError(`Invalid selector: ${selector}`, e);
            return null;
        }
    };

    const selectElements = (selector, context = document) => {
        try {
            return context.querySelectorAll(selector);
        } catch (e) {
            logError(`Invalid selector: ${selector}`, e);
            return document.querySelectorAll('.non-existent-selector'); // Return empty NodeList
        }
    };

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
    let audioFadeInterval = null; // For music fading

    // --- Element Selectors Cache ---
    const ELEMENTS = (() => {
        const selectors = {
            html: 'html',
            body: 'body',
            preloader: '#preloader',
            header: '#main-header',
            darkModeToggle: '#darkModeToggle',
            darkModeToggleIconContainer: '#darkModeToggle .icon-container',
            darkModeToggleText: '#darkModeToggle .mode-button-text',
            hamburgerButton: '#hamburger-button',
            mobileNav: '#main-navigation',
            navLinks: '.nav-link[data-section-id]',
            scrollProgress: '.scroll-progress',
            currentTimeDisplay: '#current-time',
            typingEffectElement: '#typing-effect',
            mapElement: '#map',
            serviceCards: '.service[data-modal-target]',
            modalContainer: '.modal-container',
            modals: '.modal',
            galleryItems: '.gallery-item[data-src]',
            lightbox: '#lightbox',
            lightboxImage: '#lightbox-image',
            lightboxAltText: '#lightbox-alt-text', // For screen reader text
            lightboxClose: '.lightbox-close',
            testimonialSlider: '.testimonial-slider',
            testimonials: '.testimonial',
            testimonialLiveRegion: '#testimonial-live-region', // Optional ARIA live region
            carouselPrev: '.carousel-prev',
            carouselNext: '.carousel-next',
            statsNumbers: '.stat-number[data-target]',
            animatedSections: '.section-animation',
            footer: '.main-footer',
            triviaTextElement: '#trivia-text',
            musicToggle: '#music-toggle',
            backgroundMusic: '#background-music',
            scrollTopButton: '#scroll-top-button',
            easterEggTrigger: '.easter-egg-trigger',
            customCursor: '.cursor',
            form: '.contact-form',
            formStatus: '#form-status',
            skipLink: '.skip-link',
            mainContent: '#main-content'
        };

        const elements = {};
        for (const key in selectors) {
            const isNodeList = ['modals', 'navLinks', 'serviceCards', 'galleryItems', 'testimonials', 'statsNumbers', 'animatedSections'].includes(key);
            elements[key] = isNodeList ? selectElements(selectors[key]) : selectElement(selectors[key]);
        }

        if (!elements.body) console.error("FATAL: Body element not found!");
        if (!elements.header) logWarn("Header element not found, layout adjustments might fail.");
        if (!elements.mainContent) logWarn("Main content element (#main-content) not found, inert attribute cannot be applied.");

        return elements;
    })();


    // --- Core Functions ---

    /**
     * Initializes Dark Mode based on localStorage or system preference.
     */
    const initializeDarkMode = () => {
        if (!ELEMENTS.body || !ELEMENTS.darkModeToggle) return;
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');
        const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
        ELEMENTS.body.classList.toggle('dark-mode', isDark);
        updateDarkModeButton(isDark);
        setTimeout(() => ELEMENTS.body?.classList.add('theme-transitions-active'), 150);
    };

    /**
     * Item 12: Updates the Dark Mode toggle button text, icon, and ARIA attributes.
     * CSS handles the background gradient change based on body class.
     * @param {boolean} isDarkMode - Whether dark mode is active.
     */
    const updateDarkModeButton = (isDarkMode) => {
        if (!ELEMENTS.darkModeToggle || !ELEMENTS.darkModeToggleIconContainer || !ELEMENTS.darkModeToggleText) return;
        const icon = selectElement('i', ELEMENTS.darkModeToggleIconContainer);

        ELEMENTS.darkModeToggle.setAttribute('aria-pressed', String(isDarkMode));
        if (isDarkMode) {
            icon?.classList.replace('fa-sun', 'fa-moon'); // Show Moon Icon in Dark Mode
            ELEMENTS.darkModeToggleText.textContent = 'Dark Mode'; // Text shows current mode
            ELEMENTS.darkModeToggle.setAttribute('aria-label', 'Switch to light mode');
        } else {
            icon?.classList.replace('fa-moon', 'fa-sun'); // Show Sun Icon in Light Mode
            ELEMENTS.darkModeToggleText.textContent = 'Light Mode'; // Text shows current mode
            ELEMENTS.darkModeToggle.setAttribute('aria-label', 'Switch to dark mode');
        }
    };

    /**
     * Toggles Dark Mode on button click.
     */
    const toggleDarkMode = () => {
        if (!ELEMENTS.body) return;
        const isDark = ELEMENTS.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateDarkModeButton(isDark);
        if (mapInstance) initializeMapMarker(); // Update map marker color
        if (particlesJS) ReInitializeParticles(); // Re-init particles if library exists
    };

    /**
     * Re-initializes Particles.js for theme change.
     * Only call if particlesJS library is loaded and feature enabled.
     */
    const ReInitializeParticles = () => {
        if (!FEATURE_FLAGS.enableParticles || prefersReducedMotion || typeof particlesJS === 'undefined') return;
        const particlesElement = selectElement('#particles-js');
        if (particlesElement) {
            // Remove existing canvas if present to avoid duplicates
            const existingCanvas = selectElement('canvas.particles-js-canvas-el', particlesElement);
            if (existingCanvas) existingCanvas.remove();
             // Re-run initialization which checks theme
            initializeParticles();
        } else {
            logWarn("Could not re-initialize particles: Container #particles-js not found.");
        }
    };


    /**
     * Adjusts body/scroll padding based on header height. Debounced.
     */
    const adjustLayoutPadding = debounce(() => {
        if (!ELEMENTS.header || !ELEMENTS.body || !ELEMENTS.html) return;
        headerHeight = ELEMENTS.header.offsetHeight;
        ELEMENTS.body.style.paddingTop = `${headerHeight}px`;
        ELEMENTS.html.style.scrollPaddingTop = `${headerHeight + 20}px`; // Extra buffer
    }, CONFIG.RESIZE_DEBOUNCE_MS); // Use configured debounce time

    /**
     * Handles header shrinking/expanding based on scroll direction.
     */
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

    /**
     * Updates the scroll progress bar. Throttled.
     */
    const updateScrollProgress = throttle(() => {
        if (!ELEMENTS.scrollProgress || !ELEMENTS.html) return;
        const scrollableHeight = ELEMENTS.html.scrollHeight - window.innerHeight;
        const scrolled = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
        ELEMENTS.scrollProgress.style.width = `${Math.min(scrolled, 100)}%`;
        ELEMENTS.scrollProgress.setAttribute('aria-valuenow', String(Math.round(scrolled)));
    }, 50); // Slightly more frequent update

    /**
     * Displays the current time and date.
     */
    const displayTime = () => {
        if (!ELEMENTS.currentTimeDisplay) return;
        try {
            const now = new Date();
            const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: true };
            const optionsDate = { weekday: 'short', month: 'short', day: 'numeric' };
            const timeString = now.toLocaleTimeString(navigator.language || 'en-US', optionsTime);
            const dateString = now.toLocaleDateString(navigator.language || 'en-US', optionsDate);
            // Using textContent for security - create elements for structure if needed
            ELEMENTS.currentTimeDisplay.textContent = ''; // Clear previous
            const dateIcon = document.createElement('i'); dateIcon.className = 'far fa-calendar-alt'; dateIcon.setAttribute('aria-hidden', 'true');
            const timeIcon = document.createElement('i'); timeIcon.className = 'far fa-clock'; timeIcon.setAttribute('aria-hidden', 'true');
            ELEMENTS.currentTimeDisplay.append(dateIcon, ` ${dateString} \u00A0\u00A0 `, timeIcon, ` ${timeString}`); // Non-breaking spaces
        } catch (e) {
            logError('Failed to display time', e);
            ELEMENTS.currentTimeDisplay.textContent = 'Could not load time.';
        }
    };

    /**
     * Handles the typing effect using async/await. Includes pause check.
     * Initial HTML should have ` ` inside the p tag.
     */
    const typeEffectHandler = async () => {
        if (!ELEMENTS.typingEffectElement || prefersReducedMotion) {
            if (prefersReducedMotion && ELEMENTS.typingEffectElement && CONFIG.TAGLINES.length > 0) {
                ELEMENTS.typingEffectElement.textContent = CONFIG.TAGLINES[0];
            } else if (ELEMENTS.typingEffectElement) {
                // Ensure the nbsp is present if no animation
                ELEMENTS.typingEffectElement.innerHTML = ' ';
            }
            return;
        }

        // Ensure initial non-breaking space to prevent collapse
        if (ELEMENTS.typingEffectElement.textContent.trim() === '') {
             ELEMENTS.typingEffectElement.innerHTML = ' ';
        }

        while (true) {
            if (isTypingPaused) {
                await new Promise(resolve => setTimeout(resolve, 500));
                continue;
            }

            const currentText = CONFIG.TAGLINES[currentTaglineIndex];

            // Typing
            for (let i = 0; i <= currentText.length; i++) {
                if (isTypingPaused) break;
                ELEMENTS.typingEffectElement.textContent = currentText.substring(0, i) || '\u00A0'; // Use nbsp if empty
                await new Promise(resolve => setTimeout(resolve, CONFIG.TYPING_SPEED_MS));
            }
            if (isTypingPaused) continue;

            // Pause after typing
            await new Promise(resolve => setTimeout(resolve, CONFIG.TYPING_PAUSE_MS));
            if (isTypingPaused) continue;

            // Deleting
            for (let i = currentText.length; i >= 0; i--) {
                if (isTypingPaused) break;
                ELEMENTS.typingEffectElement.textContent = currentText.substring(0, i) || '\u00A0'; // Use nbsp if empty
                await new Promise(resolve => setTimeout(resolve, CONFIG.TYPING_DELETE_SPEED_MS));
            }
            if (isTypingPaused) continue;

            // Pause before next line
            await new Promise(resolve => setTimeout(resolve, CONFIG.TYPING_DELETE_SPEED_MS * 3));

            currentTaglineIndex = (currentTaglineIndex + 1) % CONFIG.TAGLINES.length;
        }
    };


    /**
     * Initializes Particles.js background if enabled.
     */
    const initializeParticles = () => {
        if (!FEATURE_FLAGS.enableParticles || prefersReducedMotion || typeof particlesJS === 'undefined') {
            logInfo('ParticlesJS skipped (disabled, reduced motion, or library missing).');
            selectElement('#particles-js')?.style.setProperty('display', 'none', 'important'); // Force hide
            return;
        }

        const particlesElementId = 'particles-js';
        if (!selectElement(`#${particlesElementId}`)) {
            logWarn(`Particles container #${particlesElementId} not found.`);
            return;
        }

        try {
            // Define configs inside function to check theme at runtime
            const isDark = ELEMENTS.body?.classList.contains('dark-mode');
            const config = { // Shared base config
                interactivity: {
                    detect_on: "canvas",
                    events: { resize: true, onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" } },
                    modes: { repulse: { distance: 80, duration: 0.4 }, push: { particles_nb: 4 }, grab: { distance: 140, line_opacity: 0.7 }, bubble: { distance: 200, size: 6, duration: 0.3 } }
                },
                retina_detect: true
            };

            if (isDark) {
                // Dark Mode Specific Particles
                Object.assign(config, {
                    particles: {
                        number: { value: 100, density: { enable: true, value_area: 800 } },
                        color: { value: "#4CAF50" }, // Secondary green
                        shape: { type: "circle" },
                        opacity: { value: 0.45, random: true, anim: { enable: true, speed: 0.8, opacity_min: 0.1, sync: false } },
                        size: { value: 3, random: true },
                        line_linked: { enable: true, distance: 130, color: "#444444", opacity: 0.5, width: 1 },
                        move: { enable: true, speed: 1.5, direction: "none", random: true, straight: false, out_mode: "out", bounce: false }
                    },
                    interactivity: { // Override interactivity for dark if needed
                        ...config.interactivity,
                         events: { ...config.interactivity.events, onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "bubble" } },
                    }
                });
            } else {
                // Light Mode Specific Particles
                Object.assign(config, {
                    particles: {
                        number: { value: 80, density: { enable: true, value_area: 900 } },
                        color: { value: "#00a000" }, // Primary green
                        shape: { type: "circle" },
                        opacity: { value: 0.35, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
                        size: { value: 3, random: true },
                        line_linked: { enable: true, distance: 150, color: "#cccccc", opacity: 0.4, width: 1 },
                        move: { enable: true, speed: 2, direction: "none", random: false, straight: false, out_mode: "out", bounce: false }
                    }
                    // Inherits base interactivity from 'config'
                });
            }

            particlesJS(particlesElementId, config, () => { logInfo('Particles.js initialized.'); });

        } catch (error) {
            logError("Error initializing particles.js", error);
            selectElement(`#${particlesElementId}`)?.style.setProperty('display', 'none', 'important');
        }
    };


    /**
     * Initializes the Leaflet map.
     */
    const initializeMap = () => {
        if (typeof L === 'undefined') {
            logWarn('Leaflet library (L) not found.');
            if (ELEMENTS.mapElement) ELEMENTS.mapElement.innerHTML = '<p>Map library failed to load.</p>';
            return;
        }
        if (!ELEMENTS.mapElement) {
            logWarn('Map element (#map) not found.');
            return;
        }

        try {
            if (mapInstance) mapInstance.remove(); // Remove previous instance
            mapInstance = L.map(ELEMENTS.mapElement, { scrollWheelZoom: false, attributionControl: false })
                         .setView(CONFIG.MAP_COORDS, CONFIG.MAP_ZOOM);
            mapInstance.on('click', () => mapInstance?.scrollWheelZoom.enable());
            mapInstance.on('blur', () => mapInstance?.scrollWheelZoom.disable());
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: CONFIG.MAP_MAX_ZOOM, minZoom: CONFIG.MAP_MIN_ZOOM }).addTo(mapInstance);
            L.control.attribution({ prefix: false, position: 'bottomright' })
                     .addAttribution('© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors')
                     .addTo(mapInstance);
            initializeMapMarker();
            logInfo('Leaflet map initialized.');
        } catch (error) {
            logError("Error initializing Leaflet map", error);
            if (ELEMENTS.mapElement) ELEMENTS.mapElement.innerHTML = '<p>Map could not be loaded.</p>';
            mapInstance = null;
        }
    };

    /**
     * Creates/updates the map marker with dynamic pulsing effect.
     */
    const initializeMapMarker = () => {
        if (!mapInstance || typeof L === 'undefined' || !ELEMENTS.body) return;

        mapInstance.eachLayer((layer) => { // Remove previous marker layers
            if (layer instanceof L.Marker || (layer.options && layer.options.icon instanceof L.DivIcon)) {
                try { mapInstance.removeLayer(layer); } catch (e) { logWarn("Could not remove previous map marker.", e); }
            }
        });

        try {
            const computedStyle = getComputedStyle(ELEMENTS.body);
            const markerColor = ELEMENTS.body.classList.contains('dark-mode')
                ? (computedStyle.getPropertyValue('--secondary-color').trim() || '#4CAF50')
                : (computedStyle.getPropertyValue('--primary-color').trim() || '#00a000');
            const borderColor = ELEMENTS.body.classList.contains('dark-mode')
                ? (computedStyle.getPropertyValue('--text-dark').trim() || '#212529') // Black border in dark mode
                : (computedStyle.getPropertyValue('--text-light').trim() || '#f8f9fa'); // White border in light mode
            const pulseColor = markerColor + '80'; // Add 50% opacity hex code (approx)
            const pulseEndColor = markerColor + '00'; // Fully transparent

            const keyframes = `@keyframes pulseMarker { 0% { box-shadow: 0 0 0 0 ${pulseColor}; } 70% { box-shadow: 0 0 0 15px ${pulseEndColor}; } 100% { box-shadow: 0 0 0 0 ${pulseEndColor}; } }`;
            const styleElement = document.createElement('style');
            styleElement.textContent = keyframes;
            document.head.appendChild(styleElement); // Add keyframes globally (simpler than per marker)

            const pulsingIcon = L.divIcon({
                className: 'custom-map-marker',
                html: `<div style="background-color: ${markerColor}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid ${borderColor}; animation: pulseMarker 2s infinite; transition: background-color 0.3s ease, border-color 0.3s ease;"></div>`,
                iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -15]
            });

            L.marker(CONFIG.MAP_COORDS, { icon: pulsingIcon, title: 'sysfx Location' })
                .addTo(mapInstance)
                .bindPopup("<b>sysfx HQ</b><br>123 Main Street<br>Clinton, CT 06413");

            // Cleanup style element if map is removed later? (Consider if necessary)
            // mapInstance.on('remove', () => styleElement.remove());

        } catch(error) { logError("Failed to create map marker", error); }
    };

    /**
     * Handles modal opening/closing, focus, and accessibility.
     */
    const handleModals = () => {
        if (ELEMENTS.serviceCards.length === 0 && ELEMENTS.modals.length === 0) return;

        // Open modal triggers
        ELEMENTS.serviceCards?.forEach(card => {
            const modalId = card.getAttribute('data-modal-target');
            if (!modalId) return;
            const modal = selectElement(`#${modalId}`);
            if (!modal) return;
            card.addEventListener('click', () => openModal(modal, card));
            card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(modal, card); } });
        });

        // Close triggers within each modal
        ELEMENTS.modals?.forEach(modal => {
            selectElements('.modal-close, .modal-close-alt', modal).forEach(button => {
                button.addEventListener('click', () => closeModal(modal));
            });
            modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(modal); }); // Backdrop click
             // Modal action buttons (e.g., link to contact)
            selectElements('.modal-action[data-link]', modal).forEach(button => {
                button.addEventListener('click', () => {
                    const targetSelector = button.getAttribute('data-link');
                    const targetElement = selectElement(targetSelector);
                    closeModal(modal); // Close first
                    setTimeout(() => {
                       if (targetElement) {
                            targetElement.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                            targetElement.focus({ preventScroll: true });
                        }
                    }, 100);
                });
            });
        });

        // Global Escape key listener
        document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && activeModal) closeModal(activeModal); });
    };

    const openModal = (modal, triggerElement = null) => {
        if (!modal || modal === activeModal) return;
        activeModal = modal;
        if (triggerElement) activeModal.triggerElement = triggerElement;

        modal.style.display = 'flex';
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const reflow = modal.offsetHeight; // Force reflow

        requestAnimationFrame(() => {
            modal.classList.add('active');
            ELEMENTS.body?.classList.add('no-scroll');
            ELEMENTS.mainContent?.setAttribute('inert', ''); // Make background content inert
            ELEMENTS.footer?.setAttribute('inert', '');
            modal.setAttribute('aria-hidden', 'false');
            const firstFocusable = selectElement('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal) || modal;
            setTimeout(() => firstFocusable.focus(), 100);
        });
    };

    const closeModal = (modal) => {
        if (!modal || modal !== activeModal || !modal.classList.contains('active')) return;

        const triggerElement = activeModal.triggerElement;
        activeModal.triggerElement = null;
        activeModal = null;

        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        ELEMENTS.mainContent?.removeAttribute('inert'); // Restore background content
        ELEMENTS.footer?.removeAttribute('inert');

        const onTransitionEnd = (event) => {
            if (event.target !== modal || !['opacity', 'transform'].includes(event.propertyName)) return;
            modal.style.display = 'none';
            ELEMENTS.body?.classList.remove('no-scroll');
            triggerElement?.focus();
            modal.removeEventListener('transitionend', onTransitionEnd);
        };
        modal.addEventListener('transitionend', onTransitionEnd);

        // Fallback timeout
        setTimeout(() => {
            if (!activeModal && modal.style.display !== 'none') {
                 logWarn(`Modal transitionEnd fallback triggered: ${modal.id}`);
                 modal.removeEventListener('transitionend', onTransitionEnd);
                 modal.style.display = 'none';
                 ELEMENTS.body?.classList.remove('no-scroll');
                 triggerElement?.focus();
            }
        }, 500); // Match CSS transition duration + buffer
    };


    /**
     * Handles lightbox opening/closing.
     */
    const handleLightbox = () => {
        if (!ELEMENTS.lightbox || !ELEMENTS.lightboxImage || !ELEMENTS.lightboxClose || !ELEMENTS.lightboxAltText) return;

        const openLightbox = (item) => {
            activeLightboxTarget = item;
            const highResSrc = item.getAttribute('data-src');
            const altText = item.getAttribute('data-alt') || selectElement('img', item)?.alt || 'Gallery image';

            if (!highResSrc) { logWarn("Gallery item has no data-src.", item); return; }

            ELEMENTS.lightboxImage.setAttribute('src', highResSrc);
            ELEMENTS.lightboxImage.setAttribute('alt', altText);
            ELEMENTS.lightboxAltText.textContent = altText; // Update sr-only text
            ELEMENTS.lightbox.style.display = 'flex';
             // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const reflow = ELEMENTS.lightbox.offsetHeight;

            requestAnimationFrame(() => {
                ELEMENTS.lightbox.classList.add('active');
                ELEMENTS.body?.classList.add('no-scroll');
                ELEMENTS.mainContent?.setAttribute('inert', '');
                ELEMENTS.footer?.setAttribute('inert', '');
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
            ELEMENTS.mainContent?.removeAttribute('inert');
            ELEMENTS.footer?.removeAttribute('inert');

            const onTransitionEnd = (event) => {
                 if (event.target !== ELEMENTS.lightbox || !['opacity', 'transform'].includes(event.propertyName)) return;
                 ELEMENTS.lightbox.style.display = 'none';
                 ELEMENTS.lightboxImage.setAttribute('src', '');
                 ELEMENTS.lightboxImage.setAttribute('alt', '');
                 ELEMENTS.lightboxAltText.textContent = '';
                 ELEMENTS.body?.classList.remove('no-scroll');
                 trigger?.focus();
                 ELEMENTS.lightbox.removeEventListener('transitionend', onTransitionEnd);
            };
            ELEMENTS.lightbox.addEventListener('transitionend', onTransitionEnd);
             // Fallback
             setTimeout(() => {
                 if (ELEMENTS.lightbox.style.display !== 'none' && !activeLightboxTarget) {
                     logWarn(`Lightbox transitionEnd fallback.`);
                     ELEMENTS.lightbox.removeEventListener('transitionend', onTransitionEnd);
                     ELEMENTS.lightbox.style.display = 'none';
                     ELEMENTS.lightboxImage.setAttribute('src', '');
                     ELEMENTS.lightboxImage.setAttribute('alt', '');
                     ELEMENTS.lightboxAltText.textContent = '';
                     ELEMENTS.body?.classList.remove('no-scroll');
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


    /**
     * Handles the testimonial carousel (fade transition).
     */
    const handleTestimonialCarousel = () => {
        if (!ELEMENTS.testimonialSlider || ELEMENTS.testimonials.length === 0) {
            selectElement('.carousel-container', document)?.style.setProperty('display', 'none'); // Hide whole container if no slides
            return;
        }

        const totalTestimonials = ELEMENTS.testimonials.length;
        const container = ELEMENTS.testimonialSlider.parentElement;

        const showTestimonial = (index) => {
            currentTestimonialIndex = (index + totalTestimonials) % totalTestimonials; // Ensure positive index
            ELEMENTS.testimonials.forEach((testimonial, i) => {
                testimonial.setAttribute('aria-hidden', String(i !== currentTestimonialIndex));
            });
            if (ELEMENTS.testimonialLiveRegion) {
                ELEMENTS.testimonialLiveRegion.textContent = `Showing testimonial ${currentTestimonialIndex + 1} of ${totalTestimonials}.`;
            }
        };

        const nextTestimonial = () => showTestimonial(currentTestimonialIndex + 1);
        const prevTestimonial = () => showTestimonial(currentTestimonialIndex - 1);
        const stopInterval = () => clearInterval(testimonialInterval);
        const startInterval = () => {
            stopInterval();
            if (!prefersReducedMotion) {
                testimonialInterval = setInterval(nextTestimonial, CONFIG.CAROUSEL_INTERVAL_MS);
            }
        };
        const resetInterval = () => { stopInterval(); startInterval(); };

        ELEMENTS.carouselNext?.addEventListener('click', () => { nextTestimonial(); resetInterval(); });
        ELEMENTS.carouselPrev?.addEventListener('click', () => { prevTestimonial(); resetInterval(); });
        [ELEMENTS.carouselPrev, ELEMENTS.carouselNext].forEach((btn, i) => {
            btn?.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (i === 0 ? prevTestimonial : nextTestimonial)(); resetInterval(); }
            });
        });

        if (container) { // Pause on hover/focus
             container.addEventListener('mouseenter', stopInterval);
             container.addEventListener('mouseleave', startInterval);
             container.addEventListener('focusin', stopInterval);
             container.addEventListener('focusout', startInterval);
        }

        showTestimonial(0); // Show first slide initially
        startInterval();
    };


    /**
     * Animates stats numbers using GSAP if available.
     */
    const animateStats = () => {
        if (ELEMENTS.statsNumbers.length === 0) return;

        const runFallback = () => {
            ELEMENTS.statsNumbers?.forEach(n => n.textContent = (parseInt(n.dataset.target || '0')).toLocaleString());
        };

        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || prefersReducedMotion) {
            logInfo('GSAP/ScrollTrigger missing or reduced motion. Using fallback for stats.');
            runFallback();
            return;
        }

        gsap.registerPlugin(ScrollTrigger);
        ELEMENTS.statsNumbers.forEach(statNum => {
            const target = parseInt(statNum.dataset.target || '0');
            let proxy = { val: 0 };
            ScrollTrigger.create({
                trigger: statNum, start: "top 90%", once: true,
                onEnter: () => {
                    gsap.to(proxy, {
                        val: target, duration: 2.5, ease: "power2.out", // Slightly longer duration
                        onUpdate: () => { statNum.textContent = Math.round(proxy.val).toLocaleString(); },
                        onComplete: () => { statNum.textContent = target.toLocaleString(); } // Final value
                    });
                }
            });
        });
    };

    /**
     * Handles section reveal animations using GSAP.
     */
    const revealSections = () => {
        if (ELEMENTS.animatedSections.length === 0 && !ELEMENTS.footer) return;

        const runFallback = () => {
            ELEMENTS.animatedSections?.forEach(s => { s.style.opacity = '1'; s.style.transform = 'none'; });
            ELEMENTS.footer?.classList.add('visible');
        };

        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || prefersReducedMotion) {
             logInfo('GSAP/ScrollTrigger missing or reduced motion. Using fallback for reveals.');
             runFallback();
             return;
        }

        gsap.registerPlugin(ScrollTrigger);
        ELEMENTS.animatedSections?.forEach((section, index) => {
            gsap.fromTo(section,
                { opacity: 0, y: 60 },
                {
                    opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
                    scrollTrigger: { trigger: section, start: "top 88%", toggleActions: "play none none none" },
                    delay: index * 0.05 // Stagger effect
                }
            );
        });

        if (ELEMENTS.footer) { // Footer fade-in class toggle
            ScrollTrigger.create({
                trigger: ELEMENTS.footer, start: "top 95%",
                onEnter: () => ELEMENTS.footer.classList.add('visible'),
                onLeaveBack: () => ELEMENTS.footer.classList.remove('visible')
            });
        }
    };

    /**
     * Displays a random tech trivia fact from the local array.
     */
    const displayTechTrivia = () => {
        if (!ELEMENTS.triviaTextElement) return;
        if (CONFIG.TECH_TRIVIA && CONFIG.TECH_TRIVIA.length > 0) {
             const randomIndex = Math.floor(Math.random() * CONFIG.TECH_TRIVIA.length);
             ELEMENTS.triviaTextElement.textContent = CONFIG.TECH_TRIVIA[randomIndex];
        } else {
            ELEMENTS.triviaTextElement.textContent = 'Tech insights loading...';
        }
        // Optional: Cycle trivia
        // setTimeout(displayTechTrivia, 30000);
    };

    /**
     * Item 11: Toggles background music with fade effect using GSAP if available.
     */
    const toggleMusic = () => {
        if (!FEATURE_FLAGS.enableBackgroundMusic || !ELEMENTS.backgroundMusic || !ELEMENTS.musicToggle) return;

        const audio = ELEMENTS.backgroundMusic;
        const button = ELEMENTS.musicToggle;
        const fadeDurationSeconds = CONFIG.MUSIC_FADE_DURATION_MS / 1000;

        // Clear any existing fade interval/tween
        if (audioFadeInterval) clearInterval(audioFadeInterval);
        if (gsap) gsap.killTweensOf(audio); // Kill GSAP tweens if using GSAP

        if (musicPlaying) {
            // Fade Out
            if (typeof gsap !== 'undefined') {
                gsap.to(audio, { volume: 0, duration: fadeDurationSeconds, ease: "linear", onComplete: () => audio.pause() });
            } else {
                // Manual Fade Out
                 let currentVolume = audio.volume;
                 audioFadeInterval = setInterval(() => {
                     currentVolume -= 0.1 / (fadeDurationSeconds * 10); // Decrement volume smoothly
                     if (currentVolume <= 0) {
                         audio.volume = 0;
                         audio.pause();
                         clearInterval(audioFadeInterval);
                     } else {
                         audio.volume = currentVolume;
                     }
                 }, 100); // Update every 100ms
            }
            musicPlaying = false;
            button.classList.add('muted');
            button.setAttribute('aria-pressed', 'false');
            button.setAttribute('aria-label', 'Play background music');
        } else {
            // Fade In
            audio.volume = 0; // Start silent
            const playPromise = audio.play();

            if (playPromise !== undefined) {
                 playPromise.then(() => {
                    // Play started successfully
                    if (typeof gsap !== 'undefined') {
                         gsap.to(audio, { volume: 1, duration: fadeDurationSeconds, ease: "linear" });
                     } else {
                          // Manual Fade In
                          let currentVolume = 0;
                          audioFadeInterval = setInterval(() => {
                              currentVolume += 0.1 / (fadeDurationSeconds * 10);
                              if (currentVolume >= 1) {
                                  audio.volume = 1;
                                  clearInterval(audioFadeInterval);
                              } else {
                                  audio.volume = currentVolume;
                              }
                          }, 100);
                     }
                     musicPlaying = true;
                     button.classList.remove('muted');
                     button.setAttribute('aria-pressed', 'true');
                     button.setAttribute('aria-label', 'Pause background music');

                 }).catch(error => {
                    logWarn("Music playback failed (likely browser restriction).", error);
                    // Ensure button stays muted if play fails
                     button.classList.add('muted');
                     button.setAttribute('aria-pressed', 'false');
                     musicPlaying = false;
                 });
            } else {
                 // Handle browsers where play() doesn't return a promise (older?) - less common now
                 logWarn("Audio play() did not return a promise.");
                 // Attempt immediate play/fade (might still be blocked)
                  if (typeof gsap !== 'undefined') {
                     gsap.to(audio, { volume: 1, duration: fadeDurationSeconds, ease: "linear" });
                 } else { audio.volume = 1; } // No fade fallback
                 musicPlaying = true;
                 button.classList.remove('muted');
                 button.setAttribute('aria-pressed', 'true');
                 button.setAttribute('aria-label', 'Pause background music');
            }
        }
    };


    /**
     * Shows/hides the scroll-to-top button based on scroll position. Throttled.
     */
    const handleScrollTopButton = throttle(() => {
        if (!ELEMENTS.scrollTopButton) return;
        const scrollThreshold = window.innerHeight * 0.4;
        const shouldBeVisible = window.scrollY > scrollThreshold;
        const isVisible = parseFloat(ELEMENTS.scrollTopButton.style.opacity || '0') > 0;

        if (shouldBeVisible && !isVisible) {
            ELEMENTS.scrollTopButton.style.display = 'flex';
            requestAnimationFrame(() => { // Ensure display is set before animating
                 gsap?.to(ELEMENTS.scrollTopButton, { opacity: 1, scale: 1, duration: 0.3, ease: 'power1.out' }) || (ELEMENTS.scrollTopButton.style.opacity = '1');
            });
        } else if (!shouldBeVisible && isVisible) {
            const onComplete = () => { if (window.scrollY <= scrollThreshold) ELEMENTS.scrollTopButton.style.display = 'none'; };
             gsap?.to(ELEMENTS.scrollTopButton, { opacity: 0, scale: 0.8, duration: 0.3, ease: 'power1.in', onComplete }) ||
             (ELEMENTS.scrollTopButton.style.opacity = '0', ELEMENTS.scrollTopButton.style.display = 'none');
        }
    }, 200);

    /**
     * Scrolls the page to the top.
     */
    const scrollToTop = () => {
        ELEMENTS.html?.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    };

    /**
     * Item 10: Handles the custom cursor movement using GSAP quickTo.
     */
    const handleCustomCursor = () => {
        if (!FEATURE_FLAGS.enableCustomCursor || !ELEMENTS.customCursor || prefersReducedMotion || typeof gsap === 'undefined') {
            ELEMENTS.customCursor?.remove();
            ELEMENTS.body?.classList.remove('cursor-ready'); // Ensure class removed
            return;
        }

        ELEMENTS.body?.classList.add('cursor-ready');

        // Use GSAP's quickTo for direct, smooth positioning - more performant than updating style directly
        const xTo = gsap.quickTo(ELEMENTS.customCursor, "x", { duration: 0.3, ease: "power2.out" });
        const yTo = gsap.quickTo(ELEMENTS.customCursor, "y", { duration: 0.3, ease: "power2.out" });

        const moveCursor = (e) => { xTo(e.clientX); yTo(e.clientY); };
        const addClickEffect = () => ELEMENTS.customCursor?.classList.add('click');
        const removeClickEffect = () => ELEMENTS.customCursor?.classList.remove('click');
        const addHoverEffect = () => ELEMENTS.customCursor?.classList.add('hover');
        const removeHoverEffect = () => ELEMENTS.customCursor?.classList.remove('hover');

        window.addEventListener('mousemove', moveCursor, { passive: true });
        document.addEventListener('mousedown', addClickEffect);
        document.addEventListener('mouseup', removeClickEffect);

        // Event delegation for hover effects
        const interactiveSelector = 'a[href], button, input, textarea, select, .card-hover, [role="button"], [tabindex="0"]';
        ELEMENTS.body?.addEventListener('mouseover', (e) => { if (e.target?.closest(interactiveSelector)) addHoverEffect(); });
        ELEMENTS.body?.addEventListener('mouseout', (e) => { if (e.target?.closest(interactiveSelector)) removeHoverEffect(); });
        ELEMENTS.body?.addEventListener('focusin', (e) => { if (e.target?.closest(interactiveSelector)) addHoverEffect(); });
        ELEMENTS.body?.addEventListener('focusout', (e) => { if (e.target?.closest(interactiveSelector)) removeHoverEffect(); });

        // Hide/show cursor on window leave/enter
        document.addEventListener('mouseleave', () => gsap.to(ELEMENTS.customCursor, { opacity: 0, duration: 0.2 }));
        document.addEventListener('mouseenter', () => gsap.to(ELEMENTS.customCursor, { opacity: 1, duration: 0.2 }));
    };

    /**
     * Handles mobile navigation toggle and accessibility.
     */
    const handleMobileNav = () => {
        if (!ELEMENTS.hamburgerButton || !ELEMENTS.mobileNav || !ELEMENTS.body) return;

        const mainContent = ELEMENTS.mainContent;
        const footerContent = ELEMENTS.footer;
        const overlay = document.createElement('div'); // Create overlay dynamically
        overlay.className = 'mobile-nav-overlay';
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = String(parseInt(getComputedStyle(ELEMENTS.html).getPropertyValue('--z-nav-overlay') || '1049')); // Use CSS var
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
        overlay.style.transition = 'opacity 0.4s ease, visibility 0s 0.4s';
        overlay.style.pointerEvents = 'none'; // Start non-interactive
        ELEMENTS.body.appendChild(overlay);

        const toggleNav = (forceClose = false) => {
            const isActive = ELEMENTS.body.classList.contains('nav-active');
            const openNav = !isActive && !forceClose;

            ELEMENTS.body.classList.toggle('nav-active', openNav);
            ELEMENTS.hamburgerButton.classList.toggle('is-active', openNav);
            ELEMENTS.hamburgerButton.setAttribute('aria-expanded', String(openNav));
            ELEMENTS.mobileNav.setAttribute('aria-hidden', String(!openNav));

            if (openNav) {
                mainContent?.setAttribute('inert', '');
                footerContent?.setAttribute('inert', '');
                overlay.style.opacity = '1';
                overlay.style.visibility = 'visible';
                overlay.style.pointerEvents = 'auto'; // Make interactive
                overlay.style.transition = 'opacity 0.4s ease, visibility 0s 0s';
                const firstFocusable = selectElement('a[href], button', ELEMENTS.mobileNav) || ELEMENTS.mobileNav;
                setTimeout(() => firstFocusable.focus(), 100);
            } else {
                mainContent?.removeAttribute('inert');
                footerContent?.removeAttribute('inert');
                overlay.style.opacity = '0';
                overlay.style.visibility = 'hidden';
                overlay.style.pointerEvents = 'none';
                overlay.style.transition = 'opacity 0.4s ease, visibility 0s 0.4s';
                 // Only focus hamburger if it's visible (avoids errors if closed programmatically)
                if (ELEMENTS.hamburgerButton.offsetParent !== null) {
                    ELEMENTS.hamburgerButton.focus();
                }
            }
        };

        ELEMENTS.hamburgerButton.addEventListener('click', () => toggleNav());
        ELEMENTS.mobileNav.addEventListener('click', (event) => { if (event.target.closest('a')) toggleNav(true); });
        document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && ELEMENTS.body.classList.contains('nav-active')) toggleNav(true); });
        overlay.addEventListener('click', () => { if (ELEMENTS.body.classList.contains('nav-active')) toggleNav(true); }); // Use overlay click
    };

    /**
     * Handles scrollspy functionality. Throttled.
     */
    const handleScrollspy = throttle(() => {
        if (ELEMENTS.navLinks.length === 0) return;

        let currentSectionId = null;
        const adjustedHeaderHeight = ELEMENTS.header?.offsetHeight || 0; // Get current header height
        const scrollPosition = window.scrollY + adjustedHeaderHeight + 60; // Offset below header
        const sections = selectElements('main section[id]');

        sections.forEach(section => {
             const rect = section.getBoundingClientRect();
             // Check if section is within a reasonable viewport range before calculating offsetTop
             if (rect.top < window.innerHeight && rect.bottom >= 0) {
                 const sectionTop = section.offsetTop;
                 if (scrollPosition >= sectionTop && scrollPosition < sectionTop + section.offsetHeight) {
                     currentSectionId = section.id;
                 }
             }
        });

        // Fallbacks for top/bottom of page
        if (!currentSectionId) {
            if (window.scrollY < window.innerHeight * 0.2) currentSectionId = 'home';
            else if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 150) { // Near bottom threshold
                 const lastNavigableSectionId = ELEMENTS.navLinks[ELEMENTS.navLinks.length - 1]?.getAttribute('href')?.substring(1);
                 const lastSectionElement = selectElement(`#${lastNavigableSectionId}`);
                 if (lastSectionElement && lastSectionElement.offsetTop <= scrollPosition) {
                     currentSectionId = lastNavigableSectionId; // Target last nav item if near bottom
                 }
            }
        }

        // Update nav links
        ELEMENTS.navLinks.forEach(link => {
            const linkSectionId = link.getAttribute('href')?.substring(1);
            if (!linkSectionId) return;
            const isActive = linkSectionId === currentSectionId;
            link.classList.toggle('active', isActive);
            link.setAttribute('aria-current', isActive ? 'section' : 'false'); // Use 'false' string
        });
    }, CONFIG.SCROLLSPY_THROTTLE_MS);


    /**
     * Handles confetti easter egg.
     */
    const handleEasterEgg = () => {
        if (!FEATURE_FLAGS.enableEasterEgg || !ELEMENTS.easterEggTrigger || typeof confetti === 'undefined' || prefersReducedMotion) return;
        ELEMENTS.easterEggTrigger.addEventListener('click', () => {
            const duration = 4 * 1000;
            const animationEnd = Date.now() + duration;
            const colors = ['#00a000', '#4CAF50', '#ffdd00', '#ffffff', '#dddddd'];
            const zIndex = parseInt(getComputedStyle(ELEMENTS.html).getPropertyValue('--z-modal-content'), 10) + 50 || 1500;
            const randomInRange = (min, max) => Math.random() * (max - min) + min;
            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);
                confetti({
                    startVelocity: 30, spread: 360, ticks: 60, zIndex: zIndex,
                    particleCount: 40 * (timeLeft / duration),
                    origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
                    colors: colors
                });
            }, 200);
            logInfo("Confetti!");
        });
    };

    /**
     * Basic form validation.
     * @returns {boolean} True if valid.
     */
    const validateForm = () => {
        if (!ELEMENTS.form) return true;
        let isValid = true;
        selectElements('.form-error', ELEMENTS.form).forEach(el => el.textContent = '');
        selectElements('.invalid', ELEMENTS.form).forEach(el => el.classList.remove('invalid'));

        selectElements('[required]', ELEMENTS.form).forEach(input => {
            const group = input.closest('.form-group');
            if (!group) return;
            const errorElement = selectElement('.form-error', group);
            let errorMessage = '';

            if (input.type === 'email' && (!input.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()))) {
                errorMessage = 'Please enter a valid email address.';
            } else if (input.type === 'checkbox' && !input.checked) {
                errorMessage = 'This field must be checked.';
            } else if (input.value.trim() === '') {
                 errorMessage = 'This field is required.';
            }

            if (errorMessage) {
                isValid = false;
                input.classList.add('invalid');
                if (errorElement) errorElement.textContent = errorMessage;
            }
        });
        if (!isValid) {
             selectElement('.invalid', ELEMENTS.form)?.focus(); // Focus first invalid field
        }
        return isValid;
    };

    /**
     * Handles form submission (e.g., for Formspree).
     */
    const handleFormSubmission = () => {
        if (!FEATURE_FLAGS.enableFormspree || !ELEMENTS.form || !ELEMENTS.form.action || !ELEMENTS.form.action.includes('formspree.io')) {
            if(ELEMENTS.form && (!ELEMENTS.form.action || !ELEMENTS.form.action.includes('formspree.io'))) {
                logWarn('Form action does not point to Formspree or is missing. Submission disabled.');
            }
            return; // Exit if no form, no formspree, or action invalid
        }

        ELEMENTS.form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!validateForm()) {
                updateFormStatus('Please correct the errors above.', 'error');
                return;
            }

            const formData = new FormData(ELEMENTS.form);
            const submitButton = selectElement('button[type="submit"]', ELEMENTS.form);
            const originalButtonContent = submitButton?.innerHTML;

            updateFormStatus('Sending message...', 'loading');
            if (submitButton) { submitButton.disabled = true; submitButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending...'; }

            try {
                const response = await fetch(ELEMENTS.form.action, { method: 'POST', body: formData, headers: { 'Accept': 'application/json' } });
                if (response.ok) {
                    updateFormStatus('Message sent successfully! We\'ll be in touch.', 'success');
                    ELEMENTS.form.reset();
                    setTimeout(() => updateFormStatus('', 'idle'), CONFIG.FORM_STATUS_TIMEOUT_MS);
                } else {
                    const data = await response.json().catch(() => ({}));
                    let errorMsg = data?.errors?.map(e => e.message).join('. ') || response.statusText || 'Submission failed.';
                    throw new Error(errorMsg);
                }
            } catch (error) {
                logError('Form submission error', error);
                updateFormStatus(`Error: ${error.message || 'Could not send message.'}`, 'error');
                // Optionally keep error visible longer
            } finally {
                if (submitButton) { submitButton.disabled = false; submitButton.innerHTML = originalButtonContent; }
            }
        });
    };

    /**
     * Updates the form status message area.
     */
    const updateFormStatus = (message, state = 'idle') => {
        if (!ELEMENTS.formStatus) return;
        ELEMENTS.formStatus.textContent = message;
        ELEMENTS.formStatus.className = `form-status ${state}`;
        ELEMENTS.formStatus.style.display = (state === 'idle' || !message) ? 'none' : 'block';
        ELEMENTS.formStatus.setAttribute('role', (state === 'error' || state === 'success') ? 'alert' : 'status');
        ELEMENTS.formStatus.setAttribute('aria-live', (state === 'error' || state === 'success') ? 'assertive' : 'polite');
    };

    /**
     * Hides the preloader when the window finishes loading.
     */
    const hidePreloader = () => {
        if (!ELEMENTS.preloader) {
            ELEMENTS.body?.classList.remove('preload');
            return;
        }
        const removePreloader = () => {
            ELEMENTS.preloader?.remove();
            ELEMENTS.body?.classList.remove('preload');
            logInfo("Preloader removed.");
        };
        const fallbackTimeout = setTimeout(() => {
            logWarn("Preloader fallback timeout."); removePreloader();
        }, CONFIG.PRELOADER_TIMEOUT_MS);

        window.addEventListener('load', () => {
            clearTimeout(fallbackTimeout);
            if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
                gsap.to(ELEMENTS.preloader, { opacity: 0, duration: 0.6, ease: 'power1.inOut', onComplete: removePreloader });
            } else {
                 ELEMENTS.preloader.style.transition = 'opacity 0.5s ease-out';
                 ELEMENTS.preloader.style.opacity = '0';
                 ELEMENTS.preloader.addEventListener('transitionend', removePreloader, { once: true });
                 setTimeout(removePreloader, 600); // Safety net
            }
        });
    };

    // --- Initialization Function ---
    const initialize = () => {
        logInfo("Initializing SysFX Script v1.8...");

        hidePreloader(); // Start preloader hiding process
        initializeDarkMode();
        adjustLayoutPadding(); // Initial call
        displayTime(); setInterval(displayTime, 60000);
        displayTechTrivia();
        handleMobileNav();
        handleScrollTopButton(); // Initial check
        handleModals();
        handleLightbox();
        handleTestimonialCarousel();
        if (FEATURE_FLAGS.enableFormspree) handleFormSubmission();

        // Libraries and animations that might need DOM ready
        requestAnimationFrame(() => {
            initializeParticles();
            initializeMap();
            animateStats();
            revealSections();
            if (FEATURE_FLAGS.enableCustomCursor) handleCustomCursor();
            if (FEATURE_FLAGS.enableEasterEgg) handleEasterEgg();
            if (!prefersReducedMotion) typeEffectHandler();
        });

        // Initial Scrollspy Call after libraries/layout likely settled
        setTimeout(handleScrollspy, 250);

        logInfo("SysFX Script Initialized.");
    };

    // --- Global Event Listeners ---
    ELEMENTS.darkModeToggle?.addEventListener('click', toggleDarkMode);
    if(FEATURE_FLAGS.enableBackgroundMusic) ELEMENTS.musicToggle?.addEventListener('click', toggleMusic);
    ELEMENTS.scrollTopButton?.addEventListener('click', scrollToTop);
    window.addEventListener('scroll', throttle(() => { // Combine throttled scroll listeners
        updateScrollProgress();
        handleScrollspy();
        handleScrollTopButton();
        handleHeaderShrink();
    }, 100), { passive: true }); // Throttle more aggressively
    window.addEventListener('resize', adjustLayoutPadding); // Uses its own debounce
    ELEMENTS.skipLink?.addEventListener('blur', () => { if(ELEMENTS.skipLink) ELEMENTS.skipLink.style.left = '-9999px'; }); // Ensure blur resets position

    // --- Start Initialization ---
    if (ELEMENTS.body) initialize();
    else console.error("FATAL: Body element not found. Initialization cancelled.");

}); // End DOMContentLoaded
