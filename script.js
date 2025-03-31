/**
 * SysFX Website Script
 * Version: 1.4
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
        skipLink: document.querySelector('.skip-link') // Assuming class is 'skip-link'
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
    let particlesInstance = null; // To potentially destroy later if needed

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
        // Note: Default particles.js doesn't easily support live color changes without reinit or complex config.
        // Re-initializeParticles(); // Uncomment if particles need theme update
    };

    /**
     * Adjusts body padding-top based on the header's actual height.
     */
    const adjustBodyPadding = () => {
        headerHeight = ELEMENTS.header?.offsetHeight || 0;
        ELEMENTS.body.style.paddingTop = `${headerHeight}px`;
        html.style.scrollPaddingTop = `${headerHeight + 10}px`; // Update scroll padding too
    };

    /**
     * Updates the scroll progress bar width.
     */
    const updateScrollProgress = () => {
        if (!ELEMENTS.scrollProgress) return;
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / scrollableHeight) * 100;
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
        if (!ELEMENTS.typingEffectElement || isTyping) return;
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
        if (typeof particlesJS !== 'undefined' && document.getElementById('particles-js')) {
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

        } else {
            console.warn('particlesJS not found or particles-js element missing.');
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
                mapInstance.scrollWheelZoom.enable();
            });
            // Add blur listener to disable again when map loses focus
            mapInstance.on('blur', () => {
                 mapInstance.scrollWheelZoom.disable();
            });


            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
         const markerColor = isDark ? 'var(--secondary-color)' : 'var(--primary-color)';
         const borderColor = isDark ? 'var(--text-dark)' : 'var(--text-light)';

        // Create a custom pulsing marker with DivIcon
         const pulsingIcon = L.divIcon({
             className: 'custom-map-marker', // Can add custom CSS rules for this class
             html: `<div style="
                        background-color: ${markerColor};
                        width: 18px;
                        height: 18px;
                        border-radius: 50%;
                        border: 3px solid ${borderColor};
                        box-shadow: 0 0 0 rgba(0, 160, 0, 0.4);
                        animation: pulse 2s infinite;
                     "></div>
                     <style>
                        @keyframes pulse {
                            0% { box-shadow: 0 0 0 0 rgba(0, 160, 0, 0.5); }
                            70% { box-shadow: 0 0 0 15px rgba(0, 160, 0, 0); }
                            100% { box-shadow: 0 0 0 0 rgba(0, 160, 0, 0); }
                        }
                        /* Adjust animation color for dark mode if needed */
                        body.dark-mode @keyframes pulse {
                             0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.5); }
                            70% { box-shadow: 0 0 0 15px rgba(76, 175, 80, 0); }
                            100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
                        }
                     </style>`,
             iconSize: [24, 24],
             iconAnchor: [12, 12],
             popupAnchor: [0, -15]
         });


        L.marker([41.2793, -72.4310], { icon: pulsingIcon })
            .addTo(mapInstance)
            .bindPopup("<b>sysfx HQ</b><br>123 Main Street<br>Clinton, CT 06413")
            .openPopup();
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
                if (event.target === modal) { // Check if click is on backdrop itself
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
     * @param {HTMLElement} modal - The modal element to open.
     */
     const openModal = (modal) => {
        if (!modal) return;
        // Lazy load modal content here if implemented
        modal.classList.add('active');
        ELEMENTS.body.classList.add('no-scroll'); // Prevent background scroll
        modal.setAttribute('aria-hidden', 'false');
         // Focus management: focus the close button or the modal itself
         const focusableElement = modal.querySelector('.modal-close') || modal;
         setTimeout(() => focusableElement?.focus(), 50); // Delay focus slightly for transition
     };

     /**
      * Closes a specific modal.
      * @param {HTMLElement} modal - The modal element to close.
      */
     const closeModal = (modal) => {
        if (!modal) return;
        modal.classList.remove('active');
        ELEMENTS.body.classList.remove('no-scroll');
        modal.setAttribute('aria-hidden', 'true');
        // Optional: return focus to the element that opened the modal
     };


    /**
     * Handles opening the gallery lightbox.
     */
    const handleLightbox = () => {
        if (!ELEMENTS.lightbox || !ELEMENTS.lightboxImage || !ELEMENTS.lightboxClose) return;

        let currentTarget = null; // To return focus

        ELEMENTS.galleryItems?.forEach(item => {
            item.addEventListener('click', () => {
                currentTarget = item; // Store the clicked item
                const highResSrc = item.getAttribute('data-src');
                const altText = item.getAttribute('data-alt') || item.querySelector('img')?.alt || 'Gallery image';
                if (highResSrc) {
                    ELEMENTS.lightboxImage.setAttribute('src', highResSrc);
                    ELEMENTS.lightboxImage.setAttribute('alt', altText);
                    ELEMENTS.lightbox.classList.add('active');
                    ELEMENTS.body.classList.add('no-scroll');
                    ELEMENTS.lightbox.setAttribute('aria-hidden', 'false');
                    setTimeout(() => ELEMENTS.lightboxClose.focus(), 50); // Focus close button
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
             ELEMENTS.lightbox.classList.remove('active');
             ELEMENTS.body.classList.remove('no-scroll');
             ELEMENTS.lightbox.setAttribute('aria-hidden', 'true');
             ELEMENTS.lightboxImage.setAttribute('src', ''); // Clear src
             ELEMENTS.lightboxImage.setAttribute('alt', '');
             currentTarget?.focus(); // Return focus to the item that opened it
        };

        ELEMENTS.lightboxClose.addEventListener('click', closeLightboxAction);
        ELEMENTS.lightbox.addEventListener('click', (event) => {
            if (event.target === ELEMENTS.lightbox) { // Click on backdrop
                closeLightboxAction();
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && ELEMENTS.lightbox.classList.contains('active')) {
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
            ELEMENTS.testimonials.forEach((testimonial, i) => {
                if (i === index) {
                    testimonial.setAttribute('aria-hidden', 'false');
                    // Opacity/visibility handled by CSS [.testimonial[aria-hidden="false"]]
                } else {
                    testimonial.setAttribute('aria-hidden', 'true');
                }
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
            testimonialInterval = setInterval(nextTestimonial, CONFIG.CAROUSEL_INTERVAL_MS);
        };

        const resetInterval = () => {
            clearInterval(testimonialInterval);
            startInterval();
        };

        // Initial setup
        showTestimonial(0); // Show the first testimonial initially
        startInterval(); // Start auto-play

        // Pause on hover
        ELEMENTS.testimonialSlider.addEventListener('mouseenter', () => clearInterval(testimonialInterval));
        ELEMENTS.testimonialSlider.addEventListener('mouseleave', startInterval);
        ELEMENTS.testimonialSlider.addEventListener('focusin', () => clearInterval(testimonialInterval));
        ELEMENTS.testimonialSlider.addEventListener('focusout', startInterval);
    };

    /**
     * Animates the stats numbers using GSAP when they become visible.
     */
    const animateStats = () => {
        if (prefersReducedMotion || typeof gsap === 'undefined') {
            // If reduced motion or GSAP unavailable, just set final values
            ELEMENTS.statsNumbers?.forEach(num => {
                num.textContent = num.dataset.target || '0';
            });
            return;
        }

        ELEMENTS.statsNumbers?.forEach(statNum => {
            const target = parseInt(statNum.dataset.target, 10) || 0;
            // Use Intersection Observer to trigger animation
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        gsap.to(statNum, {
                            textContent: target,
                            duration: 2,
                            ease: "power1.inOut",
                            snap: { textContent: 1 }, // Snap to whole numbers
                            stagger: 0.1, // Add stagger if animating multiple stats at once
                            onUpdate: function() {
                                // Format number with commas if needed
                                // statNum.textContent = parseInt(statNum.textContent).toLocaleString();
                                statNum.textContent = Math.round(this.targets()[0].textContent); // Ensure integer display
                            },
                            onComplete: function() {
                                // Ensure final value is exact and formatted
                                statNum.textContent = target.toLocaleString();
                            }
                        });
                        observer.unobserve(statNum); // Animate only once
                    }
                });
            }, { threshold: 0.5 }); // Trigger when 50% visible

            observer.observe(statNum);
        });
    };

     /**
     * Handles section reveal animations using GSAP and ScrollTrigger.
     */
    const revealSections = () => {
        if (prefersReducedMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
             // Remove opacity if animations disabled
            ELEMENTS.animatedSections?.forEach(section => section.style.opacity = 1);
            ELEMENTS.footer?.classList.add('visible'); // Make footer visible immediately
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        ELEMENTS.animatedSections?.forEach((section) => {
            gsap.from(section, {
                scrollTrigger: {
                    trigger: section,
                    start: "top 85%", // Trigger when 85% from top enters viewport
                    end: "bottom 20%",
                    // markers: true, // Uncomment for debugging
                    toggleActions: "play none none none", // Play animation once on enter
                    // scrub: true, // Uncomment for scroll-linked animation
                },
                y: 50, // Start 50px down
                opacity: 0, // Start invisible
                duration: 0.8, // Animation duration
                ease: "power2.out",
            });
        });

        // Separate animation for the footer
        if (ELEMENTS.footer) {
            gsap.to(ELEMENTS.footer, {
                scrollTrigger: {
                    trigger: ELEMENTS.footer,
                    start: "top 95%", // Trigger when footer is almost visible
                    end: "bottom top", // End when bottom hits top (fully visible)
                    // markers: true, // Debugging
                    onEnter: () => ELEMENTS.footer.classList.add('visible'),
                    onLeaveBack: () => ELEMENTS.footer.classList.remove('visible') // Optional: hide if scrolling back up past trigger
                }
                // CSS handles the actual animation via .visible class
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
            // Using a simple placeholder as the API might be unreliable/require sign-up
            const trivia = [
                "The first computer mouse was invented by Doug Engelbart in 1964 and was made of wood.",
                "Approximately 90% of the world's data has been created in the last few years.",
                "The QWERTY keyboard layout was designed to slow typists down to prevent typewriter jams.",
                "The average smartphone user checks their phone over 150 times a day.",
                "Domain name registration was free until 1995."
            ];
             const randomFact = trivia[Math.floor(Math.random() * trivia.length)];
             ELEMENTS.triviaTextElement.textContent = randomFact;

            // Example using Fetch API (replace URL if needed)
            // const response = await fetch(CONFIG.TECH_TRIVIA_URL);
            // if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            // const data = await response.json();
            // if (data.results && data.results.length > 0) {
            //     // Decode HTML entities often found in OpenTDB
            //     const txt = document.createElement("textarea");
            //     txt.innerHTML = data.results[0].question + " A: " + data.results[0].correct_answer; // Combine Q&A for trivia format
            //     ELEMENTS.triviaTextElement.textContent = txt.value;
            // } else {
            //     ELEMENTS.triviaTextElement.textContent = 'Could not fetch a tech fact right now.';
            // }
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
                ELEMENTS.backgroundMusic.play().then(() => {
                    ELEMENTS.musicToggle.classList.remove('muted');
                    ELEMENTS.musicToggle.setAttribute('aria-pressed', 'true');
                     ELEMENTS.musicToggle.setAttribute('aria-label', 'Pause background music');
                }).catch(error => {
                    console.warn("Background music playback failed. User interaction might be required first.", error);
                     musicPlaying = !musicPlaying; // Revert state if play failed
                     // Optionally display a message to the user
                });
            }
            musicPlaying = !musicPlaying;
        } catch(e) {
            console.error("Error toggling music:", e);
        }
    };

    /**
     * Shows/hides the scroll-to-top button.
     */
    const handleScrollTopButton = () => {
        if (!ELEMENTS.scrollTopButton) return;
        if (window.scrollY > window.innerHeight * 0.5) { // Show after scrolling 50% of viewport height
            ELEMENTS.scrollTopButton.style.display = 'flex'; // Use flex to show
             ELEMENTS.scrollTopButton.style.opacity = '1';
             ELEMENTS.scrollTopButton.style.transform = 'scale(1)';
        } else {
             ELEMENTS.scrollTopButton.style.opacity = '0';
             ELEMENTS.scrollTopButton.style.transform = 'scale(0.8)';
             // Use timeout to set display none after transition
             setTimeout(() => {
                 if (window.scrollY <= window.innerHeight * 0.5) { // Double check condition
                     ELEMENTS.scrollTopButton.style.display = 'none';
                 }
             }, 300); // Match CSS transition duration
        }
    };

    /**
     * Scrolls the page to the top smoothly.
     */
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    /**
     * Handles the custom cursor movement and interactions.
     */
    const handleCustomCursor = () => {
        if (!ELEMENTS.customCursor || prefersReducedMotion) {
            ELEMENTS.customCursor?.remove(); // Remove cursor element if not needed
            return;
        }

        ELEMENTS.body.classList.add('cursor-ready'); // Show cursor after JS init

        window.addEventListener('mousemove', (e) => {
            gsap.to(ELEMENTS.customCursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1, // Faster update
                ease: 'power1.out'
            });
        });

        document.addEventListener('mousedown', () => ELEMENTS.customCursor.classList.add('click'));
        document.addEventListener('mouseup', () => ELEMENTS.customCursor.classList.remove('click'));

        // Add hover effect for specific elements
        const hoverTargets = document.querySelectorAll(
            'a, button, .service, .gallery-item, .testimonial, .card-hover, .event-card, .timeline-item, .social-links a, .floating-action-button, .hamburger, input, textarea, [role="button"]'
        );
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

        ELEMENTS.hamburgerButton.addEventListener('click', () => {
            const isActive = ELEMENTS.hamburgerButton.classList.toggle('is-active');
            ELEMENTS.body.classList.toggle('nav-active');
            ELEMENTS.hamburgerButton.setAttribute('aria-expanded', isActive ? 'true' : 'false');
            ELEMENTS.mobileNav.setAttribute('aria-hidden', isActive ? 'false' : 'true');
             // Toggle inert state for main content (accessibility)
             const mainContent = document.getElementById('main-content');
             const footerContent = document.querySelector('.main-footer');
             if (isActive) {
                 mainContent?.setAttribute('inert', '');
                 footerContent?.setAttribute('inert', '');
                 ELEMENTS.mobileNav.focus(); // Focus nav panel when opened
             } else {
                 mainContent?.removeAttribute('inert');
                 footerContent?.removeAttribute('inert');
                  ELEMENTS.hamburgerButton.focus(); // Return focus to toggle button
             }
        });

        // Close nav when a link is clicked
        ELEMENTS.mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                ELEMENTS.hamburgerButton.classList.remove('is-active');
                ELEMENTS.body.classList.remove('nav-active');
                ELEMENTS.hamburgerButton.setAttribute('aria-expanded', 'false');
                ELEMENTS.mobileNav.setAttribute('aria-hidden', 'true');
                 // Remove inert state
                document.getElementById('main-content')?.removeAttribute('inert');
                document.querySelector('.main-footer')?.removeAttribute('inert');
            });
        });

         // Close nav on Escape key
         document.addEventListener('keydown', (event) => {
             if (event.key === 'Escape' && ELEMENTS.body.classList.contains('nav-active')) {
                 ELEMENTS.hamburgerButton.click(); // Simulate click to close
             }
         });

         // Close nav on overlay click (using the body::before pseudo-element)
         // We can detect clicks *not* on the nav itself when it's active
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
            const sectionHeight = section.offsetHeight;

            // Check if section is within the scroll position (+/- height for accuracy)
             if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.id;
             }
        });

         // Fallback for top/bottom of page
        if (window.scrollY < window.innerHeight * 0.5 && !currentSectionId) {
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
            link.classList.remove('active');
            const sectionId = link.getAttribute('href')?.substring(1); // Get ID from href
            // Use dataset if available, otherwise fallback to href
            // const sectionId = link.dataset.sectionId || link.getAttribute('href')?.substring(1);
            if (sectionId && sectionId === currentSectionId) {
                link.classList.add('active');
            }
        });
    }, CONFIG.SCROLLSPY_THROTTLE_MS);


    /**
     * Shows the sticky note after a delay.
     */
    const showStickyNote = () => {
        if (!ELEMENTS.stickyNote) return;
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
     * Shows the chat bubble after a delay.
     */
    const showChatBubble = () => {
        if (!ELEMENTS.chatBubble) return;
        setTimeout(() => {
             ELEMENTS.chatBubble.style.display = 'flex';
             gsap.fromTo(ELEMENTS.chatBubble, { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' });

             ELEMENTS.chatBubble.addEventListener('click', () => {
                alert('Live chat coming soon!'); // Placeholder action
            });
        }, CONFIG.CHAT_BUBBLE_DELAY_MS);
    };

    /**
     * Handles the confetti easter egg.
     */
    const handleEasterEgg = () => {
        if (!ELEMENTS.easterEggTrigger || typeof confetti === 'undefined') return;
        ELEMENTS.easterEggTrigger.addEventListener('click', () => {
             const duration = 5 * 1000; // 5 seconds
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: var(--z-modal-content) + 10 }; // Ensure confetti is high

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

             // Add a little burst at the end
             setTimeout(() => confetti({ particleCount: 100, spread: 200, origin: { y: 0.6 }, colors: ['#00a000', '#4CAF50', '#ffeb3b', '#ffffff'] }), duration - 100);
        });
    };

     /**
     * Basic form validation.
     */
    const validateForm = () => {
        let isValid = true;
        const requiredInputs = ELEMENTS.form?.querySelectorAll('[required]');

        requiredInputs?.forEach(input => {
            const group = input.closest('.form-group') || input.parentElement;
            const errorElement = group.querySelector('.form-error');
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
                 }
                return;
            }

            const formData = new FormData(ELEMENTS.form);
            const submitButton = ELEMENTS.form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;

            // Indicate loading state
            if (ELEMENTS.formStatus) {
                 ELEMENTS.formStatus.textContent = 'Sending...';
                 ELEMENTS.formStatus.className = 'form-status';
            }
            submitButton.disabled = true;
             submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...'; // Loading indicator

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
                } else {
                    // Handle server errors (e.g., Formspree error)
                     const data = await response.json();
                     if (Object.hasOwn(data, 'errors')) {
                         throw new Error(data["errors"].map(error => error["message"]).join(", "));
                     } else {
                          throw new Error('Oops! There was a problem submitting your form.');
                     }
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
                 submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        });
    };

     /**
      * Hides the preloader.
      */
    const hidePreloader = () => {
        if (!ELEMENTS.preloader) {
             ELEMENTS.body.classList.remove('preload'); // Ensure body becomes visible even if no preloader
            return;
        }
        // Use GSAP for smooth fade out if available
        if (typeof gsap !== 'undefined') {
            gsap.to(ELEMENTS.preloader, {
                opacity: 0,
                duration: 0.5,
                ease: 'power1.inOut',
                onComplete: () => {
                    ELEMENTS.preloader.style.display = 'none';
                     ELEMENTS.body.classList.remove('preload'); // Make body visible
                }
            });
        } else {
             ELEMENTS.preloader.style.opacity = '0';
             setTimeout(() => {
                 ELEMENTS.preloader.style.display = 'none';
                  ELEMENTS.body.classList.remove('preload');
             }, 500); // Match potential CSS transition
        }
    };


    // --- Initialization Function ---
    const initialize = () => {
        initializeDarkMode();
        adjustBodyPadding(); // Initial padding adjustment
        displayTime();
        setInterval(displayTime, 60000); // Update time every minute
        if (!prefersReducedMotion) {
            initializeParticles();
            typeEffectHandler(); // Start typing effect
            handleCustomCursor();
            revealSections(); // Init GSAP animations
            animateStats(); // Init GSAP stat animations
             showStickyNote();
             showChatBubble();
        } else {
             // Handle non-animated fallbacks if needed (stats, sections visible)
            ELEMENTS.statsNumbers?.forEach(num => num.textContent = num.dataset.target || '0');
            ELEMENTS.animatedSections?.forEach(section => section.style.opacity = 1);
            ELEMENTS.footer?.classList.add('visible');
             // Ensure cursor element is removed if motion is reduced
             ELEMENTS.customCursor?.remove();
        }
        initializeMap();
        handleModals();
        handleLightbox();
        handleTestimonialCarousel();
        fetchTechTrivia(); // Fetch trivia on load
        handleMobileNav();
        handleScrollTopButton(); // Initial check for scroll button
        handleEasterEgg();
        handleFormSubmission();

        // Hide preloader after everything else is potentially set up
        // Use window.onload for better accuracy (waits for images etc)
        window.onload = hidePreloader;
        // Fallback if onload doesn't fire quickly
        setTimeout(hidePreloader, 2500);


        // Initial Scrollspy Call
        handleScrollspy();
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
    }, 50)); // Throttle scroll events more aggressively

    window.addEventListener('resize', debounce(() => {
        adjustBodyPadding();
        handleScrollspy(); // Re-check scrollspy on resize
    }, CONFIG.RESIZE_DEBOUNCE_MS));

     // Add focus handler for skip link
     ELEMENTS.skipLink?.addEventListener('blur', () => {
         ELEMENTS.skipLink.style.left = '-999px'; // Hide again on blur
     });


    // --- Start Initialization ---
    initialize();

}); // End DOMContentLoaded
