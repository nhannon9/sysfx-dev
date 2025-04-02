document.addEventListener("DOMContentLoaded", () => {
    const emailConfig = {
        user: "nick",
        domain: "sysfx.net",
        getEmail: function() { return `${this.user}@${this.domain}`; }
    };

    const emailElement = document.getElementById("email");
    if (emailElement) emailElement.innerHTML = `<a href="mailto:${emailConfig.getEmail()}" aria-label="Email sysfx">${emailConfig.getEmail()}</a>`;

    const emailLink = document.getElementById("email-link");
    if (emailLink) {
        emailLink.href = `mailto:${emailConfig.getEmail()}`;
        emailLink.addEventListener("click", () => playSound("click"));
    }

    const typingElement = document.getElementById("typing-effect");
    if (typingElement) {
        const phrases = [
            "Your trusted tech partner.",
            "Securing your digital future.",
            "Providing next-gen tech solutions.",
            "Is this thing on?",
            "Precision tech expertise.",
            "Your IT partner in Clinton, CT.",
            "Innovating for business success.",
            "Securing your tech, 24/7.",
            "Building the web of tomorrow."
        ];
        let currentPhraseIndex = 0;
        let charIndex = 0;
        let isTyping = true;
        const typingSpeed = 60;
        const erasingSpeed = 40;
        const pauseBetweenPhrases = 2500;

        function typeText() {
            const currentPhrase = phrases[currentPhraseIndex];
            if (isTyping) {
                if (charIndex < currentPhrase.length) {
                    typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
                    charIndex++;
                    requestAnimationFrame(() => setTimeout(typeText, typingSpeed));
                } else {
                    isTyping = false;
                    setTimeout(eraseText, pauseBetweenPhrases + Math.random() * 500);
                }
            }
        }

        function eraseText() {
            if (typingElement.textContent.length > 0) {
                typingElement.textContent = typingElement.textContent.slice(0, -1);
                requestAnimationFrame(() => setTimeout(eraseText, erasingSpeed));
            } else {
                isTyping = true;
                charIndex = 0;
                currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
                setTimeout(typeText, 600);
            }
        }
        typeText();
    }

    const darkModeToggle = document.getElementById("darkModeToggle");
    const body = document.body;
    if (darkModeToggle) {
        body.classList.remove("dark-mode"); // Reset state to avoid cache stickiness
        const savedMode = localStorage.getItem("darkMode");
        if (savedMode === "enabled") {
            body.classList.add("dark-mode");
            darkModeToggle.querySelector("i").classList.replace("fa-moon", "fa-sun");
            darkModeToggle.querySelector(".mode-text").textContent = "Light Mode";
            updateParticles();
            updateMarkers();
        }

        darkModeToggle.removeEventListener("click", toggleDarkMode); // Prevent duplicate listeners
        darkModeToggle.addEventListener("click", toggleDarkMode);

        function toggleDarkMode() {
            body.classList.toggle("dark-mode");
            const icon = darkModeToggle.querySelector("i");
            const text = darkModeToggle.querySelector(".mode-text");
            const isDarkMode = body.classList.contains("dark-mode");
            icon.classList.replace(isDarkMode ? "fa-moon" : "fa-sun", isDarkMode ? "fa-sun" : "fa-moon");
            text.textContent = isDarkMode ? "Light Mode" : "Dark Mode";
            localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
            playSound("click");
            updateParticles();
            updateMarkers();
            announceModeChange(isDarkMode ? "Dark mode enabled" : "Light mode enabled");
        }
    }

    const hamburger = document.querySelector(".hamburger");
    const navWrapper = document.querySelector(".nav-wrapper");
    if (hamburger && navWrapper) {
        hamburger.removeEventListener("click", toggleNav); // Clean up
        hamburger.addEventListener("click", toggleNav);

        function toggleNav() {
            navWrapper.classList.toggle("active");
            const isActive = navWrapper.classList.contains("active");
            hamburger.setAttribute("aria-expanded", isActive);
            const icon = hamburger.querySelector("i");
            icon.classList.toggle("fa-bars");
            icon.classList.toggle("fa-times");
            playSound("click");
            document.body.style.overflow = isActive ? "hidden" : "";
            gsap.to(navWrapper, { x: isActive ? 0 : "-100%", duration: 0.4, ease: "power2.out" });
        }

        document.removeEventListener("click", closeNavOutside); // Clean up
        document.addEventListener("click", closeNavOutside);
        document.removeEventListener("keydown", closeNavEscape);
        document.addEventListener("keydown", closeNavEscape);

        function closeNavOutside(e) {
            if (!navWrapper.contains(e.target) && !hamburger.contains(e.target) && navWrapper.classList.contains("active")) {
                closeNav();
            }
        }

        function closeNavEscape(e) {
            if (e.key === "Escape" && navWrapper.classList.contains("active")) {
                closeNav();
            }
        }

        function closeNav() {
            navWrapper.classList.remove("active");
            hamburger.querySelector("i").classList.replace("fa-times", "fa-bars");
            hamburger.setAttribute("aria-expanded", "false");
            document.body.style.overflow = "";
            playSound("click");
            gsap.to(navWrapper, { x: "-100%", duration: 0.4, ease: "power2.in" });
        }
    }

    function scrollToSection(id) {
        const targetElement = document.getElementById(id);
        if (targetElement) {
            const headerHeight = document.querySelector("header").offsetHeight;
            window.scrollTo({
                top: targetElement.offsetTop - (headerHeight > 50 ? 80 : 50),
                behavior: "smooth"
            });
            playSound("click");
        }
    }

    document.querySelectorAll(".nav-link").forEach(anchor => {
        anchor.removeEventListener("click", navLinkClick); // Clean up
        anchor.addEventListener("click", navLinkClick);
    });

    function navLinkClick(e) {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute("href").slice(1);
        scrollToSection(targetId);
        if (window.innerWidth <= 768 && navWrapper.classList.contains("active")) {
            navWrapper.classList.remove("active");
            hamburger.querySelector("i").classList.replace("fa-times", "fa-bars");
            hamburger.setAttribute("aria-expanded", "false");
            document.body.style.overflow = "";
            gsap.to(navWrapper, { x: "-100%", duration: 0.4, ease: "power2.in" });
        }
    }

    function updateClock() {
        const clockElement = document.getElementById("current-time");
        if (clockElement) {
            const now = new Date();
            const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "America/New_York" });
            const day = now.toLocaleDateString("en-US", { weekday: "short", timeZone: "America/New_York" });
            const date = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York" });
            clockElement.innerHTML = `<i class="fas fa-clock" aria-hidden="true"></i> ${time} | ${day}, ${date} (EST)`;
        }
    }
    updateClock();
    setInterval(updateClock, 1000);

    function updateParticles() {
        const isDarkMode = body.classList.contains("dark-mode");
        particlesJS("particles-js", {
            particles: {
                number: { value: Math.min(window.innerWidth / 10, 100), density: { enable: true, value_area: 900 } },
                color: { value: isDarkMode ? "#ffffff" : "#00a000" },
                shape: { type: "polygon", polygon: { nb_sides: 6 } },
                opacity: { value: isDarkMode ? 0.9 : 0.4, random: true },
                size: { value: 5, random: true },
                line_linked: { enable: true, distance: 130, color: isDarkMode ? "#ffffff" : "#00a000", opacity: 0.5, width: 1.5 },
                move: { enable: true, speed: 5, direction: "none", random: true, straight: false, out_mode: "out" }
            },
            interactivity: {
                detect_on: "canvas",
                events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "push" }, resize: true },
                modes: { grab: { distance: 140, line_linked: { opacity: 0.7 } }, push: { particles_nb: 4 } }
            },
            retina_detect: true
        });
    }
    updateParticles();
    window.removeEventListener("resize", resizeParticles); // Clean up
    window.addEventListener("resize", resizeParticles);
    function resizeParticles() { debounce(updateParticles, 200)(); }

    const mapElement = document.getElementById("map");
    if (mapElement && typeof L !== "undefined") {
        const map = L.map(mapElement, { scrollWheelZoom: false, dragging: !L.Browser.mobile, touchZoom: false })
            .setView([41.2788, -72.5276], 14);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 18
        }).addTo(map);

        const customIcon = () => L.divIcon({
            className: "custom-icon",
            html: `<div style="background: ${body.classList.contains("dark-mode") ? "#fff" : "#00a000"}; width: 20px; height: 20px; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        const markers = [
            { lat: 41.2788, lon: -72.5276, popup: "sysfx HQ", url: "#contact" },
        ];

        const markerLayer = L.layerGroup().addTo(map);
        function updateMarkers() {
            markerLayer.clearLayers();
            markers.forEach(({ lat, lon, popup, url }) => {
                const marker = L.marker([lat, lon], { icon: customIcon() }).addTo(markerLayer)
                    .bindPopup(`<b>${popup}</b><br><a href="${url}">Visit Section</a>`)
                    .on("click", () => scrollToSection(url.slice(1)));
                marker.on("mouseover", () => marker.openPopup());
            });
        }
        updateMarkers();
    }

    const testimonials = document.querySelectorAll(".testimonial");
    const prevBtn = document.querySelector(".carousel-prev");
    const nextBtn = document.querySelector(".carousel-next");
    let currentTestimonial = 0;

    function showTestimonial(index, animate = true) {
        testimonials.forEach((t, i) => {
            if (animate) {
                gsap.to(t, {
                    opacity: i === index ? 1 : 0,
                    scale: i === index ? 1 : 0.9,
                    duration: 0.6,
                    ease: "power2.inOut",
                    onComplete: () => { t.style.position = i === index ? "relative" : "absolute"; }
                });
            } else {
                t.style.opacity = i === index ? "1" : "0";
                t.style.transform = i === index ? "scale(1)" : "scale(0.9)";
                t.style.position = i === index ? "relative" : "absolute";
            }
        });
        currentTestimonial = index;
    }

    function nextTestimonial() {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(currentTestimonial);
        playSound("click");
    }

    function prevTestimonial() {
        currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
        showTestimonial(currentTestimonial);
        playSound("click");
    }

    showTestimonial(currentTestimonial, false);
    let slideInterval = setInterval(nextTestimonial, 4500);

    if (prevBtn && nextBtn) {
        nextBtn.removeEventListener("click", nextClick); // Clean up
        nextBtn.addEventListener("click", nextClick);
        prevBtn.removeEventListener("click", prevClick);
        prevBtn.addEventListener("click", prevClick);
        [prevBtn, nextBtn].forEach(btn => {
            btn.removeEventListener("mouseover", stopSlide);
            btn.addEventListener("mouseover", stopSlide);
            btn.removeEventListener("mouseleave", startSlide);
            btn.addEventListener("mouseleave", startSlide);
        });
    }

    function nextClick() { clearInterval(slideInterval); nextTestimonial(); slideInterval = setInterval(nextTestimonial, 4500); }
    function prevClick() { clearInterval(slideInterval); prevTestimonial(); slideInterval = setInterval(nextTestimonial, 4500); }
    function stopSlide() { clearInterval(slideInterval); }
    function startSlide() { slideInterval = setInterval(nextTestimonial, 4500); }

    const statNumbers = document.querySelectorAll(".stat-number");
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute("data-count"));
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                gsap.to(stat, { textContent: target, duration: 2.5, roundProps: "textContent", ease: "power2.out" });
                observer.disconnect();
            }
        }, { threshold: 0.6 });
        observer.observe(stat);

        gsap.to(stat.closest(".stat-item"), {
            y: -20,
            ease: "power2.inOut",
            scrollTrigger: { trigger: stat.closest(".stat-item"), start: "top 80%", end: "bottom 15%", scrub: true }
        });
    });

    const cursor = document.querySelector(".cursor");
    if (cursor && window.innerWidth > 768) {
        document.removeEventListener("mousemove", moveCursor); // Clean up
        document.addEventListener("mousemove", moveCursor);
        document.removeEventListener("mousedown", pressCursor);
        document.addEventListener("mousedown", pressCursor);
        document.removeEventListener("mouseup", releaseCursor);
        document.addEventListener("mouseup", releaseCursor);

        function moveCursor(e) {
            requestAnimationFrame(() => {
                cursor.style.left = `${e.clientX}px`;
                cursor.style.top = `${e.clientY}px`;
                cursor.classList.add("trail");
                setTimeout(() => cursor.classList.remove("trail"), 120);
            });
        }

        function pressCursor() {
            cursor.classList.add("trail");
            gsap.to(cursor, { scale: 1.8, duration: 0.2, ease: "power2.out" });
        }

        function releaseCursor() {
            cursor.classList.remove("trail");
            gsap.to(cursor, { scale: 1, duration: 0.2, ease: "power2.in" });
        }

        document.querySelectorAll(".modern-button, .nav-link, .service").forEach(el => {
            el.removeEventListener("mouseenter", hoverCursor);
            el.addEventListener("mouseenter", hoverCursor);
            el.removeEventListener("mouseleave", resetCursor);
            el.addEventListener("mouseleave", resetCursor);
        });

        function hoverCursor() { gsap.to(cursor, { scale: 1.4, duration: 0.3 }); }
        function resetCursor() { gsap.to(cursor, { scale: 1, duration: 0.3 }); }
    } else if (cursor) {
        cursor.style.display = "none";
    }

    const services = document.querySelectorAll(".service");
    const modals = document.querySelectorAll(".modal");
    services.forEach(service => {
        service.removeEventListener("click", openModal);
        service.addEventListener("click", openModal);
        service.removeEventListener("mousemove", tiltService);
        service.addEventListener("mousemove", tiltService);
        service.removeEventListener("mouseleave", resetTilt);
        service.addEventListener("mouseleave", resetTilt);
        service.removeEventListener("keydown", keyOpenModal);
        service.addEventListener("keydown", keyOpenModal);

        function openModal() {
            const modal = document.getElementById(`${service.getAttribute("data-modal")}-modal`);
            if (modal) {
                modal.style.display = "flex";
                playSound("click");
                gsap.fromTo(modal.querySelector(".modal-content"), { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" });
                modal.querySelector(".modal-close").focus();
            }
        }

        function tiltService(e) {
            const rect = service.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            requestAnimationFrame(() => {
                service.style.transform = `perspective(1200px) rotateX(${y / 25}deg) rotateY(${-x / 25}deg) scale(1.08)`;
            });
        }

        function resetTilt() {
            requestAnimationFrame(() => {
                service.style.transform = "perspective(1200px) scale(1)";
            });
        }

        function keyOpenModal(e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                service.click();
            }
        }
    });

    modals.forEach(modal => {
        const closeBtn = modal.querySelector(".modal-close");
        closeBtn.removeEventListener("click", closeModal);
        closeBtn.addEventListener("click", closeModal);
        modal.removeEventListener("click", closeModalOutside);
        modal.addEventListener("click", closeModalOutside);
        modal.querySelector(".modal-action").removeEventListener("click", modalAction);
        modal.querySelector(".modal-action").addEventListener("click", modalAction);
        modal.removeEventListener("keydown", closeModalEscape);
        modal.addEventListener("keydown", closeModalEscape);

        function closeModal() {
            gsap.to(modal.querySelector(".modal-content"), {
                scale: 0.9,
                opacity: 0,
                duration: 0.3,
                ease: "back.in(1.7)",
                onComplete: () => modal.style.display = "none"
            });
            playSound("click");
        }

        function closeModalOutside(e) {
            if (e.target === modal) closeBtn.click();
        }

        function modalAction(e) {
            e.stopPropagation();
            scrollToSection("contact");
            closeBtn.click();
        }

        function closeModalEscape(e) {
            if (e.key === "Escape") closeBtn.click();
        }
    });

    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll(".parallax, .section-animation").forEach(section => {
        gsap.fromTo(section, { opacity: 0, y: 60 }, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: section, start: "top 80%", toggleActions: "play none none reset" },
            onComplete: () => section.classList.add("visible")
        });
    });

    document.querySelectorAll(".testimonial").forEach(testimonial => {
        gsap.to(testimonial, {
            y: -20,
            ease: "power2.inOut",
            scrollTrigger: { trigger: testimonial, start: "top 80%", end: "bottom 15%", scrub: true }
        });
    });

    const galleryItems = document.querySelectorAll(".gallery-item");
    const lightbox = document.querySelector(".lightbox");
    if (lightbox) {
        const lightboxImg = lightbox.querySelector("img");
        const lightboxClose = lightbox.querySelector(".lightbox-close");

        galleryItems.forEach(item => {
            item.removeEventListener("click", openLightbox);
            item.addEventListener("click", openLightbox);
            item.removeEventListener("mouseover", hoverSound);
            item.addEventListener("mouseover", hoverSound);
            item.removeEventListener("keydown", keyOpenLightbox);
            item.addEventListener("keydown", keyOpenLightbox);

            function openLightbox() {
                lightboxImg.src = item.getAttribute("data-src");
                lightboxImg.alt = `Enlarged view of ${item.querySelector("img").alt}`;
                lightbox.style.display = "flex";
                playSound("click");
                gsap.fromTo(lightboxImg, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" });
            }

            function hoverSound() { playSound("hover", 0.4); }

            function keyOpenLightbox(e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    item.click();
                }
            }
        });

        lightboxClose.removeEventListener("click", closeLightbox);
        lightboxClose.addEventListener("click", closeLightbox);
        lightbox.removeEventListener("click", closeLightboxOutside);
        lightbox.addEventListener("click", closeLightboxOutside);
        lightbox.removeEventListener("keydown", closeLightboxEscape);
        lightbox.addEventListener("keydown", closeLightboxEscape);
        lightboxImg.removeEventListener("click", zoomLightbox);
        lightboxImg.addEventListener("click", zoomLightbox);

        function closeLightbox() {
            gsap.to(lightboxImg, {
                scale: 0.9,
                opacity: 0,
                duration: 0.4,
                ease: "back.in(1.7)",
                onComplete: () => lightbox.style.display = "none"
            });
            playSound("click");
        }

        function closeLightboxOutside(e) {
            if (e.target === lightbox) lightboxClose.click();
        }

        function closeLightboxEscape(e) {
            if (e.key === "Escape") lightboxClose.click();
        }

        function zoomLightbox() {
            const currentScale = gsap.getProperty(lightboxImg, "scale");
            gsap.to(lightboxImg, { scale: currentScale === 1 ? 1.5 : 1, duration: 0.3, ease: "power2.inOut" });
        }
    }

    const header = document.querySelector("header");
    const scrollProgress = document.querySelector(".scroll-progress");
    function updateScroll() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        scrollProgress.style.width = `${scrollPercent}%`;
        header.classList.toggle("shrink", scrollTop > 100);
    }
    window.removeEventListener("scroll", debounce(updateScroll, 10));
    window.addEventListener("scroll", debounce(updateScroll, 10));
    updateScroll();

    const soundCache = {};
    function playSound(type, volume = 1) {
        if (!soundCache[type]) {
            soundCache[type] = new Audio();
            soundCache[type].volume = Math.min(volume, 1);
            soundCache[type].preload = "auto";
            soundCache[type].src = type === "click" ? "https://freesound.org/data/previews/245/245645_4055516-lq.mp3" : "https://freesound.org/data/previews/184/184438_2393279-lq.mp3";
        }
        soundCache[type].currentTime = 0;
        soundCache[type].play().catch(() => {});
    }

    const musicToggle = document.getElementById("music-toggle");
    const welcomeMusic = document.getElementById("welcome-music");
    if (musicToggle && welcomeMusic) {
        welcomeMusic.pause(); // Reset state
        welcomeMusic.volume = 0;
        musicToggle.classList.add("muted");
        const isMusicPlaying = localStorage.getItem("musicPlaying") === "true";
        if (isMusicPlaying) {
            welcomeMusic.play().then(() => {
                gsap.to(welcomeMusic, { volume: 0.6, duration: 1 });
                musicToggle.classList.remove("muted");
            }).catch(() => {});
        }

        musicToggle.removeEventListener("click", toggleMusic);
        musicToggle.addEventListener("click", toggleMusic);

        function toggleMusic() {
            if (welcomeMusic.paused) {
                welcomeMusic.play().then(() => {
                    gsap.to(welcomeMusic, { volume: 0.6, duration: 1 });
                    musicToggle.classList.remove("muted");
                    localStorage.setItem("musicPlaying", "true");
                }).catch(() => {});
            } else {
                gsap.to(welcomeMusic, {
                    volume: 0,
                    duration: 1,
                    onComplete: () => {
                        welcomeMusic.pause();
                        musicToggle.classList.add("muted");
                        localStorage.setItem("musicPlaying", "false");
                    }
                });
            }
            playSound("click");
        }
    }

    const techTip = document.getElementById("tech-tip-text");
    const closeTechTip = document.getElementById("close-tech-tip");
    if (techTip) {
        const tips = [
            "Ctrl + Shift + T reopens closed tabs instantly.",
            "Restarting your router fixes 80% of network issues.",
            "Use 2FA for an extra layer of account security."
        ];
        const stickyNote = document.querySelector(".sticky-note");
        stickyNote.classList.remove("visible"); // Reset state
        if (localStorage.getItem("techTipDismissed") !== "true") {
            techTip.textContent = tips[Math.floor(Math.random() * tips.length)];
            setTimeout(() => stickyNote.classList.add("visible"), 2000);
        }

        closeTechTip.removeEventListener("click", closeTechTipHandler);
        closeTechTip.addEventListener("click", closeTechTipHandler);

        function closeTechTipHandler() {
            gsap.to(stickyNote, {
                scale: 0.9,
                opacity: 0,
                duration: 0.3,
                ease: "back.in(1.7)",
                onComplete: () => {
                    stickyNote.classList.remove("visible");
                    localStorage.setItem("techTipDismissed", "true");
                }
            });
            playSound("click");
        }
    }

    const chatBubble = document.getElementById("chat-bubble");
    if (chatBubble) {
        chatBubble.classList.remove("visible"); // Reset state
        setTimeout(() => {
            chatBubble.classList.add("visible");
            gsap.from(chatBubble, { x: 50, opacity: 0, duration: 0.5, ease: "power2.out" });
        }, 3500);
        chatBubble.removeEventListener("click", chatClick);
        chatBubble.addEventListener("click", chatClick);
        chatBubble.removeEventListener("mouseover", chatHover);
        chatBubble.addEventListener("mouseover", chatHover);

        function chatClick() {
            alert("Chat feature coming soon! Contact us at nick@sysfx.net for now.");
            playSound("click");
        }

        function chatHover() { playSound("hover", 0.4); }
    }

    const scrollTopBtn = document.querySelector(".scroll-top-btn");
    if (scrollTopBtn) {
        window.removeEventListener("scroll", toggleScrollTop);
        window.addEventListener("scroll", toggleScrollTop);
        scrollTopBtn.removeEventListener("click", scrollToTop);
        scrollTopBtn.addEventListener("click", scrollToTop);

        function toggleScrollTop() {
            scrollTopBtn.classList.toggle("visible", window.scrollY > 350);
        }

        function scrollToTop() {
            window.scrollTo({ top: 0, behavior: "smooth" });
            playSound("click");
        }
    }

    const triviaText = document.getElementById("trivia-text");
    if (triviaText) {
        const trivia = [
            "The first 'bug' was an insect in a relay in 1947.",
            "ARPANET launched the internet in 1969.",
            "A byte is 8 bits; a nibble is just 4."
        ];
        triviaText.textContent = trivia[Math.floor(Math.random() * trivia.length)];
    }

    const easterEggTrigger = document.querySelector(".easter-egg-trigger");
    if (easterEggTrigger) {
        let clickCount = 0;
        easterEggTrigger.removeEventListener("click", easterEggClick);
        easterEggTrigger.addEventListener("click", easterEggClick);

        function easterEggClick() {
            clickCount++;
            if (clickCount === 5) {
                confetti({
                    particleCount: 150,
                    spread: 90,
                    origin: { y: 0.6 },
                    colors: ["#00a000", "#4CAF50", "#ffeb3b"],
                    scalar: 1.2
                });
                alert("Easter Egg Unlocked! Enjoy a 5% discount—use code: SYSFX5");
                playSound("click");
                clickCount = 0;
            }
        }
    }

    function announceModeChange(message) {
        const announcement = document.createElement("div");
        announcement.setAttribute("aria-live", "polite");
        announcement.className = "sr-only";
        announcement.textContent = message;
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 1000);
    }

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
});

const script = document.createElement("script");
script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
script.async = true;
document.head.appendChild(script);
