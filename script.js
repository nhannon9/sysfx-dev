// Utility Functions
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

function playSound(type) {
    const sounds = {
        click: new Audio('https://www.soundjay.com/buttons/beep-01a.mp3'),
        hover: new Audio('https://www.soundjay.com/buttons/beep-02.mp3')
    };
    if (sounds[type]) {
        sounds[type].play().catch(err => console.log('Audio play failed:', err));
    }
}

function scrollToSection(sectionId) {
    const section = document.querySelector(`#${sectionId}`);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// DOM Elements
const header = document.querySelector('header');
const hamburger = document.querySelector('.hamburger');
const navWrapper = document.querySelector('.nav-wrapper');
const musicToggle = document.getElementById('music-toggle');
const welcomeMusic = document.getElementById('welcome-music');
const darkModeToggle = document.getElementById('darkModeToggle');
const scrollTopBtn = document.querySelector('.scroll-top-btn');
const cursor = document.querySelector('.cursor');
const emailSpan = document.getElementById('email');
const emailLink = document.getElementById('email-link');
const chatBubble = document.getElementById('chat-bubble');
const closeTechTip = document.getElementById('close-tech-tip');
const techTipText = document.getElementById('tech-tip-text');
const scrollProgress = document.querySelector('.scroll-progress');
const modals = document.querySelectorAll('.modal');
const services = document.querySelectorAll('.service');

// Time Update
function updateTime() {
    const now = new Date();
    document.getElementById('current-time').textContent = now.toLocaleTimeString();
}
setInterval(updateTime, 1000);
updateTime();

// Scroll Behavior
function updateScroll() {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const headerHeight = header.offsetHeight;

    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    scrollProgress.style.width = `${(scrollPosition / (documentHeight - windowHeight)) * 100}%`;

    if (scrollPosition > 100) {
        header.classList.add('shrink');
    } else {
        header.classList.remove('shrink');
    }

    scrollTopBtn.style.display = scrollPosition > 300 ? 'block' : 'none';

    document.querySelectorAll('.section-animation').forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop < windowHeight * 0.8) {
            section.classList.add('visible');
        }
    });
}

window.addEventListener('scroll', debounce(updateScroll, 50)); // Adjusted debounce to 50ms
window.addEventListener('resize', updateScroll);
updateScroll();

// Hamburger Menu
hamburger.addEventListener('click', () => {
    const isActive = navWrapper.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isActive);
    document.body.style.overflow = isActive ? 'hidden' : '';
    playSound('click');

    if (typeof gsap !== 'undefined') {
        if (isActive) {
            gsap.to(navWrapper, { left: 0, duration: 0.4, ease: 'power2.out' });
            gsap.from('.nav-link', { x: -50, opacity: 0, stagger: 0.1, duration: 0.3, delay: 0.2 }); // Added stagger animation
        } else {
            gsap.to(navWrapper, { left: '-80%', duration: 0.5, ease: 'power2.in' });
        }
    } else {
        navWrapper.style.left = isActive ? '0' : '-80%';
    }
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navWrapper.contains(e.target) && !hamburger.contains(e.target) && navWrapper.classList.contains('active')) {
        navWrapper.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        if (typeof gsap !== 'undefined') {
            gsap.to(navWrapper, { left: '-80%', duration: 0.5, ease: 'power2.in' });
        } else {
            navWrapper.style.left = '-80%';
        }
    }
});

// Close mobile menu with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navWrapper.classList.contains('active')) {
        navWrapper.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        if (typeof gsap !== 'undefined') {
            gsap.to(navWrapper, { left: '-80%', duration: 0.5, ease: 'power2.in' });
        } else {
            navWrapper.style.left = '-80%';
        }
    }
});

// Nav Links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('href').substring(1);
        scrollToSection(sectionId);
        playSound('click');
        if (navWrapper.classList.contains('active')) {
            navWrapper.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            if (typeof gsap !== 'undefined') {
                gsap.to(navWrapper, { left: '-80%', duration: 0.5, ease: 'power2.in' });
            } else {
                navWrapper.style.left = '-80%';
            }
        }
    });

    link.addEventListener('mouseenter', () => playSound('hover'));
});

// Music Toggle
const isMusicPlaying = localStorage.getItem('musicPlaying') === 'true';

if (isMusicPlaying) {
    welcomeMusic.play().catch(err => console.log('Autoplay blocked:', err));
    if (typeof gsap !== 'undefined') {
        gsap.to(welcomeMusic, { volume: 0.6, duration: 1 });
    } else {
        welcomeMusic.volume = 0.6;
    }
    musicToggle.classList.remove('muted');
} else {
    musicToggle.classList.add('muted');
    welcomeMusic.volume = 0;
}

musicToggle.addEventListener('click', () => {
    if (welcomeMusic.paused) {
        welcomeMusic.play().catch(err => console.log('Play failed:', err));
        if (typeof gsap !== 'undefined') {
            gsap.to(welcomeMusic, { volume: 0.6, duration: 1 });
        } else {
            welcomeMusic.volume = 0.6;
        }
        musicToggle.classList.remove('muted');
        localStorage.setItem('musicPlaying', 'true');
    } else {
        if (typeof gsap !== 'undefined') {
            gsap.to(welcomeMusic, {
                volume: 0,
                duration: 1,
                onComplete: () => welcomeMusic.pause()
            });
        } else {
            welcomeMusic.volume = 0;
            welcomeMusic.pause();
        }
        musicToggle.classList.add('muted');
        localStorage.setItem('musicPlaying', 'false');
    }
    playSound('click');
});

// Dark Mode Toggle
const isDarkMode = localStorage.getItem('darkMode') === 'true';
if (isDarkMode) {
    document.body.classList.add('dark-mode');
    darkModeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    darkModeToggle.querySelector('.mode-text').textContent = 'Light Mode';
}

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    darkModeToggle.querySelector('i').classList.toggle('fa-moon', !isDark);
    darkModeToggle.querySelector('i').classList.toggle('fa-sun', isDark);
    darkModeToggle.querySelector('.mode-text').textContent = isDark ? 'Light Mode' : 'Dark Mode';
    playSound('click');
});

// Scroll to Top
scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    playSound('click');
});

// Custom Cursor
document.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
});

document.querySelectorAll('a, button, .card-hover, .gallery-item, .modal-close, .lightbox-close, .chat-bubble').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('trail'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('trail'));
});

// Typing Effect
const phrases = [
    'Tech Solutions for All',
    'Your IT Partner',
    'Innovate with sysfx',
    'Secure Your Future',
    'Fast. Reliable. Expert.'
];
let phraseIndex = 0;
let charIndex = 0;
const typingSpeed = 100;
const erasingSpeed = 50;
const delayBetweenPhrases = 2000;

function type() {
    const currentPhrase = phrases[phraseIndex];
    if (charIndex < currentPhrase.length) {
        document.getElementById('typing-effect').textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        setTimeout(type, typingSpeed);
    } else {
        setTimeout(erase, delayBetweenPhrases);
    }
}

function erase() {
    const currentText = document.getElementById('typing-effect').textContent;
    if (currentText.length > 0) {
        document.getElementById('typing-effect').textContent = currentText.substring(0, currentText.length - 1);
        setTimeout(erase, erasingSpeed);
    } else {
        phraseIndex = (phraseIndex + 1) % phrases.length;
        charIndex = 0;
        setTimeout(type, 500);
    }
}

setTimeout(type, 1000);

// Email Obfuscation
const email = 'nick@sysfx.net';
emailSpan.textContent = email;
emailLink.href = `mailto:${email}`;
emailLink.textContent = email;

// Chat Bubble
chatBubble.addEventListener('click', () => {
    alert('Live chat coming soon! For now, email us at nick@sysfx.net');
    playSound('click');
});

// Tech Tips
const techTips = [
    'Restarting your device can fix many issues!',
    'Keep your software updated for security.',
    'Back up your data regularly.',
    'Use strong, unique passwords.',
    'Clear your cache to speed up browsing.'
];
techTipText.textContent = techTips[Math.floor(Math.random() * techTips.length)];
closeTechTip.addEventListener('click', () => {
    document.querySelector('.sticky-note').style.display = 'none';
    playSound('click');
});

// Stats Animation
function animateStats() {
    document.querySelectorAll('.stat-number').forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        let count = 0;
        const increment = target / 100;
        const interval = setInterval(() => {
            count += increment;
            if (count >= target) {
                count = target;
                clearInterval(interval);
            }
            stat.textContent = Math.round(count);
        }, 20);
    });
}

const statsSection = document.querySelector('.stats');
if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            animateStats();
            observer.disconnect();
        }
    }, { threshold: 0.5 });
    observer.observe(statsSection);
}

// Gallery Lightbox
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
        const lightbox = document.querySelector('.lightbox');
        const img = lightbox.querySelector('img');
        img.src = item.getAttribute('data-src');
        lightbox.style.display = 'flex';
        if (typeof gsap !== 'undefined') {
            gsap.from(img, { scale: 0.8, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' });
        }
        playSound('click');
    });
});

document.querySelector('.lightbox-close').addEventListener('click', () => {
    const lightbox = document.querySelector('.lightbox');
    if (typeof gsap !== 'undefined') {
        gsap.to(lightbox.querySelector('img'), {
            scale: 0.8,
            opacity: 0,
            duration: 0.3,
            ease: 'back.in(1.7)',
            onComplete: () => lightbox.style.display = 'none'
        });
    } else {
        lightbox.style.display = 'none';
    }
    playSound('click');
});

// Service Modals
services.forEach(service => {
    service.addEventListener('click', () => {
        const modalId = service.getAttribute('data-modal') + '-modal';
        const modal = document.getElementById(modalId);
        modal.style.display = 'flex';
        if (typeof gsap !== 'undefined') {
            gsap.from(modal.querySelector('.modal-content'), {
                scale: 0.8,
                opacity: 0,
                duration: 0.5,
                ease: 'back.out(1.7)'
            });
        }
        playSound('click');
    });
});

modals.forEach(modal => {
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        if (typeof gsap !== 'undefined') {
            gsap.to(modal.querySelector('.modal-content'), {
                scale: 0.9,
                opacity: 0,
                duration: 0.3,
                ease: 'back.in(1.7)',
                onComplete: () => modal.style.display = 'none'
            });
        } else {
            modal.style.display = 'none';
        }
        playSound('click');
    });

    modal.querySelector('.modal-action').addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof gsap !== 'undefined') {
            gsap.to(modal.querySelector('.modal-content'), {
                scale: 0.9,
                opacity: 0,
                duration: 0.3,
                ease: 'back.in(1.7)',
                onComplete: () => {
                    modal.style.display = 'none';
                    scrollToSection('contact');
                }
            });
        } else {
            modal.style.display = 'none';
            scrollToSection('contact');
        }
        playSound('click');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            if (typeof gsap !== 'undefined') {
                gsap.to(modal.querySelector('.modal-content'), {
                    scale: 0.9,
                    opacity: 0,
                    duration: 0.3,
                    ease: 'back.in(1.7)',
                    onComplete: () => modal.style.display = 'none'
                });
            } else {
                modal.style.display = 'none';
            }
            playSound('click');
        }
    });
});

// Testimonial Carousel
const testimonials = document.querySelectorAll('.testimonial');
let currentTestimonial = 0;

function updateTestimonial(direction) {
    testimonials[currentTestimonial].style.opacity = '0';
    testimonials[currentTestimonial].style.transform = direction === 'next' ? 'translateX(-100%)' : 'translateX(100%)';
    
    currentTestimonial = direction === 'next' ? 
        (currentTestimonial + 1) % testimonials.length : 
        (currentTestimonial - 1 + testimonials.length) % testimonials.length;

    testimonials[currentTestimonial].style.opacity = '1';
    testimonials[currentTestimonial].style.transform = 'translateX(0)';
    playSound('click');
}

document.querySelector('.carousel-next').addEventListener('click', () => updateTestimonial('next'));
document.querySelector('.carousel-prev').addEventListener('click', () => updateTestimonial('prev'));

testimonials.forEach((testimonial, index) => {
    testimonial.style.opacity = index === 0 ? '1' : '0';
    testimonial.style.transform = index === 0 ? 'translateX(0)' : 'translateX(100%)';
});

// Particles.js
try {
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: '#00a000' },
            shape: { type: 'circle' },
            opacity: { value: 0.5, random: false },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: '#00a000', opacity: 0.4, width: 1 },
            move: { enable: true, speed: 6, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false }
        },
        interactivity: {
            detect_on: 'canvas',
            events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' }, resize: true },
            modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } }
        },
        retina_detect: true
    });
} catch (e) {
    console.log('Particles.js failed to load:', e);
}

// Map Initialization
try {
    const map = L.map('map').setView([41.2786, -72.5276], 13); // Clinton, CT coordinates
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    L.marker([41.2786, -72.5276]).addTo(map).bindPopup('sysfx - 123 Main Street, Clinton, CT').openPopup();
} catch (e) {
    console.log('Leaflet map failed to load:', e);
}

// Tech Trivia
const trivia = [
    'The first computer "bug" was an actual insect stuck in a relay.',
    'The first mouse was made of wood.',
    'The internet was born in 1969 as ARPANET.',
    'A single Google search uses enough energy to power a light bulb for 30 minutes.',
    'The first email was sent in 1971 by Ray Tomlinson.'
];
document.getElementById('trivia-text').textContent = trivia[Math.floor(Math.random() * trivia.length)];

// Easter Egg
document.querySelector('.easter-egg-trigger').addEventListener('click', () => {
    alert('You found the Easter Egg! Enjoy this classic: *plays Windows XP startup sound in your mind*');
    playSound('click');
});

// GSAP ScrollTrigger
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll('.parallax').forEach((section) => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 50,
            duration: 1,
            ease: 'power2.out'
        });
    });

    document.querySelectorAll('.card-hover').forEach((card) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            scale: 0.9,
            duration: 0.8,
            ease: 'back.out(1.7)'
        });
    });
} else {
    console.log('GSAP or ScrollTrigger not loaded.');
}

// Ensure main content is visible after JS loads
document.body.classList.remove('js-fallback');
document.querySelector('main').style.opacity = '1';

console.log('Script loaded successfully');
