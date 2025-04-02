/**
 * SysFX Website Script
 * Version: 1.5 (SyntaxError Fix)
 * Author: sysfx (Revised by AI Assistant)
 *
 * Features:
 * - Dark Mode Toggle & Persistence
 * - Mobile Navigation Handling
 * - Dynamic Header Padding Adjustment
 * - Smooth Scrolling & Scrollspy
 * - Typing Effect
 * - Particles.js Background
 * - Leaflet Map Integration
 * - Service Modals
 * - Gallery Lightbox
 * - Testimonial Carousel (Fade)
 * - Stats Counter Animation (GSAP)
 * - Section Reveal Animations (GSAP)
 * - Footer Reveal Animation (GSAP)
 * - Current Time Display
 * - Tech Trivia Fetch
 * - Background Music Toggle
 * - Custom Cursor Logic
 * - Scroll Progress Bar
 * - Sticky Note & Chat Bubble Logic
 * - Easter Egg (Confetti)
 * - Preloader Hiding
 * - Form Validation & Submission
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // --- Globals & Configuration ---
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const CONFIG = {
        SCROLLSPY_THROTTLE_MS: 100,
        RESIZE_DEBOUNCE_MS: 250,
        TYPING_SPEED_MS: 100,
        TYPING_DELETE_SPEED_MS: 50,
        TYPING_PAUSE_MS: 2000,
        CAROUSEL_INTERVAL_MS: 5000,
        STICKY_NOTE_DELAY_MS: 8000,
        CHAT_BUBBLE_DELAY_MS: 12000,
        TAGLINES: [
            "Your Partner in Tech Solutions.",
            "Expert Computer Repair Services.",
            "Robust Cybersecurity Solutions.",
            "Custom Web Development.",
            "Reliable Networking & IT Support.",
            "Serving Clinton, CT and Beyond."
        ],
        TECH_TRIVIA_URL: 'https://opentdb.com/api.php?amount=1&category=18&type=multiple' // Example API
    };

    // --- Element Selectors Cache ---
    const ELEMENTS = {
        html: document.documentElement, // Added html element
        body: document.body,
        preloader: document.getElementById('preloader'),
        header: document.getElementById('main-header'),
        darkModeToggle: document.getElementById('darkModeToggle'),
        hamburgerButton: document.getElementById('hamburger-button'),
        mobileNav: document.getElementById('main-navigation'),
        navLinks: document.querySelectorAll('.nav-link'),
        scrollProgress: document.querySelector('.scroll-progress'),
        currentTimeDisplay: document.getElementById('current-time'),
        typingEffectElement: document.getElementById('typing-effect'),
        mapElement: document.getElementById('map'),
        serviceCards: document.querySelectorAll('.service[data-modal-target]'),
        modalContainer: document.querySelector('.modal-container'),
        modals: document.querySelectorAll('.modal'),
        galleryItems: document.querySelectorAll('.gallery-item'),
        lightbox: document.getElementById('lightbox'),
        lightboxImage: document.querySelector('.lightbox-image'),
        lightboxClose: document.querySelector('.lightbox-close'),
        testimonialSlider: document.querySelector('.testimonial-slider'),
        testimonials: document.querySelectorAll('.testimonial'),
        carouselPrev: document.querySelector('.carousel-prev'),
        carouselNext: document.querySelector('.carousel-next'),
        statsNumbers: document.querySelectorAll('.stat-number[data-target]'),
        animatedSections: document.querySelectorAll('.section-animation'),
        footer: document.querySelector('.main-footer'),
        triviaTextElement: document.getElementById('trivia-text'),
        musicToggle: document.getElementById('music-toggle'),
        backgroundMusic: document.getElementById('background-music'),
        scrollTopButton: document.getElementById('scroll-top-button'),
        stickyNote: document.getElementById('sticky-note'),
        chatBubble: document.getElementById('chat-bubble'),
        easterEggTrigger: document.querySelector('.easter-egg-trigger'),
        customCursor: document.querySelector('.cursor'),
        form: document.querySelector('.contact-form'),
        formStatus: document.getElementById('form-status'),
        skipLink: document.querySelector('.skip-link')
    };

    // --- State Variables ---
    let headerHeight = ELEMENTS.header?.offsetHeight || 0;
    let currentTypingIndex = 0;
    let currentTaglineIndex = 0;
    let isTyping = false;
    let currentTestimonialIndex = 0;
    let testimonialInterval;
    let musicPlaying = false;
    let mapInstance = null;
    let particlesInstance = null;

    // --- Utility Functions ---
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    const throttle = (func, limit) => {
        let inThrottle;
        return function executedFunction(...args) {
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    // --- Core Functions ---

    /**
     * Initializes Dark Mode based on localStorage or system preference.
     */
    const initializeDarkMode = () => {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            ELEMENTS.body.classList.add('dark-mode');
            updateDarkModeButton(true);
        } else {
            ELEMENTS.body.classList.remove('dark-mode');
            updateDarkModeButton(false);
        }
        // Add transition class after initial load to prevent flash
        setTimeout(() => ELEMENTS.body.classList.add('theme-transitions-active'), 100);
    };

    /**
     * Updates the Dark Mode toggle button's appearance.
     * @param {boolean} isDarkMode - Whether dark mode is active.
     */
    const updateDarkModeButton = (isDarkMode) => {
        if (!ELEMENTS.darkModeToggle) return;
        const icon = ELEMENTS.darkModeToggle.querySelector('i');
        const text = ELEMENTS.darkModeToggle.querySelector('.mode-button-text');
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
        const isDark = ELEMENTS.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateDarkModeButton(isDark);
        // Re-initialize map marker if map exists
        if (mapInstance) {
            initializeMapMarker(); // Update marker color
        }
         // Update Particles.js colors (requires custom config or reinit)
        // ReInitializeParticles(); // Uncomment if particles need theme update
    };

    /**
     * Adjusts body padding-top based on the header's actual height.
     */
    const adjustBodyPadding = () => {
        headerHeight = ELEMENTS.header?.offsetHeight || 0;
        ELEMENTS.body.style.paddingTop = `${headerHeight}px`;
        ELEMENTS.html.style.scrollPaddingTop = `${headerHeight + 10}px`; // Update scroll padding too
    };

    /**
     * Updates the scroll progress bar width.
     */
    const updateScrollProgress = () => {
        if (!ELEMENTS.scrollProgress) return;
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        // Prevent division by zero if scrollableHeight is 0
        const scrolled = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
        ELEMENTS.scrollProgress.style.width = `${Math.min(scrolled, 100)}%`;
    };

    /**
     * Displays the current time.
     */
    const displayTime = () => {
        if (!ELEMENTS.currentTimeDisplay) return;
        const now = new Date();
        const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: true };
        const optionsDate = { weekday: 'short', month: 'short', day: 'numeric' };
        const timeString = now.toLocaleTimeString('en-US', optionsTime);
        const dateString = now.toLocaleDateString('en-US', optionsDate);
        ELEMENTS.currentTimeDisplay.innerHTML = `<i class="far fa-calendar-alt"></i> ${dateString}   <i class="far fa-clock"></i> ${timeString}`;
    };

    /**
     * Handles the typing and deleting effect for taglines.
     */
    const typeEffectHandler = async () => {
        if (!ELEMENTS.typingEffectElement || isTyping || prefersReducedMotion) {
            // If reduced motion, just set the first tagline
            if (prefersReducedMotion && ELEMENTS.typingEffectElement) {
                ELEMENTS.typingEffectElement.textContent = CONFIG.TAGLINES[0];
            }
            return;
        };
        isTyping = true;
        const currentText = CONFIG.TAGLINES[currentTaglineIndex];

        // Typing
        for (let i = 0; i <= currentText.length; i++) {
            ELEMENTS.typingEffectElement.textContent = currentText.substring(0, i);
            await new Promise(resolve => setTimeout(resolve, CONFIG.TYPING_SPEED_MS));
        }

        // Pause
        await new Promise(resolve => setTimeout(resolve, CONFIG.TYPING_PAUSE_MS));

        // Deleting
        for (let i = currentText.length; i >= 0; i--) {
            ELEMENTS.typingEffectElement.textContent = currentText.substring(0, i);
            await new Promise(resolve => setTimeout(resolve, CONFIG.TYPING_DELETE_SPEED_MS));
        }

         // Pause before next line
        await new Promise(resolve => setTimeout(resolve, CONFIG.TYPING_DELETE_SPEED_MS * 2));


        currentTaglineIndex = (currentTaglineIndex + 1) % CONFIG.TAGLINES.length;
        isTyping = false;
        requestAnimationFrame(typeEffectHandler); // Loop
    };

    /**
     * Initializes the Particles.js background.
     */
    const initializeParticles = () => {
        if (prefersReducedMotion || typeof particlesJS === 'undefined' || !document.getElementById('particles-js')) {
             console.warn('ParticlesJS skipped due to reduced motion or missing library/element.');
             const particlesContainer = document.getElementById('particles-js');
             if(particlesContainer) particlesContainer.style.display = 'none';
            return;
        }
        try {
             // Define configurations for light and dark modes
            const lightModeConfig = {
                particles: {
                    number: { value: 80, density: { enable: true, value_area: 800 } },
                    color: { value: "#00a000" }, // Primary color
                    shape: { type: "circle" },
                    opacity: { value: 0.4, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
                    size: { value: 3, random: true, anim: { enable: false } },
                    line_linked: { enable: true, distance: 150, color: "#cccccc", opacity: 0.4, width: 1 }, // Lighter links
                    move: { enable: true, speed: 2, direction: "none", random: false, straight: false, out_mode: "out", bounce: false }
                },
                interactivity: {
                    detect_on: "canvas",
                    events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" }, resize: true },
                    modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } }
                },
                retina_detect: true
            };
            const darkModeConfig = { // Slightly different config for dark mode
                 particles: {
                    number: { value: 100, density: { enable: true, value_area: 800 } },
                    color: { value: "#4CAF50" }, // Secondary color
                    shape: { type: "circle" },
                    opacity: { value: 0.5, random: true, anim: { enable: true, speed: 0.8, opacity_min: 0.15, sync: false } },
                    size: { value: 3.5, random: true, anim: { enable: false } },
                    line_linked: { enable: true, distance: 130, color: "#444444", opacity: 0.6, width: 1 }, // Darker links
                    move: { enable: true, speed: 1.5, direction: "none", random: true, straight: false, out_mode: "out", bounce: false }
                },
                 interactivity: {
                    detect_on: "canvas",
                    events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "bubble" }, resize: true }, // Different modes
                    modes: { grab: { distance: 140, line_opacity: 1 }, bubble: { distance: 200, size: 6, duration: 0.3 }, repulse: { distance: 100 }, push: { particles_nb: 4 } }
                },
                retina_detect: true
            };

            const currentConfig = ELEMENTS.body.classList.contains('dark-mode') ? darkModeConfig : lightModeConfig;
            particlesJS('particles-js', currentConfig);
        } catch(error) {
             console.error("Error initializing particles.js:", error);
             const particlesContainer = document.getElementById('particles-js');
             if(particlesContainer) particlesContainer.style.display = 'none';
        }
    };
     // Function to potentially re-initialize particles on theme change (use carefully)
    // const ReInitializeParticles = () => {
    //     const pjsContainer = document.querySelector('.particles-js-canvas-el')?.parentElement;
    //     if (pjsContainer && typeof pJSDom !== 'undefined' && pJSDom.length > 0) {
    //         pJSDom[0].pJS.fn.vendors.destroypJS(); // Destroy existing instance
    //         pJSDom.splice(0, 1); // Remove from internal array
    //     }
    //     initializeParticles(); // Re-initialize with new theme config
    // };


    /**
     * Initializes the Leaflet map.
     */
    const initializeMap = () => {
        if (typeof L === 'undefined' || !ELEMENTS.mapElement) {
             console.warn('Leaflet library or map element not found.');
             if(ELEMENTS.mapElement) ELEMENTS.mapElement.innerHTML = '<p>Map could not be loaded.</p>';
             return;
        }
        try {
            mapInstance = L.map(ELEMENTS.mapElement, {
                scrollWheelZoom: false // Disable scroll wheel zoom initially
            }).setView([41.2793, -72.4310], 14); // Approx Clinton, CT coordinates & zoom

            // Add click listener to enable scroll wheel zoom
            mapInstance.on('click', () => {
                if(mapInstance) mapInstance.scrollWheelZoom.enable();
            });
            // Add blur listener to disable again when map loses focus
            mapInstance.on('blur', () => {
                 if(mapInstance) mapInstance.scrollWheelZoom.disable();
            });


            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 18, // Standard max zoom
                minZoom: 5   // Prevent zooming out too far
            }).addTo(mapInstance);

            initializeMapMarker(); // Add the marker

        } catch (error) {
            console.error("Error initializing Leaflet map:", error);
            ELEMENTS.mapElement.innerHTML = '<p>Map could not be loaded due to an error.</p>';
        }
    };

    /**
      * Creates and adds/updates the map marker based on the current theme.
      */
    const initializeMapMarker = () => {
        if (!mapInstance || typeof L === 'undefined') return;

        // Remove existing marker layer if present
        mapInstance.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                mapInstance.removeLayer(layer);
            }
        });

         const isDark = ELEMENTS.body.classList.contains('dark-mode');
         // Get computed styles for colors
         const computedStyle = getComputedStyle(ELEMENTS.body);
         const markerColor = computedStyle.getPropertyValue(isDark ? '--secondary-color' : '--primary-color').trim();
         const borderColor = computedStyle.getPropertyValue(isDark ? '--text-dark' : '--text-light').trim(); // Ensure trim
         const pulseColor = isDark ? 'rgba(76, 175, 80, 0.5)' : 'rgba(0, 160, 0, 0.5)';
         const pulseEndColor = isDark ? 'rgba(76, 175, 80, 0)' : 'rgba(0, 160, 0, 0)';

        // Create a custom pulsing marker with DivIcon
         const pulsingIcon = L.divIcon({
             className: 'custom-map-marker', // Can add custom CSS rules for this class
             // Inject styles directly - safer than relying on global CSS for dynamic parts
             html: `<div style="
                        background-color: ${markerColor};
                        width: 18px;
                        height: 18px;
                        border-radius: 50%;
                        border: 3px solid ${borderColor};
                        box-shadow: 0 0 0 ${pulseColor};
                        animation: pulse 2s infinite;
                     "></div>
                     <style>
                        @keyframes pulse {
                            0% { box-shadow: 0 0 0 0 ${pulseColor}; }
                            70% { box-shadow: 0 0 0 15px ${pulseEndColor}; }
                            100% { box-shadow: 0 0 0 0 ${pulseEndColor}; }
                        }
                     </style>`,
             iconSize: [24, 24],
             iconAnchor: [12, 12],
             popupAnchor: [0, -15]
         });


        L.marker([41.2793, -72.4310], { icon: pulsingIcon })
            .addTo(mapInstance)
            .bindPopup("<b>sysfx HQ</b><br>123 Main Street<br>Clinton, CT 06413");
            // Optionally open popup by default: .openPopup();
    };


    /**
     * Handles opening and closing modals.
     */
    const handleModals = () => {
        ELEMENTS.serviceCards?.forEach(card => {
            card.addEventListener('click', () => {
                const modalId = card.getAttribute('data-modal-target');
                const modal = document.getElementById(modalId);
                openModal(modal);
            });
             // Add keyboard accessibility
            card.addEventListener('keydown', (e) => {
                 if (e.key === 'Enter' || e.key === ' ') {
                     e.preventDefault(); // Prevent space bar scrolling
                     const modalId = card.getAttribute('data-modal-target');
                     const modal = document.getElementById(modalId);
                     openModal(modal);
                 }
            });
        });

        ELEMENTS.modals?.forEach(modal => {
            const closeButton = modal.querySelector('.modal-close');
            // Close on close button click
            closeButton?.addEventListener('click', () => closeModal(modal));
            // Close on backdrop click
            modal.addEventListener('click', (event) => {
                // Check if the direct target of the click is the modal backdrop itself
                if (event.target === modal) {
                    closeModal(modal);
                }
            });
        });

        // Close modal on Escape key press
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    closeModal(activeModal);
                }
            }
        });
    };

     /**
     * Opens a specific modal.
     * @param {HTMLElement | null} modal - The modal element to open.
     */
     const openModal = (modal) => {
        if (!modal) return;
        // Lazy load modal content here if implemented
        modal.style.display = 'flex'; // Set display before adding class for transition
        requestAnimationFrame(() => { // Allow display change to paint
            modal.classList.add('active');
            ELEMENTS.body.classList.add('no-scroll'); // Prevent background scroll
            modal.setAttribute('aria-hidden', 'false');
            // Focus management: focus the close button or the modal content wrapper
             const focusableElement = modal.querySelector('.modal-close') || modal.querySelector('.modal-content');
             setTimeout(() => focusableElement?.focus(), 50); // Delay focus slightly for transition
        });
     };

     /**
      * Closes a specific modal.
      * @param {HTMLElement | null} modal - The modal element to close.
      */
     const closeModal = (modal) => {
        if (!modal || !modal.classList.contains('active')) return;

        modal.classList.remove('active');
        ELEMENTS.body.classList.remove('no-scroll');
        modal.setAttribute('aria-hidden', 'true');

        // Wait for opacity transition to finish before setting display: none
        modal.addEventListener('transitionend', () => {
             if (!modal.classList.contains('active')) { // Check again in case reopened quickly
                 modal.style.display = 'none';
             }
        }, { once: true }); // Remove listener after it runs once

        // Fallback timeout if transitionend doesn't fire reliably
         setTimeout(() => {
             if (!modal.classList.contains('active')) {
                 modal.style.display = 'none';
             }
         }, 500); // Adjust timeout based on CSS transition duration


        // Optional: return focus to the element that opened the modal (requires tracking)
     };


    /**
     * Handles opening the gallery lightbox.
     */
    const handleLightbox = () => {
        if (!ELEMENTS.lightbox || !ELEMENTS.lightboxImage || !ELEMENTS.lightboxClose) return;

        let currentTarget = null; // To return focus

        ELEMENTS.galleryItems?.forEach(item => {
             item.setAttribute('role', 'button'); // Make it clear it's interactive
             item.setAttribute('tabindex', '0'); // Make it focusable

            item.addEventListener('click', () => {
                currentTarget = item; // Store the clicked item
                const highResSrc = item.getAttribute('data-src');
                const altText = item.getAttribute('data-alt') || item.querySelector('img')?.alt || 'Gallery image';
                if (highResSrc && ELEMENTS.lightbox && ELEMENTS.lightboxImage) {
                    ELEMENTS.lightboxImage.setAttribute('src', highResSrc);
                    ELEMENTS.lightboxImage.setAttribute('alt', altText);
                    ELEMENTS.lightbox.style.display = 'flex'; // Set display before class for transition
                     requestAnimationFrame(() => {
                         ELEMENTS.lightbox.classList.add('active');
                         ELEMENTS.body.classList.add('no-scroll');
                         ELEMENTS.lightbox.setAttribute('aria-hidden', 'false');
                         setTimeout(() => ELEMENTS.lightboxClose.focus(), 50); // Focus close button
                    });
                }
            });
             // Add keyboard accessibility
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                     e.preventDefault();
                     item.click(); // Trigger click handler
                }
            });
        });

        // Close lightbox
        const closeLightboxAction = () => {
            if (!ELEMENTS.lightbox || !ELEMENTS.lightboxImage) return;
             ELEMENTS.lightbox.classList.remove('active');
             ELEMENTS.body.classList.remove('no-scroll');
             ELEMENTS.lightbox.setAttribute('aria-hidden', 'true');

             // Wait for transition before hiding and clearing src
             ELEMENTS.lightbox.addEventListener('transitionend', () => {
                 if (!ELEMENTS.lightbox.classList.contains('active')) {
                     ELEMENTS.lightbox.style.display = 'none';
                     ELEMENTS.lightboxImage.setAttribute('src', ''); // Clear src
                     ELEMENTS.lightboxImage.setAttribute('alt', '');
                     currentTarget?.focus(); // Return focus to the item that opened it
                 }
             }, { once: true });
              // Fallback timeout
             setTimeout(() => {
                 if (!ELEMENTS.lightbox.classList.contains('active')) {
                     ELEMENTS.lightbox.style.display = 'none';
                     ELEMENTS.lightboxImage.setAttribute('src', '');
                     ELEMENTS.lightboxImage.setAttribute('alt', '');
                     currentTarget?.focus();
                 }
             }, 500); // Match transition duration
        };

        ELEMENTS.lightboxClose.addEventListener('click', closeLightboxAction);
        ELEMENTS.lightbox.addEventListener('click', (event) => {
            if (event.target === ELEMENTS.lightbox) { // Click on backdrop
                closeLightboxAction();
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && ELEMENTS.lightbox?.classList.contains('active')) {
                 closeLightboxAction();
            }
        });
    };


    /**
     * Handles the testimonial carousel (fade transition).
     */
    const handleTestimonialCarousel = () => {
        if (!ELEMENTS.testimonialSlider || !ELEMENTS.testimonials || ELEMENTS.testimonials.length === 0) return;

        const totalTestimonials = ELEMENTS.testimonials.length;

        const showTestimonial = (index) => {
             if(index < 0 || index >= totalTestimonials) index = 0; // Safety check
            ELEMENTS.testimonials.forEach((testimonial, i) => {
                testimonial.setAttribute('aria-hidden', i !== index);
                // CSS handles opacity/visibility: .testimonial[aria-hidden="false"] { opacity: 1; ... }
            });
            currentTestimonialIndex = index;
        };

        const nextTestimonial = () => {
            const nextIndex = (currentTestimonialIndex + 1) % totalTestimonials;
            showTestimonial(nextIndex);
        };

        const prevTestimonial = () => {
            const prevIndex = (currentTestimonialIndex - 1 + totalTestimonials) % totalTestimonials;
            showTestimonial(prevIndex);
        };

        // Event Listeners for Controls
        ELEMENTS.carouselNext?.addEventListener('click', () => {
            nextTestimonial();
            resetInterval();
        });
        ELEMENTS.carouselPrev?.addEventListener('click', () => {
            prevTestimonial();
            resetInterval();
        });

        // Keyboard navigation
        ELEMENTS.carouselPrev?.addEventListener('keydown', e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), prevTestimonial(), resetInterval()));
        ELEMENTS.carouselNext?.addEventListener('keydown', e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), nextTestimonial(), resetInterval()));


        // Auto-play
        const startInterval = () => {
            if (testimonialInterval) clearInterval(testimonialInterval); // Clear existing interval
            // Only start interval if not reduced motion
            if (!prefersReducedMotion) {
                 testimonialInterval = setInterval(nextTestimonial, CONFIG.CAROUSEL_INTERVAL_MS);
            }
        };

        const resetInterval = () => {
            clearInterval(testimonialInterval);
            startInterval();
        };

        // Initial setup
        showTestimonial(0); // Show the first testimonial initially
        startInterval(); // Start auto-play

        // Pause on hover/focus
        const container = ELEMENTS.testimonialSlider.parentElement; // Assuming slider is inside container
        container?.addEventListener('mouseenter', () => clearInterval(testimonialInterval));
        container?.addEventListener('mouseleave', startInterval);
        container?.addEventListener('focusin', () => clearInterval(testimonialInterval));
        container?.addEventListener('focusout', startInterval);
    };

    /**
     * Animates the stats numbers using GSAP when they become visible.
     */
    const animateStats = () => {
         if (!ELEMENTS.statsNumbers || typeof gsap === 'undefined') {
              ELEMENTS.statsNumbers?.forEach(num => { // Fallback if GSAP fails
                  num.textContent = parseInt(num.dataset.target || '0').toLocaleString();
              });
             return; // Skip if GSAP not loaded
         }

        ELEMENTS.statsNumbers.forEach(statNum => {
            const target = parseInt(statNum.dataset.target, 10) || 0;

            // Use GSAP ScrollTrigger for triggering
            gsap.from(statNum, {
                textContent: 0,
                duration: prefersReducedMotion ? 0 : 2, // No duration if reduced motion
                ease: "power1.inOut",
                snap: { textContent: 1 },
                scrollTrigger: {
                    trigger: statNum,
                    start: "top 90%", // Trigger when 90% from top enters viewport
                    toggleActions: "play none none none", // Play once
                     onEnter: () => { // Ensure final value is set correctly even with reduced motion
                         statNum.textContent = target.toLocaleString();
                     }
                },
                onUpdate: function() {
                    // Format number with commas during animation
                    if (!prefersReducedMotion) {
                        this.targets()[0].textContent = parseInt(this.targets()[0].textContent).toLocaleString();
                    }
                },
                 onComplete: () => { // Ensure final formatted value on completion
                     statNum.textContent = target.toLocaleString();
                 }
            });
        });
    };

     /**
     * Handles section reveal animations using GSAP and ScrollTrigger.
     */
    const revealSections = () => {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
             console.warn('GSAP or ScrollTrigger not loaded. Skipping reveal animations.');
            ELEMENTS.animatedSections?.forEach(section => section.style.opacity = 1);
            ELEMENTS.footer?.classList.add('visible');
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        ELEMENTS.animatedSections?.forEach((section) => {
            // Use a common class if needed, or animate each section individually
             gsap.to(section, { // Animate TO visible state
                 opacity: 1,
                 y: 0,
                 duration: prefersReducedMotion ? 0 : 0.8,
                 ease: "power2.out",
                 scrollTrigger: {
                     trigger: section,
                     start: "top 85%",
                     toggleActions: "play none none none",
                 }
             });
             // Set initial state (hidden) if not handled by CSS
             if (!section.style.opacity) { // Check if opacity already set
                 gsap.set(section, { opacity: 0, y: 50 });
             }
        });

        // Separate animation for the footer visibility class toggle
        if (ELEMENTS.footer) {
            ScrollTrigger.create({
                 trigger: ELEMENTS.footer,
                 start: "top 95%",
                 // markers: true, // Debugging
                 onEnter: () => ELEMENTS.footer.classList.add('visible'),
                 onLeaveBack: () => ELEMENTS.footer.classList.remove('visible')
            });
        }
    };

    /**
     * Fetches and displays a tech trivia fact.
     */
    const fetchTechTrivia = async () => {
        if (!ELEMENTS.triviaTextElement) return;
        ELEMENTS.triviaTextElement.textContent = 'Loading tech fact...';
        try {
            // Using placeholder facts as API might be unreliable/require sign-up
            const trivia = [
                "The first computer mouse was invented by Doug Engelbart in 1964 and was made of wood.",
                "Approximately 90% of the world's data has been created in the last few years.",
                "The QWERTY keyboard layout was designed to slow typists down to prevent typewriter jams.",
                "The average smartphone user checks their phone over 150 times a day.",
                "Domain name registration was free until 1995."
            ];
             const randomFact = trivia[Math.floor(Math.random() * trivia.length)];
             ELEMENTS.triviaTextElement.textContent = randomFact;

            // --- Commented out API fetch example ---
            // const response = await fetch(CONFIG.TECH_TRIVIA_URL);
            // if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            // const data = await response.json();
            // if (data.results && data.results.length > 0) {
            //     const txt = document.createElement("textarea");
            //     txt.innerHTML = data.results[0].question + " A: " + data.results[0].correct_answer;
            //     ELEMENTS.triviaTextElement.textContent = txt.value;
            // } else {
            //     throw new Error('No trivia results found.');
            // }
            // --- End commented out API fetch ---

        } catch (error) {
            console.error("Error fetching tech trivia:", error);
            ELEMENTS.triviaTextElement.textContent = 'Did you know? The first gigabyte hard drive (IBM 3380) in 1980 weighed over 500 pounds!'; // Fallback fact
        }
    };

    /**
     * Toggles background music playback.
     */
    const toggleMusic = () => {
        if (!ELEMENTS.backgroundMusic || !ELEMENTS.musicToggle) return;
        try {
            if (musicPlaying) {
                ELEMENTS.backgroundMusic.pause();
                ELEMENTS.musicToggle.classList.add('muted');
                ELEMENTS.musicToggle.setAttribute('aria-pressed', 'false');
                ELEMENTS.musicToggle.setAttribute('aria-label', 'Play background music');
            } else {
                // Play might return a promise, handle potential errors
                const playPromise = ELEMENTS.backgroundMusic.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        // Autoplay started!
                        ELEMENTS.musicToggle.classList.remove('muted');
                        ELEMENTS.musicToggle.setAttribute('aria-pressed', 'true');
                        ELEMENTS.musicToggle.setAttribute('aria-label', 'Pause background music');
                    }).catch(error => {
                        console.warn("Background music playback failed. User interaction might be required first.", error);
                         musicPlaying = !musicPlaying; // Revert state if play failed
                         // Display a message if needed
                    });
                } else {
                     // Fallback for older browsers? Assume playback started.
                     ELEMENTS.musicToggle.classList.remove('muted');
                     ELEMENTS.musicToggle.setAttribute('aria-pressed', 'true');
                     ELEMENTS.musicToggle.setAttribute('aria-label', 'Pause background music');
                }
            }
            musicPlaying = !musicPlaying;
        } catch(e) {
            console.error("Error toggling music:", e);
        }
    };

    /**
     * Shows/hides the scroll-to-top button with animation.
     */
    const handleScrollTopButton = () => {
        if (!ELEMENTS.scrollTopButton) return;
        const scrollThreshold = window.innerHeight * 0.5;

        if (window.scrollY > scrollThreshold) {
            if (ELEMENTS.scrollTopButton.style.display === 'none' || ELEMENTS.scrollTopButton.style.display === '') {
                ELEMENTS.scrollTopButton.style.display = 'flex'; // Make it visible for animation
                gsap.to(ELEMENTS.scrollTopButton, { opacity: 1, scale: 1, duration: 0.3, ease: 'power1.out' });
            }
        } else {
             if (ELEMENTS.scrollTopButton.style.opacity === '1' || ELEMENTS.scrollTopButton.style.opacity === '') {
                 gsap.to(ELEMENTS.scrollTopButton, {
                     opacity: 0,
                     scale: 0.8,
                     duration: 0.3,
                     ease: 'power1.in',
                     onComplete: () => {
                         // Check condition again before hiding to prevent race conditions
                         if (window.scrollY <= scrollThreshold) {
                             ELEMENTS.scrollTopButton.style.display = 'none';
                         }
                     }
                 });
            }
        }
    };

    /**
     * Scrolls the page to the top smoothly.
     */
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
    };

    /**
     * Handles the custom cursor movement and interactions.
     */
    const handleCustomCursor = () => {
        if (!ELEMENTS.customCursor || prefersReducedMotion || typeof gsap === 'undefined') {
            ELEMENTS.customCursor?.remove();
            return;
        }

        ELEMENTS.body.classList.add('cursor-ready'); // Show cursor after JS init

        // Use GSAP QuickTo for smoother cursor following
        const xTo = gsap.quickTo(ELEMENTS.customCursor, "x", { duration: 0.3, ease: "power1.out" });
        const yTo = gsap.quickTo(ELEMENTS.customCursor, "y", { duration: 0.3, ease: "power1.out" });

        window.addEventListener('mousemove', (e) => {
             xTo(e.clientX);
             yTo(e.clientY);
        });

        document.addEventListener('mousedown', () => ELEMENTS.customCursor.classList.add('click'));
        document.addEventListener('mouseup', () => ELEMENTS.customCursor.classList.remove('click'));

        // Add hover effect for specific elements
        const hoverTargets = document.querySelectorAll(
            'a, button, .service, .gallery-item, .testimonial, .card-hover, .event-card, .timeline-item, .social-links a, .floating-action-button, .hamburger, input[type="text"], input[type="email"], input[type="tel"], textarea, select, [role="button"]'
        ); // Added form inputs
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => ELEMENTS.customCursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => ELEMENTS.customCursor.classList.remove('hover'));
        });
    };

    /**
     * Handles the mobile navigation toggle and closing.
     */
    const handleMobileNav = () => {
        if (!ELEMENTS.hamburgerButton || !ELEMENTS.mobileNav) return;

        const mainContent = document.getElementById('main-content');
        const footerContent = document.querySelector('.main-footer');

        ELEMENTS.hamburgerButton.addEventListener('click', () => {
            const isActive = ELEMENTS.hamburgerButton.classList.toggle('is-active');
            ELEMENTS.body.classList.toggle('nav-active');
            ELEMENTS.hamburgerButton.setAttribute('aria-expanded', String(isActive)); // Use String()
            ELEMENTS.mobileNav.setAttribute('aria-hidden', String(!isActive));

             // Toggle inert state for main content (accessibility)
             if (isActive) {
                 mainContent?.setAttribute('inert', '');
                 footerContent?.setAttribute('inert', '');
                 // Focus first focusable item in nav, or nav itself
                 const firstFocusable = ELEMENTS.mobileNav.querySelector('a[href], button') || ELEMENTS.mobileNav;
                 setTimeout(() => firstFocusable.focus(), 50); // Delay focus
             } else {
                 mainContent?.removeAttribute('inert');
                 footerContent?.removeAttribute('inert');
                  ELEMENTS.hamburgerButton.focus(); // Return focus to toggle button
             }
        });

        // Close nav when a link is clicked
        ELEMENTS.mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (ELEMENTS.body.classList.contains('nav-active')) { // Only close if active
                     ELEMENTS.hamburgerButton.click(); // Simulate click to ensure all states toggle
                }
            });
        });

         // Close nav on Escape key
         document.addEventListener('keydown', (event) => {
             if (event.key === 'Escape' && ELEMENTS.body.classList.contains('nav-active')) {
                 ELEMENTS.hamburgerButton.click(); // Simulate click to close
             }
         });

         // Close nav on overlay click (body::before)
         document.addEventListener('click', (event) => {
            if (ELEMENTS.body.classList.contains('nav-active') &&
                !ELEMENTS.mobileNav.contains(event.target) &&
                !ELEMENTS.hamburgerButton.contains(event.target)) {
                 ELEMENTS.hamburgerButton.click();
            }
         });
    };


    /**
     * Handles the scrollspy functionality to highlight active nav link.
     */
    const handleScrollspy = throttle(() => {
        if (!ELEMENTS.navLinks) return;
        let currentSectionId = null;
        const scrollPosition = window.scrollY + headerHeight + 50; // Offset includes header + buffer

        // Find the section currently in view
        const sections = document.querySelectorAll('main section[id]'); // Select only sections in main with IDs
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // Optimization: Check if section is even potentially visible before getting height
            if (sectionTop < (window.scrollY + window.innerHeight) && (sectionTop + section.offsetHeight) > window.scrollY) {
                 const sectionHeight = section.offsetHeight;
                 if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    currentSectionId = section.id;
                 }
            }
        });

         // Fallback for top/bottom of page
        if (window.scrollY < window.innerHeight * 0.3 && !currentSectionId) { // Smaller threshold for top
            currentSectionId = 'home'; // Default to home if near top
        } else if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50 && !currentSectionId) {
            // If near the bottom, check if contact is the last section
             const lastSection = sections[sections.length - 1];
            if (lastSection?.id === 'contact') {
                 currentSectionId = 'contact';
            }
        }


        // Update nav link styles
        ELEMENTS.navLinks.forEach(link => {
            const linkSectionId = link.getAttribute('href')?.substring(1);
            if (linkSectionId && linkSectionId === currentSectionId) {
                if (!link.classList.contains('active')) {
                     link.classList.add('active');
                     link.setAttribute('aria-current', 'section');
                }
            } else {
                 if (link.classList.contains('active')) {
                     link.classList.remove('active');
                     link.removeAttribute('aria-current');
                 }
            }
        });
    }, CONFIG.SCROLLSPY_THROTTLE_MS);


    /**
     * Shows the sticky note after a delay using GSAP.
     */
    const showStickyNote = () => {
        if (!ELEMENTS.stickyNote || typeof gsap === 'undefined' || prefersReducedMotion) return;
        setTimeout(() => {
            ELEMENTS.stickyNote.style.display = 'flex';
            gsap.fromTo(ELEMENTS.stickyNote, { opacity: 0, scale: 0.8, rotation: -10 }, { opacity: 1, scale: 1, rotation: -4, duration: 0.5, ease: 'back.out(1.7)' });

            const closeBtn = ELEMENTS.stickyNote.querySelector('.close-btn');
            closeBtn?.addEventListener('click', () => {
                 gsap.to(ELEMENTS.stickyNote, { opacity: 0, scale: 0.8, rotation: 10, duration: 0.3, ease: 'power1.in', onComplete: () => ELEMENTS.stickyNote.style.display = 'none' });
            });
        }, CONFIG.STICKY_NOTE_DELAY_MS);
    };

    /**
     * Shows the chat bubble after a delay using GSAP.
     */
    const showChatBubble = () => {
        if (!ELEMENTS.chatBubble || typeof gsap === 'undefined' || prefersReducedMotion) return;
        setTimeout(() => {
             ELEMENTS.chatBubble.style.display = 'flex';
             gsap.fromTo(ELEMENTS.chatBubble, { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' });

             ELEMENTS.chatBubble.addEventListener('click', () => {
                alert('Live chat coming soon!'); // Placeholder action
                 // Optionally hide bubble after interaction
                 gsap.to(ELEMENTS.chatBubble, { opacity: 0, x: 50, duration: 0.3, onComplete: () => ELEMENTS.chatBubble.style.display = 'none' });
            });
        }, CONFIG.CHAT_BUBBLE_DELAY_MS);
    };

    /**
     * Handles the confetti easter egg.
     */
    const handleEasterEgg = () => {
        if (!ELEMENTS.easterEggTrigger || typeof confetti === 'undefined' || prefersReducedMotion) return;

        ELEMENTS.easterEggTrigger.addEventListener('click', () => {
             const duration = 5 * 1000; // 5 seconds
             const animationEnd = Date.now() + duration;

             // FIX: Get z-index safely or use a fixed high number
             const modalZ = parseInt(getComputedStyle(ELEMENTS.html).getPropertyValue('--z-modal-content'), 10) || 1210;
             const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: modalZ + 10 }; // Corrected zIndex

            function randomInRange(min, max) {
                return Math.random() * (max - min) + min;
            }

            const interval = setInterval(function() {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);

                const particleCount = 50 * (timeLeft / duration);
                // Launch from middle-left and middle-right
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.4), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.6, 0.9), y: Math.random() - 0.2 } });
            }, 250);

             // Corrected colors array definition
             const finalColors = ['#00a000', '#4CAF50', '#ffdd00', '#ffffff']; // Use var(--accent-color) hex value
             setTimeout(() => confetti({ particleCount: 100, spread: 200, origin: { y: 0.6 }, colors: finalColors }), duration - 100);
        });
    };

     /**
     * Basic form validation.
     */
    const validateForm = () => {
        if (!ELEMENTS.form) return true; // No form, no validation needed
        let isValid = true;
        const requiredInputs = ELEMENTS.form.querySelectorAll('[required]');

        requiredInputs?.forEach(input => {
            const group = input.closest('.form-group') || input.parentElement;
            const errorElement = group?.querySelector('.form-error'); // Add safety check for group
            input.classList.remove('invalid');
            if (errorElement) errorElement.style.display = 'none';

            let hasError = false;
            if (input.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!input.value.trim() || !emailRegex.test(input.value.trim())) {
                    hasError = true;
                    if(errorElement) errorElement.textContent = 'Please enter a valid email address.';
                }
            } else if (input.type === 'checkbox') {
                 if (!input.checked) {
                     hasError = true;
                     if(errorElement) errorElement.textContent = 'This field is required.';
                 }
            } else { // Text, Textarea, Tel etc.
                if (!input.value.trim()) {
                     hasError = true;
                    if(errorElement) errorElement.textContent = 'This field is required.';
                }
            }

             if (hasError) {
                 isValid = false;
                 input.classList.add('invalid');
                 if (errorElement) errorElement.style.display = 'block';
             }
        });

        return isValid;
    };

    /**
      * Handles form submission via Formspree (or similar).
      */
    const handleFormSubmission = () => {
        if (!ELEMENTS.form) return;

        ELEMENTS.form.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default browser submission

             if (!validateForm()) {
                 if (ELEMENTS.formStatus) {
                     ELEMENTS.formStatus.textContent = 'Please fix the errors above.';
                     ELEMENTS.formStatus.className = 'form-status error';
                     ELEMENTS.formStatus.style.display = 'block'; // Ensure visible
                 }
                return;
            }

            const formData = new FormData(ELEMENTS.form);
            const submitButton = ELEMENTS.form.querySelector('button[type="submit"]');
            const originalButtonContent = submitButton.innerHTML; // Store full HTML content

            // Indicate loading state
            if (ELEMENTS.formStatus) {
                 ELEMENTS.formStatus.textContent = 'Sending...';
                 ELEMENTS.formStatus.className = 'form-status';
                 ELEMENTS.formStatus.style.display = 'block'; // Ensure visible
            }
            if(submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> <span class="button-text">Sending...</span>'; // Loading indicator
            }


            try {
                const response = await fetch(ELEMENTS.form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Success
                    if (ELEMENTS.formStatus) {
                        ELEMENTS.formStatus.textContent = 'Message sent successfully! We\'ll be in touch soon.';
                        ELEMENTS.formStatus.className = 'form-status success';
                    }
                    ELEMENTS.form.reset(); // Clear the form
                    // Clear validation states
                    ELEMENTS.form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
                    ELEMENTS.form.querySelectorAll('.form-error').forEach(el => el.style.display = 'none');
                     // Hide status message after a delay? Optional.
                     // setTimeout(() => { if(ELEMENTS.formStatus) ELEMENTS.formStatus.style.display = 'none'; }, 5000);
                } else {
                    // Handle server errors (e.g., Formspree error)
                     const data = await response.json().catch(() => ({})); // Catch if response is not JSON
                     let errorMessage = 'Oops! There was a problem submitting your form.'; // Default error
                     if (data && Object.hasOwn(data, 'errors')) {
                         errorMessage = data["errors"].map(error => error["message"]).join(", ");
                     }
                    throw new Error(errorMessage);
                }
            } catch (error) {
                // Handle network errors or thrown errors
                console.error('Form submission error:', error);
                if (ELEMENTS.formStatus) {
                    ELEMENTS.formStatus.textContent = error.message || 'An error occurred. Please try again later.';
                    ELEMENTS.formStatus.className = 'form-status error';
                }
            } finally {
                // Reset button state
                 if(submitButton) {
                     submitButton.disabled = false;
                     submitButton.innerHTML = originalButtonContent;
                 }
            }
        });
    };

     /**
      * Hides the preloader smoothly.
      */
    const hidePreloader = () => {
        // Ensure this runs even if the preloader element is missing
        if (!ELEMENTS.preloader) {
            ELEMENTS.body.classList.remove('preload');
            console.warn("Preloader element not found.");
            return;
        }

         const removePreloader = () => {
             ELEMENTS.preloader.style.display = 'none';
             ELEMENTS.body.classList.remove('preload'); // Make body visible AFTER preloader is gone
        };

        // Use GSAP for smooth fade out if available
        if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
            gsap.to(ELEMENTS.preloader, {
                opacity: 0,
                duration: 0.5,
                ease: 'power1.inOut',
                onComplete: removePreloader
            });
        } else {
             ELEMENTS.preloader.style.opacity = '0';
             // Use transitionend event for smoother fallback
            ELEMENTS.preloader.addEventListener('transitionend', removePreloader, { once: true });
             // Safety timeout if transitionend doesn't fire
             setTimeout(removePreloader, 600); // Slightly longer than typical transition
        }
    };


    // --- Initialization Function ---
    const initialize = () => {
        console.log("Initializing SysFX Script..."); // Log start

        // Run preloader hiding logic early, but wait for window.onload for final removal
        window.addEventListener('load', hidePreloader);
        // Fallback timeout for hiding preloader
        setTimeout(hidePreloader, 3000); // Increased timeout


        initializeDarkMode();
        adjustBodyPadding(); // Initial padding adjustment
        displayTime();
        setInterval(displayTime, 60000); // Update time every minute

        if (!prefersReducedMotion) {
            // Start non-critical animations later to allow critical content rendering
            requestAnimationFrame(() => { // Defer slightly
                 initializeParticles();
                 typeEffectHandler();
                 handleCustomCursor();
                 showStickyNote();
                 showChatBubble();
                 handleEasterEgg();
            });
            revealSections(); // Init GSAP section animations
            animateStats(); // Init GSAP stat animations
        } else {
             // Handle non-animated fallbacks
            ELEMENTS.statsNumbers?.forEach(num => num.textContent = parseInt(num.dataset.target || '0').toLocaleString());
            ELEMENTS.animatedSections?.forEach(section => section.style.opacity = 1);
            ELEMENTS.footer?.classList.add('visible');
            ELEMENTS.customCursor?.remove();
            if (ELEMENTS.typingEffectElement) ELEMENTS.typingEffectElement.textContent = CONFIG.TAGLINES[0]; // Set static tagline
        }

        initializeMap();
        handleModals();
        handleLightbox();
        handleTestimonialCarousel();
        fetchTechTrivia();
        handleMobileNav();
        handleScrollTopButton(); // Initial check
        handleFormSubmission();

        // Initial Scrollspy Call
        handleScrollspy();

         console.log("SysFX Script Initialized."); // Log end
    };


    // --- Event Listeners ---
    ELEMENTS.darkModeToggle?.addEventListener('click', toggleDarkMode);
    ELEMENTS.musicToggle?.addEventListener('click', toggleMusic);
    ELEMENTS.scrollTopButton?.addEventListener('click', scrollToTop);

    // Throttled and Debounced Listeners
    window.addEventListener('scroll', throttle(() => {
        updateScrollProgress();
        handleScrollspy();
        handleScrollTopButton();
    }, 100), { passive: true }); // Use passive listener for scroll

    window.addEventListener('resize', debounce(() => {
        adjustBodyPadding();
        handleScrollspy(); // Re-check scrollspy on resize
    }, CONFIG.RESIZE_DEBOUNCE_MS));

     // Add focus handler for skip link
     ELEMENTS.skipLink?.addEventListener('focus', () => {
          if (ELEMENTS.skipLink) ELEMENTS.skipLink.style.left = '0';
     });
     ELEMENTS.skipLink?.addEventListener('blur', () => {
         if (ELEMENTS.skipLink) ELEMENTS.skipLink.style.left = '-999px'; // Hide again on blur
     });


    // --- Start Initialization ---
    // Ensure critical elements are selected before init
    if (ELEMENTS.body && ELEMENTS.header) {
         initialize();
    } else {
        console.error("Critical elements (body or header) not found. Initialization aborted.");
        // Attempt to hide preloader anyway to prevent getting stuck
        hidePreloader();
    }


}); // End DOMContentLoaded
