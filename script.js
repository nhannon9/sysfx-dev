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
    }

    // Set email link in contact section
    const emailLink = document.getElementById("email-link");
    if (emailLink) {
        emailLink.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = `mailto:${emailConfig.getEmail()}`;
            playSound('click');
        });
    }

    // Enhanced typing effect for #typing-effect
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
        let currentPhraseIndex = 0;

        typingElement.style.opacity = "1";
        typingElement.textContent = "";

        function typeText() {
            const currentPhrase = phrases[currentPhraseIndex];
            let charIndex = 0;
            typingElement.textContent = "";

            const typeInterval = setInterval(() => {
                if (charIndex < currentPhrase.length) {
                    typingElement.textContent += currentPhrase[charIndex];
                    charIndex++;
                    playSound('beep', 0.1);
                } else {
                    clearInterval(typeInterval);
                    setTimeout(eraseText, 2000);
                }
            }, 50);
        }

        function eraseText() {
            let text = typingElement.textContent;
            const eraseInterval = setInterval(() => {
                if (text.length > 0) {
                    text = text.slice(0, -1);
                    typingElement.textContent = text;
                } else {
                    clearInterval(eraseInterval);
                    currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
                    setTimeout(typeText, 500);
                }
            }, 30);
        }

        typeText();
    } else {
        console.error("Typing element (#typing-effect) not found in the DOM!");
    }

    // Dark mode toggle with localStorage
    const darkModeToggle = document.getElementById("darkModeToggle");
    const body = document.body;
    if (darkModeToggle) {
        darkModeToggle.addEventListener("click", () => {
            body.classList.toggle("dark-mode");
            const icon = darkModeToggle.querySelector("i");
            if (icon) {
                icon.classList.toggle("fa-moon");
                icon.classList.toggle("fa-sun");
            }
            localStorage.setItem("darkMode", body.classList.contains("dark-mode") ? "enabled" : null);
            playSound('click');
            updateParticles();
            gsap.to(body, { backgroundColor: body.classList.contains("dark-mode") ? "#222" : "#f4f4f4", duration: 0.5 });
        });

        if (localStorage.getItem("darkMode") === "enabled") {
            body.classList.add("dark-mode");
            const icon = darkModeToggle.querySelector("i");
            if (icon) {
                icon.classList.remove("fa-moon");
                icon.classList.add("fa-sun");
            }
        }
    }

    // Hamburger menu toggle
    const hamburger = document.querySelector(".hamburger");
    const navUl = document.querySelector("nav ul");
    if (hamburger && navUl) {
        hamburger.addEventListener("click", () => {
            navUl.classList.toggle("active");
            hamburger.querySelector("i").classList.toggle("fa-bars");
            hamburger.querySelector("i").classList.toggle("fa-times");
            playSound('click');
            gsap.fromTo(navUl.querySelectorAll("li"), 
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 0.3, stagger: 0.1 }
            );
        });
    }

    // Smooth scrolling with offset for header
    document.querySelectorAll("nav a").forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const targetId = this.getAttribute("href").substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: "smooth"
                });
                if (window.innerWidth <= 768 && navUl) {
                    navUl.classList.remove("active");
                    hamburger.querySelector("i").classList.remove("fa-times");
                    hamburger.querySelector("i").classList.add("fa-bars");
                }
            }
            playSound('click');
        });
    });

    // Real-time clock
    function updateClock() {
        const clockElement = document.getElementById("current-time");
        if (clockElement) {
            const now = new Date();
            clockElement.innerHTML = `<i class="fas fa-clock" aria-hidden="true"></i> ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
        }
    }
    updateClock();
    setInterval(updateClock, 1000);

    // Weather widget with OpenWeatherMap API
    const weatherText = document.getElementById("weather-text");
    const localWeatherBtn = document.getElementById("local-weather-btn");
    const apiKey = "YOUR_OPENWEATHERMAP_API_KEY";

    function updateWeather(lat = 41.2788, lon = -72.5276) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`)
            .then(response => response.ok ? response.json() : Promise.reject())
            .then(data => {
                weatherText.innerHTML = `<i class="fas fa-cloud-sun" aria-hidden="true"></i> ${Math.round(data.main.temp)}°F in ${data.name}`;
                gsap.from(weatherText, { opacity: 0, y: 10, duration: 0.5 });
            })
            .catch(() => {
                weatherText.innerHTML = "Weather unavailable";
            });
    }
    updateWeather();

    if (localWeatherBtn) {
        localWeatherBtn.addEventListener("click", () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        updateWeather(latitude, longitude);
                    },
                    () => {
                        weatherText.innerHTML = "Location access denied";
                    }
                );
            } else {
                weatherText.innerHTML = "Geolocation not supported";
            }
            playSound('click');
        });
    }

    // Particles.js with dynamic dark mode update
    function updateParticles() {
        const isDarkMode = body.classList.contains("dark-mode");
        particlesJS("particles-js", {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: isDarkMode ? "#ffffff" : "#00a000" },
                shape: { type: "polygon", polygon: { nb_sides: 6 } },
                opacity: { value: isDarkMode ? 0.8 : 0.3, random: true },
                size: { value: 4, random: true },
                line_linked: { 
                    enable: true, 
                    distance: 120, 
                    color: isDarkMode ? "#ffffff" : "#00a000",
                    opacity: 0.4, 
                    width: 1 
                },
                move: { 
                    enable: true, 
                    speed: 4, 
                    direction: "none", 
                    random: true, 
                    straight: false, 
                    out_mode: "out", 
                    bounce: false,
                    attract: { enable: true, rotateX: 600, rotateY: 1200 }
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "repulse" },
                    onclick: { enable: true, mode: "push" },
                    resize: true
                }
            },
            retina_detect: true
        });
    }
    updateParticles();

    // Interactive Leaflet map with animation
    const mapElement = document.getElementById("map");
    if (mapElement && typeof L !== "undefined") {
        const map = L.map("map", { 
            scrollWheelZoom: false, 
            dragging: !L.Browser.mobile,
            touchZoom: false 
        }).setView([41.2788, -72.5276], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        const markers = [
            { lat: 41.2788, lon: -72.5276, popup: "sysfx HQ - Click for Contact", url: "#contact" },
            { lat: 41.2800, lon: -72.5300, popup: "Service Center - Learn About Repairs", url: "#services" },
            { lat: 41.2776, lon: -72.5250, popup: "Support Office - Get IT Help", url: "#support" }
        ];

        markers.forEach((markerData, index) => {
            const marker = L.marker([markerData.lat, markerData.lon]).addTo(map)
                .bindPopup(markerData.popup)
                .on('click', () => {
                    window.location.href = markerData.url;
                    playSound('click');
                });
            gsap.from(marker._icon, { opacity: 0, y: 20, duration: 0.5, delay: index * 0.2 });
        });
    }

    // Testimonial carousel with GSAP
    const testimonials = document.querySelectorAll(".testimonial");
    let currentTestimonial = 0;
    function showTestimonial() {
        gsap.to(testimonials, {
            opacity: 0,
            scale: 0.95,
            duration: 0.5,
            onComplete: () => {
                testimonials.forEach((t, i) => {
                    t.style.position = i === currentTestimonial ? "relative" : "absolute";
                    t.style.opacity = i === currentTestimonial ? "1" : "0";
                    t.style.transform = i === currentTestimonial ? "scale(1)" : "scale(0.95)";
                });
                currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            }
        });
    }
    showTestimonial();
    setInterval(showTestimonial, 4000);

    // Animated stats counters with parallax
    const statNumbers = document.querySelectorAll(".stat-number");
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute("data-count"));
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                gsap.to(stat, {
                    textContent: target,
                    duration: 2,
                    roundProps: "textContent",
                    ease: "power1.out",
                    onComplete: () => stat.textContent = target
                });
                observer.disconnect();
            }
        }, { threshold: 0.5 });
        observer.observe(stat);

        gsap.to(stat.closest(".stat-item"), {
            y: -15,
            ease: "power1.inOut",
            scrollTrigger: {
                trigger: stat.closest(".stat-item"),
                start: "top 85%",
                end: "bottom 20%",
                scrub: true
            }
        });
    });

    // Custom cursor effect with trail
    const cursor = document.querySelector(".cursor");
    if (cursor) {
        let lastX = 0, lastY = 0;
        let trailTimeout;
        function updateCursor(e) {
            const x = e.clientX;
            const y = e.clientY;
            cursor.style.left = `${x}px`;
            cursor.style.top = `${y}px`;
            cursor.classList.add("trail");
            clearTimeout(trailTimeout);
            trailTimeout = setTimeout(() => cursor.classList.remove("trail"), 100);
            lastX = x;
            lastY = y;
        }
        document.addEventListener("mousemove", (e) => requestAnimationFrame(() => updateCursor(e)));
        if (window.innerWidth <= 768) cursor.style.display = "none";
    }

    // Service modals with enhanced interaction
    const services = document.querySelectorAll(".service");
    const modals = document.querySelectorAll(".modal");
    const closeButtons = document.querySelectorAll(".modal-close");
    const modalActions = document.querySelectorAll(".modal-action");

    services.forEach(service => {
        service.addEventListener("click", () => {
            const modalId = service.getAttribute("data-modal") + "-modal";
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = "flex";
                playSound('click');
                gsap.from(modal.querySelector(".modal-content"), { scale: 0.8, opacity: 0, duration: 0.3 });
            }
        });

        service.addEventListener("mousemove", (e) => {
            const rect = service.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const tiltX = (y - centerY) / 20;
            const tiltY = -(x - centerX) / 20;
            gsap.to(service, { rotationX: tiltX, rotationY: tiltY, duration: 0.2, ease: "power1.out" });
        });

        service.addEventListener("mouseleave", () => {
            gsap.to(service, { rotationX: 0, rotationY: 0, scale: 1, duration: 0.2, ease: "power1.out" });
        });
    });

    closeButtons.forEach(button => {
        button.addEventListener("click", () => {
            const modal = button.closest(".modal");
            gsap.to(modal.querySelector(".modal-content"), {
                scale: 0.8,
                opacity: 0,
                duration: 0.3,
                onComplete: () => modal.style.display = "none"
            });
            playSound('click');
        });
    });

    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("modal")) {
            gsap.to(e.target.querySelector(".modal-content"), {
                scale: 0.8,
                opacity: 0,
                duration: 0.3,
                onComplete: () => e.target.style.display = "none"
            });
            playSound('click');
        }
    });

    modalActions.forEach(action => {
        action.addEventListener("click", (e) => {
            e.stopPropagation();
            const href = action.getAttribute("onclick").match(/location\.href='([^']+)'/)[1];
            window.location.href = href;
            playSound('click');
        });
    });

    // Scroll animations with GSAP
    gsap.registerPlugin(ScrollTrigger);
    const sections = document.querySelectorAll(".parallax, .section-animation");
    sections.forEach((section, index) => {
        gsap.fromTo(section, 
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                delay: index * 0.1
            }
        );
    });

    // Parallax effect for testimonials
    const testimonialItems = document.querySelectorAll(".testimonial");
    testimonialItems.forEach(testimonial => {
        gsap.to(testimonial, {
            y: -15,
            ease: "power1.inOut",
            scrollTrigger: {
                trigger: testimonial,
                start: "top 85%",
                end: "bottom 20%",
                scrub: true
            }
        });
    });

    // Video background fallback
    const heroVideo = document.querySelector(".hero-video");
    if (heroVideo) {
        heroVideo.addEventListener("error", () => {
            heroVideo.style.display = "none";
            playSound('error');
        });
    }

    // Gallery lightbox with enhanced animation
    const galleryItems = document.querySelectorAll(".gallery-item");
    const lightbox = document.querySelector(".lightbox");
    const lightboxImg = lightbox && lightbox.querySelector("img");
    const lightboxClose = lightbox && lightbox.querySelector(".lightbox-close");

    if (galleryItems.length && lightbox && lightboxImg && lightboxClose) {
        galleryItems.forEach(item => {
            item.addEventListener("click", () => {
                lightboxImg.src = item.getAttribute("data-src");
                lightbox.style.display = "flex";
                playSound('click');
                gsap.from(lightboxImg, { scale: 0.8, opacity: 0, duration: 0.3 });
            });

            item.addEventListener("mouseover", () => {
                gsap.to(item, { scale: 1.1, duration: 0.3 });
                playSound('hover', 0.3);
            });

            item.addEventListener("mouseout", () => {
                gsap.to(item, { scale: 1, duration: 0.3 });
            });
        });

        lightboxClose.addEventListener("click", () => {
            gsap.to(lightboxImg, {
                scale: 0.8,
                opacity: 0,
                duration: 0.3,
                onComplete: () => lightbox.style.display = "none"
            });
            playSound('click');
        });

        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) {
                gsap.to(lightboxImg, {
                    scale: 0.8,
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => lightbox.style.display = "none"
                });
                playSound('click');
            }
        });
    }

    // Scroll progress bar
    const scrollProgress = document.querySelector(".scroll-progress");
    if (scrollProgress) {
        window.addEventListener("scroll", () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            scrollProgress.style.width = `${scrollPercent}%`;
        });
    }

    // Audio feedback with mute control
    let audioContext;
    let isMuted = false;

    function playSound(type, volume = 0.5) {
        if (isMuted) return;
        if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = type === 'click' ? 440 : type === 'hover' ? 330 : type === 'error' ? 200 : type === 'beep' ? 880 : 350;
        gainNode.gain.value = volume;
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
            oscillator.disconnect();
            gainNode.disconnect();
        }, 100);
    }

    document.addEventListener("click", () => {
        if (audioContext && audioContext.state === "suspended" && !isMuted) audioContext.resume();
    }, { once: true });

    // Music toggle with mute control
    const musicToggle = document.getElementById("music-toggle");
    const welcomeMusic = document.getElementById("welcome-music");
    if (musicToggle && welcomeMusic) {
        welcomeMusic.volume = 0.5;
        let isPlaying = false;

        musicToggle.addEventListener("click", () => {
            if (isPlaying) {
                welcomeMusic.pause();
                isMuted = true;
                musicToggle.classList.add("muted");
                gsap.to(musicToggle, { scale: 0.9, duration: 0.2 });
            } else {
                welcomeMusic.play().catch(() => console.log("Music playback blocked until user interaction"));
                isMuted = false;
                musicToggle.classList.remove("muted");
                gsap.to(musicToggle, { scale: 1.1, duration: 0.2, yoyo: true, repeat: 1 });
            }
            isPlaying = !isPlaying;
            playSound('click');
        });

        document.addEventListener("click", () => {
            if (!isPlaying && !isMuted) {
                welcomeMusic.play().catch(() => {});
                isPlaying = true;
                musicToggle.classList.remove("muted");
            }
        }, { once: true });
    }

    // Single tech tip per load with animation
    const techTips = [
        "Tech Tip: Regular updates keep your systems secure!",
        "Tech Tip: Back up your data weekly to avoid loss.",
        "Tech Tip: Use strong passwords for better protection.",
        "Tech Tip: Restarting can fix many tech glitches.",
        "Tech Tip: Clear cache to boost browser speed.",
        "Tech Tip: Keep software patched against vulnerabilities.",
        "Tech Tip: Monitor your network for unusual activity."
    ];
    const techTipText = document.getElementById("tech-tip-text");
    const closeTechTip = document.getElementById("close-tech-tip");
    const stickyNote = document.querySelector(".sticky-note");

    if (techTipText && stickyNote) {
        const randomTip = techTips[Math.floor(Math.random() * techTips.length)];
        techTipText.textContent = randomTip;
        gsap.fromTo(".sticky-note", 
            { opacity: 0, y: -50, rotation: -5 },
            { opacity: 1, y: 0, rotation: 0, duration: 1, delay: 2, ease: "elastic.out(1, 0.5)" }
        );

        if (closeTechTip) {
            closeTechTip.addEventListener("click", () => {
                gsap.to(".sticky-note", {
                    opacity: 0,
                    y: -50,
                    duration: 0.5,
                    onComplete: () => stickyNote.style.display = "none"
                });
                playSound('click');
            });
        }
    }

    // Chat Bubble Toggle
    const chatBubble = document.getElementById("chat-bubble");
    if (chatBubble) {
        setTimeout(() => {
            chatBubble.classList.add("visible");
            gsap.from(chatBubble, { scale: 0, opacity: 0, duration: 0.5, ease: "back.out(1.7)" });
        }, 3000);
        chatBubble.addEventListener("click", () => {
            alert("Chat feature coming soon! Contact us at nick@sysfx.net for now.");
            playSound('beep');
        });
    }

    // Scroll-to-Top Button
    const scrollTopBtn = document.querySelector(".scroll-top-btn");
    if (scrollTopBtn) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add("visible");
                gsap.from(scrollTopBtn, { opacity: 0, y: 20, duration: 0.3 });
            } else {
                scrollTopBtn.classList.remove("visible");
            }
        });

        scrollTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            playSound('click');
            gsap.to(scrollTopBtn, { rotation: 360, duration: 0.5, ease: "power1.out" });
        });
    }

    // Random Service Highlight with animation
    const serviceGrid = document.querySelector(".service-grid");
    if (serviceGrid) {
        const services = serviceGrid.querySelectorAll(".service");
        setInterval(() => {
            const randomIndex = Math.floor(Math.random() * services.length);
            services.forEach((s, i) => {
                if (i === randomIndex) {
                    gsap.to(s, { border: "2px solid var(--highlight-color)", duration: 0.5, ease: "power1.inOut" });
                } else {
                    gsap.to(s, { border: "none", duration: 0.5 });
                }
            });
        }, 10000);
    }

    // Easter Egg
    const easterEggTrigger = document.querySelector(".easter-egg-trigger");
    if (easterEggTrigger) {
        easterEggTrigger.addEventListener("click", () => {
            gsap.to(body, {
                background: "linear-gradient(135deg, #ffeb3b, #00a000)",
                duration: 1,
                onComplete: () => {
                    alert("You found the Easter Egg! Enjoy this tech surprise!");
                    setTimeout(() => {
                        gsap.to(body, { background: body.classList.contains("dark-mode") ? "#222" : "linear-gradient(135deg, #f4f4f4, #e6e6e6)", duration: 1 });
                    }, 2000);
                }
            });
            playSound('beep', 1);
        });
    }
});
