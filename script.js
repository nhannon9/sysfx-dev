/**
 * SysFX Website Script
 * Version: 1.7 (Professional Refinements & Integration Fixes)
 * Author: sysfx (Revised by Professional Web Developer - Gemini)
 *
 * Purpose: Manages dynamic interactions, animations, and third-party
 *          library integrations for the sysfx website.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // --- Configuration & Feature Flags ---
    const CONFIG = {
        SCROLLSPY_THROTTLE_MS: 150,     // Slightly increased throttle for potentially complex checks
        RESIZE_DEBOUNCE_MS: 300,
        TYPING_SPEED_MS: 90,            // Slightly faster typing
        TYPING_DELETE_SPEED_MS: 45,     // Slightly faster deletion
        TYPING_PAUSE_MS: 2200,
        CAROUSEL_INTERVAL_MS: 5500,
        STICKY_NOTE_DELAY_MS: 8000,     // Delay for non-critical popups
        CHAT_BUBBLE_DELAY_MS: 12000,
        FORM_STATUS_TIMEOUT_MS: 6000,   // How long success/error messages stay visible
        PRELOADER_TIMEOUT_MS: 4000,     // Max time preloader stays visible
        TAGLINES: [
            "Your Partner in Tech Solutions.",
            "Expert Computer Repair Services.",
            "Robust Cybersecurity Solutions.",
            "Custom Web Development.",
            "Reliable Networking & IT Support.",
            "Serving Clinton, CT and Beyond."
        ],
        // Using placeholder trivia to avoid external API dependency issues
        TECH_TRIVIA: [
            "The first computer mouse, invented by Doug Engelbart in 1964, was made of wood.",
            "An estimated 90% of the world's data has been created in just the last few years.",
            "The QWERTY keyboard layout was initially designed to slow typists down, preventing jams on early typewriters.",
            "On average, a smartphone user checks their device over 150 times per day.",
            "Registering a domain name was free until 1995.",
            "The first 1GB hard drive (IBM 3380, 1980) weighed over 500 pounds and cost $40,000.",
            "The term 'bug' originated when a real moth caused a malfunction in the Harvard Mark II computer in 1947."
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
        enableStickyNote: false, // Example: Disable if not fully implemented
        enableChatBubble: false, // Example: Disable if not fully implemented
        enableEasterEgg: true,
        enableBackgroundMusic: true,
        enableFormspree: true // Set to false if not using Formspree or similar
    };

    // --- Utility Functions ---
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args); // Use apply to preserve 'this' context
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    const throttle = (func, limit) => {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args); // Use apply to preserve 'this' context
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    const logError = (message, error = '') => {
        console.error(`[SysFX Script Error] ${message}`, error);
    };

    const logWarn = (message) => {
        console.warn(`[SysFX Script Warn] ${message}`);
    };

    const logInfo = (message) => {
        console.info(`[SysFX Script Info] ${message}`);
    };

    /**
     * Safely selects a single DOM element.
     * @param {string} selector - The CSS selector.
     * @param {HTMLElement} [context=document] - The context to search within.
     * @returns {HTMLElement|null} The found element or null.
     */
    const selectElement = (selector, context = document) => {
        try {
            const element = context.querySelector(selector);
            if (!element) {
                // logWarn(`Element not found for selector: ${selector}`);
            }
            return element;
        } catch (e) {
            logError(`Invalid selector: ${selector}`, e);
            return null;
        }
    };

    /**
     * Safely selects multiple DOM elements.
     * @param {string} selector - The CSS selector.
     * @param {HTMLElement} [context=document] - The context to search within.
     * @returns {NodeListOf<Element>} An empty NodeList if none found or error.
     */
    const selectElements = (selector, context = document) => {
        try {
            const elements = context.querySelectorAll(selector);
            // if (elements.length === 0) {
            //     logWarn(`No elements found for selector: ${selector}`);
            // }
            return elements;
        } catch (e) {
            logError(`Invalid selector: ${selector}`, e);
            return document.querySelectorAll('.non-existent-selector-to-return-empty-nodelist'); // Return empty NodeList
        }
    };


    // --- State Variables ---
    let headerHeight = 0;
    let currentTypingIndex = 0;
    let currentTaglineIndex = 0;
    let isTypingPaused = false;
    let currentTestimonialIndex = 0;
    let testimonialInterval = null;
    let musicPlaying = false;
    let mapInstance = null;
    let particlesInstance = null; // Store pJS instance if needed
    let activeModal = null; // Track the currently open modal
    let activeLightboxTarget = null; // Track element that opened lightbox
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Element Selectors Cache (using safe selectors) ---
    // Using an IIFE to create a private scope for ELEMENTS
    const ELEMENTS = (() => {
        const selectors = {
            html: 'html',
            body: 'body',
            preloader: '#preloader',
            header: '#main-header',
            darkModeToggle: '#darkModeToggle',
            hamburgerButton: '#hamburger-button',
            mobileNav: '#main-navigation',
            navLinks: '.nav-link[data-section-id]', // More specific selector
            scrollProgress: '.scroll-progress',
            currentTimeDisplay: '#current-time',
            typingEffectElement: '#typing-effect',
            mapElement: '#map',
            serviceCards: '.service[data-modal-target]',
            modalContainer: '.modal-container',
            modals: '.modal',
            galleryItems: '.gallery-item[data-src]', // Ensure it has a source
            lightbox: '#lightbox',
            lightboxImage: '.lightbox-image',
            lightboxClose: '.lightbox-close',
            testimonialSlider: '.testimonial-slider',
            testimonials: '.testimonial',
            carouselPrev: '.carousel-prev',
            carouselNext: '.carousel-next',
            statsNumbers: '.stat-number[data-target]',
            animatedSections: '.section-animation',
            footer: '.main-footer',
            triviaTextElement: '#trivia-text',
            musicToggle: '#music-toggle',
            backgroundMusic: '#background-music',
            scrollTopButton: '#scroll-top-button',
            stickyNote: '#sticky-note', // Assuming ID exists if feature enabled
            stickyNoteClose: '#sticky-note .close-btn', // Assuming class exists
            chatBubble: '#chat-bubble', // Assuming ID exists if feature enabled
            easterEggTrigger: '.easter-egg-trigger',
            customCursor: '.cursor',
            form: '.contact-form',
            formStatus: '#form-status',
            skipLink: '.skip-link',
            mainContent: '#main-content' // Added for inert toggling
        };

        const elements = {};
        for (const key in selectors) {
            if (key === 'modals' || key === 'navLinks' || key === 'serviceCards' || key === 'galleryItems' || key === 'testimonials' || key === 'statsNumbers' || key === 'animatedSections') {
                elements[key] = selectElements(selectors[key]);
            } else {
                elements[key] = selectElement(selectors[key]);
            }
        }

        // Add checks for critical elements
        if (!elements.body) console.error("FATAL: Body element not found!");
        if (!elements.header) logWarn("Header element not found, layout adjustments might fail.");

        return elements;
    })();


    // --- Core Functions ---

    /**
     * Initializes Dark Mode based on localStorage or system preference.
     */
    const initializeDarkMode = () => {
        if (!ELEMENTS.body || !ELEMENTS.darkModeToggle) return;

        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');
        const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

        ELEMENTS.body.classList.toggle('dark-mode', isDark);
        updateDarkModeButton(isDark);

        // Add transition class slightly after load to prevent initial flash
        setTimeout(() => ELEMENTS.body.classList.add('theme-transitions-active'), 150);
    };

    /**
     * Updates the Dark Mode toggle button's appearance and ARIA attributes.
     * @param {boolean} isDarkMode - Whether dark mode is active.
     */
    const updateDarkModeButton = (isDarkMode) => {
        if (!ELEMENTS.darkModeToggle) return;
        const icon = selectElement('i', ELEMENTS.darkModeToggle);
        const text = selectElement('.mode-button-text', ELEMENTS.darkModeToggle);

        ELEMENTS.darkModeToggle.setAttribute('aria-pressed', String(isDarkMode));
        if (isDarkMode) {
            icon?.classList.replace('fa-moon', 'fa-sun');
            if (text) text.textContent = ' Light Mode';
            ELEMENTS.darkModeToggle.setAttribute('aria-label', 'Switch to light mode');
        } else {
            icon?.classList.replace('fa-sun', 'fa-moon');
            if (text) text.textContent = ' Dark Mode';
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
        // ReInitializeParticles(); // Consider if particles truly need full reinit
    };

    /**
     * Adjusts body padding-top and scroll-padding-top based on the header's actual height.
     * Debounced for performance on resize.
     */
    const adjustLayoutPadding = debounce(() => {
        if (!ELEMENTS.header || !ELEMENTS.body || !ELEMENTS.html) return;
        headerHeight = ELEMENTS.header.offsetHeight;
        ELEMENTS.body.style.paddingTop = `${headerHeight}px`;
        ELEMENTS.html.style.scrollPaddingTop = `${headerHeight + 20}px`; // Add a bit more buffer
        logInfo(`Layout padding adjusted. Header height: ${headerHeight}px`);
    }, 100); // Short debounce for this adjustment

    /**
     * Shrinks header on scroll down, expands on scroll up.
     */
    let lastScrollTop = 0;
    const handleHeaderShrink = () => {
        if (!ELEMENTS.header) return;
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        const shrinkThreshold = 100; // Pixels scrolled before shrinking

        if (currentScroll > lastScrollTop && currentScroll > shrinkThreshold) {
            // Scroll Down
            ELEMENTS.header.classList.add('header-shrunk');
        } else if (currentScroll < lastScrollTop || currentScroll <= shrinkThreshold) {
            // Scroll Up or near top
            ELEMENTS.header.classList.remove('header-shrunk');
        }
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // For Mobile or negative scrolling
    };


    /**
     * Updates the scroll progress bar width. Throttled for performance.
     */
    const updateScrollProgress = throttle(() => {
        if (!ELEMENTS.scrollProgress) return;
        const scrollableHeight = ELEMENTS.html.scrollHeight - window.innerHeight;
        const scrolled = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
        ELEMENTS.scrollProgress.style.width = `${Math.min(scrolled, 100)}%`;
        ELEMENTS.scrollProgress.setAttribute('aria-valuenow', Math.round(scrolled));
    }, 50); // Throttle slightly less aggressively

    /**
     * Displays the current time and date.
     */
    const displayTime = () => {
        if (!ELEMENTS.currentTimeDisplay) return;
        try {
            const now = new Date();
            const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: true };
            const optionsDate = { weekday: 'short', month: 'short', day: 'numeric' };
            // Use locale strings for better internationalization potential
            const timeString = now.toLocaleTimeString(navigator.language || 'en-US', optionsTime);
            const dateString = now.toLocaleDateString(navigator.language || 'en-US', optionsDate);
            // Use innerHTML cautiously, ensure no user input is involved here
            ELEMENTS.currentTimeDisplay.innerHTML = `<i class="far fa-calendar-alt" aria-hidden="true"></i> ${dateString}    <i class="far fa-clock" aria-hidden="true"></i> ${timeString}`;
        } catch (e) {
            logError('Failed to display time', e);
            ELEMENTS.currentTimeDisplay.textContent = 'Could not load time.';
        }
    };

    /**
     * Handles the typing and deleting effect for taglines using async/await.
     */
    const typeEffectHandler = async () => {
        if (!ELEMENTS.typingEffectElement || prefersReducedMotion) {
            if (prefersReducedMotion && ELEMENTS.typingEffectElement && CONFIG.TAGLINES.length > 0) {
                ELEMENTS.typingEffectElement.textContent = CONFIG.TAGLINES[0]; // Set static tagline if reduced motion
            }
            return; // Exit if no element or reduced motion
        }

        while (true) { // Loop indefinitely
            if (isTypingPaused) { // Allow pausing
                await new Promise(resolve => setTimeout(resolve, 500));
                continue;
            }

            const currentText = CONFIG.TAGLINES[currentTaglineIndex];

            // Typing
            for (let i = 0; i <= currentText.length; i++) {
                if (isTypingPaused) break; // Check pause during typing
                ELEMENTS.typingEffectElement.textContent = currentText.substring(0, i);
                await new Promise(resolve => setTimeout(resolve, CONFIG.TYPING_SPEED_MS));
            }
            if (isTypingPaused) continue; // Restart loop if paused

            // Pause after typing
            await new Promise(resolve => setTimeout(resolve, CONFIG.TYPING_PAUSE_MS));
            if (isTypingPaused) continue;

            // Deleting
            for (let i = currentText.length; i >= 0; i--) {
                 if (isTypingPaused) break;
                ELEMENTS.typingEffectElement.textContent = currentText.substring(0, i);
                await new Promise(resolve => setTimeout(resolve, CONFIG.TYPING_DELETE_SPEED_MS));
            }
             if (isTypingPaused) continue;

            // Pause before next line
            await new Promise(resolve => setTimeout(resolve, CONFIG.TYPING_DELETE_SPEED_MS * 3));

            currentTaglineIndex = (currentTaglineIndex + 1) % CONFIG.TAGLINES.length;
        }
    };

    // Functions to pause/resume typing effect if needed (e.g., on window blur/focus)
    // const pauseTyping = () => { isTypingPaused = true; };
    // const resumeTyping = () => { isTypingPaused = false; };
    // window.addEventListener('blur', pauseTyping);
    // window.addEventListener('focus', resumeTyping);

    /**
     * Initializes the Particles.js background if enabled and library is available.
     */
    const initializeParticles = () => {
        if (!FEATURE_FLAGS.enableParticles || prefersReducedMotion || typeof particlesJS === 'undefined') {
            logInfo('ParticlesJS skipped (disabled, reduced motion, or library missing).');
            const particlesContainer = selectElement('#particles-js');
            if (particlesContainer) particlesContainer.style.display = 'none';
            return;
        }

        const particlesElementId = 'particles-js';
        if (!selectElement(`#${particlesElementId}`)) {
            logWarn(`Particles container #${particlesElementId} not found.`);
            return;
        }

        try {
            const commonConfig = { // Base config, reduce repetition
                interactivity: {
                    detect_on: "canvas", // Use 'window' if issues with canvas detection
                    events: { resize: true },
                     modes: { // Define all modes used
                         repulse: { distance: 100, duration: 0.4 },
                         push: { particles_nb: 4 },
                         grab: { distance: 140, line_opacity: 0.7 },
                         bubble: { distance: 200, size: 6, duration: 0.3 }
                    }
                },
                retina_detect: true
            };

            const lightModeConfig = {
                ...commonConfig, // Spread common config
                particles: {
                    number: { value: 80, density: { enable: true, value_area: 900 } },
                    color: { value: "#00a000" }, // Use CSS var? getComputedStyle('--primary-color') is complex here
                    shape: { type: "circle" },
                    opacity: { value: 0.4, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
                    size: { value: 3, random: true },
                    line_linked: { enable: true, distance: 150, color: "#cccccc", opacity: 0.4, width: 1 },
                    move: { enable: true, speed: 2, direction: "none", random: false, straight: false, out_mode: "out", bounce: false }
                },
                 interactivity: {
                     ...commonConfig.interactivity,
                     events: { ...commonConfig.interactivity.events, onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" } },
                 }
            };

            const darkModeConfig = {
                 ...commonConfig,
                 particles: {
                    number: { value: 100, density: { enable: true, value_area: 800 } },
                    color: { value: "#4CAF50" },
                    shape: { type: "circle" },
                    opacity: { value: 0.5, random: true, anim: { enable: true, speed: 0.8, opacity_min: 0.15, sync: false } },
                    size: { value: 3.5, random: true },
                    line_linked: { enable: true, distance: 130, color: "#444444", opacity: 0.6, width: 1 },
                    move: { enable: true, speed: 1.5, direction: "none", random: true, straight: false, out_mode: "out", bounce: false }
                },
                 interactivity: {
                     ...commonConfig.interactivity,
                     events: { ...commonConfig.interactivity.events, onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "bubble" } },
                 }
            };

            const currentConfig = ELEMENTS.body.classList.contains('dark-mode') ? darkModeConfig : lightModeConfig;
             // Store the instance if needed for later manipulation
             // window.pJSDom[0].pJS holds the instance after init
             particlesJS(particlesElementId, currentConfig, () => {
                logInfo('Particles.js initialized successfully.');
                // Example: Access instance after init if pJSDom is available globally
                // if (window.pJSDom && window.pJSDom[0]) {
                //     particlesInstance = window.pJSDom[0].pJS;
                // }
            });
        } catch (error) {
            logError("Error initializing particles.js", error);
            const particlesContainer = selectElement(`#${particlesElementId}`);
            if (particlesContainer) particlesContainer.style.display = 'none';
        }
    };

    /**
     * Initializes the Leaflet map if the library is available and element exists.
     */
    const initializeMap = () => {
        if (typeof L === 'undefined') {
            logWarn('Leaflet library (L) not found. Skipping map initialization.');
            if (ELEMENTS.mapElement) ELEMENTS.mapElement.innerHTML = '<p>Map library failed to load.</p>';
            return;
        }
        if (!ELEMENTS.mapElement) {
            logWarn('Map element (#map) not found. Skipping map initialization.');
            return;
        }

        try {
            // Check if map is already initialized
            if (mapInstance && mapInstance.remove) {
                 mapInstance.remove(); // Remove previous instance if re-initializing
                 mapInstance = null;
            }

            mapInstance = L.map(ELEMENTS.mapElement, {
                scrollWheelZoom: false, // Start with scroll zoom disabled
                attributionControl: false // Disable default attribution, add custom later
            }).setView(CONFIG.MAP_COORDS, CONFIG.MAP_ZOOM);

            // Enable scroll zoom on click, disable on blur
            mapInstance.on('click', () => mapInstance?.scrollWheelZoom.enable());
            mapInstance.on('blur', () => mapInstance?.scrollWheelZoom.disable());

            // Add Tile Layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                // attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors', // Handled by custom control
                maxZoom: CONFIG.MAP_MAX_ZOOM,
                minZoom: CONFIG.MAP_MIN_ZOOM
            }).addTo(mapInstance);

            // Add custom attribution control to the bottom right
            L.control.attribution({
                prefix: false, // Don't show 'Leaflet' prefix
                position: 'bottomright'
            }).addAttribution('© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors').addTo(mapInstance);


            initializeMapMarker(); // Add the marker

            logInfo('Leaflet map initialized successfully.');

        } catch (error) {
            logError("Error initializing Leaflet map", error);
            ELEMENTS.mapElement.innerHTML = '<p>Map could not be loaded due to an error.</p>';
            mapInstance = null; // Ensure instance is null on error
        }
    };

    /**
      * Creates and adds/updates the map marker based on the current theme.
      * Uses CSS variables for dynamic colors.
      */
    const initializeMapMarker = () => {
        if (!mapInstance || typeof L === 'undefined') return;

        // Remove existing marker layer(s) reliably
        mapInstance.eachLayer((layer) => {
            if (layer instanceof L.Marker || layer instanceof L.DivIcon) { // Check for both marker types
                 try {
                     mapInstance.removeLayer(layer);
                 } catch (e) {
                    logWarn("Could not remove previous map marker layer.", e);
                 }
            }
        });

        try {
             const isDark = ELEMENTS.body.classList.contains('dark-mode');
             // Get computed styles - ensure body is available
             const computedStyle = getComputedStyle(ELEMENTS.body);
             // Safely get CSS variable values with fallbacks
             const markerColor = computedStyle.getPropertyValue('--primary-color').trim() || '#00a000'; // Fallback green
             const markerColorDark = computedStyle.getPropertyValue('--secondary-color').trim() || '#4CAF50'; // Fallback lighter green
             const borderColor = computedStyle.getPropertyValue('--text-light').trim() || '#f8f9fa';
             const borderColorDark = computedStyle.getPropertyValue('--text-dark').trim() || '#212529';

             const currentMarkerColor = isDark ? markerColorDark : markerColor;
             const currentBorderColor = isDark ? borderColorDark : borderColor;
             const pulseColor = isDark ? 'rgba(76, 175, 80, 0.5)' : 'rgba(0, 160, 0, 0.5)';
             const pulseEndColor = isDark ? 'rgba(76, 175, 80, 0)' : 'rgba(0, 160, 0, 0)';


            // Define the keyframes directly in the style block for broader compatibility
             const keyframes = `@keyframes pulseMarker {
                                 0% { box-shadow: 0 0 0 0 ${pulseColor}; }
                                 70% { box-shadow: 0 0 0 15px ${pulseEndColor}; }
                                 100% { box-shadow: 0 0 0 0 ${pulseEndColor}; }
                             }`;

             const pulsingIcon = L.divIcon({
                 className: 'custom-map-marker', // Base class for potential global styles
                 html: `<style>${keyframes}</style>
                        <div style="
                            background-color: ${currentMarkerColor};
                            width: 18px;
                            height: 18px;
                            border-radius: 50%;
                            border: 3px solid ${currentBorderColor};
                            box-shadow: 0 0 0 ${pulseColor};
                            animation: pulseMarker 2s infinite;
                            transition: background-color 0.3s ease, border-color 0.3s ease; /* Smooth theme transition */
                         "></div>`,
                 iconSize: [24, 24],
                 iconAnchor: [12, 12], // Center the icon anchor
                 popupAnchor: [0, -15] // Position popup above the icon center
             });

            L.marker(CONFIG.MAP_COORDS, { icon: pulsingIcon, title: 'sysfx Location' })
                .addTo(mapInstance)
                .bindPopup("<b>sysfx HQ</b><br>123 Main Street<br>Clinton, CT 06413");

        } catch(error) {
             logError("Failed to create or update map marker", error);
        }
    };

    /**
     * Handles opening and closing modals with focus management and accessibility.
     */
    const handleModals = () => {
        if (ELEMENTS.serviceCards.length === 0 && ELEMENTS.modals.length === 0) return;

        // Open modal via service card click/keypress
        ELEMENTS.serviceCards?.forEach(card => {
             const modalId = card.getAttribute('data-modal-target');
             if (!modalId) {
                 logWarn("Service card missing data-modal-target attribute.", card);
                 return;
             }
             const modal = selectElement(`#${modalId}`);
             if (!modal) {
                 logWarn(`Modal with ID #${modalId} not found for service card.`, card);
                 return;
             }

            const openTrigger = () => openModal(modal, card); // Pass trigger element

            card.addEventListener('click', openTrigger);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openTrigger();
                }
            });
        });

        // Handle closing modals
        ELEMENTS.modals?.forEach(modal => {
            const closeButtons = selectElements('.modal-close, .modal-close-alt', modal); // Select all close triggers

            // Close via button clicks
            closeButtons.forEach(button => {
                button.addEventListener('click', () => closeModal(modal));
            });

            // Close via backdrop click
            modal.addEventListener('click', (event) => {
                if (event.target === modal) { // Only if clicking the backdrop itself
                    closeModal(modal);
                }
            });

             // Handle actions within modals (e.g., buttons linking to sections)
             const actionButtons = selectElements('.modal-action[data-link]', modal);
             actionButtons.forEach(button => {
                 button.addEventListener('click', () => {
                     const targetSelector = button.getAttribute('data-link');
                     const targetElement = selectElement(targetSelector);
                     closeModal(modal); // Close modal first
                     // Scroll to target section after modal closes (add slight delay)
                     setTimeout(() => {
                        if (targetElement) {
                             targetElement.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                             // Optionally focus the target section or a focusable element within it
                             targetElement.focus({ preventScroll: true }); // preventScroll might be needed
                         } else {
                             logWarn(`Modal action target not found: ${targetSelector}`);
                         }
                     }, 100); // Small delay to allow modal close animation
                 });
             });
        });

        // Global Escape key listener for modals
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && activeModal) {
                closeModal(activeModal);
            }
        });
    };

    /**
     * Opens a specific modal, manages focus and accessibility attributes.
     * @param {HTMLElement} modal - The modal element to open.
     * @param {HTMLElement} [triggerElement=null] - The element that triggered the modal opening (optional, for returning focus).
     */
    const openModal = (modal, triggerElement = null) => {
        if (!modal || modal === activeModal) return; // Don't open if already open or doesn't exist

        activeModal = modal; // Set as active
        if (triggerElement) activeModal.triggerElement = triggerElement; // Store trigger element

        modal.style.display = 'flex'; // Set display before transition class
        // Force reflow before adding class (more reliable transition)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const reflow = modal.offsetHeight;

        requestAnimationFrame(() => {
            modal.classList.add('active');
            ELEMENTS.body?.classList.add('no-scroll');
            modal.setAttribute('aria-hidden', 'false');

            // Focus management: Find first focusable element or modal itself
            const focusableElements = selectElements('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal);
            const firstFocusable = focusableElements.length > 0 ? focusableElements[0] : modal;
            setTimeout(() => firstFocusable.focus(), 100); // Delay focus slightly
        });
    };

    /**
     * Closes the currently active modal, manages focus and accessibility.
     * @param {HTMLElement} modal - The modal element to close.
     */
    const closeModal = (modal) => {
        if (!modal || modal !== activeModal || !modal.classList.contains('active')) return;

        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');

        const triggerElement = activeModal.triggerElement; // Retrieve trigger
        activeModal.triggerElement = null; // Clear stored trigger
        activeModal = null; // Clear active modal state

        // Use transitionend event for reliable hiding and focus return
        const onTransitionEnd = (event) => {
            // Ensure the transition is for the modal itself and for opacity or transform
             if (event.target !== modal || !['opacity', 'transform'].includes(event.propertyName)) {
                 return;
             }
            modal.style.display = 'none';
            ELEMENTS.body?.classList.remove('no-scroll'); // Remove only when fully closed
            triggerElement?.focus(); // Return focus to the element that opened it
             modal.removeEventListener('transitionend', onTransitionEnd); // Clean up listener
        };

        modal.addEventListener('transitionend', onTransitionEnd);

        // Fallback timeout in case transitionend doesn't fire (e.g., display:none interrupt)
        setTimeout(() => {
            if (!activeModal && modal.style.display !== 'none') { // Check if still needs hiding
                 logWarn(`TransitionEnd fallback triggered for modal: ${modal.id}`);
                 modal.removeEventListener('transitionend', onTransitionEnd); // Clean up listener
                 modal.style.display = 'none';
                 ELEMENTS.body?.classList.remove('no-scroll');
                 triggerElement?.focus();
            }
        }, 500); // Match CSS transition duration + buffer
    };


    /**
     * Handles opening/closing the gallery lightbox with focus management.
     */
    const handleLightbox = () => {
        if (!ELEMENTS.lightbox || !ELEMENTS.lightboxImage || !ELEMENTS.lightboxClose) return;

        const openLightbox = (item) => {
            activeLightboxTarget = item; // Store the clicked item
            const highResSrc = item.getAttribute('data-src');
            const altText = item.getAttribute('data-alt') || selectElement('img', item)?.alt || 'Gallery image';

            if (highResSrc) {
                ELEMENTS.lightboxImage.setAttribute('src', highResSrc);
                ELEMENTS.lightboxImage.setAttribute('alt', altText);
                ELEMENTS.lightbox.style.display = 'flex';
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const reflow = ELEMENTS.lightbox.offsetHeight; // Force reflow

                requestAnimationFrame(() => {
                    ELEMENTS.lightbox.classList.add('active');
                    ELEMENTS.body?.classList.add('no-scroll');
                    ELEMENTS.lightbox.setAttribute('aria-hidden', 'false');
                    setTimeout(() => ELEMENTS.lightboxClose.focus(), 100); // Focus close button
                });
            } else {
                logWarn("Gallery item clicked has no data-src attribute.", item);
            }
        };

        const closeLightbox = () => {
            if (!ELEMENTS.lightbox.classList.contains('active')) return;

            ELEMENTS.lightbox.classList.remove('active');
            ELEMENTS.lightbox.setAttribute('aria-hidden', 'true');

             const trigger = activeLightboxTarget; // Get trigger before clearing
             activeLightboxTarget = null; // Clear target

            const onTransitionEnd = (event) => {
                 if (event.target !== ELEMENTS.lightbox || !['opacity', 'transform'].includes(event.propertyName)) return;

                 ELEMENTS.lightbox.style.display = 'none';
                 ELEMENTS.lightboxImage.setAttribute('src', ''); // Clear src for next use
                 ELEMENTS.lightboxImage.setAttribute('alt', '');
                 ELEMENTS.body?.classList.remove('no-scroll');
                 trigger?.focus(); // Return focus
                 ELEMENTS.lightbox.removeEventListener('transitionend', onTransitionEnd);
            };

             ELEMENTS.lightbox.addEventListener('transitionend', onTransitionEnd);

             // Fallback timeout
             setTimeout(() => {
                 if (ELEMENTS.lightbox.style.display !== 'none' && !activeLightboxTarget) { // Check if still needs hiding
                     logWarn(`TransitionEnd fallback triggered for lightbox.`);
                     ELEMENTS.lightbox.removeEventListener('transitionend', onTransitionEnd);
                     ELEMENTS.lightbox.style.display = 'none';
                     ELEMENTS.lightboxImage.setAttribute('src', '');
                     ELEMENTS.lightboxImage.setAttribute('alt', '');
                     ELEMENTS.body?.classList.remove('no-scroll');
                     trigger?.focus();
                 }
             }, 500); // Match transition + buffer
        };

        ELEMENTS.galleryItems?.forEach(item => {
            item.setAttribute('role', 'button');
            item.setAttribute('tabindex', '0');
            item.addEventListener('click', () => openLightbox(item));
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(item);
                }
            });
        });

        ELEMENTS.lightboxClose.addEventListener('click', closeLightbox);
        ELEMENTS.lightbox.addEventListener('click', (event) => {
            if (event.target === ELEMENTS.lightbox) { // Backdrop click
                closeLightbox();
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && ELEMENTS.lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    };

    /**
     * Handles the testimonial carousel (fade transition) with improved controls and accessibility.
     */
    const handleTestimonialCarousel = () => {
        if (!ELEMENTS.testimonialSlider || ELEMENTS.testimonials.length === 0) {
            // Hide controls if no testimonials
            if(ELEMENTS.carouselPrev) ELEMENTS.carouselPrev.style.display = 'none';
            if(ELEMENTS.carouselNext) ELEMENTS.carouselNext.style.display = 'none';
            return;
        }

        const totalTestimonials = ELEMENTS.testimonials.length;
        const container = ELEMENTS.testimonialSlider.parentElement; // Carousel container

        const showTestimonial = (index) => {
            if (index < 0 || index >= totalTestimonials) {
                logWarn(`Invalid testimonial index: ${index}`);
                index = 0; // Default to first
            }

            ELEMENTS.testimonials.forEach((testimonial, i) => {
                const isActive = i === index;
                testimonial.setAttribute('aria-hidden', String(!isActive));
                // Using CSS attribute selector for visibility/opacity transitions
                // .testimonial[aria-hidden="false"] { opacity: 1; visibility: visible; position: relative; }
                // .testimonial[aria-hidden="true"] { opacity: 0; visibility: hidden; position: absolute; }
            });
            currentTestimonialIndex = index;

            // Update ARIA live region if one exists (recommended for accessibility)
            const liveRegion = selectElement('#testimonial-live-region'); // Add this element to HTML if needed
            if (liveRegion) {
                liveRegion.textContent = `Showing testimonial ${index + 1} of ${totalTestimonials}.`;
            }
        };

        const nextTestimonial = () => {
            const nextIndex = (currentTestimonialIndex + 1) % totalTestimonials;
            showTestimonial(nextIndex);
        };

        const prevTestimonial = () => {
            const prevIndex = (currentTestimonialIndex - 1 + totalTestimonials) % totalTestimonials;
            showTestimonial(prevIndex);
        };

        // Auto-play Management
        const stopInterval = () => clearInterval(testimonialInterval);
        const startInterval = () => {
            stopInterval(); // Clear existing first
            if (!prefersReducedMotion) {
                testimonialInterval = setInterval(nextTestimonial, CONFIG.CAROUSEL_INTERVAL_MS);
            }
        };
        const resetInterval = () => {
             stopInterval();
             startInterval();
        };


        // Event Listeners for Controls
        ELEMENTS.carouselNext?.addEventListener('click', () => { nextTestimonial(); resetInterval(); });
        ELEMENTS.carouselPrev?.addEventListener('click', () => { prevTestimonial(); resetInterval(); });

        // Keyboard accessibility for controls
        [ELEMENTS.carouselPrev, ELEMENTS.carouselNext].forEach((btn, i) => {
            btn?.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                     (i === 0 ? prevTestimonial : nextTestimonial)();
                     resetInterval();
                }
            });
        });

        // Pause on hover/focus of the container
        if (container) {
             container.addEventListener('mouseenter', stopInterval);
             container.addEventListener('mouseleave', startInterval);
             container.addEventListener('focusin', stopInterval);
             container.addEventListener('focusout', startInterval);
        }

        // Initial setup
        showTestimonial(0);
        startInterval();
    };


    /**
     * Animates the stats numbers using GSAP when they become visible.
     */
    const animateStats = () => {
        if (ELEMENTS.statsNumbers.length === 0) return; // Exit if no stat elements

        // Fallback for no GSAP or reduced motion
        const runFallback = () => {
            ELEMENTS.statsNumbers?.forEach(statNum => {
                const target = parseInt(statNum.dataset.target || '0', 10);
                statNum.textContent = target.toLocaleString(); // Display final number formatted
            });
        };

        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            logWarn('GSAP or ScrollTrigger not loaded. Using fallback for stats animation.');
            runFallback();
            return;
        }
        if (prefersReducedMotion) {
             logInfo('Reduced motion preferred. Using fallback for stats animation.');
             runFallback();
            return;
        }

        // GSAP Animation
        gsap.registerPlugin(ScrollTrigger);

        ELEMENTS.statsNumbers.forEach(statNum => {
            const target = parseInt(statNum.dataset.target, 10) || 0;
            // Use a proxy object for animation to handle formatting
            let proxy = { val: 0 };

            ScrollTrigger.create({
                 trigger: statNum,
                 start: "top 90%", // Trigger when element is 90% from top of viewport
                 once: true, // Trigger only once
                 onEnter: () => {
                     gsap.to(proxy, {
                         val: target,
                         duration: 2,
                         ease: "power2.out",
                         onUpdate: () => {
                             statNum.textContent = Math.round(proxy.val).toLocaleString();
                         },
                         onComplete: () => {
                              statNum.textContent = target.toLocaleString(); // Ensure final value is exact
                         }
                     });
                 }
            });
        });
    };

    /**
     * Handles section reveal animations using GSAP and ScrollTrigger.
     */
    const revealSections = () => {
        if (ELEMENTS.animatedSections.length === 0 && !ELEMENTS.footer) return; // Exit if nothing to animate

        // Fallback for no GSAP or reduced motion
         const runFallback = () => {
             ELEMENTS.animatedSections?.forEach(section => {
                 section.style.opacity = '1';
                 section.style.transform = 'translateY(0)';
             });
             ELEMENTS.footer?.classList.add('visible'); // Make footer visible directly
         };

         if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
             logWarn('GSAP or ScrollTrigger not loaded. Using fallback for reveal animations.');
             runFallback();
             return;
         }
         if (prefersReducedMotion) {
              logInfo('Reduced motion preferred. Using fallback for reveal animations.');
              runFallback();
             return;
         }

        // GSAP Animations
        gsap.registerPlugin(ScrollTrigger);

        // Animate sections
        ELEMENTS.animatedSections?.forEach((section, index) => {
            // Set initial state via GSAP for consistency
            gsap.set(section, { opacity: 0, y: 60 });

            gsap.to(section, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 88%", // Adjust trigger point as needed
                    toggleActions: "play none none none", // Play once on enter
                    // markers: true, // Uncomment for debugging
                },
                delay: index * 0.05 // Stagger animation slightly
            });
        });

        // Animate footer visibility class toggle
        if (ELEMENTS.footer) {
             // Set initial state for footer if CSS doesn't handle it (safer)
             // Note: CSS should ideally handle initial state via .main-footer selector
             // gsap.set(ELEMENTS.footer, { opacity: 0, y: 40 });

            ScrollTrigger.create({
                trigger: ELEMENTS.footer,
                start: "top 95%", // When top of footer is 95% from top of viewport
                // markers: true, // Uncomment for debugging
                onEnter: () => ELEMENTS.footer.classList.add('visible'),
                onLeaveBack: () => ELEMENTS.footer.classList.remove('visible') // Hide if scrolling back up past it
                 // Optionally add GSAP animation alongside class toggle:
                 // onEnter: () => {
                 //     ELEMENTS.footer.classList.add('visible');
                 //     gsap.to(ELEMENTS.footer, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
                 // },
                 // onLeaveBack: () => {
                 //     gsap.to(ELEMENTS.footer, { opacity: 0, y: 40, duration: 0.4, ease: 'power1.in', onComplete: () => ELEMENTS.footer.classList.remove('visible') });
                 // }
            });
        }
    };


    /**
     * Fetches and displays a tech trivia fact from the local array.
     */
    const displayTechTrivia = () => {
        if (!ELEMENTS.triviaTextElement) return;

        if (CONFIG.TECH_TRIVIA && CONFIG.TECH_TRIVIA.length > 0) {
             const randomIndex = Math.floor(Math.random() * CONFIG.TECH_TRIVIA.length);
             const randomFact = CONFIG.TECH_TRIVIA[randomIndex];
             // Use textContent for security (prevents HTML injection)
             ELEMENTS.triviaTextElement.textContent = randomFact;
        } else {
            logWarn("Tech trivia array is empty or missing.");
            ELEMENTS.triviaTextElement.textContent = 'Tech insights coming soon!'; // Fallback message
        }
        // Optionally, cycle trivia periodically
        // setInterval(displayTechTrivia, 30000); // Change every 30 seconds
    };


    /**
     * Toggles background music playback if enabled.
     */
    const toggleMusic = () => {
        if (!FEATURE_FLAGS.enableBackgroundMusic || !ELEMENTS.backgroundMusic || !ELEMENTS.musicToggle) return;

        try {
            if (musicPlaying) {
                ELEMENTS.backgroundMusic.pause();
            } else {
                 // Play returns a promise which should be handled
                 const playPromise = ELEMENTS.backgroundMusic.play();
                 if (playPromise !== undefined) {
                     playPromise.catch(error => {
                         // Autoplay was prevented.
                         logWarn("Background music autoplay failed. User interaction likely required.", error);
                         // Optionally, provide feedback to the user that music needs manual start
                          ELEMENTS.musicToggle.classList.add('muted'); // Keep muted style if failed
                          ELEMENTS.musicToggle.setAttribute('aria-pressed', 'false');
                         musicPlaying = false; // Ensure state reflects reality
                     });
                 }
            }
            // Toggle state optimistically, but catch handles failure
             musicPlaying = !musicPlaying;
             ELEMENTS.musicToggle.classList.toggle('muted', !musicPlaying);
             ELEMENTS.musicToggle.setAttribute('aria-pressed', String(musicPlaying));
             ELEMENTS.musicToggle.setAttribute('aria-label', musicPlaying ? 'Pause background music' : 'Play background music');

        } catch (e) {
            logError("Error toggling music", e);
            // Reset state visually if error occurs
            ELEMENTS.musicToggle.classList.add('muted');
            ELEMENTS.musicToggle.setAttribute('aria-pressed', 'false');
            musicPlaying = false;
        }
    };

    /**
     * Shows/hides the scroll-to-top button based on scroll position. Throttled.
     */
    const handleScrollTopButton = throttle(() => {
        if (!ELEMENTS.scrollTopButton) return;
        const scrollThreshold = window.innerHeight * 0.4; // Show button earlier

        const shouldBeVisible = window.scrollY > scrollThreshold;
        const isVisible = ELEMENTS.scrollTopButton.style.opacity === '1'; // Check opacity for visibility state

        if (shouldBeVisible && !isVisible) {
            ELEMENTS.scrollTopButton.style.display = 'flex';
            gsap?.to(ELEMENTS.scrollTopButton, { opacity: 1, scale: 1, duration: 0.3, ease: 'power1.out' }) || (ELEMENTS.scrollTopButton.style.opacity = '1'); // Fallback
        } else if (!shouldBeVisible && isVisible) {
            if (typeof gsap !== 'undefined') {
                gsap.to(ELEMENTS.scrollTopButton, {
                    opacity: 0,
                    scale: 0.8,
                    duration: 0.3,
                    ease: 'power1.in',
                    onComplete: () => { if (window.scrollY <= scrollThreshold) ELEMENTS.scrollTopButton.style.display = 'none'; }
                });
            } else {
                ELEMENTS.scrollTopButton.style.opacity = '0';
                ELEMENTS.scrollTopButton.style.display = 'none';
            }
        }
    }, 200); // Throttle scroll checks for this button

    /**
     * Scrolls the page to the top smoothly or instantly based on motion preference.
     */
    const scrollToTop = () => {
        ELEMENTS.html?.scrollTo({ // Scroll on html element for better compatibility
            top: 0,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
    };

    /**
     * Handles the custom cursor movement and interactions if enabled.
     */
    const handleCustomCursor = () => {
        if (!FEATURE_FLAGS.enableCustomCursor || !ELEMENTS.customCursor || prefersReducedMotion || typeof gsap === 'undefined') {
            ELEMENTS.customCursor?.remove(); // Remove element if not used
            return;
        }

        ELEMENTS.body?.classList.add('cursor-ready');

        const xTo = gsap.quickTo(ELEMENTS.customCursor, "x", { duration: 0.4, ease: "power2.out" });
        const yTo = gsap.quickTo(ELEMENTS.customCursor, "y", { duration: 0.4, ease: "power2.out" });

        const moveCursor = (e) => {
            xTo(e.clientX);
            yTo(e.clientY);
        };

        const addClickEffect = () => ELEMENTS.customCursor.classList.add('click');
        const removeClickEffect = () => ELEMENTS.customCursor.classList.remove('click');

        const addHoverEffect = () => ELEMENTS.customCursor.classList.add('hover');
        const removeHoverEffect = () => ELEMENTS.customCursor.classList.remove('hover');

        window.addEventListener('mousemove', moveCursor, { passive: true });
        document.addEventListener('mousedown', addClickEffect);
        document.addEventListener('mouseup', removeClickEffect);

        // Add hover effect for interactive elements using event delegation on body
         const interactiveSelector = 'a, button, .service, .gallery-item, .testimonial, .card-hover, .event-card, .timeline-item, .social-links a, .floating-action-button, .hamburger, input, textarea, select, [role="button"], [tabindex="0"]';
         ELEMENTS.body.addEventListener('mouseover', (e) => {
             if (e.target.closest(interactiveSelector)) {
                 addHoverEffect();
             } else {
                 removeHoverEffect(); // Ensure hover removed if moving off target quickly
             }
         });
         ELEMENTS.body.addEventListener('mouseout', (e) => {
             if (e.target.closest(interactiveSelector)) {
                 removeHoverEffect();
             }
         });

         // Hide cursor when leaving the window
         document.addEventListener('mouseleave', () => {
            gsap.to(ELEMENTS.customCursor, { opacity: 0, duration: 0.2 });
         });
         document.addEventListener('mouseenter', () => {
            gsap.to(ELEMENTS.customCursor, { opacity: 1, duration: 0.2 });
         });
    };

    /**
     * Handles the mobile navigation toggle, closing, and accessibility (inert).
     */
    const handleMobileNav = () => {
        if (!ELEMENTS.hamburgerButton || !ELEMENTS.mobileNav) return;

        const mainContent = ELEMENTS.mainContent; // Use cached element
        const footerContent = ELEMENTS.footer;

        const toggleNav = (forceClose = false) => {
             const isActive = ELEMENTS.body.classList.contains('nav-active');
             const openNav = !isActive && !forceClose; // Open if not active and not forced close

            ELEMENTS.body.classList.toggle('nav-active', openNav);
            ELEMENTS.hamburgerButton.classList.toggle('is-active', openNav);
            ELEMENTS.hamburgerButton.setAttribute('aria-expanded', String(openNav));
            ELEMENTS.mobileNav.setAttribute('aria-hidden', String(!openNav));

            if (openNav) {
                 mainContent?.setAttribute('inert', '');
                 footerContent?.setAttribute('inert', '');
                // Focus first focusable item in nav
                 const firstFocusable = selectElement('a[href], button', ELEMENTS.mobileNav) || ELEMENTS.mobileNav;
                 setTimeout(() => firstFocusable.focus(), 100); // Delay focus slightly
            } else {
                 mainContent?.removeAttribute('inert');
                 footerContent?.removeAttribute('inert');
                 ELEMENTS.hamburgerButton.focus(); // Return focus to toggle button
            }
        };

        ELEMENTS.hamburgerButton.addEventListener('click', () => toggleNav());

        // Close nav when a link is clicked
        ELEMENTS.mobileNav.addEventListener('click', (event) => {
            if (event.target.closest('a')) {
                 toggleNav(true); // Force close
            }
        });

        // Close nav on Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && ELEMENTS.body.classList.contains('nav-active')) {
                 toggleNav(true); // Force close
            }
        });

        // Close nav on click outside (on the overlay)
        document.addEventListener('click', (event) => {
            if (ELEMENTS.body.classList.contains('nav-active') &&
                !ELEMENTS.mobileNav.contains(event.target) &&
                event.target !== ELEMENTS.hamburgerButton && // Check it wasn't the button itself
                !ELEMENTS.hamburgerButton.contains(event.target) // Check it wasn't inside the button
            ) {
                 toggleNav(true); // Force close
            }
        });
    };

    /**
     * Handles the scrollspy functionality to highlight active nav link. Throttled.
     */
    const handleScrollspy = throttle(() => {
        if (ELEMENTS.navLinks.length === 0) return;

        let currentSectionId = null;
        const scrollPosition = window.scrollY + headerHeight + 60; // Adjusted offset
        const sections = selectElements('main section[id]'); // Get sections dynamically

        sections.forEach(section => {
            // Basic visibility check before offset calculation
             const rect = section.getBoundingClientRect();
             const isPotentiallyVisible = rect.top < window.innerHeight && rect.bottom >= 0;

            if (isPotentiallyVisible) {
                 const sectionTop = section.offsetTop;
                 const sectionHeight = section.offsetHeight;
                 if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                     currentSectionId = section.id;
                 }
            }
        });

        // Refined Fallbacks
        if (!currentSectionId) {
            if (window.scrollY < window.innerHeight * 0.2) { // Near top
                currentSectionId = 'home';
            } else if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) { // Near bottom
                const lastSection = sections[sections.length - 1];
                if (lastSection) currentSectionId = lastSection.id; // Assume last section is the target near bottom
            }
        }

        // Update nav link styles
        ELEMENTS.navLinks.forEach(link => {
            // Ensure href exists and is a valid ID selector
             const href = link.getAttribute('href');
             if (!href || !href.startsWith('#') || href.length === 1) return;

             const linkSectionId = href.substring(1);
             const isActive = linkSectionId === currentSectionId;

             link.classList.toggle('active', isActive);
             if (isActive) {
                link.setAttribute('aria-current', 'section');
             } else {
                link.removeAttribute('aria-current');
             }
        });
    }, CONFIG.SCROLLSPY_THROTTLE_MS);


    /**
     * Shows the sticky note after a delay using GSAP, if enabled.
     */
    const showStickyNote = () => {
        if (!FEATURE_FLAGS.enableStickyNote || !ELEMENTS.stickyNote || typeof gsap === 'undefined' || prefersReducedMotion) return;

        setTimeout(() => {
            ELEMENTS.stickyNote.style.display = 'flex';
            gsap.fromTo(ELEMENTS.stickyNote,
                { opacity: 0, scale: 0.8, rotation: -15 },
                { opacity: 1, scale: 1, rotation: -4, duration: 0.6, ease: 'back.out(1.7)' }
            );

            ELEMENTS.stickyNoteClose?.addEventListener('click', () => {
                gsap.to(ELEMENTS.stickyNote, {
                    opacity: 0, scale: 0.7, rotation: 15, duration: 0.4, ease: 'power1.in',
                    onComplete: () => ELEMENTS.stickyNote.style.display = 'none'
                });
            }, { once: true }); // Ensure listener only fires once

        }, CONFIG.STICKY_NOTE_DELAY_MS);
    };

    /**
     * Shows the chat bubble after a delay using GSAP, if enabled.
     */
    const showChatBubble = () => {
        if (!FEATURE_FLAGS.enableChatBubble || !ELEMENTS.chatBubble || typeof gsap === 'undefined' || prefersReducedMotion) return;

        setTimeout(() => {
            ELEMENTS.chatBubble.style.display = 'flex';
            gsap.fromTo(ELEMENTS.chatBubble,
                 { opacity: 0, x: 60 },
                 { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }
            );

            ELEMENTS.chatBubble.addEventListener('click', () => {
                alert('Live chat functionality coming soon!'); // Placeholder
                // Optionally hide after click
                gsap.to(ELEMENTS.chatBubble, {
                     opacity: 0, x: 60, duration: 0.3,
                     onComplete: () => ELEMENTS.chatBubble.style.display = 'none'
                });
            }, { once: true }); // Interact once

        }, CONFIG.CHAT_BUBBLE_DELAY_MS);
    };

    /**
     * Handles the confetti easter egg if enabled and library is available.
     */
    const handleEasterEgg = () => {
        if (!FEATURE_FLAGS.enableEasterEgg || !ELEMENTS.easterEggTrigger || typeof confetti === 'undefined' || prefersReducedMotion) return;

        ELEMENTS.easterEggTrigger.addEventListener('click', () => {
            const duration = 4 * 1000; // 4 seconds
            const animationEnd = Date.now() + duration;
            const colors = ['#00a000', '#4CAF50', '#ffdd00', '#ffffff', '#dddddd']; // Sysfx colors + white/grey

            // Get a high z-index dynamically or use a fixed high value
             const zIndex = parseInt(getComputedStyle(ELEMENTS.html).getPropertyValue('--z-modal-content'), 10) + 50 || 1500;

            const randomInRange = (min, max) => Math.random() * (max - min) + min;

            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);

                const particleCount = 40 * (timeLeft / duration);
                // Launch confetti from multiple points
                confetti({
                    startVelocity: 30,
                    spread: 360,
                    ticks: 60,
                    zIndex: zIndex,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
                    colors: colors
                });
            }, 200);

             logInfo("Easter egg triggered!");
        });
    };

    /**
     * Basic form validation with improved feedback.
     * @returns {boolean} - True if the form is valid, false otherwise.
     */
    const validateForm = () => {
        if (!ELEMENTS.form) return true; // No form, valid by default

        let isValid = true;
        const requiredFields = selectElements('[required]', ELEMENTS.form);

        // Clear previous errors
        selectElements('.form-group .form-error', ELEMENTS.form).forEach(el => el.textContent = '');
        selectElements('.form-input.invalid, .form-textarea.invalid', ELEMENTS.form).forEach(el => el.classList.remove('invalid'));

        requiredFields.forEach(input => {
            const group = input.closest('.form-group');
            if (!group) return; // Skip if structure is unexpected

            const errorElement = selectElement('.form-error', group);
            let errorMessage = '';

            // Check specific types
            if (input.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!input.value.trim() || !emailRegex.test(input.value.trim())) {
                    errorMessage = 'Please enter a valid email address.';
                }
            } else if (input.type === 'checkbox') {
                if (!input.checked) {
                    errorMessage = 'Please confirm this field is checked.';
                }
            } else if (input.value.trim() === '') { // General check for text, textarea, etc.
                 errorMessage = 'This field is required.';
            }

            if (errorMessage) {
                isValid = false;
                input.classList.add('invalid');
                if (errorElement) errorElement.textContent = errorMessage;
                 // Optionally focus the first invalid field
                 // if (isValid === false && !document.querySelector('.form-input.invalid:focus')) {
                 //     input.focus();
                 // }
            }
        });

        return isValid;
    };

    /**
      * Handles form submission using Fetch API (e.g., for Formspree).
      */
    const handleFormSubmission = () => {
        if (!FEATURE_FLAGS.enableFormspree || !ELEMENTS.form) return;
        if (!ELEMENTS.form.action || !ELEMENTS.form.action.includes('formspree.io')) {
            logWarn('Form action is not set or does not point to Formspree. Submission disabled.');
            return;
        }

        ELEMENTS.form.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (!validateForm()) {
                updateFormStatus('Please check the errors above.', 'error');
                return;
            }

            const formData = new FormData(ELEMENTS.form);
            const submitButton = selectElement('button[type="submit"]', ELEMENTS.form);
            const originalButtonContent = submitButton?.innerHTML;

            // Set loading state
            updateFormStatus('Sending message...', 'loading');
            if (submitButton) {
                 submitButton.disabled = true;
                 submitButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending...';
            }

            try {
                const response = await fetch(ELEMENTS.form.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    updateFormStatus('Message sent successfully! We\'ll be in touch.', 'success');
                    ELEMENTS.form.reset();
                     setTimeout(() => updateFormStatus('', 'idle'), CONFIG.FORM_STATUS_TIMEOUT_MS); // Clear status after delay
                } else {
                    // Try to parse Formspree error response
                    const data = await response.json().catch(() => ({})); // Default empty object if JSON parse fails
                     let errorMsg = 'Submission failed. Please try again.'; // Default server error
                     if (data && data.errors && data.errors.length > 0) {
                         // Extract Formspree specific error message
                         errorMsg = data.errors.map(err => err.message || String(err)).join('. ');
                     } else if (response.statusText) {
                         errorMsg = `Submission failed: ${response.statusText} (Code: ${response.status})`;
                     }
                    throw new Error(errorMsg);
                }
            } catch (error) {
                logError('Form submission error', error);
                updateFormStatus(`Error: ${error.message || 'Could not send message.'}`, 'error');
                 // Optionally leave error message visible longer or indefinitely
                 // setTimeout(() => updateFormStatus('', 'idle'), CONFIG.FORM_STATUS_TIMEOUT_MS * 2);
            } finally {
                // Reset button state
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonContent;
                }
            }
        });
    };

    /**
     * Updates the form status message area.
     * @param {string} message - The message to display.
     * @param {'idle'|'loading'|'success'|'error'} state - The current state.
     */
    const updateFormStatus = (message, state = 'idle') => {
        if (!ELEMENTS.formStatus) return;

        ELEMENTS.formStatus.textContent = message;
        ELEMENTS.formStatus.className = `form-status ${state}`; // Use state for class styling
        ELEMENTS.formStatus.style.display = (state === 'idle' || !message) ? 'none' : 'block'; // Hide if idle or no message

        // Set ARIA live region attributes
        if (state === 'error' || state === 'success') {
            ELEMENTS.formStatus.setAttribute('role', 'alert');
            ELEMENTS.formStatus.setAttribute('aria-live', 'assertive');
        } else {
            ELEMENTS.formStatus.setAttribute('role', 'status');
            ELEMENTS.formStatus.setAttribute('aria-live', 'polite');
        }
    };

    /**
     * Hides the preloader smoothly when the window finishes loading.
     */
    const hidePreloader = () => {
        if (!ELEMENTS.preloader) {
            ELEMENTS.body?.classList.remove('preload'); // Ensure body is visible even if preloader missing
            logWarn("Preloader element not found, cannot hide smoothly.");
            return;
        }

        const removePreloader = () => {
            ELEMENTS.preloader.remove(); // Remove from DOM entirely
            ELEMENTS.body?.classList.remove('preload');
            logInfo("Preloader removed.");
        };

        // Fallback timeout: If window.load doesn't fire or takes too long
        const fallbackTimeout = setTimeout(() => {
            logWarn("Preloader fallback timeout reached. Forcing removal.");
             removePreloader();
        }, CONFIG.PRELOADER_TIMEOUT_MS);


        // Primary method: Wait for window load event
        window.addEventListener('load', () => {
            clearTimeout(fallbackTimeout); // Clear fallback if load event fires

            // Use GSAP for fade if available and no reduced motion
            if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
                gsap.to(ELEMENTS.preloader, {
                    opacity: 0,
                    duration: 0.6,
                    ease: 'power1.inOut',
                    onComplete: removePreloader
                });
            } else {
                // Fallback to CSS transition or immediate removal
                ELEMENTS.preloader.style.transition = 'opacity 0.5s ease-out';
                ELEMENTS.preloader.style.opacity = '0';
                // Use transitionend for smoother removal
                ELEMENTS.preloader.addEventListener('transitionend', removePreloader, { once: true });
                // Safety net if transitionend doesn't fire
                setTimeout(removePreloader, 600);
            }
        });
    };


    // --- Initialization Function ---
    const initialize = () => {
        logInfo("Initializing SysFX Script...");

        // Run preloader hiding logic immediately (it waits for window.load)
        hidePreloader();

        // Initial setup that doesn't depend on external libraries or complex DOM
        initializeDarkMode();
        adjustLayoutPadding(); // Initial call
        displayTime();
        setInterval(displayTime, 60000); // Update time every minute
        displayTechTrivia(); // Display initial trivia
        handleMobileNav();
        handleScrollTopButton(); // Initial visibility check
        handleModals();
        handleLightbox();
        handleTestimonialCarousel();

        // Initialize features that might depend on libraries or need slight delay
        requestAnimationFrame(() => {
            initializeParticles();
            initializeMap(); // Map might need DOM ready for dimensions
            if (FEATURE_FLAGS.enableFormspree) handleFormSubmission();

            // Start animations after main content is likely painted
            if (!prefersReducedMotion) {
                 typeEffectHandler(); // Start typing animation
                 animateStats();    // Set up stats animations
                 revealSections(); // Set up section reveal animations
                 if(FEATURE_FLAGS.enableCustomCursor) handleCustomCursor();
                 if(FEATURE_FLAGS.enableStickyNote) showStickyNote();
                 if(FEATURE_FLAGS.enableChatBubble) showChatBubble();
                 if(FEATURE_FLAGS.enableEasterEgg) handleEasterEgg();
            } else {
                 // Apply final states directly if reduced motion
                 ELEMENTS.animatedSections?.forEach(s => { s.style.opacity = '1'; s.style.transform = 'none'; });
                 ELEMENTS.footer?.classList.add('visible');
                 ELEMENTS.statsNumbers?.forEach(n => n.textContent = parseInt(n.dataset.target || '0').toLocaleString());
                 if (ELEMENTS.typingEffectElement && CONFIG.TAGLINES.length > 0) ELEMENTS.typingEffectElement.textContent = CONFIG.TAGLINES[0];
            }
        });


        // Initial Scrollspy Call after potential layout shifts
        setTimeout(handleScrollspy, 200);

        logInfo("SysFX Script Initialized.");
    };


    // --- Global Event Listeners ---
    ELEMENTS.darkModeToggle?.addEventListener('click', toggleDarkMode);
    if(FEATURE_FLAGS.enableBackgroundMusic) ELEMENTS.musicToggle?.addEventListener('click', toggleMusic);
    ELEMENTS.scrollTopButton?.addEventListener('click', scrollToTop);

    // Throttled and Debounced Listeners
    window.addEventListener('scroll', () => {
        updateScrollProgress();
        handleScrollspy();
        handleScrollTopButton();
        handleHeaderShrink(); // Add header shrink handler
    }, { passive: true }); // Use passive listener for scroll performance

    window.addEventListener('resize', () => {
        adjustLayoutPadding(); // Use the debounced version defined earlier
        handleScrollspy(); // Re-check scrollspy immediately on resize finish
    });

    // Skip Link Focus Handling
    ELEMENTS.skipLink?.addEventListener('focus', () => ELEMENTS.skipLink.style.left = '0');
    ELEMENTS.skipLink?.addEventListener('blur', () => ELEMENTS.skipLink.style.left = '-999px');


    // --- Start Initialization ---
    // Ensure body exists before running anything complex
    if (ELEMENTS.body) {
        initialize();
    } else {
        console.error("FATAL: Body element not found. SysFX script cannot initialize.");
        // Attempt to hide preloader anyway as a last resort
        const preloader = document.getElementById('preloader');
        if (preloader) {
            window.addEventListener('load', () => preloader.remove());
            setTimeout(() => preloader?.remove(), CONFIG.PRELOADER_TIMEOUT_MS);
        }
    }

}); // End DOMContentLoaded
