document.addEventListener("DOMContentLoaded", function () {
    // Email configuration
    const emailConfig = {
        user: "nick",
        domain: "sysfx.net",
        getEmail: function() { return `${this.user}@${this.domain}`; }
    };

    // Set email in welcome section
    const emailElement = document.getElementById("email");
    if (emailElement) {
        emailElement.innerHTML = `<a href="mailto:${emailConfig.getEmail()}">${emailConfig.getEmail()}</a>`;
    } else {
        console.error("Email element (#email) not found in DOM at load time!");
    }

    // Set email link in contact section
    const emailLink = document.getElementById("email-link");
    if (emailLink) {
        emailLink.href = `mailto:${emailConfig.getEmail()}`;
        emailLink.textContent = emailConfig.getEmail();
    } else {
        console.error("Email link (#email-link) not found in DOM!");
    }

    // Typing effect with pause and speed variation
    const typingElement = document.getElementById("typing-effect");
    if (typingElement) {
        const phrases = [
            "Providing next-gen tech solutions.",
            "Empowering your digital future.",
            "Precision tech expertise.",
            "Your IT partner in Clinton, CT.",
            "Innovating for business success.",
            "Securing your tech, 24/7.",
            "Building the web of tomorrow."
        ];
        let index = 0, charIndex = 0, isDeleting = false, speed = 50;

        function updateTyping() {
            const phrase = phrases[index];
            typingElement.textContent = phrase.slice(0, charIndex);
            typingElement.setAttribute("aria-label", phrase);
            charIndex += isDeleting ? -1 : 1;

            if (!isDeleting && charIndex > phrase.length) {
                isDeleting = true;
                speed = 30;
                setTimeout(updateTyping, 1500);
            } else if (isDeleting && charIndex <= 0) {
                isDeleting = false;
                index = (index + 1) % phrases.length;
                speed = 50;
                setTimeout(updateTyping, 500);
            } else {
                setTimeout(updateTyping, speed);
            }
        }
        updateTyping();
    } else {
        console.error("Typing element (#typing-effect) not found in DOM!");
    }

    // Dark mode toggle with transition
    const darkModeToggle = document.getElementById("darkModeToggle");
    const body = document.body;
    if (darkModeToggle) {
        darkModeToggle.addEventListener("click", () => {
            body.style.transition = "background 0.5s ease";
            body.classList.toggle("dark-mode");
            const icon = darkModeToggle.querySelector("i");
            icon.classList.toggle("fa-moon");
            icon.classList.toggle("fa-sun");
            localStorage.setItem("darkMode", body.classList.contains("dark-mode"));
            updateParticles();
            setTimeout(() => body.style.transition = "", 500);
        });
        if (localStorage.getItem("darkMode") === "true") {
            body.classList.add("dark-mode");
            darkModeToggle.querySelector("i").classList.replace("fa-moon", "fa-sun");
        }
    } else {
        console.warn("Dark mode toggle not found; skipping initialization.");
    }

    // Hamburger menu with accessibility
    const hamburger = document.querySelector(".hamburger");
    const navUl = document.querySelector("nav ul");
    if (hamburger && navUl) {
        hamburger.addEventListener("click", () => {
            navUl.classList.toggle("active");
            hamburger.querySelector("i").classList.toggle("fa-bars");
            hamburger.querySelector("i").classList.toggle("fa-times");
            hamburger.setAttribute("aria-expanded", navUl.classList.contains("active"));
        });
        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && navUl.classList.contains("active")) {
                navUl.classList.remove("active");
                hamburger.querySelector("i").classList.replace("fa-times", "fa-bars");
            }
        });
    } else {
        console.error("Hamburger or nav ul not found in DOM!");
    }

    // Smooth scrolling with offset
    document.querySelectorAll("nav a").forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const targetId = this.getAttribute("href").substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector("header").offsetHeight;
                window.scrollTo({
                    top: targetElement.offsetTop - headerHeight - 20,
                    behavior: "smooth"
                });
                if (window.innerWidth <= 768 && navUl) {
                    navUl.classList.remove("active");
                    hamburger.querySelector("i").classList.replace("fa-times", "fa-bars");
                }
            } else {
                console.error(`Navigation target #${targetId} not found in DOM!`);
            }
        });
    });

    // Clock with date option
    function updateClock() {
        const clockElement = document.getElementById("current-time");
        if (clockElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const dateString = now.toLocaleDateString();
            clockElement.textContent = `${timeString} | ${dateString}`;
        }
    }
    updateClock();
    setInterval(updateClock, 1000);

    // Weather with retry and caching
    const weatherText = document.getElementById("weather-text");
    const weatherBtn = document.getElementById("local-weather-btn");
    if (weatherText && weatherBtn) {
        let retryCount = 0;
        const maxRetries = 3;
        const cacheKey = "weatherData";
        const cacheTTL = 30 * 60 * 1000; // 30 minutes

        function fetchWeather() {
            const cached = localStorage.getItem(cacheKey);
            const cacheTime = localStorage.getItem(`${cacheKey}_time`);
            if (cached && cacheTime && (Date.now() - cacheTime < cacheTTL)) {
                weatherText.textContent = cached;
                return;
            }

            // Uncomment with your OpenWeatherMap API key
            /*
            fetch(`https://api.openweathermap.org/data/2.5/weather?q=Clinton,CT,US&appid=YOUR_API_KEY&units=imperial`)
                .then(response => {
                    if (!response.ok) throw new Error("Weather fetch failed");
                    return response.json();
                })
                .then(data => {
                    const weatherStr = `Weather: ${Math.round(data.main.temp)}°F, ${data.weather[0].description}`;
                    weatherText.textContent = weatherStr;
                    localStorage.setItem(cacheKey, weatherStr);
                    localStorage.setItem(`${cacheKey}_time`, Date.now());
                })
                .catch(() => {
                    if (retryCount < maxRetries) {
                        retryCount++;
                        setTimeout(fetchWeather, 2000 * retryCount);
                    } else {
                        weatherText.textContent = "Weather unavailable";
                    }
                });
            */
            const placeholder = "Weather: 65°F, Sunny (Clinton, CT)";
            weatherText.textContent = placeholder;
            localStorage.setItem(cacheKey, placeholder);
            localStorage.setItem(`${cacheKey}_time`, Date.now());
        }

        weatherBtn.addEventListener("click", fetchWeather);
        fetchWeather();
    } else {
        console.warn("Weather elements not found; skipping weather functionality.");
    }

    // Particles with custom config
    function updateParticles() {
        if (typeof particlesJS === "undefined") {
            console.warn("Particles.js not loaded; skipping particle effects.");
            return;
        }
        const isDarkMode = body.classList.contains("dark-mode");
        particlesJS("particles-js", {
            particles: {
                number: { value: 100, density: { enable: true, value_area: 800 } },
                color: { value: isDarkMode ? "#ffffff" : "#00a000" },
                shape: { type: "circle", stroke: { width: 0 } },
                opacity: { value: 0.5, random: true, anim: { enable: true, speed: 1 } },
                size: { value: 3, random: true, anim: { enable: true, speed: 2 } },
                line_linked: { enable: true, distance: 150, color: isDarkMode ? "#ffffff" : "#00a000", opacity: 0.4, width: 1 },
                move: { enable: true, speed: 3, direction: "none", random: true, out_mode: "out" }
            },
            interactivity: {
                detect_on: "canvas",
                events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" }, resize: true },
                modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } }
            },
            retina_detect: true
        });

        particlesJS("footer-particles", {
            particles: {
                number: { value: 40, density: { enable: true, value_area: 1000 } },
                color: { value: isDarkMode ? "#ffffff" : "#4CAF50" },
                shape: { type: "circle" },
                opacity: { value: 0.3 },
                size: { value: 2 },
                move: { enable: false }
            }
        });
    }
    updateParticles();

    // Map with zoom control
    const mapElement = document.getElementById("map");
    if (mapElement && typeof L !== "undefined") {
        const map = L.map(mapElement, { zoomControl: true }).setView([41.2788, -72.5276], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 18
        }).addTo(map);
        const marker = L.marker([41.2788, -72.5276]).addTo(map).bindPopup("sysfx HQ").openPopup();
        map.on("click", () => marker.openPopup());
    } else {
        console.warn("Map element or Leaflet not available.");
    }

    // Custom cursor with hover detection
    const cursor = document.querySelector(".cursor");
    if (cursor) {
        document.addEventListener("mousemove", e => {
            cursor.style.left = `${e.clientX - 10}px`;
            cursor.style.top = `${e.clientY - 10}px`;
        });
        document.addEventListener("mousedown", () => cursor.classList.add("trail"));
        document.addEventListener("mouseup", () => cursor.classList.remove("trail"));
        document.querySelectorAll("a, button").forEach(el => {
            el.addEventListener("mouseenter", () => cursor.style.transform = "scale(1.5)");
            el.addEventListener("mouseleave", () => cursor.style.transform = "scale(1)");
        });
    }

    // GSAP animations with enhanced effects
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);

        // Hero animation
        gsap.from(".hero-content", { y: 100, opacity: 0, duration: 1.2, ease: "power2.out" });
        gsap.from(".hero-video", { scale: 1.1, duration: 2, ease: "power1.out" });

        // Section fade-ins
        document.querySelectorAll("main section").forEach(section => {
            gsap.from(section, {
                scrollTrigger: {
                    trigger: section,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out"
            });
        });

        // Service cards stagger
        gsap.from(".service", {
            scrollTrigger: { trigger: ".service-grid", start: "top 80%" },
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.2,
            ease: "power2.out"
        });

        // Button pulse
        gsap.to(".modern-button", {
            scale: 1.02,
            duration: 0.5,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
        });

        // Parallax effect
        document.querySelectorAll(".parallax").forEach(section => {
            gsap.to(section, {
                scrollTrigger: {
                    trigger: section,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                },
                backgroundPosition: "50% 100%",
                ease: "none"
            });
        });
    } else {
        console.warn("GSAP or ScrollTrigger not loaded; animations skipped.");
    }

    // Testimonial carousel with pause on hover
    const testimonials = document.querySelectorAll(".testimonial");
    if (testimonials.length) {
        let current = 0, interval;
        function rotateTestimonials() {
            testimonials.forEach((t, i) => {
                t.style.opacity = i === current ? "1" : "0";
                t.style.transform = i === current ? "translateY(0)" : "translateY(20px)";
            });
            current = (current + 1) % testimonials.length;
        }
        rotateTestimonials();
        interval = setInterval(rotateTestimonials, 4000);
        document.querySelector(".testimonials").addEventListener("mouseenter", () => clearInterval(interval));
        document.querySelector(".testimonials").addEventListener("mouseleave", () => interval = setInterval(rotateTestimonials, 4000));
    }

    // Stats animation with sound (simulated)
    const statNumbers = document.querySelectorAll(".stat-number");
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute("data-count"));
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                let count = 0;
                const increment = target / 100;
                const interval = setInterval(() => {
                    count += increment;
                    stat.textContent = Math.round(count);
                    if (count >= target) {
                        stat.textContent = target;
                        clearInterval(interval);
                        console.log(`Stat ${stat.textContent} reached!`);
                    }
                }, 20);
                observer.disconnect();
            }
        }, { threshold: 0.5 });
        observer.observe(stat);
    });

    // Ensure content visibility with detailed logging
    const sections = document.querySelectorAll("main section");
    sections.forEach(section => {
        if (!section.offsetHeight) {
            console.error(`Section #${section.id} has zero height! Forcing visibility with min-height.`);
            section.style.display = "block";
            section.style.minHeight = "100px";
        }
    });
    if (!sections.length) {
        console.error("No sections found in main element! Check HTML structure.");
    }

    // Debounce utility
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Header shrink and scroll progress
    const header = document.querySelector("header");
    const scrollProgress = document.querySelector(".scroll-progress");
    const statusBar = document.querySelector(".status-bar");
    const nav = document.querySelector("nav");
    const hamburgerBtn = document.querySelector(".hamburger");

    function updateScroll() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        scrollProgress.style.width = `${scrollPercent}%`;

        if (scrollTop > 100) {
            header.classList.add("shrink");
            if (statusBar) statusBar.style.display = "none";
            if (nav) nav.style.display = "none";
            if (hamburgerBtn) hamburgerBtn.style.display = "none";
        } else {
            header.classList.remove("shrink");
            if (statusBar) statusBar.style.display = "flex";
            if (nav) nav.style.display = "flex";
            if (hamburgerBtn) hamburgerBtn.style.display = window.innerWidth <= 768 ? "block" : "none";
        }
    }
    window.addEventListener("scroll", debounce(updateScroll, 10));
    window.addEventListener("resize", debounce(updateScroll, 100));
    updateScroll();

    // Service modals with accessibility
    const services = document.querySelectorAll(".service");
    services.forEach(service => {
        service.addEventListener("click", () => {
            const modalId = service.getAttribute("data-modal") + "-modal";
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = "flex";
                modal.querySelector(".modal-content").focus();
            } else {
                console.error(`Modal #${modalId} not found!`);
            }
        });
    });
    document.querySelectorAll(".modal-close").forEach(close => {
        close.addEventListener("click", () => {
            close.closest(".modal").style.display = "none";
        });
    });
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            document.querySelectorAll(".modal").forEach(modal => {
                if (modal.style.display === "flex") modal.style.display = "none";
            });
        }
    });
    document.addEventListener("click", e => {
        if (e.target.classList.contains("modal")) e.target.style.display = "none";
    });

    // Gallery lightbox with zoom and captions
    const galleryItems = document.querySelectorAll(".gallery-item");
    const lightbox = document.querySelector(".lightbox");
    const lightboxImg = lightbox && lightbox.querySelector("img");
    const lightboxClose = lightbox && lightbox.querySelector(".lightbox-close");

    if (galleryItems.length && lightbox && lightboxImg && lightboxClose) {
        let zoomLevel = 1;
        galleryItems.forEach(item => {
            item.addEventListener("click", () => {
                lightboxImg.src = item.getAttribute("data-src");
                lightboxImg.alt = item.querySelector("img").alt;
                lightbox.style.display = "flex";
                zoomLevel = 1;
                lightboxImg.style.transform = `scale(${zoomLevel})`;
                lightbox.setAttribute("aria-label", lightboxImg.alt);
            });
        });
        lightboxClose.addEventListener("click", () => lightbox.style.display = "none");
        lightbox.addEventListener("click", e => {
            if (e.target === lightbox) lightbox.style.display = "none";
        });
        lightboxImg.addEventListener("wheel", e => {
            e.preventDefault();
            zoomLevel += e.deltaY * -0.001;
            zoomLevel = Math.min(Math.max(1, zoomLevel), 3);
            lightboxImg.style.transform = `scale(${zoomLevel})`;
        });
    }

    // Timeline animation with sound (simulated)
    const timelineItems = document.querySelectorAll(".timeline-item");
    if (timelineItems.length && typeof gsap !== "undefined") {
        timelineItems.forEach((item, i) => {
            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: "top 90%",
                },
                opacity: 0,
                x: i % 2 === 0 ? -50 : 50,
                duration: 0.8,
                delay: i * 0.2,
                ease: "power2.out",
                onComplete: () => console.log(`Timeline item ${i + 1} animated`)
            });
        });
    }

    // Scroll-to-top with animation
    const scrollTopBtn = document.querySelector(".scroll-top-btn");
    if (scrollTopBtn) {
        window.addEventListener("scroll", () => {
            scrollTopBtn.classList.toggle("visible", window.scrollY > 300);
        });
        scrollTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            if (typeof gsap !== "undefined") {
                gsap.to(scrollTopBtn, { rotation: 360, duration: 0.5, ease: "power1.out" });
            }
        });
    }

    // Tech tip with local storage and rotation
    const techTipText = document.getElementById("tech-tip-text");
    if (techTipText) {
        const tips = [
            "Tech Tip: Regular updates keep your systems secure!",
            "Tech Tip: Back up your data weekly to avoid loss.",
            "Tech Tip: Use strong passwords for better protection.",
            "Tech Tip: Clear cache to boost performance.",
            "Tech Tip: Enable 2FA for extra security."
        ];
        const lastTip = localStorage.getItem("lastTechTip");
        let tipIndex = lastTip ? (tips.indexOf(lastTip) + 1) % tips.length : Math.floor(Math.random() * tips.length);
        techTipText.textContent = tips[tipIndex];
        localStorage.setItem("lastTechTip", tips[tipIndex]);

        document.getElementById("close-tech-tip").addEventListener("click", () => {
            document.querySelector(".sticky-note").style.display = "none";
            localStorage.setItem("hideTechTip", "true");
        });
        if (localStorage.getItem("hideTechTip") === "true") {
            document.querySelector(".sticky-note").style.display = "none";
        }
    }

    // Chat bubble with delay variation
    const chatBubble = document.getElementById("chat-bubble");
    if (chatBubble) {
        const delay = Math.random() * 2000 + 3000; // 3-5s
        setTimeout(() => chatBubble.classList.add("visible"), delay);
        chatBubble.addEventListener("click", () => {
            alert("Chat feature coming soon! Contact us at nick@sysfx.net for now.");
        });
    }

    // Music toggle with volume control
    const musicToggle = document.getElementById("music-toggle");
    const welcomeMusic = document.getElementById("welcome-music");
    if (musicToggle && welcomeMusic) {
        welcomeMusic.volume = parseFloat(localStorage.getItem("musicVolume") || 0.5);
        let isPlaying = localStorage.getItem("musicPlaying") === "true";

        function updateMusicState() {
            if (isPlaying) {
                welcomeMusic.play().catch(() => console.log("Music playback blocked by browser"));
                musicToggle.classList.remove("muted");
            } else {
                welcomeMusic.pause();
                musicToggle.classList.add("muted");
            }
            localStorage.setItem("musicPlaying", isPlaying);
        }

        musicToggle.addEventListener("click", () => {
            isPlaying = !isPlaying;
            updateMusicState();
        });

        musicToggle.addEventListener("wheel", e => {
            e.preventDefault();
            welcomeMusic.volume = Math.min(Math.max(welcomeMusic.volume + (e.deltaY * -0.01), 0), 1);
            localStorage.setItem("musicVolume", welcomeMusic.volume);
        });

        document.addEventListener("click", () => {
            if (!isPlaying) {
                isPlaying = true;
                updateMusicState();
            }
        }, { once: true });

        updateMusicState();
    }

    // Contact form handling (assuming a hidden form)
    const contactSection = document.getElementById("contact");
    if (contactSection) {
        let form = contactSection.querySelector("form");
        if (!form) {
            form = document.createElement("form");
            form.innerHTML = `
                <input type="text" name="name" placeholder="Your Name" required aria-label="Your Name">
                <input type="email" name="email" placeholder="Your Email" required aria-label="Your Email">
                <textarea name="message" placeholder="Your Message" required aria-label="Your Message"></textarea>
                <button type="submit" class="modern-button">Send Message</button>
            `;
            contactSection.appendChild(form);
        }
        form.addEventListener("submit", e => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            console.log("Form submitted:", data);
            alert("Message sent! (Simulated - check console for data)");
            form.reset();
        });
    }

    // Service request tracker
    const serviceRequests = {};
    document.querySelectorAll(".service .modern-button").forEach(btn => {
        btn.addEventListener("click", () => {
            const service = btn.closest(".service").querySelector("h3").textContent;
            serviceRequests[service] = (serviceRequests[service] || 0) + 1;
            console.log(`Service request for "${service}" logged. Total: ${serviceRequests[service]}`);
        });
    });

    // Lazy loading images
    const images = document.querySelectorAll("img[loading='lazy']");
    if ("IntersectionObserver" in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute("data-src") || img.src;
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: "0px 0px 100px 0px" });
        images.forEach(img => imageObserver.observe(img));
    } else {
        images.forEach(img => img.src = img.getAttribute("data-src") || img.src);
    }

    // Easter egg: Mini-game
    const logo = document.querySelector(".spinning-logo");
    let clickCount = 0;
    if (logo) {
        logo.addEventListener("click", () => {
            clickCount++;
            if (clickCount === 5) {
                alert("Tech Invaders Activated! Click particles to score points!");
                if (typeof particlesJS !== "undefined") {
                    let score = 0;
                    particlesJS("particles-js", {
                        particles: {
                            number: { value: 50, density: { enable: true, value_area: 800 } },
                            color: { value: "#ffeb3b" },
                            shape: { type: "star" },
                            opacity: { value: 0.8 },
                            size: { value: 5, random: true },
                            move: { enable: true, speed: 5, direction: "none", random: true }
                        },
                        interactivity: {
                            events: {
                                onclick: {
                                    enable: true,
                                    mode: "push",
                                    callback: () => {
                                        score += 10;
                                        console.log(`Score: ${score}`);
                                        if (score >= 100) {
                                            alert(`Game Over! Final Score: ${score}`);
                                            updateParticles();
                                        }
                                    }
                                }
                            }
                        }
                    });
                    setTimeout(updateParticles, 10000); // Reset after 10s
                }
                clickCount = 0;
            }
        });
    }

    // Window resize handler with map fix
    window.addEventListener("resize", () => {
        if (mapElement && typeof L !== "undefined") {
            setTimeout(() => map.invalidateSize(), 200);
        }
    });

    // Performance check
    const loadTime = performance.now();
    console.log(`Page loaded successfully at ${new Date().toLocaleString()} in ${loadTime.toFixed(2)}ms`);
});
