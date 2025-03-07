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
        emailElement.innerHTML = `<a href="mailto:${emailConfig.getEmail()}" aria-label="Email sysfx at ${emailConfig.getEmail()}">${emailConfig.getEmail()}</a>`;
    }

    // Set email link in contact section
    const emailLink = document.getElementById("email-link");
    if (emailLink) {
        emailLink.href = `mailto:${emailConfig.getEmail()}`;
        emailLink.textContent = emailConfig.getEmail();
        emailLink.addEventListener("click", () => playSound('click'));
    }

    // Typing effect with accessibility
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
        console.warn("Typing element (#typing-effect) not found!");
    }

    // Dark mode toggle
    const darkModeToggle = document.getElementById("darkModeToggle");
    const body = document.body;
    if (darkModeToggle) {
        darkModeToggle.addEventListener("click", () => {
            body.classList.toggle("dark-mode");
            const icon = darkModeToggle.querySelector("i");
            icon.classList.toggle("fa-moon");
            icon.classList.toggle("fa-sun");
            localStorage.setItem("darkMode", body.classList.contains("dark-mode") ? "enabled" : "disabled");
            playSound('click');
            updateParticles();
        });

        if (localStorage.getItem("darkMode") === "enabled") {
            body.classList.add("dark-mode");
            const icon = darkModeToggle.querySelector("i");
            icon.classList.remove("fa-moon");
            icon.classList.add("fa-sun");
        }
    }

    // Hamburger menu
    const hamburger = document.querySelector(".hamburger");
    const navUl = document.querySelector("nav ul");
    if (hamburger && navUl) {
        hamburger.addEventListener("click", () => {
            navUl.classList.toggle("active");
            const icon = hamburger.querySelector("i");
            icon.classList.toggle("fa-bars");
            icon.classList.toggle("fa-times");
            hamburger.setAttribute("aria-expanded", navUl.classList.contains("active"));
            playSound('click');
        });
    }

    // Smooth scrolling
    document.querySelectorAll("nav a").forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const targetId = this.getAttribute("href").substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: "smooth"
                });
                if (window.innerWidth <= 768 && navUl) {
                    navUl.classList.remove("active");
                    hamburger.querySelector("i").classList.remove("fa-times");
                    hamburger.querySelector("i").classList.add("fa-bars");
                    hamburger.setAttribute("aria-expanded", "false");
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

    // Weather widget
    const weatherText = document.getElementById("weather-text");
    const localWeatherBtn = document.getElementById("local-weather-btn");
    const apiKey = "YOUR_OPENWEATHERMAP_API_KEY"; // Replace with your key

    function updateWeather(lat = 41.2788, lon = -72.5276) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`)
            .then(response => response.ok ? response.json() : Promise.reject("Weather API error"))
            .then(data => {
                weatherText.innerHTML = `<i class="fas fa-cloud-sun" aria-hidden="true"></i> ${Math.round(data.main.temp)}°F in ${data.name}`;
            })
            .catch(error => {
                console.warn(error);
                weatherText.innerHTML = "Weather unavailable";
            });
    }
    if (weatherText) updateWeather();

    if (localWeatherBtn) {
        localWeatherBtn.addEventListener("click", () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => updateWeather(position.coords.latitude, position.coords.longitude),
                    () => weatherText.innerHTML = "Location access denied"
                );
            } else {
                weatherText.innerHTML = "Geolocation not supported";
            }
            playSound('click');
        });
    }

    // Particles.js
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

    // Leaflet map
    const mapElement = document.getElementById("map");
    if (mapElement && typeof L !== "undefined") {
        const map = L.map("map", { 
            scrollWheelZoom: false, 
            dragging: !L.Browser.mobile,
            touchZoom: false 
        }).setView([41.2788, -72.5276], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        const markers = [
            { lat: 41.2788, lon: -72.5276, popup: "sysfx HQ - Click for Contact", url: "#contact" },
            { lat: 41.2800, lon: -72.5300, popup: "Service Center - Learn About Repairs", url: "#services" },
            { lat: 41.2776, lon: -72.5250, popup: "Support Office - Get IT Help", url: "#support" }
        ];

        markers.forEach(markerData => {
            L.marker([markerData.lat, markerData.lon]).addTo(map)
                .bindPopup(markerData.popup)
                .on('click', () => {
                    window.location.href = markerData.url;
                    playSound('click');
                });
        });
    }

    // Testimonial carousel
    const testimonials = document.querySelectorAll(".testimonial");
    if (testimonials.length) {
        let currentTestimonial = 0;
        function showTestimonial() {
            testimonials.forEach((t, i) => {
                t.style.opacity = i === currentTestimonial ? "1" : "0";
                t.style.transform = i === currentTestimonial ? "scale(1)" : "scale(0.95)";
                t.style.position = i === currentTestimonial ? "relative" : "absolute";
                t.setAttribute("aria-hidden", i !== currentTestimonial);
            });
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        }
        showTestimonial();
        setInterval(showTestimonial, 4000);
    }

    // Animated stats counters
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

    // Custom cursor
    const cursor = document.querySelector(".cursor");
    if (cursor && window.innerWidth > 768) {
        let trailTimeout;
        document.addEventListener("mousemove", (e) => {
            requestAnimationFrame(() => {
                cursor.style.left = `${e.clientX}px`;
                cursor.style.top = `${e.clientY}px`;
                cursor.classList.add("trail");
                clearTimeout(trailTimeout);
                trailTimeout = setTimeout(() => cursor.classList.remove("trail"), 100);
            });
        });
    }

    // Creative card interactions
    const creativeCards = document.querySelectorAll(".creative-card");
    creativeCards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const tiltX = (y - centerY) / 20;
            const tiltY = -(x - centerX) / 20;
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.05)`;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "perspective(1000px) scale(1)";
        });

        const modalId = card.getAttribute("data-modal");
        if (modalId) {
            card.addEventListener("click", () => {
                const modal = document.getElementById(`${modalId}-modal`);
                if (modal) {
                    modal.style.display = "flex";
                    modal.focus();
                    playSound('click');
                }
            });
        }
    });

    // Modal handling
    const modals = document.querySelectorAll(".modal");
    modals.forEach(modal => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.style.display = "none";
                playSound('click');
            }
        });

        const closeBtn = modal.querySelector(".modal-close");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                modal.style.display = "none";
                playSound('click');
            });
        }

        const actionBtn = modal.querySelector(".modal-action");
        if (actionBtn) {
            actionBtn.addEventListener("click", () => {
                modal.style.display = "none"; // Close modal on action
            });
        }
    });

    // Scroll animations
    gsap.registerPlugin(ScrollTrigger);
    const sections = document.querySelectorAll(".parallax, .section-animation");
    sections.forEach(section => {
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
                }
            }
        );
    });

    // Gallery lightbox
    const galleryItems = document.querySelectorAll(".gallery-item");
    const lightbox = document.querySelector(".lightbox");
    if (lightbox) {
        const lightboxImg = lightbox.querySelector("img");
        const lightboxClose = lightbox.querySelector(".lightbox-close");

        galleryItems.forEach(item => {
            item.addEventListener("click", () => {
                lightboxImg.src = item.getAttribute("data-src");
                lightbox.style.display = "flex";
                lightbox.focus();
                playSound('click');
            });

            item.addEventListener("mouseover", () => playSound('hover', 0.3));
        });

        lightboxClose.addEventListener("click", () => {
            lightbox.style.display = "none";
            playSound('click');
        });

        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = "none";
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
            scrollProgress.style.width = `${(scrollTop / docHeight) * 100}%`;
        });
    }

    // Audio feedback
    let audioContext;
    let isMuted = false;

    function playSound(type, volume = 0.5) {
        if (isMuted || !audioContext) return;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = { click: 440, hover: 330, error: 200, beep: 880 }[type] || 350;
        gainNode.gain.value = volume;
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start();
        setTimeout(() => oscillator.stop(), 100);
    }

    document.addEventListener("click", () => {
        if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === "suspended" && !isMuted) audioContext.resume();
    }, { once: true });

    // Music toggle
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
            } else {
                welcomeMusic.play().catch(() => console.log("Music blocked until interaction"));
                isMuted = false;
                musicToggle.classList.remove("muted");
            }
            isPlaying = !isPlaying;
            playSound('click');
        });
    }

    // Tech tip
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
    if (techTipText) {
        techTipText.textContent = techTips[Math.floor(Math.random() * techTips.length)];
        gsap.fromTo(".sticky-note", 
            { opacity: 0, y: -50, rotation: -5 },
            { opacity: 1, y: 0, rotation: 0, duration: 1, delay: 2, ease: "elastic.out(1, 0.5)" }
        );

        document.getElementById("close-tech-tip")?.addEventListener("click", () => {
            gsap.to(".sticky-note", {
                opacity: 0,
                y: -50,
                duration: 0.5,
                onComplete: () => document.querySelector(".sticky-note").style.display = "none"
            });
            playSound('click');
        });
    }

    // Chat bubble
    const chatBubble = document.getElementById("chat-bubble");
    if (chatBubble) {
        setTimeout(() => chatBubble.classList.add("visible"), 3000);
        chatBubble.addEventListener("click", () => {
            alert("Chat feature coming soon! Email us at nick@sysfx.net for now.");
            playSound('beep');
        });
    }

    // Scroll-to-top
    const scrollTopBtn = document.querySelector(".scroll-top-btn");
    if (scrollTopBtn) {
        window.addEventListener("scroll", () => {
            scrollTopBtn.classList.toggle("visible", window.scrollY > 300);
        });
        scrollTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            playSound('click');
        });
    }

    // Contact form submission (placeholder)
    const contactForm = document.querySelector(".contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("Thank you! Your message has been sent. (Note: This is a placeholder—actual form submission requires backend setup.)");
            contactForm.reset();
            playSound('beep');
        });
    }

    // Random service highlight
    const creativeGrid = document.querySelector(".service-grid.creative-grid");
    if (creativeGrid) {
        const cards = creativeGrid.querySelectorAll(".creative-card");
        setInterval(() => {
            const randomIndex = Math.floor(Math.random() * cards.length);
            cards.forEach((card, i) => {
                card.style.border = i === randomIndex ? "2px solid var(--highlight-color)" : "none";
            });
        }, 10000);
    }
});
