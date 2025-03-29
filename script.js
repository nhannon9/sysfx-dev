/**
 * sysfx Website Script
 * Version: 1.1
 * Author: sysfx (Revised by AI Assistant)
 * Description: Handles animations, interactivity, and dynamic content for the sysfx website.
 */

// Wait for the DOM to be fully loaded and parsed
document.addEventListener("DOMContentLoaded", () => {

    // --- Global Elements & State ---
    const body = document.body;
    const header = document.getElementById('main-header');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // --- Utility Functions ---
    /**
     * Debounces a function to limit the rate at which it can fire.
     * @param {Function} func - The function to debounce.
     * @param {number} wait - The debounce duration in milliseconds.
     * @returns {Function} - The debounced function.
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Plays a sound effect. Caches Audio objects for efficiency.
     * @param {string} type - The type of sound ('click', 'hover', 'confirm', etc.).
     * @param {number} [volume=0.8] - Volume level (0 to 1).
     */
    const soundCache = {};
    function playSound(type, volume = 0.8) {
        // Example sound URLs (replace with your actual files or CDN links)
        const sounds = {
            click: "https://cdn.freesound.org/previews/245/245645_4055516-lq.mp3", // Example click sound
            hover: "https://cdn.freesound.org/previews/184/184438_2393279-lq.mp3", // Example hover sound
            confirm: "https://cdn.freesound.org/previews/505/505727_11019708-lq.mp3", // Example confirmation
            open: "https://cdn.freesound.org/previews/661/661481_12731996-lq.mp3", // Example open/reveal
            close: "https://cdn.freesound.org/previews/245/245645_4055516-lq.mp3" // Example close (can reuse click)
        };

        if (!sounds[type]) {
            console.warn(`Sound type "${type}" not defined.`);
            return;
        }

        try {
            if (!soundCache[type]) {
                soundCache[type] = new Audio(sounds[type]);
                soundCache[type].volume = Math.max(0, Math.min(volume, 1)); // Clamp volume
                soundCache[type].preload = "auto";
            }
            // Ensure playback isn't interrupted if already playing briefly
            if (soundCache[type].readyState >= 2) { // HAVE_CURRENT_DATA or more
                 soundCache[type].currentTime = 0; // Reset playback position
                 soundCache[type].play().catch(e => console.warn(`Sound play failed: ${e.message}`));
            } else {
                // If not ready, try playing once loaded (might have slight delay first time)
                soundCache[type].addEventListener('canplaythrough', () => {
                     soundCache[type].currentTime = 0;
                     soundCache[type].play().catch(e => console.warn(`Sound play failed: ${e.message}`));
                }, { once: true });
            }
        } catch (error) {
            console.error("Error playing sound:", error);
        }
    }

    /**
     * Announces a message to screen readers.
     * @param {string} message - The message to announce.
     */
    function announceToScreenReader(message) {
        const announcement = document.createElement("div");
        announcement.setAttribute("aria-live", "polite");
        announcement.className = "sr-only"; // Use the utility class for visual hiding
        announcement.textContent = message;
        body.appendChild(announcement);
        // Remove after a short delay to ensure it's read
        setTimeout(() => announcement.remove(), 1500);
    }

    /**
     * Smoothly scrolls to a target element, accounting for the fixed header.
     * @param {string} selector - The CSS selector for the target element (e.g., '#contact').
     */
    function scrollToSection(selector) {
        const targetElement = document.querySelector(selector);
        if (targetElement && header) {
            const headerHeight = header.offsetHeight;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = targetPosition - headerHeight - 10; // Add a small buffer

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
            playSound("click");
        } else {
            console.warn(`Element not found for selector: ${selector}`);
        }
    }

    // --- Initialization Functions ---

    /**
     * Initializes header-related functionality (clock, dynamic padding, scroll behavior).
     */
    function initHeader() {
        const clockElement = document.getElementById("current-time");
        const scrollProgress = document.querySelector(".scroll-progress");

        // Update Clock
        function updateClock() {
            if (clockElement) {
                try {
                    const now = new Date();
                    // Use Intl for better localization and formatting
                    const timeFormat = new Intl.DateTimeFormat("en-US", { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'America/New_York', hour12: true });
                    const dateFormat = new Intl.DateTimeFormat("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' });
                    const timeZoneAbbr = new Intl.DateTimeFormat("en-US", { timeZoneName: 'short', timeZone: 'America/New_York' }).formatToParts(now).find(part => part.type === 'timeZoneName')?.value || 'EST'; // Fallback

                    const time = timeFormat.format(now);
                    const date = dateFormat.format(now);

                    clockElement.innerHTML = `<i class="fas fa-clock" aria-hidden="true"></i> ${time} | ${date} (${timeZoneAbbr})`;
                } catch (e) {
                    console.error("Error updating clock:", e);
                    clockElement.textContent = "Error loading time.";
                }
            }
        }
        updateClock();
        setInterval(updateClock, 1000); // Update every second

        // Update Body Padding & Scroll Progress/Header Shrink
        let lastHeaderHeight = 0;
        function updateLayout() {
            if (!header) return;

            const currentHeaderHeight = header.offsetHeight;
            // Only update padding if header height actually changes
            if (currentHeaderHeight !== lastHeaderHeight) {
                body.style.paddingTop = `${currentHeaderHeight}px`;
                lastHeaderHeight = currentHeaderHeight;
                 // console.log(`Header height updated: ${currentHeaderHeight}px`); // Debug log
            }


            // Scroll Progress
            if (scrollProgress) {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const docHeight = Math.max(
                    body.scrollHeight, document.documentElement.scrollHeight,
                    body.offsetHeight, document.documentElement.offsetHeight,
                    body.clientHeight, document.documentElement.clientHeight
                ) - window.innerHeight;
                const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
                scrollProgress.style.width = `${scrollPercent}%`;
            }

             // Header shrink class (optional - can be CSS only if preferred)
            // header.classList.toggle("shrink", window.scrollY > 100);
        }

        // Initial layout calculation
        // Use requestAnimationFrame to ensure layout is stable
        requestAnimationFrame(() => {
             updateLayout();
             // Add listeners after initial calculation
             window.addEventListener("scroll", debounce(updateLayout, 10), { passive: true });
             window.addEventListener("resize", debounce(updateLayout, 100));
        });
    }

    /**
     * Initializes the main navigation (hamburger toggle, link clicks, closing behavior).
     */
    function initNavigation() {
        const navToggle = document.getElementById('hamburger-button');
        const mainNav = document.getElementById('main-navigation');

        if (!navToggle || !mainNav) {
             console.warn("Navigation elements not found.");
             return;
        }

        const navLinks = mainNav.querySelectorAll('.nav-link');

        function openNav() {
            body.classList.add('nav-active', 'no-scroll');
            navToggle.setAttribute('aria-expanded', 'true');
            navToggle.querySelector('i').classList.replace('fa-bars', 'fa-times');
            mainNav.querySelector('a').focus(); // Focus first link for accessibility
            playSound("open", 0.6);
        }

        function closeNav() {
            body.classList.remove('nav-active', 'no-scroll');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');
            // Optional: return focus to hamburger button
            // navToggle.focus();
            playSound("close", 0.6);
        }

        navToggle.addEventListener('click', () => {
            const isNavActive = body.classList.contains('nav-active');
            if (isNavActive) {
                closeNav();
            } else {
                openNav();
            }
        });

        // Close nav when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetHref = link.getAttribute('href');
                if (targetHref && targetHref.startsWith('#')) {
                    e.preventDefault(); // Prevent default jump
                    closeNav();
                    // Use timeout to allow nav closing animation before scrolling
                    setTimeout(() => {
                         scrollToSection(targetHref);
                    }, 100); // Adjust delay if needed
                }
                // Allow normal behavior for external links if any are added later
            });
        });

        // Close nav on Escape key press
        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape" && body.classList.contains('nav-active')) {
                closeNav();
            }
        });

        // Close nav on click outside (if nav is open)
        document.addEventListener('click', (e) => {
            if (body.classList.contains('nav-active') && !mainNav.contains(e.target) && !navToggle.contains(e.target)) {
                closeNav();
            }
        });
    }

    /**
     * Initializes the typing effect in the header.
     */
    function initTypingEffect() {
        const typingElement = document.getElementById("typing-effect");
        if (!typingElement) return;

        const phrases = [
            "Your Trusted Tech Partner.",
            "Securing Your Digital Future.",
            "Providing Next-Gen Solutions.",
            "Local Experts, Global Standards.",
            "Precision Tech Expertise.",
            "Your IT Partner in Clinton, CT.",
            "Innovating for Your Success.",
            "Building the Web of Tomorrow."
        ];
        let currentPhraseIndex = 0;
        let charIndex = 0;
        let isTyping = true;
        const typingSpeed = 55; // Slightly faster
        const erasingSpeed = 35;
        const pauseBetweenPhrases = 2000; // Slightly shorter pause
        let timeoutId;

        function type() {
            const currentPhrase = phrases[currentPhraseIndex];
            if (isTyping) {
                if (charIndex < currentPhrase.length) {
                    typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
                    charIndex++;
                    timeoutId = setTimeout(type, typingSpeed);
                } else {
                    isTyping = false;
                    timeoutId = setTimeout(erase, pauseBetweenPhrases + Math.random() * 400);
                }
            }
        }

        function erase() {
             const currentText = typingElement.textContent;
            if (currentText.length > 0) {
                typingElement.textContent = currentText.slice(0, -1);
                timeoutId = setTimeout(erase, erasingSpeed);
            } else {
                isTyping = true;
                charIndex = 0;
                currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
                timeoutId = setTimeout(type, 500); // Pause before typing next phrase
            }
        }

        // Clear any previous timeouts if re-initializing (though DOMContentLoaded should prevent this)
        clearTimeout(timeoutId);
        // Start the effect
        type();
    }

    /**
     * Initializes dark mode toggle functionality.
     */
    function initDarkMode() {
        const darkModeToggle = document.getElementById("darkModeToggle");
        if (!darkModeToggle) return;

        const icon = darkModeToggle.querySelector("i");
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        let isDarkMode = localStorage.getItem("darkMode") === "enabled" || (localStorage.getItem("darkMode") === null && prefersDark);

        function applyDarkMode(active) {
            body.classList.toggle("dark-mode", active);
            icon.classList.replace(active ? "fa-moon" : "fa-sun", active ? "fa-sun" : "fa-moon");
            darkModeToggle.setAttribute('aria-label', active ? 'Switch to Light Mode' : 'Switch to Dark Mode');
            localStorage.setItem("darkMode", active ? "enabled" : "disabled");
            // Update dependent components
            updateParticles();
            updateMapMarkers(); // Call marker update
        }

        darkModeToggle.addEventListener("click", () => {
            isDarkMode = !isDarkMode;
            applyDarkMode(isDarkMode);
            playSound("click");
            announceToScreenReader(isDarkMode ? "Dark mode enabled" : "Light mode enabled");
        });

        // Apply initial state
        applyDarkMode(isDarkMode);
    }

    /**
     * Initializes the Particles.js background.
     */
    function initParticles() {
        const particlesElement = document.getElementById('particles-js');
        if (!particlesElement || typeof particlesJS === 'undefined') {
            // console.warn("Particles.js element or library not found.");
            return;
        }
        updateParticles(); // Initial setup
        // Debounced resize handler added in initHeader
    }
    function updateParticles() {
         if (typeof particlesJS === 'undefined') return; // Guard clause
         const isDarkMode = body.classList.contains("dark-mode");
         const particleColor = isDarkMode ? "#ffffff" : "#00a000";
         const lineColor = isDarkMode ? "#ffffff" : "#00a000";
         const particleOpacity = isDarkMode ? 0.7 : 0.4;

         particlesJS("particles-js", {
            particles: {
                number: { value: Math.max(30, Math.min(window.innerWidth / 15, 80)), density: { enable: true, value_area: 800 } }, // Responsive particle count
                color: { value: particleColor },
                shape: { type: "circle" }, // Simpler shape
                opacity: { value: particleOpacity, random: true, anim: { enable: true, speed: 0.5, opacity_min: 0.1, sync: false } },
                size: { value: 3, random: true, anim: { enable: false } }, // Smaller size
                line_linked: { enable: true, distance: 150, color: lineColor, opacity: 0.3, width: 1 },
                move: { enable: true, speed: 2, direction: "none", random: true, straight: false, out_mode: "out", bounce: false }
            },
            interactivity: {
                detect_on: "canvas",
                events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: false }, resize: true }, // Disabled click push
                modes: { grab: { distance: 120, line_linked: { opacity: 0.6 } } }
            },
            retina_detect: true
        });
    }


    /**
     * Initializes the Leaflet map.
     */
    let mapInstance = null; // Store map instance
    let markerLayer = null; // Store marker layer
    function initMap() {
        const mapElement = document.getElementById("map");
        if (!mapElement || typeof L === "undefined") {
             // console.warn("Map element or Leaflet library not found.");
             return;
        }

        // Prevent re-initialization if map already exists
        if (mapInstance) {
            mapInstance.remove();
            mapInstance = null;
        }

        mapInstance = L.map(mapElement, {
            scrollWheelZoom: false,
            dragging: !L.Browser.mobile, // Allow dragging only on non-mobile
            touchZoom: L.Browser.mobile, // Allow touch zoom on mobile
            zoomControl: true // Keep zoom controls
        }).setView([41.2788, -72.5276], 14); // Clinton, CT coordinates (adjust if needed)

        // Use a tile layer that respects user preferences if possible, or a standard one
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
            minZoom: 10 // Prevent zooming out too far
        }).addTo(mapInstance);

        markerLayer = L.layerGroup().addTo(mapInstance);
        updateMapMarkers(); // Initial marker placement
    }
    // Function to update markers (can be called by dark mode toggle)
    function updateMapMarkers() {
        if (!mapInstance || !markerLayer || typeof L === "undefined") return; // Ensure map is initialized

        const isDarkMode = body.classList.contains("dark-mode");
        const iconColor = isDarkMode ? "var(--secondary-color)" : "var(--primary-color)";
        const borderColor = isDarkMode ? "#444" : "#fff";

        // Define custom icon using Leaflet's DivIcon
        const customIcon = L.divIcon({
            className: 'custom-map-marker', // Use this class for CSS styling
            html: `<span style="background-color:${iconColor}; border: 2px solid ${borderColor};" class="marker-inner"></span>`, // Inner span for styling flexibility
            iconSize: [24, 24], // Size of the icon
            iconAnchor: [12, 12] // Anchor point (center)
        });

        // Clear existing markers before adding new/updated ones
        markerLayer.clearLayers();

        // Define marker data (can be expanded)
        const markersData = [
            { lat: 41.2788, lon: -72.5276, popup: "<strong>sysfx HQ</strong><br>123 Main St<br>Clinton, CT", targetSection: "#contact" },
            // Add more markers here if needed
            // { lat: 41.xxxx, lon: -72.xxxx, popup: "Service Area Highlight", targetSection: "#services" }
        ];

        markersData.forEach(({ lat, lon, popup, targetSection }) => {
            const marker = L.marker([lat, lon], { icon: customIcon }).addTo(markerLayer);

            // Bind popup
            marker.bindPopup(popup);

            // Add interactivity
            marker.on('mouseover', () => marker.openPopup());
            // marker.on('mouseout', () => marker.closePopup()); // Optional: close on mouseout

            if (targetSection) {
                marker.on('click', () => {
                     // Check if the target section exists before scrolling
                     if (document.querySelector(targetSection)) {
                         scrollToSection(targetSection);
                     } else {
                          console.warn(`Target section ${targetSection} not found for map marker.`);
                     }
                });
            }
        });
    }


    /**
     * Initializes the testimonial slider.
     */
    function initTestimonialSlider() {
        const slider = document.querySelector(".testimonial-slider");
        const testimonials = document.querySelectorAll(".testimonial");
        const prevBtn = document.querySelector(".carousel-prev");
        const nextBtn = document.querySelector(".carousel-next");

        if (!slider || testimonials.length === 0 || !prevBtn || !nextBtn) {
             // console.warn("Testimonial slider elements not found or no testimonials present.");
             return;
        }

        let currentIndex = 0;
        let slideInterval;
        const totalSlides = testimonials.length;

        // Prepare slides - hide all except the first
        testimonials.forEach((testimonial, index) => {
            testimonial.style.opacity = index === 0 ? '1' : '0';
            testimonial.style.position = index === 0 ? 'relative' : 'absolute';
            testimonial.style.top = '0'; // Ensure absolute slides are positioned correctly
            testimonial.style.left = '0';
            testimonial.setAttribute('aria-hidden', index !== 0);
        });

        function showTestimonial(index) {
            const previousIndex = currentIndex;
            currentIndex = (index + totalSlides) % totalSlides; // Ensure index loops correctly

            if (previousIndex === currentIndex) return; // No change

            const prevSlide = testimonials[previousIndex];
            const nextSlide = testimonials[currentIndex];

            // Make next slide visible and ready for transition
            nextSlide.style.position = 'relative';
            nextSlide.setAttribute('aria-hidden', 'false');

            // Use GSAP for smoother fade transition
            gsap.to(prevSlide, { opacity: 0, duration: 0.5, ease: "power2.inOut", onComplete: () => {
                 prevSlide.style.position = 'absolute'; // Hide previous slide after fade out
                 prevSlide.setAttribute('aria-hidden', 'true');
            }});
            gsap.to(nextSlide, { opacity: 1, duration: 0.5, ease: "power2.inOut" });
        }

        function next() { showTestimonial(currentIndex + 1); playSound('click', 0.5); }
        function prev() { showTestimonial(currentIndex - 1); playSound('click', 0.5); }

        function startAutoSlide() {
            stopAutoSlide(); // Clear existing interval first
            slideInterval = setInterval(next, 5500); // Increased interval slightly
        }

        function stopAutoSlide() {
            clearInterval(slideInterval);
        }

        nextBtn.addEventListener('click', () => { next(); stopAutoSlide(); startAutoSlide(); });
        prevBtn.addEventListener('click', () => { prev(); stopAutoSlide(); startAutoSlide(); });

        // Pause on hover
        const container = document.querySelector('.carousel-container');
        if(container) {
            container.addEventListener('mouseenter', stopAutoSlide);
            container.addEventListener('mouseleave', startAutoSlide);
        }

        startAutoSlide(); // Start the slideshow
    }

    /**
     * Initializes the counting animation for stats numbers.
     */
    function initStatsCounter() {
        const statNumbers = document.querySelectorAll(".stat-number");
        if (statNumbers.length === 0 || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            // console.warn("Stats elements or GSAP/ScrollTrigger not found.");
             // Fallback: display target number immediately if animation fails
            statNumbers.forEach(stat => {
                const target = parseInt(stat.getAttribute("data-target")) || 0;
                stat.textContent = target.toLocaleString() + (stat.textContent.includes('+') ? '+' : ''); // Keep "+" if present
            });
            return;
        }

        gsap.registerPlugin(ScrollTrigger); // Ensure plugin is registered

        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute("data-target")) || 0;
            const hasPlus = stat.nextSibling && stat.nextSibling.nodeValue && stat.nextSibling.nodeValue.trim().startsWith('+'); // Check for trailing '+'

            // Use ScrollTrigger to trigger the animation when the stat item enters the viewport
            ScrollTrigger.create({
                trigger: stat,
                start: "top 85%", // Trigger when 85% of the element is visible from the top
                once: true, // Only trigger once
                onEnter: () => {
                    gsap.fromTo(stat,
                        { textContent: 0 }, // Start from 0
                        {
                            textContent: target,
                            duration: 2.5, // Animation duration
                            ease: "power2.out", // Easing function
                            snap: { textContent: 1 }, // Snap to whole numbers
                            onUpdate: function() {
                                // Format number with commas during animation
                                stat.textContent = Math.ceil(this.targets()[0].textContent).toLocaleString() + (hasPlus ? '+' : '');
                            },
                            onComplete: function() {
                                // Ensure final number is correctly formatted
                                stat.textContent = target.toLocaleString() + (hasPlus ? '+' : '');
                            }
                        }
                    );
                }
            });
        });
    }

    /**
     * Initializes the custom cursor behavior.
     */
    function initCustomCursor() {
        const cursor = document.querySelector(".cursor");
        if (!cursor || isTouchDevice) {
             if(cursor) cursor.style.display = 'none';
             return; // Don't initialize on touch devices or if element is missing
        }

        // Ensure cursor is visible initially
        cursor.style.opacity = '1';

        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;
        const smoothing = 0.12; // Adjust for desired smoothness (lower = smoother, more lag)

        function updateCursorPosition(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }

        function renderCursor() {
            const deltaX = mouseX - currentX;
            const deltaY = mouseY - currentY;

            currentX += deltaX * smoothing;
            currentY += deltaY * smoothing;

            cursor.style.transform = `translate(${currentX - cursor.offsetWidth / 2}px, ${currentY - cursor.offsetHeight / 2}px)`;

            requestAnimationFrame(renderCursor);
        }

        document.addEventListener("mousemove", updateCursorPosition);

        // Start the rendering loop
        requestAnimationFrame(renderCursor);


        // Add interaction classes
        document.addEventListener("mousedown", () => cursor.classList.add("click"));
        document.addEventListener("mouseup", () => cursor.classList.remove("click"));

        // Add hover effect on interactive elements
        document.querySelectorAll(
            'a, button, .service, .gallery-item, .nav-link, .modal-close, .carousel-control, .social-links a, .floating-action-button, .chat-bubble'
        ).forEach(el => {
            el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
            el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
        });
    }

    /**
     * Initializes modal window functionality for service items.
     */
    function initModals() {
        const serviceArticles = document.querySelectorAll(".service[data-modal-target]");
        const modals = document.querySelectorAll(".modal");

        if (serviceArticles.length === 0 || modals.length === 0) return;

        const modalMap = new Map();
        modals.forEach(modal => modalMap.set(modal.id, modal));

        function openModal(modalId) {
            const modal = modalMap.get(modalId);
            if (modal) {
                modal.classList.add('active');
                modal.setAttribute('aria-hidden', 'false');
                body.classList.add('no-scroll'); // Prevent background scroll
                // Focus the close button or the modal content itself
                const closeButton = modal.querySelector('.modal-close');
                if (closeButton) closeButton.focus();
                playSound("open");
                // Animation is handled by CSS (.modal.active .modal-content)
            } else {
                console.warn(`Modal with ID "${modalId}" not found.`);
            }
        }

        function closeModal(modal) {
             if(modal) {
                modal.classList.remove('active');
                modal.setAttribute('aria-hidden', 'true');
                body.classList.remove('no-scroll');
                 playSound("close");
                 // Optional: return focus to the element that opened the modal
                 // Consider storing the trigger element and focusing it here.
             }
        }

        // Event listeners for opening modals
        serviceArticles.forEach(article => {
            const modalId = article.getAttribute("data-modal-target");
            if (modalId) {
                article.addEventListener('click', () => openModal(modalId));
                article.addEventListener('keydown', (e) => {
                     if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openModal(modalId);
                     }
                });
            }
        });

        // Event listeners for closing modals
        modals.forEach(modal => {
            const closeBtn = modal.querySelector(".modal-close");
            const modalActions = modal.querySelectorAll(".modal-action[data-link]");

            if (closeBtn) {
                closeBtn.addEventListener('click', () => closeModal(modal));
            }

            // Close when clicking outside the modal content
            modal.addEventListener('click', (e) => {
                if (e.target === modal) { // Check if the click was directly on the modal background
                    closeModal(modal);
                }
            });

            // Handle action buttons within modals
            modalActions.forEach(button => {
                 button.addEventListener('click', (e) => {
                     e.stopPropagation(); // Prevent modal background click from firing
                     const targetSection = button.getAttribute('data-link');
                     if(targetSection) {
                          closeModal(modal);
                          // Delay scroll slightly to allow modal close animation
                          setTimeout(() => scrollToSection(targetSection), 100);
                     }
                 });
            });
        });

         // Global listener for Escape key to close any active modal
        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape") {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    closeModal(activeModal);
                }
            }
        });
    }

    /**
     * Initializes GSAP ScrollTrigger animations for sections.
     */
    function initScrollAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.warn("GSAP or ScrollTrigger not found, skipping scroll animations.");
            // Add 'visible' class immediately as fallback
            document.querySelectorAll(".section-animation").forEach(section => {
                 section.classList.add('visible');
            });
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        document.querySelectorAll(".section-animation").forEach(section => {
            gsap.fromTo(section,
                { opacity: 0, y: 50 }, // Start state
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8, // Animation duration
                    ease: "power3.out", // Easing function
                    scrollTrigger: {
                        trigger: section,
                        start: "top 85%", // Trigger point
                        end: "bottom 15%",
                        toggleActions: "play none none reset", // Play on enter, reset on leave back
                        // markers: true, // Uncomment for debugging
                        onEnter: () => section.classList.add("visible"), // Add class for potential CSS fallback/styling
                        onLeaveBack: () => section.classList.remove("visible") // Remove class on scroll up past trigger
                    }
                }
            );
        });

        // Optional: Add subtle parallax effect to specific elements if needed
        // gsap.utils.toArray('.some-element-inside-parallax').forEach(el => {
        //     gsap.to(el, {
        //         yPercent: -20, // Move up 20% of its height
        //         ease: "none",
        //         scrollTrigger: {
        //             trigger: el.closest('.parallax'), // Trigger based on parent section
        //             start: "top bottom", // Start when section top hits viewport bottom
        //             end: "bottom top", // End when section bottom hits viewport top
        //             scrub: true // Smooth scrubbing effect
        //         }
        //     });
        // });
    }

    /**
     * Initializes the image lightbox gallery functionality.
     */
    function initLightbox() {
        const galleryItems = document.querySelectorAll(".gallery-item");
        const lightbox = document.getElementById("lightbox");

        if (galleryItems.length === 0 || !lightbox) return;

        const lightboxImage = lightbox.querySelector(".lightbox-image");
        const lightboxClose = lightbox.querySelector(".lightbox-close");
        let currentTrigger = null; // Store the element that opened the lightbox

        function openLightbox(item) {
            const imgSrc = item.getAttribute("data-src");
            const imgAlt = item.getAttribute("data-alt") || item.querySelector("img")?.alt || "Enlarged gallery image"; // Get alt text

            if (!imgSrc) {
                console.warn("Gallery item missing data-src attribute.");
                return;
            }

            lightboxImage.src = imgSrc;
            lightboxImage.alt = imgAlt;
            lightboxImage.classList.remove('zoomed'); // Reset zoom state
            lightbox.classList.add('active');
            lightbox.setAttribute('aria-hidden', 'false');
            body.classList.add('no-scroll');
            currentTrigger = item; // Store the trigger
            lightboxClose.focus(); // Focus close button
            playSound("open");
            // CSS handles animation
        }

        function closeLightbox() {
            lightbox.classList.remove('active');
            lightbox.setAttribute('aria-hidden', 'true');
            body.classList.remove('no-scroll');
             playSound("close");
             if (currentTrigger) {
                currentTrigger.focus(); // Return focus
                currentTrigger = null;
             }
             // Reset image src to prevent loading flicker if reopened quickly
             // setTimeout(() => { lightboxImage.src = ''; }, 400); // Delay slightly after animation
        }

        function toggleZoom(e) {
             e.stopPropagation(); // Prevent background click close
             lightboxImage.classList.toggle('zoomed');
             // Basic scale toggle (CSS could handle this more smoothly)
             lightboxImage.style.transform = lightboxImage.classList.contains('zoomed') ? 'scale(1.5)' : 'scale(1)';
        }


        galleryItems.forEach(item => {
            item.addEventListener("click", () => openLightbox(item));
            item.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openLightbox(item);
                }
            });
            item.addEventListener("mouseover", () => playSound("hover", 0.4));
        });

        lightboxClose.addEventListener("click", closeLightbox);
        lightbox.addEventListener("click", (e) => { // Close on background click
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        lightboxImage.addEventListener('click', toggleZoom); // Zoom on image click

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape" && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

    /**
     * Initializes the background music toggle.
     */
    function initMusicPlayer() {
        const musicToggle = document.getElementById("music-toggle");
        const backgroundMusic = document.getElementById("background-music");

        if (!musicToggle || !backgroundMusic) return;

        let isMusicPlaying = localStorage.getItem("musicPlaying") === "true";

        function setMusicState(play) {
             try {
                 if (play) {
                     backgroundMusic.play().then(() => {
                         gsap.to(backgroundMusic, { volume: 0.4, duration: 1 }); // Fade in volume
                         musicToggle.classList.remove("muted");
                         musicToggle.setAttribute('aria-pressed', 'true');
                         musicToggle.setAttribute('aria-label', 'Pause background music');
                         localStorage.setItem("musicPlaying", "true");
                         isMusicPlaying = true;
                     }).catch(e => { // Handle autoplay block
                         console.warn("Music autoplay failed:", e.message);
                         setMusicState(false); // Ensure state reflects reality
                     });
                 } else {
                     gsap.to(backgroundMusic, {
                         volume: 0,
                         duration: 0.8,
                         onComplete: () => {
                             backgroundMusic.pause();
                             musicToggle.classList.add("muted");
                             musicToggle.setAttribute('aria-pressed', 'false');
                             musicToggle.setAttribute('aria-label', 'Play background music');
                             localStorage.setItem("musicPlaying", "false");
                             isMusicPlaying = false;
                         }
                     });
                 }
             } catch (error) {
                 console.error("Error controlling music:", error);
             }
        }

        musicToggle.addEventListener("click", () => {
            setMusicState(!isMusicPlaying);
            playSound("click");
        });

        // Initialize state based on localStorage
        // Set initial volume low to prevent blast if autoplay works
        backgroundMusic.volume = 0;
        if (isMusicPlaying) {
             // Try to play respecting potential browser restrictions
             setTimeout(() => setMusicState(true), 50); // Slight delay can sometimes help
        } else {
             setMusicState(false); // Ensure UI is correct if not playing
        }
    }

    /**
     * Initializes floating elements like tech tips, chat bubble, scroll-to-top.
     */
    function initFloatingElements() {
        // Tech Tip / Sticky Note
        const stickyNote = document.getElementById("sticky-note");
        const techTipText = document.getElementById("tech-tip-text");
        const closeTechTipBtn = document.getElementById("close-tech-tip");

        if (stickyNote && techTipText && closeTechTipBtn) {
            const tips = [
                "Ctrl+Shift+T reopens the last closed browser tab!",
                "Regularly restarting your router can solve many connection issues.",
                "Use a password manager for strong, unique passwords.",
                "Enable Two-Factor Authentication (2FA) wherever possible.",
                "Keep your software updated to patch security vulnerabilities.",
                "Backup your important data regularly (cloud or external drive)."
            ];
            const tipDismissed = localStorage.getItem("techTipDismissed") === "true";

            if (!tipDismissed) {
                techTipText.textContent = tips[Math.floor(Math.random() * tips.length)];
                // Show after a delay
                setTimeout(() => {
                     stickyNote.style.display = 'flex';
                     gsap.from(stickyNote, { y: -30, opacity: 0, duration: 0.5, ease: 'back.out(1.7)'});
                }, 3000); // Show after 3 seconds

                closeTechTipBtn.addEventListener('click', () => {
                     gsap.to(stickyNote, {
                         scale: 0.8,
                         opacity: 0,
                         duration: 0.3,
                         ease: "back.in(1.7)",
                         onComplete: () => {
                             stickyNote.style.display = 'none';
                             localStorage.setItem("techTipDismissed", "true");
                         }
                     });
                     playSound("close");
                });
            } else {
                 stickyNote.style.display = 'none'; // Ensure it's hidden if dismissed
            }
        }

        // Chat Bubble
        const chatBubble = document.getElementById("chat-bubble");
        if (chatBubble) {
            setTimeout(() => {
                chatBubble.style.display = 'flex';
                gsap.from(chatBubble, { x: 50, opacity: 0, duration: 0.5, ease: "power2.out" });
            }, 4500); // Show after sticky note potentially

            chatBubble.addEventListener("click", () => {
                alert("Live chat coming soon! For urgent help, please call or email us via the Contact section.");
                playSound("confirm");
            });
            chatBubble.addEventListener("mouseover", () => playSound("hover", 0.4));
            chatBubble.addEventListener("keydown", (e) => {
                 if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      chatBubble.click();
                 }
            });
        }

        // Scroll Top Button
        const scrollTopBtn = document.getElementById("scroll-top-button");
        if (scrollTopBtn) {
             function checkScrollTopVisibility() {
                 const isVisible = window.scrollY > 350;
                 if (isVisible && scrollTopBtn.style.display !== 'flex') {
                      scrollTopBtn.style.display = 'flex';
                      gsap.fromTo(scrollTopBtn, {opacity: 0, scale: 0.5}, {opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.7)'});
                 } else if (!isVisible && scrollTopBtn.style.display !== 'none') {
                      gsap.to(scrollTopBtn, {opacity: 0, scale: 0.5, duration: 0.3, ease: 'back.in(1.7)', onComplete: () => {
                           scrollTopBtn.style.display = 'none';
                      }});
                 }
             }

            window.addEventListener("scroll", debounce(checkScrollTopVisibility, 100), { passive: true });
            scrollTopBtn.addEventListener("click", () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                playSound("click");
            });
            checkScrollTopVisibility(); // Initial check
        }
    }

    /**
     * Initializes miscellaneous interactive elements (trivia, easter egg, etc.).
     */
    function initMisc() {
        // Tech Trivia Update
        const triviaTextElement = document.getElementById("trivia-text");
        if (triviaTextElement) {
            const trivia = [
                "The first computer 'bug' was literally a moth found in a relay in 1947.",
                "The first 1GB hard drive (IBM 3380) in 1980 weighed over 500 pounds.",
                "Domain Name System (DNS), the internet's phonebook, was introduced in 1983.",
                "Approximately 90% of the world's data was created in the last two years.",
                "The QWERTY keyboard layout was designed to slow typists down.",
                "There are more devices connected to the internet than people on Earth."
            ];
            triviaTextElement.textContent = trivia[Math.floor(Math.random() * trivia.length)];
        }

        // Easter Egg (Konami Code or similar could be fun too)
        const easterEggTrigger = document.querySelector(".easter-egg-trigger");
        if (easterEggTrigger && typeof confetti !== 'undefined') { // Check if confetti library is loaded
            let clickCount = 0;
            const requiredClicks = 7; // Number of clicks needed

            easterEggTrigger.addEventListener("click", () => {
                clickCount++;
                 playSound('hover', 0.2); // Subtle feedback
                if (clickCount === requiredClicks) {
                    confetti({
                        particleCount: 150,
                        spread: 80,
                        origin: { y: 0.6 },
                        colors: ["#00a000", "#4CAF50", "#ffffff", "#ffeb3b"], // Sysfx colors + white/yellow
                        scalar: 1.1
                    });
                    alert("✨ Easter Egg Found! ✨\nThanks for visiting! Mention code 'SYSFX10' for 10% off your next service!");
                    playSound("confirm"); // Confirmation sound
                    clickCount = 0; // Reset count
                }
                // Reset if clicks are too far apart (optional)
                setTimeout(() => { if(clickCount < requiredClicks) clickCount = 0; }, 2000);
            });
        }

        // Update Footer Year
        const yearSpan = document.getElementById("current-year");
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }

        // Add hover sounds to social links
         document.querySelectorAll('.social-links a').forEach(link => {
            link.addEventListener('mouseover', () => playSound('hover', 0.3));
         });
    }


    // --- Run Initializations ---
    initHeader();
    initNavigation();
    initTypingEffect();
    initDarkMode();
    initParticles();
    initMap(); // Initialize map after particles (less critical)
    initTestimonialSlider();
    initStatsCounter();
    initCustomCursor();
    initModals();
    initScrollAnimations();
    initLightbox();
    initMusicPlayer();
    initFloatingElements();
    initMisc();

    // Final check log
    console.log("sysfx scripts initialized successfully.");

}); // End DOMContentLoaded
