document.addEventListener("DOMContentLoaded", () => {
    // **Email Configuration**
    const emailConfig = {
        user: "nick",
        domain: "sysfx.net",
        getEmail: function() { return `${this.user}@${this.domain}`; }
    };

    const emailElement = document.getElementById("email");
    if (emailElement) emailElement.innerHTML = `<a href="mailto:${emailConfig.getEmail()}">${emailConfig.getEmail()}</a>`;

    const emailLink = document.getElementById("email-link");
    if (emailLink) {
        emailLink.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = `mailto:${emailConfig.getEmail()}`;
            playSound("click");
        });
    }

    // **Typing Effect**
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

        function typeText() {
            const phrase = phrases[currentPhraseIndex];
            let charIndex = 0;
            typingElement.textContent = "";
            const typeInterval = setInterval(() => {
                if (charIndex < phrase.length) {
                    typingElement.textContent += phrase[charIndex++];
                } else {
                    clearInterval(typeInterval);
                    setTimeout(eraseText, 2000);
                }
            }, 50);
        }

        function eraseText() {
            const text = typingElement.textContent;
            const eraseInterval = setInterval(() => {
                if (text.length) {
                    typingElement.textContent = text.slice(0, -1);
                } else {
                    clearInterval(eraseInterval);
                    currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
                    setTimeout(typeText, 500);
                }
            }, 30);
        }

        typeText();
    }

    // **Dark Mode Toggle**
    const darkModeToggle = document.getElementById("darkModeToggle");
    const body = document.body;
    if (darkModeToggle) {
        darkModeToggle.addEventListener("click", () => {
            body.classList.toggle("dark-mode");
            const icon = darkModeToggle.querySelector("i");
            icon.classList.toggle("fa-moon");
            icon.classList.toggle("fa-sun");
            localStorage.setItem("darkMode", body.classList.contains("dark-mode") ? "enabled" : null);
            playSound("click");
            updateParticles();
        });

        if (localStorage.getItem("darkMode") === "enabled") {
            body.classList.add("dark-mode");
            const icon = darkModeToggle.querySelector("i");
            icon.classList.replace("fa-moon", "fa-sun");
        }
    }

    // **Hamburger Menu**
    const hamburger = document.querySelector(".hamburger");
    const navWrapper = document.querySelector(".nav-wrapper");
    if (hamburger && navWrapper) {
        hamburger.addEventListener("click", () => {
            navWrapper.classList.toggle("active");
            const isActive = navWrapper.classList.contains("active");
            hamburger.setAttribute("aria-expanded", isActive);
            hamburger.querySelector("i").classList.toggle("fa-bars");
            hamburger.querySelector("i").classList.toggle("fa-times");
            playSound("click");
        });
    }

    // **Smooth Scrolling for Nav Links**
    document.querySelectorAll(".nav-link").forEach(anchor => {
        anchor.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = anchor.getAttribute("href").slice(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: "smooth"
                });
                if (window.innerWidth <= 768 && navWrapper.classList.contains("active")) {
                    navWrapper.classList.remove("active");
                    hamburger.querySelector("i").classList.replace("fa-times", "fa-bars");
                    hamburger.setAttribute("aria-expanded", "false");
                }
                playSound("click");
            }
        });
    });

    // **Clock Update**
    function updateClock() {
        const clockElement = document.getElementById("current-time");
        if (clockElement) {
            const now = new Date();
            const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
            const day = now.toLocaleDateString([], { weekday: "short" });
            const date = now.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
            clockElement.innerHTML = `<i class="fas fa-clock" aria-hidden="true"></i> ${time} | ${day}, ${date}`;
        }
    }
    updateClock();
    setInterval(updateClock, 1000);

    // **Particles.js Configuration**
    function updateParticles() {
        const isDarkMode = body.classList.contains("dark-mode");
        particlesJS("particles-js", {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: isDarkMode ? "#ffffff" : "#00a000" },
                shape: { type: "polygon", polygon: { nb_sides: 6 } },
                opacity: { value: isDarkMode ? 0.8 : 0.3, random: true },
                size: { value: 4, random: true },
                line_linked: { enable: true, distance: 120, color: isDarkMode ? "#ffffff" : "#00a000", opacity: 0.4, width: 1 },
                move: { enable: true, speed: 4, direction: "none", random: true, straight: false, out_mode: "out", bounce: false }
            },
            interactivity: {
                detect_on: "canvas",
                events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" }, resize: true }
            },
            retina_detect: true
        });
    }
    updateParticles();

    // **Leaflet Map Setup**
    const mapElement = document.getElementById("map");
    if (mapElement && typeof L !== "undefined") {
        const map = L.map(mapElement, { scrollWheelZoom: false, dragging: !L.Browser.mobile, touchZoom: false })
            .setView([41.2788, -72.5276], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        const markers = [
            { lat: 41.2788, lon: -72.5276, popup: "sysfx HQ", url: "#contact" },
            { lat: 41.2800, lon: -72.5300, popup: "Service Center", url: "#services" },
            { lat: 41.2776, lon: -72.5250, popup: "Support Office", url: "#support" }
        ];

        markers.forEach(({ lat, lon, popup, url }) => {
            L.marker([lat, lon]).addTo(map)
                .bindPopup(popup)
                .on("click", () => {
                    window.location.href = url;
                    playSound("click");
                });
        });
    }

    // **Testimonials Slider**
    const testimonials = document.querySelectorAll(".testimonial");
    let currentTestimonial = 0;
    function showTestimonial() {
        testimonials.forEach((t, i) => {
            t.style.opacity = i === currentTestimonial ? "1" : "0";
            t.style.transform = i === currentTestimonial ? "scale(1)" : "scale(0.95)";
            t.style.position = i === currentTestimonial ? "relative" : "absolute";
        });
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    }
    showTestimonial();
    setInterval(showTestimonial, 4000);

    // **Stats Animation**
    const statNumbers = document.querySelectorAll(".stat-number");
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute("data-count"));
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                gsap.to(stat, { textContent: target, duration: 2, roundProps: "textContent", ease: "power1.out" });
                observer.disconnect();
            }
        }, { threshold: 0.5 });
        observer.observe(stat);

        gsap.to(stat.closest(".stat-item"), {
            y: -15,
            ease: "power1.inOut",
            scrollTrigger: { trigger: stat.closest(".stat-item"), start: "top 85%", end: "bottom 20%", scrub: true }
        });
    });

    // **Custom Cursor**
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
    } else if (cursor) {
        cursor.style.display = "none";
    }

    // **Service Card Interactions**
    const services = document.querySelectorAll(".service");
    const modals = document.querySelectorAll(".modal");
    services.forEach(service => {
        service.addEventListener("click", () => {
            const modal = document.getElementById(`${service.getAttribute("data-modal")}-modal`);
            if (modal) {
                modal.style.display = "flex";
                playSound("click");
            }
        });

        service.addEventListener("mousemove", (e) => {
            const rect = service.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            service.style.transform = `perspective(1000px) rotateX(${y / 20}deg) rotateY(${-x / 20}deg) scale(1.05)`;
        });

        service.addEventListener("mouseleave", () => {
            service.style.transform = "perspective(1000px) scale(1)";
        });
    });

    modals.forEach(modal => {
        modal.querySelector(".modal-close").addEventListener("click", () => {
            modal.style.display = "none";
            playSound("click");
        });
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.style.display = "none";
                playSound("click");
            }
        });
        modal.querySelector(".modal-action").addEventListener("click", (e) => {
            e.stopPropagation();
            window.location.href = "#contact";
            playSound("click");
        });
    });

    // **Parallax and Section Animations**
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll(".parallax, .section-animation").forEach(section => {
        gsap.fromTo(section, { opacity: 0, y: 50 }, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: { trigger: section, start: "top 85%", toggleActions: "play none none none" }
        });
    });

    document.querySelectorAll(".testimonial").forEach(testimonial => {
        gsap.to(testimonial, {
            y: -15,
            ease: "power1.inOut",
            scrollTrigger: { trigger: testimonial, start: "top 85%", end: "bottom 20%", scrub: true }
        });
    });

    // **Gallery Lightbox**
    const galleryItems = document.querySelectorAll(".gallery-item");
    const lightbox = document.querySelector(".lightbox");
    if (lightbox) {
        const lightboxImg = lightbox.querySelector("img");
        const lightboxClose = lightbox.querySelector(".lightbox-close");

        galleryItems.forEach(item => {
            item.addEventListener("click", () => {
                lightboxImg.src = item.getAttribute("data-src");
                lightbox.style.display = "flex";
                playSound("click");
            });

            item.addEventListener("mouseover", () => playSound("hover", 0.3));
        });

        lightboxClose.addEventListener("click", () => {
            lightbox.style.display = "none";
            playSound("click");
        });

        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = "none";
                playSound("click");
            }
        });
    }

    // **Scroll Progress and Header Shrink**
    window.addEventListener("scroll", () => {
        const scrollProgress = document.querySelector(".scroll-progress");
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        scrollProgress.style.width = `${(scrollTop / docHeight) * 100}%`;

        const header = document.querySelector("header");
        header.classList.toggle("shrink", window.scrollY > 50);
    });

    // **Audio Context and Sound Effects**
    let audioContext;
    let isMuted = false;

    function playSound(type, volume = 0.5) {
        if (isMuted || !audioContext) return;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.type = "sine";
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

    // **Music Toggle**
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
                welcomeMusic.play().catch(() => {});
                isMuted = false;
                musicToggle.classList.remove("muted");
            }
            isPlaying = !isPlaying;
            playSound("click");
        });

        document.addEventListener("click", () => {
            if (!isPlaying && !isMuted) {
                welcomeMusic.play().catch(() => {});
                isPlaying = true;
                musicToggle.classList.remove("muted");
            }
        }, { once: true });
    }

    // **Tech Tips and Trivia**
    const techTips = [
        "Tech Tip: Regular updates keep your systems secure!",
        "Tech Tip: Back up your data weekly to avoid loss.",
        "Tech Tip: Use strong passwords for better protection.",
        "Tech Tip: Restarting can fix many tech glitches.",
        "Tech Tip: Clear cache to boost browser speed.",
        "Tech Tip: Keep software patched against vulnerabilities.",
        "Tech Tip: Monitor your network for unusual activity.",
        "Tech Tip: Enable two-factor authentication for extra security.",
        "Tech Tip: Avoid public Wi-Fi for sensitive tasks.",
        "Tech Tip: Use a VPN for secure remote access."
    ];

    const techTrivia = [
        "Trivia: The first computer 'bug' was an actual insect!",
        "Trivia: The internet began with ARPANET in 1969.",
        "Trivia: A byte is 8 bits, but a nibble is 4!",
        "Trivia: The first email was sent by Ray Tomlinson in 1971.",
        "Trivia: Moore’s Law predicts tech doubles every 2 years.",
        "Trivia: The QWERTY keyboard was designed to slow typing.",
        "Trivia: The first hard drive held just 5MB in 1956.",
        "Trivia: Wi-Fi stands for Wireless Fidelity.",
        "Trivia: The first website went live in 1991.",
        "Trivia: ENIAC, the first computer, weighed 30 tons!"
    ];

    const techTipText = document.getElementById("tech-tip-text");
    const triviaText = document.getElementById("trivia-text");
    const closeTechTip = document.getElementById("close-tech-tip");
    const stickyNote = document.querySelector(".sticky-note");

    if (techTipText && stickyNote) {
        techTipText.textContent = techTips[Math.floor(Math.random() * techTips.length)];
        gsap.fromTo(".sticky-note", { opacity: 0, y: -50, rotation: -5 }, { opacity: 1, y: 0, rotation: 0, duration: 1, delay: 2, ease: "elastic.out(1, 0.5)" });
        closeTechTip.addEventListener("click", () => {
            gsap.to(".sticky-note", { opacity: 0, y: -50, duration: 0.5, onComplete: () => stickyNote.style.display = "none" });
            playSound("click");
        });
    }

    if (triviaText) {
        triviaText.textContent = techTrivia[Math.floor(Math.random() * techTrivia.length)];
    }

    // **Chat Bubble**
    const chatBubble = document.getElementById("chat-bubble");
    if (chatBubble) {
        setTimeout(() => chatBubble.classList.add("visible"), 3000);
        chatBubble.addEventListener("click", () => {
            alert("Chat feature coming soon! Contact us at nick@sysfx.net for now.");
            playSound("beep");
        });
    }

    // **Scroll-to-Top Button**
    const scrollTopBtn = document.querySelector(".scroll-top-btn");
    if (scrollTopBtn) {
        window.addEventListener("scroll", () => {
            scrollTopBtn.classList.toggle("visible", window.scrollY > 300);
        });
        scrollTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            playSound("click");
        });
    }

    // **Service Grid Highlight**
    const serviceGrid = document.querySelector(".service-grid");
    if (serviceGrid) {
        setInterval(() => {
            const services = serviceGrid.querySelectorAll(".service");
            const randomIndex = Math.floor(Math.random() * services.length);
            services.forEach((s, i) => s.style.border = i === randomIndex ? "2px solid var(--highlight-color)" : "none");
        }, 10000);
    }

    // **Easter Egg**
    const easterEggTrigger = document.querySelector(".easter-egg-trigger");
    if (easterEggTrigger) {
        let clickCount = 0;
        easterEggTrigger.addEventListener("click", () => {
            clickCount++;
            if (clickCount === 5) {
                document.body.style.background = "url('https://media.giphy.com/media/3o6Zt6KHxJTbXCnSso/giphy.gif') no-repeat center center fixed";
                document.body.style.backgroundSize = "cover";
                playSound("beep");
                setTimeout(() => {
                    document.body.style.background = body.classList.contains("dark-mode") ? "linear-gradient(135deg, #222, #333)" : "linear-gradient(135deg, #f4f4f4, #e6e6e6)";
                    clickCount = 0;
                }, 5000);
            }
        });
    }
});
