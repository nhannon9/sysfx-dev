/**
 * sysfx Website Script
 * Version: 1.2
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
     * @param {string} type - The type of sound ('click', 'hover', 'confirm', 'open', 'close').
     * @param {number} [volume=0.8] - Volume level (0 to 1).
     */
    const soundCache = {};
    function playSound(type, volume = 0.8) {
        // Example sound URLs (replace/add as needed)
        const sounds = {
            click: "https://cdn.freesound.org/previews/245/245645_4055516-lq.mp3",
            hover: "https://cdn.freesound.org/previews/184/184438_2393279-lq.mp3",
            confirm: "https://cdn.freesound.org/previews/505/505727_11019708-lq.mp3",
            open: "https://cdn.freesound.org/previews/661/661481_12731996-lq.mp3", // Example: UI reveal sound
            close: "https://cdn.freesound.org/previews/245/245645_4055516-lq.mp3" // Example: UI close (can reuse click)
        };

        if (!sounds[type]) {
            console.warn(`Sound type "${type}" not defined.`);
            return;
        }

        try {
            if (!soundCache[type]) {
                soundCache[type] = new Audio(sounds[type]);
                soundCache[type].volume = Math.max(0, Math.min(volume, 1));
                soundCache[type].preload = "auto";
            }
            if (soundCache[type].readyState >= 2) { // HAVE_CURRENT_DATA or more
                 soundCache[type].currentTime = 0;
                 soundCache[type].play().catch(e => console.warn(`Sound play failed [${type}]: ${e.message}`));
            } else {
                soundCache[type].addEventListener('canplaythrough', () => {
                     soundCache[type].currentTime = 0;
                     soundCache[type].play().catch(e => console.warn(`Sound play failed [${type}]: ${e.message}`));
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
        announcement.className = "sr-only";
        announcement.textContent = message;
        body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 1500);
    }

    /**
     * Smoothly scrolls to a target element, using scroll-padding-top defined in CSS.
     * @param {string} selector - The CSS selector for the target element (e.g., '#contact').
     */
    function scrollToSection(selector) {
        const targetElement = document.querySelector(selector);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start' // Align to top, respecting scroll-padding-top
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

        function updateClock() {
            if (clockElement) {
                try {
                    const now = new Date();
                    const timeFormat = new Intl.DateTimeFormat("en-US", { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'America/New_York', hour12: true });
                    const dateFormat = new Intl.DateTimeFormat("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' });
                    const timeZoneAbbr = new Intl.DateTimeFormat("en-US", { timeZoneName: 'short', timeZone: 'America/New_York' }).formatToParts(now).find(part => part.type === 'timeZoneName')?.value || 'EST';

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
        setInterval(updateClock, 1000);

        let lastHeaderHeight = 0;
        function updateLayout() {
            if (!header) return;

            const currentHeaderHeight = header.offsetHeight;
            if (currentHeaderHeight !== lastHeaderHeight) {
                body.style.paddingTop = `${currentHeaderHeight}px`;
                // Update scroll-padding-top dynamically as well
                document.documentElement.style.scrollPaddingTop = `${currentHeaderHeight + 10}px`; // Add buffer
                lastHeaderHeight = currentHeaderHeight;
            }

            if (scrollProgress) {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const docHeight = Math.max(body.scrollHeight, document.documentElement.scrollHeight, body.offsetHeight, document.documentElement.offsetHeight, body.clientHeight, document.documentElement.clientHeight) - window.innerHeight;
                const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
                scrollProgress.style.width = `${scrollPercent}%`;
            }
        }

        requestAnimationFrame(() => {
             updateLayout();
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
            if (body.classList.contains('nav-active')) return; // Prevent double trigger
            body.classList.add('nav-active', 'no-scroll');
            navToggle.setAttribute('aria-expanded', 'true');
            navToggle.querySelector('i').classList.replace('fa-bars', 'fa-times');
            mainNav.querySelector('a').focus();
            playSound("open", 0.6);
        }

        function closeNav() {
            if (!body.classList.contains('nav-active')) return; // Prevent double trigger
            body.classList.remove('nav-active', 'no-scroll');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');
            playSound("close", 0.6);
        }

        navToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering document click listener
            const isNavActive = body.classList.contains('nav-active');
            if (isNavActive) {
                closeNav();
            } else {
                openNav();
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetHref = link.getAttribute('href');
                if (targetHref && targetHref.startsWith('#')) {
                    e.preventDefault();
                    closeNav(); // Close nav immediately on mobile
                    // Scroll after slight delay to allow nav to close if needed
                    setTimeout(() => {
                         scrollToSection(targetHref);
                    }, 50);
                }
                // Allow default for non-hash links
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape" && body.classList.contains('nav-active')) {
                closeNav();
            }
        });

        document.addEventListener('click', (e) => {
            // Close nav only if click is outside nav AND outside toggle button
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
            "Building the Web of Tomorrow.",
            "Making Technology Work For You.",
            "Fast Repairs, Lasting Solutions."
        ];
        let currentPhraseIndex = 0;
        let charIndex = 0;
        let isTyping = true;
        const typingSpeed = 55;
        const erasingSpeed = 35;
        const pauseBetweenPhrases = 2000;
        let timeoutId;

        function type() {
            // Ensure element still exists (might be removed/replaced dynamically in some frameworks)
            if (!document.contains(typingElement)) return;

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
            if (!document.contains(typingElement)) return;

             const currentText = typingElement.textContent;
            if (currentText.length > 0) {
                typingElement.textContent = currentText.slice(0, -1);
                timeoutId = setTimeout(erase, erasingSpeed);
            } else {
                isTyping = true;
                charIndex = 0;
                currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
                timeoutId = setTimeout(type, 500);
            }
        }
        clearTimeout(timeoutId);
        type();
    }

    /**
     * Initializes dark mode toggle functionality.
     */
    function initDarkMode() {
        const darkModeToggle = document.getElementById("darkModeToggle");
        if (!darkModeToggle) return;

        const icon = darkModeToggle.querySelector("i");
        const textSpan = darkModeToggle.querySelector(".mode-button-text"); // Get the text span
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        let isDarkMode = localStorage.getItem("darkMode") === "enabled" || (localStorage.getItem("darkMode") === null && prefersDark);

        function applyDarkMode(active) {
            body.classList.toggle("dark-mode", active);
            icon.classList.replace(active ? "fa-moon" : "fa-sun", active ? "fa-sun" : "fa-moon");

            // Update button text and aria-label
            if (textSpan) {
                 textSpan.textContent = active ? " Light Mode" : " Dark Mode";
            }
            darkModeToggle.setAttribute('aria-label', active ? 'Switch to Light Mode' : 'Switch to Dark Mode');

            localStorage.setItem("darkMode", active ? "enabled" : "disabled");
            updateParticles();
            updateMapMarkers();
        }

        darkModeToggle.addEventListener("click", () => {
            isDarkMode = !isDarkMode;
            applyDarkMode(isDarkMode);
            playSound("click", 0.7); // Slightly different volume
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
            return;
        }
        updateParticles();
        // Resize handler added in initHeader
    }
    function updateParticles() {
         if (typeof particlesJS === 'undefined' || !document.getElementById('particles-js')) return;
         const isDarkMode = body.classList.contains("dark-mode");
         const particleColor = isDarkMode ? "#ffffff" : "#00a000";
         const lineColor = isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 160, 0, 0.5)"; // Use rgba for lines
         const particleOpacity = isDarkMode ? 0.7 : 0.4;

         particlesJS("particles-js", {
            particles: {
                number: { value: Math.max(30, Math.min(window.innerWidth / 15, 80)), density: { enable: true, value_area: 800 } },
                color: { value: particleColor },
                shape: { type: "circle" },
                opacity: { value: particleOpacity, random: true, anim: { enable: true, speed: 0.5, opacity_min: 0.1, sync: false } },
                size: { value: 3, random: true, anim: { enable: false } },
                line_linked: { enable: true, distance: 150, color: lineColor, opacity: 0.3, width: 1 }, // Use lineColor var
                move: { enable: true, speed: 2, direction: "none", random: true, straight: false, out_mode: "out", bounce: false }
            },
            interactivity: {
                detect_on: "canvas",
                events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: false }, resize: true },
                modes: { grab: { distance: 120, line_linked: { opacity: 0.6 } } }
            },
            retina_detect: true
        });
    }


    /**
     * Initializes the Leaflet map.
     */
    let mapInstance = null;
    let markerLayer = null;
    function initMap() {
        const mapElement = document.getElementById("map");
        if (!mapElement || typeof L === "undefined") { return; }
        if (mapInstance) { mapInstance.remove(); mapInstance = null; }

        mapInstance = L.map(mapElement, {
            scrollWheelZoom: false,
            dragging: !L.Browser.mobile,
            touchZoom: L.Browser.mobile,
            zoomControl: true
        }).setView([41.2788, -72.5276], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
            minZoom: 10
        }).addTo(mapInstance);

        markerLayer = L.layerGroup().addTo(mapInstance);
        updateMapMarkers();
    }
    function updateMapMarkers() {
        if (!mapInstance || !markerLayer || typeof L === "undefined") return;

        const isDarkMode = body.classList.contains("dark-mode");
        // Use CSS variables directly if possible, otherwise define colors here
        const iconColor = getComputedStyle(document.documentElement).getPropertyValue(isDarkMode ? '--secondary-color' : '--primary-color').trim();
        const borderColor = isDarkMode ? "#444" : "#fff";

        const customIcon = L.divIcon({
            className: 'custom-map-marker',
            html: `<span style="background-color:${iconColor}; border: 2px solid ${borderColor};" class="marker-inner"></span>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        markerLayer.clearLayers();
        const markersData = [
            { lat: 41.2788, lon: -72.5276, popup: "<strong>sysfx HQ</strong><br>123 Main St<br>Clinton, CT", targetSection: "#contact" },
        ];

        markersData.forEach(({ lat, lon, popup, targetSection }) => {
            const marker = L.marker([lat, lon], { icon: customIcon }).addTo(markerLayer);
            marker.bindPopup(popup);
            marker.on('mouseover', () => marker.openPopup());
            if (targetSection && document.querySelector(targetSection)) {
                marker.on('click', () => scrollToSection(targetSection));
            }
        });
    }


    /**
     * Initializes the testimonial slider (Fade Implementation).
     */
    function initTestimonialSlider() {
        const slider = document.querySelector(".testimonial-slider");
        const testimonials = document.querySelectorAll(".testimonial");
        const prevBtn = document.querySelector(".carousel-prev");
        const nextBtn = document.querySelector(".carousel-next");

        if (!slider || testimonials.length < 2 || !prevBtn || !nextBtn) { // Need at least 2 slides
             if (testimonials.length === 1) { // Hide buttons if only one slide
                 if(prevBtn) prevBtn.style.display = 'none';
                 if(nextBtn) nextBtn.style.display = 'none';
             }
             return;
        }

        let currentIndex = 0;
        let slideInterval;
        const totalSlides = testimonials.length;

        // Setup initial state using JS for reliability
        testimonials.forEach((testimonial, index) => {
            testimonial.style.opacity = index === 0 ? '1' : '0';
            testimonial.style.position = index === 0 ? 'relative' : 'absolute';
            testimonial.style.top = '0';
            testimonial.style.left = '0';
            testimonial.setAttribute('aria-hidden', String(index !== 0));
        });

        function showTestimonial(index) {
            const previousIndex = currentIndex;
            currentIndex = (index + totalSlides) % totalSlides;

            if (previousIndex === currentIndex) return;

            const prevSlide = testimonials[previousIndex];
            const nextSlide = testimonials[currentIndex];

            // Make next slide visible (but transparent) before animation
            nextSlide.style.position = 'relative'; // Bring to front layer conceptually
            nextSlide.style.opacity = '0'; // Start transparent
            nextSlide.setAttribute('aria-hidden', 'false');

            // Fade out previous, fade in next
            gsap.to(prevSlide, {
                opacity: 0,
                duration: 0.6, // Slower fade
                ease: "power2.inOut",
                onComplete: () => {
                    prevSlide.style.position = 'absolute'; // Move back after fade
                    prevSlide.setAttribute('aria-hidden', 'true');
                }
            });
            gsap.to(nextSlide, {
                opacity: 1,
                duration: 0.6, // Slower fade
                ease: "power2.inOut"
            });
        }

        function next() { showTestimonial(currentIndex + 1); }
        function prev() { showTestimonial(currentIndex - 1); }

        function startAutoSlide() {
            stopAutoSlide();
            slideInterval = setInterval(next, 6000); // Slower auto-slide
        }
        function stopAutoSlide() { clearInterval(slideInterval); }

        nextBtn.addEventListener('click', () => { next(); playSound('click', 0.5); stopAutoSlide(); startAutoSlide(); });
        prevBtn.addEventListener('click', () => { prev(); playSound('click', 0.5); stopAutoSlide(); startAutoSlide(); });

        const container = document.querySelector('.carousel-container');
        if(container) {
            container.addEventListener('mouseenter', stopAutoSlide);
            container.addEventListener('mouseleave', startAutoSlide);
        }
        startAutoSlide();
    }

    /**
     * Initializes the counting animation for stats numbers.
     */
    function initStatsCounter() {
        const statNumbers = document.querySelectorAll(".stat-number");
        if (statNumbers.length === 0 || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            statNumbers.forEach(stat => {
                const target = parseInt(stat.getAttribute("data-target")) || 0;
                stat.textContent = target.toLocaleString() + (stat.textContent.includes('+') ? '+' : '');
            });
            return;
        }
        gsap.registerPlugin(ScrollTrigger);

        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute("data-target")) || 0;
            const nextSiblingText = stat.nextSibling ? stat.nextSibling.nodeValue : '';
            const hasPlus = nextSiblingText && nextSiblingText.trim().startsWith('+');

            ScrollTrigger.create({
                trigger: stat,
                start: "top 85%",
                once: true,
                onEnter: () => {
                    gsap.fromTo(stat,
                        { textContent: 0 },
                        {
                            textContent: target,
                            duration: 2.5,
                            ease: "power2.out",
                            snap: { textContent: 1 },
                            onUpdate: function() {
                                stat.textContent = Math.ceil(this.targets()[0].textContent).toLocaleString() + (hasPlus ? '+' : '');
                            },
                            onComplete: function() {
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
             return;
        }

        let mouseX = -100, mouseY = -100; // Start off-screen
        let currentX = -100, currentY = -100;
        const smoothing = 0.12;

        function updateCursorPosition(e) { mouseX = e.clientX; mouseY = e.clientY; }

        function renderCursor() {
            const deltaX = mouseX - currentX;
            const deltaY = mouseY - currentY;
            currentX += deltaX * smoothing;
            currentY += deltaY * smoothing;
            cursor.style.transform = `translate(${currentX - cursor.offsetWidth / 2}px, ${currentY - cursor.offsetHeight / 2}px)`;
            requestAnimationFrame(renderCursor);
        }

        document.addEventListener("mousemove", updateCursorPosition);
        requestAnimationFrame(renderCursor); // Start rendering loop

        document.addEventListener("mousedown", () => cursor.classList.add("click"));
        document.addEventListener("mouseup", () => cursor.classList.remove("click"));

        document.querySelectorAll('a, button, .service, .gallery-item, .nav-link, .modal-close, .carousel-control, .social-links a, .floating-action-button, .chat-bubble, [role="button"]')
            .forEach(el => {
                el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
                el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
            });

        // Add ready class to body for CSS to show cursor
        body.classList.add('cursor-ready');
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
        let previouslyFocusedElement = null; // To return focus

        function openModal(modalId, triggerElement) {
            const modal = modalMap.get(modalId);
            if (modal && !modal.classList.contains('active')) {
                previouslyFocusedElement = triggerElement || document.activeElement; // Store trigger
                modal.classList.add('active');
                modal.setAttribute('aria-hidden', 'false');
                body.classList.add('no-scroll');
                const closeButton = modal.querySelector('.modal-close');
                if (closeButton) setTimeout(() => closeButton.focus(), 50); // Delay focus slightly
                playSound("open");
            } else if (!modal) {
                console.warn(`Modal with ID "${modalId}" not found.`);
            }
        }

        function closeModal(modal) {
             if(modal && modal.classList.contains('active')) {
                modal.classList.remove('active');
                modal.setAttribute('aria-hidden', 'true');
                body.classList.remove('no-scroll');
                 playSound("close");
                 // Return focus to the element that opened the modal
                 if (previouslyFocusedElement) {
                     previouslyFocusedElement.focus();
                     previouslyFocusedElement = null;
                 }
             }
        }

        serviceArticles.forEach(article => {
            const modalId = article.getAttribute("data-modal-target");
            if (modalId) {
                article.addEventListener('click', (e) => openModal(modalId, e.currentTarget));
                article.addEventListener('keydown', (e) => {
                     if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openModal(modalId, e.currentTarget);
                     }
                });
            }
        });

        modals.forEach(modal => {
            const closeBtn = modal.querySelector(".modal-close");
            const modalActions = modal.querySelectorAll(".modal-action[data-link]");

            if (closeBtn) {
                closeBtn.addEventListener('click', () => closeModal(modal));
            }
            modal.addEventListener('click', (e) => {
                if (e.target === modal) { closeModal(modal); }
            });
            modalActions.forEach(button => {
                 button.addEventListener('click', (e) => {
                     e.stopPropagation();
                     const targetSection = button.getAttribute('data-link');
                     if(targetSection) {
                          closeModal(modal);
                          setTimeout(() => scrollToSection(targetSection), 100);
                     }
                 });
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape") {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) { closeModal(activeModal); }
            }
        });
    }

    /**
     * Initializes GSAP ScrollTrigger animations for sections.
     */
    function initScrollAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.warn("GSAP/ScrollTrigger not found, skipping scroll animations.");
            document.querySelectorAll(".section-animation").forEach(section => section.classList.add('visible'));
            return;
        }
        gsap.registerPlugin(ScrollTrigger);

        document.querySelectorAll(".section-animation").forEach(section => {
            gsap.fromTo(section, { opacity: 0, y: 50 }, {
                opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
                scrollTrigger: {
                    trigger: section, start: "top 85%", end: "bottom 15%",
                    toggleActions: "play none none reset",
                    onEnter: () => section.classList.add("visible"),
                    onLeaveBack: () => section.classList.remove("visible")
                }
            });
        });

        // Footer Animation Trigger
        const footer = document.querySelector(".main-footer");
        if (footer) {
             ScrollTrigger.create({
                 trigger: footer,
                 start: "top 95%", // Trigger when footer is almost in view
                 once: true, // Only trigger once
                 onEnter: () => footer.classList.add('visible')
             });
        }
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
        let currentTrigger = null;

        function openLightbox(item) {
            const imgSrc = item.getAttribute("data-src");
            const imgAlt = item.getAttribute("data-alt") || item.querySelector("img")?.alt || "Enlarged gallery image";
            if (!imgSrc) return;

            lightboxImage.src = imgSrc;
            lightboxImage.alt = imgAlt;
            lightboxImage.style.transform = 'scale(1)'; // Reset zoom
            lightboxImage.classList.remove('zoomed');
            lightbox.classList.add('active');
            lightbox.setAttribute('aria-hidden', 'false');
            body.classList.add('no-scroll');
            currentTrigger = item;
            setTimeout(() => lightboxClose.focus(), 50); // Delay focus
            playSound("open");
        }

        function closeLightbox() {
            if (!lightbox.classList.contains('active')) return; // Prevent double close
            lightbox.classList.remove('active');
            lightbox.setAttribute('aria-hidden', 'true');
            body.classList.remove('no-scroll');
             playSound("close");
             if (currentTrigger) { currentTrigger.focus(); currentTrigger = null; }
             // Don't reset src immediately to avoid flicker during fade out
             // setTimeout(() => { if (!lightbox.classList.contains('active')) lightboxImage.src = ''; }, 400);
        }

        function toggleZoom(e) {
             e.stopPropagation();
             const isZoomed = lightboxImage.classList.toggle('zoomed');
             lightboxImage.style.transform = isZoomed ? 'scale(1.5)' : 'scale(1)';
        }

        galleryItems.forEach(item => {
            item.addEventListener("click", () => openLightbox(item));
            item.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(item); } });
            item.addEventListener("mouseover", () => playSound("hover", 0.4));
        });

        lightboxClose.addEventListener("click", closeLightbox);
        lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
        lightboxImage.addEventListener('click', toggleZoom);

        document.addEventListener('keydown', (e) => { if (e.key === "Escape" && lightbox.classList.contains('active')) closeLightbox(); });
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
                 if (play && backgroundMusic.paused) { // Only play if paused
                     backgroundMusic.play().then(() => {
                         gsap.to(backgroundMusic, { volume: 0.4, duration: 1 });
                         musicToggle.classList.remove("muted");
                         musicToggle.setAttribute('aria-pressed', 'true');
                         musicToggle.setAttribute('aria-label', 'Pause background music');
                         localStorage.setItem("musicPlaying", "true");
                         isMusicPlaying = true;
                     }).catch(e => {
                         console.warn("Music autoplay failed:", e.message);
                         setMusicState(false);
                     });
                 } else if (!play && !backgroundMusic.paused) { // Only pause if playing
                     gsap.to(backgroundMusic, {
                         volume: 0, duration: 0.8,
                         onComplete: () => {
                             backgroundMusic.pause();
                             musicToggle.classList.add("muted");
                             musicToggle.setAttribute('aria-pressed', 'false');
                             musicToggle.setAttribute('aria-label', 'Play background music');
                             localStorage.setItem("musicPlaying", "false");
                             isMusicPlaying = false;
                         }
                     });
                 } else {
                     // Update UI even if state matches (e.g., on initial load)
                      musicToggle.classList.toggle("muted", !play);
                      musicToggle.setAttribute('aria-pressed', String(play));
                      musicToggle.setAttribute('aria-label', play ? 'Pause background music' : 'Play background music');
                 }
             } catch (error) { console.error("Error controlling music:", error); }
        }

        musicToggle.addEventListener("click", () => { setMusicState(!isMusicPlaying); playSound("click"); });

        // Initialize state
        backgroundMusic.volume = 0; // Start silent
        setMusicState(isMusicPlaying); // Set initial UI and attempt play if needed
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
                "Backup your important data regularly (cloud or external drive).",
                "Windows Key + L locks your computer instantly.",
                "Clean your keyboard and mouse periodically for hygiene and performance.",
                "Right-click > 'Inspect' in your browser opens developer tools.",
                "Consider using an SSD for significantly faster boot and load times."
            ];
            const tipDismissed = localStorage.getItem("techTipDismissed") === "true";

            if (!tipDismissed) {
                techTipText.textContent = tips[Math.floor(Math.random() * tips.length)];
                setTimeout(() => {
                     stickyNote.style.display = 'flex';
                     gsap.from(stickyNote, { y: -30, opacity: 0, duration: 0.5, ease: 'back.out(1.7)'});
                }, 3000);

                closeTechTipBtn.addEventListener('click', () => {
                     gsap.to(stickyNote, {
                         scale: 0.8, opacity: 0, duration: 0.3, ease: "back.in(1.7)",
                         onComplete: () => { stickyNote.style.display = 'none'; localStorage.setItem("techTipDismissed", "true"); }
                     });
                     playSound("close");
                });
            } else { stickyNote.style.display = 'none'; }
        }

        // Chat Bubble
        const chatBubble = document.getElementById("chat-bubble");
        if (chatBubble) {
            setTimeout(() => {
                chatBubble.style.display = 'flex';
                gsap.from(chatBubble, { x: 50, opacity: 0, duration: 0.5, ease: "power2.out" });
            }, 4500);

            chatBubble.addEventListener("click", () => {
                alert("Live chat coming soon! For urgent help, please call or email us via the Contact section.");
                playSound("confirm");
            });
            chatBubble.addEventListener("mouseover", () => playSound("hover", 0.4));
            chatBubble.addEventListener("keydown", (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chatBubble.click(); } });
        }

        // Scroll Top Button
        const scrollTopBtn = document.getElementById("scroll-top-button");
        if (scrollTopBtn) {
             function checkScrollTopVisibility() {
                 const isVisible = window.scrollY > 400; // Increased threshold
                 const currentlyDisplayed = scrollTopBtn.style.display !== 'none';

                 if (isVisible && !currentlyDisplayed) {
                      scrollTopBtn.style.display = 'flex';
                      gsap.fromTo(scrollTopBtn, {opacity: 0, scale: 0.5}, {opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.7)'});
                 } else if (!isVisible && currentlyDisplayed) {
                      gsap.to(scrollTopBtn, {opacity: 0, scale: 0.5, duration: 0.3, ease: 'back.in(1.7)', onComplete: () => {
                           scrollTopBtn.style.display = 'none';
                      }});
                 }
             }
            window.addEventListener("scroll", debounce(checkScrollTopVisibility, 100), { passive: true });
            scrollTopBtn.addEventListener("click", () => { window.scrollTo({ top: 0, behavior: "smooth" }); playSound("click"); });
            checkScrollTopVisibility(); // Initial check
        }
    }

    /**
    * Initializes Scrollspy for navigation link highlighting.
    */
   function initScrollSpy() {
       if (typeof IntersectionObserver === 'undefined') {
            console.warn("IntersectionObserver not supported, skipping scrollspy.");
            return;
       }

       const sections = document.querySelectorAll('main section[id]');
       const navLinks = document.querySelectorAll('.main-nav a.nav-link[data-section-id]');
       const navLinkMap = new Map();
       navLinks.forEach(link => navLinkMap.set(link.getAttribute('data-section-id'), link));

       if (sections.length === 0 || navLinks.length === 0) return;

       let currentActiveSectionId = null;

       const observerCallback = (entries) => {
            let mostVisibleEntry = null;
            let maxRatio = 0;

            entries.forEach(entry => {
                 if (entry.isIntersecting) {
                    // Prioritize sections that are more fully visible
                    if (entry.intersectionRatio > maxRatio) {
                        maxRatio = entry.intersectionRatio;
                        mostVisibleEntry = entry;
                    }
                    // If two sections have similar high visibility, prefer the one closer to the top
                    else if (entry.intersectionRatio === maxRatio && mostVisibleEntry && entry.boundingClientRect.top < mostVisibleEntry.boundingClientRect.top) {
                         mostVisibleEntry = entry;
                    }
                 }
            });

             // Check if window is scrolled to the very top
            if (window.scrollY < 50 && navLinkMap.has('home')) {
                 currentActiveSectionId = 'home';
            }
            // Check if scrolled near the bottom
            else if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100 && navLinkMap.has('contact')) {
                 currentActiveSectionId = 'contact'; // Highlight contact when near bottom
            }
            // Otherwise, use the most visible entry
            else if (mostVisibleEntry) {
                 currentActiveSectionId = mostVisibleEntry.target.id;
            }
            // If nothing is significantly visible (e.g., between sections), keep the last active one (or clear all)
             // else { currentActiveSectionId = null; } // Option to clear if nothing matches well

            // Update nav links
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('data-section-id') === currentActiveSectionId);
            });
       };

       const observerOptions = {
            root: null, // Use viewport as root
            rootMargin: '-20% 0px -50% 0px', // Adjust margins: trigger area is middle 30% of viewport vertically
            threshold: 0 // Trigger as soon as any part enters/leaves the margin
       };

       const observer = new IntersectionObserver(observerCallback, observerOptions);
       sections.forEach(section => observer.observe(section));
   }


    /**
     * Initializes miscellaneous interactive elements (trivia, easter egg, etc.).
     */
    function initMisc() {
        const triviaTextElement = document.getElementById("trivia-text");
        if (triviaTextElement) {
            const trivia = [
                "The first computer 'bug' was literally a moth found in a relay in 1947.",
                "The first 1GB hard drive (IBM 3380) in 1980 weighed over 500 pounds.",
                "Domain Name System (DNS), the internet's phonebook, was introduced in 1983.",
                "Approximately 90% of the world's data was created in the last two years.",
                "The QWERTY keyboard layout was designed to slow typists down.",
                "There are more devices connected to the internet than people on Earth.",
                "The term 'Wi-Fi' doesn't actually stand for anything.",
                "The average smartphone user touches their phone over 2,600 times a day.",
                "The first computer mouse was made of wood.",
                "CAPTCHA stands for 'Completely Automated Public Turing test to tell Computers and Humans Apart'."
            ];
            triviaTextElement.textContent = trivia[Math.floor(Math.random() * trivia.length)];
             // Optional: Cycle trivia every X seconds
            // setInterval(() => {
            //     triviaTextElement.textContent = trivia[Math.floor(Math.random() * trivia.length)];
            // }, 15000); // Change every 15 seconds
        }

        const easterEggTrigger = document.querySelector(".easter-egg-trigger");
        if (easterEggTrigger && typeof confetti !== 'undefined') {
            let clickCount = 0;
            const requiredClicks = 7;
            let resetTimeout;

            easterEggTrigger.addEventListener("click", () => {
                clickCount++;
                playSound('hover', 0.2);
                clearTimeout(resetTimeout); // Reset timer on each click

                if (clickCount === requiredClicks) {
                    confetti({
                        particleCount: 150, spread: 80, origin: { y: 0.6 },
                        colors: ["#00a000", "#4CAF50", "#ffffff", "#ffeb3b"], scalar: 1.1
                    });
                    alert("✨ Easter Egg Found! ✨\nThanks for visiting! Mention code 'SYSFX10' for 10% off your next service!");
                    playSound("confirm");
                    clickCount = 0;
                } else {
                     // Reset count if no click for 2 seconds
                     resetTimeout = setTimeout(() => { clickCount = 0; }, 2000);
                }
            });
        }

        const yearSpan = document.getElementById("current-year");
        if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); }

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
    initMap();
    initTestimonialSlider();
    initStatsCounter();
    initCustomCursor();
    initModals();
    initScrollAnimations(); // Includes Footer Animation
    initLightbox();
    initMusicPlayer();
    initFloatingElements();
    initScrollSpy(); // Initialize Scrollspy after other elements are set up
    initMisc();

    console.log("sysfx scripts initialized successfully (v1.2).");

}); // End DOMContentLoaded
