/* ==========================================================================
   SysFX Stylesheet
   Version: 1.8 (Revised based on list items 1-7)
   Author: sysfx (Revised by AI Assistant)
   ========================================================================== */

/* ==========================================================================
   1. Root Variables & Base Styles
   ========================================================================== */
:root {
    /* Colors */
    --primary-color: #00a000;       /* Sysfx Green */
    --secondary-color: #4CAF50;     /* Lighter Green */
    --accent-color: #ffdd00;        /* Yellow Accent */
    --blue-color: #007bff;          /* Added Blue */
    --blue-hover-color: #0056b3;
    --yellow-color: #ffc107;        /* Added Yellow */
    --yellow-hover-color: #e0a800;
    --text-light: #f8f9fa;
    --text-dark: #212529;
    --text-muted-light: #6c757d;
    --text-muted-dark: #adb5bd;
    --link-color: var(--blue-color);        /* Changed default link to blue */
    --link-hover-color: var(--blue-hover-color);
    --border-light: rgba(0, 0, 0, 0.1);
    --border-dark: rgba(255, 255, 255, 0.15);
    --bg-light: #f8f9fa;
    --bg-dark: #121212;
    --bg-surface-light: #ffffff;
    --bg-surface-dark: #1e1e1e;
    --error-color: #dc3545;
    --success-color: #28a745;

    /* Issue 5: Outline & Fill Colors */
    --outline-color-light: #1a1a1a; /* Slightly softer black outline */
    --outline-color-dark: #ffffff;  /* White outline for dark mode */
    --outline-fill-light: #ffffff;  /* White fill for light mode outlined text */
    --outline-fill-dark: #1a1a1a;   /* Dark fill for dark mode outlined text */
    --glow-color: #00ff00;          /* Consistent bright green glow */
    --glow-intensity: 8px;
    --glow-spread: 12px;

    /* Gradients */
    --text-gradient: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    --dark-mode-btn-bg-light: linear-gradient(45deg, #ffc107, #ff9800);
    --dark-mode-btn-bg-dark: linear-gradient(45deg, #673ab7, #3f51b5);
    --button-gradient-green: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    --button-gradient-green-hover: linear-gradient(45deg, var(--secondary-color), var(--primary-color));
    --button-gradient-blue: linear-gradient(45deg, var(--blue-color), #3da9fc);
    --button-gradient-blue-hover: linear-gradient(45deg, #3da9fc, var(--blue-color));
    --button-gradient-yellow: linear-gradient(45deg, var(--yellow-color), #ffda63);
    --button-gradient-yellow-hover: linear-gradient(45deg, #ffda63, var(--yellow-color));
    --hero-gradient: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    --cta-gradient: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    --bg-gradient-light: linear-gradient(135deg, #f8f9fa, #e9ecef);
    --bg-gradient-dark: linear-gradient(135deg, #121212, #1e1e1e);

    /* Glassmorphism */
    --glass-bg-light: rgba(255, 255, 255, 0.8);
    --glass-border-light: rgba(255, 255, 255, 0.25);
    --glass-bg-dark: rgba(30, 30, 30, 0.75);
    --glass-border-dark: rgba(255, 255, 255, 0.1);
    --glass-blur: 10px;

    /* Shadows */
    --shadow-sm: 0 2px 5px rgba(0, 0, 0, 0.06);
    --shadow-md: 0 6px 12px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 30px rgba(0, 0, 0, 0.15);
    --shadow-inset: inset 0 2px 4px rgba(0, 0, 0, 0.06);
    --shadow-dark-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
    --shadow-dark-md: 0 6px 18px rgba(0, 0, 0, 0.4);
    --shadow-dark-lg: 0 10px 45px rgba(0, 0, 0, 0.5);
    --shadow-interactive: var(--shadow-md);
    --shadow-interactive-hover: var(--shadow-lg);
    /* Button Specific Shadows (can vary per color) */
    --shadow-green: 0 4px 15px rgba(0, 160, 0, 0.2);
    --shadow-green-hover: 0 7px 25px rgba(0, 160, 0, 0.3);
    --shadow-blue: 0 4px 15px rgba(0, 123, 255, 0.2);
    --shadow-blue-hover: 0 7px 25px rgba(0, 123, 255, 0.3);
    --shadow-yellow: 0 4px 15px rgba(255, 193, 7, 0.2);
    --shadow-yellow-hover: 0 7px 25px rgba(255, 193, 7, 0.3);
    /* Text Glow */
    --text-glow: 0 0 var(--glow-intensity) var(--glow-color), 0 0 var(--glow-spread) var(--glow-color);
    --text-glow-dark-mode: 0 0 calc(var(--glow-intensity) * 1.2) var(--glow-color), 0 0 calc(var(--glow-spread) * 1.2) var(--glow-color);

    /* Typography */
    --font-family-base: 'Roboto', sans-serif;
    --font-awesome: "Font Awesome 6 Free";
    --font-size-base: 16px;
    --line-height-base: 1.7;
    --heading-font-weight: 700;
    --heading-line-height: 1.3;

    /* Spacing */
    --spacing-xs: 0.5rem; /* 8px */
    --spacing-sm: 1rem;   /* 16px */
    --spacing-md: 1.5rem; /* 24px */
    --spacing-lg: 2.5rem; /* 40px */
    --spacing-xl: 4rem;   /* 64px */

    /* Borders */
    --border-width: 1px;
    --border-radius-sm: 6px;
    --border-radius-md: 12px;
    --border-radius-lg: 20px;
    --border-radius-pill: 50px;
    --border-radius-circle: 50%;

    /* Transitions */
    --transition-speed-fast: 0.15s;
    --transition-speed: 0.3s;
    --transition-speed-slow: 0.5s;
    --transition-ease: ease;
    --transition-ease-out: ease-out;
    --transition-ease-in: ease-in;
    --transition-cubic: cubic-bezier(0.645, 0.045, 0.355, 1);

    /* Z-Indexes (Adjusted for new mobile nav) */
    --z-back: -1;
    --z-base: 1;
    --z-content: 10;
    --z-sticky: 50;
    --z-header: 1000;
    --z-mobile-nav-overlay: 1040; /* Overlay below nav */
    --z-mobile-nav: 1050;        /* Mobile nav */
    --z-hamburger: 1060;         /* Hamburger toggle above nav */
    --z-floating: 900;
    --z-modal-backdrop: 1200;
    --z-modal-content: 1210;
    --z-lightbox-backdrop: 1300;
    --z-lightbox-content: 1310;
    --z-scroll-progress: 1400;
    --z-cursor: 9999;
}

*,
*::before,
*::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
    font-size: 100%;
    /* scroll-padding-top set by JS */
    -webkit-tap-highlight-color: transparent;
}

body {
    font-family: var(--font-family-base);
    font-size: var(--font-size-base);
    line-height: var(--line-height-base);
    background: var(--bg-gradient-light);
    color: var(--text-dark);
    /* padding-top set by JS */
    position: relative;
    overflow-x: hidden;
    background-color: var(--bg-light); /* Fallback */
    opacity: 0; /* Start hidden for preloader */
    transition: opacity 0.5s ease-in, background-color var(--transition-speed) var(--transition-ease), color var(--transition-speed) var(--transition-ease);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

body:not(.preload) {
    opacity: 1; /* Fade in body when not preloading */
}

body.theme-transitions-active * {
    /* Limit transitions to avoid performance issues */
    /* transition: none !important; */ /* DEBUG: Disable all transitions */
}

/* Specific Theme Transitions */
body.theme-transitions-active #main-header,
body.theme-transitions-active .glass-morphism,
body.theme-transitions-active .modal-content,
body.theme-transitions-active .main-nav.mobile-nav {
    transition: background var(--transition-speed) var(--transition-ease),
                border-color var(--transition-speed) var(--transition-ease),
                box-shadow var(--transition-speed) var(--transition-ease),
                backdrop-filter var(--transition-speed) var(--transition-ease);
}
body.theme-transitions-active .modern-button,
body.theme-transitions-active .nav-link,
body.theme-transitions-active a,
body.theme-transitions-active .os-logo,
body.theme-transitions-active .form-input,
body.theme-transitions-active .form-textarea,
body.theme-transitions-active .contact-item i,
body.theme-transitions-active .service-icon i {
     transition: background-color var(--transition-speed) var(--transition-ease),
                 color var(--transition-speed) var(--transition-ease),
                 border-color var(--transition-speed) var(--transition-ease),
                 fill var(--transition-speed) var(--transition-ease),
                 stroke var(--transition-speed) var(--transition-ease),
                 box-shadow var(--transition-speed) var(--transition-ease),
                 filter var(--transition-speed) var(--transition-ease),
                 opacity var(--transition-speed) var(--transition-ease);
}

body.dark-mode {
    background: var(--bg-gradient-dark);
    background-color: var(--bg-dark); /* Fallback */
    color: var(--text-light);
    /* Swap relevant variables */
    --link-color: #64b5f6;
    --link-hover-color: #90caf9;
    --border-light: var(--border-dark);
    --bg-light: var(--bg-dark);
    --bg-surface-light: var(--bg-surface-dark);
    --text-muted-light: var(--text-muted-dark);
    --shadow-sm: var(--shadow-dark-sm);
    --shadow-md: var(--shadow-dark-md);
    --shadow-lg: var(--shadow-dark-lg);
    --shadow-interactive: var(--shadow-dark-md);
    --shadow-interactive-hover: var(--shadow-dark-lg);
    --shadow-green: 0 4px 20px rgba(76, 175, 80, 0.3);
    --shadow-green-hover: 0 7px 30px rgba(76, 175, 80, 0.4);
    --shadow-blue: 0 4px 20px rgba(0, 123, 255, 0.3);
    --shadow-blue-hover: 0 7px 30px rgba(0, 123, 255, 0.4);
    --shadow-yellow: 0 4px 20px rgba(255, 193, 7, 0.3);
    --shadow-yellow-hover: 0 7px 30px rgba(255, 193, 7, 0.4);
    --glass-bg-light: var(--glass-bg-dark);
    --glass-border-light: var(--glass-border-dark);
    /* Issue 5: Swap outline fill/stroke vars */
    --outline-color-light: var(--outline-color-dark);
    --outline-fill-light: var(--outline-fill-dark);
}

body.no-scroll {
    overflow: hidden; /* Prevent scrolling when modal/nav is open */
}

/* Issue 6 Fix: Ensure text colors contrast correctly in different containers/modes */
body:not(.dark-mode) .glass-morphism,
body:not(.dark-mode) .modal-content {
    color: var(--text-dark); /* Dark text on light glass */
}
body.dark-mode .glass-morphism,
body.dark-mode .modal-content,
body.dark-mode .parallax > *, /* Direct children of parallax */
body.dark-mode .cta {
    color: var(--text-light); /* Light text on dark glass/parallax */
}

/* Explicit text colors for paragraphs/lists within themed containers */
body:not(.dark-mode) .glass-morphism p,
body:not(.dark-mode) .glass-morphism li,
body:not(.dark-mode) .service p, /* Issue 6: Service card text */
body:not(.dark-mode) .case-study p,
body:not(.dark-mode) .blog-post-preview p,
body:not(.dark-mode) .event-content p,
body:not(.dark-mode) .timeline-description,
body:not(.dark-mode) .contact p,
body:not(.dark-mode) .contact address,
body:not(.dark-mode) .stats p,
body:not(.dark-mode) .about p,
body:not(.dark-mode) .welcome p,
body:not(.dark-mode) .location-content p,
body:not(.dark-mode) .community p {
    color: var(--text-dark);
}
body.dark-mode .glass-morphism p,
body.dark-mode .glass-morphism li,
body.dark-mode .parallax p,
body.dark-mode .service p, /* Issue 6: Service card text */
body.dark-mode .case-study p,
body.dark-mode .blog-post-preview p,
body.dark-mode .event-content p,
body.dark-mode .timeline-description,
body.dark-mode .contact p,
body.dark-mode .contact address,
body.dark-mode .stats p,
body.dark-mode .cta p,
body.dark-mode .about p,
body.dark-mode .welcome p,
body.dark-mode .location-content p,
body.dark-mode .community p {
    color: var(--text-light);
}

/* Explicit heading colors for containers */
body:not(.dark-mode) .glass-morphism h1, body:not(.dark-mode) .glass-morphism h2, body:not(.dark-mode) .glass-morphism h3, body:not(.dark-mode) .glass-morphism h4 {
   color: var(--text-dark);
}
body.dark-mode .glass-morphism h1, body.dark-mode .glass-morphism h2, body.dark-mode .glass-morphism h3, body.dark-mode .glass-morphism h4,
body.dark-mode .parallax h1, body.dark-mode .parallax h2, body.dark-mode .parallax h3, body.dark-mode .parallax h4 {
   color: var(--text-light);
}
/* Issue 6 Fix: Explicitly set service card heading color */
body:not(.dark-mode) .service h3 { color: var(--text-dark); }
body.dark-mode .service h3 { color: var(--text-light); }

/* Muted text colors */
body:not(.dark-mode) .text-muted-light,
body:not(.dark-mode) .optional,
body:not(.dark-mode) .extra-info {
    color: var(--text-muted-light);
}
body.dark-mode .text-muted-light, /* Class remains for semantic meaning */
body.dark-mode .optional,
body.dark-mode .extra-info {
    color: var(--text-muted-dark);
}

/* Text shadow for readability on parallax backgrounds (only) */
.parallax h2, .parallax h3, .parallax p, .parallax .services-description {
    text-shadow: 1px 1px 3px rgba(0,0,0,0.7);
}
body.dark-mode .parallax h2, body.dark-mode .parallax h3, body.dark-mode .parallax p, body.dark-mode .parallax .services-description {
    text-shadow: 1px 1px 4px rgba(0,0,0,0.8);
}
/* Remove text shadow from elements inside glass containers */
.glass-morphism h1, .glass-morphism h2, .glass-morphism h3, .glass-morphism p,
.modal-content h1, .modal-content h2, .modal-content h3, .modal-content p {
    text-shadow: none !important;
}

/* ==========================================================================
   2. Accessibility & Utility Classes
   ========================================================================== */
.skip-link {
    position: absolute;
    top: 0;
    left: -9999px;
    background-color: var(--primary-color);
    color: white;
    padding: var(--spacing-sm);
    z-index: 99999;
    transition: left var(--transition-speed-fast) var(--transition-ease);
    border-radius: 0 0 var(--border-radius-sm) 0;
}
.skip-link:focus {
    left: 0;
    outline: 3px solid var(--accent-color);
    outline-offset: 2px;
}

.sr-only { /* Screen reader only */
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

.glass-morphism {
    background: var(--glass-bg-light);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border: var(--border-width) solid var(--glass-border-light);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
}

.sysfx-green {
    color: var(--primary-color) !important;
}

.gradient-text {
    background: var(--text-gradient);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    display: inline-block;
    font-weight: var(--heading-font-weight);
}

/* --- Issue 5: Heading Glow & Outline Fix --- */
.glow-text {
    text-shadow: var(--text-glow);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
body.dark-mode .glow-text {
    text-shadow: var(--text-glow-dark-mode);
}

.outlined-text {
    -webkit-text-stroke: 1px var(--outline-color-light); /* Light mode stroke color */
    stroke: 1px var(--outline-color-light); /* Standard property */
    paint-order: stroke fill; /* Draw stroke UNDER fill */
    color: var(--outline-fill-light); /* Light mode FILL color */
    text-shadow: none !important; /* Remove base glow if ONLY outlined */
}
body.dark-mode .outlined-text {
    -webkit-text-stroke-color: var(--outline-color-dark); /* Dark mode stroke color */
    stroke: var(--outline-color-dark);
    color: var(--outline-fill-dark); /* Dark mode FILL color */
}

/* Combined Outline and Glow */
.outlined-text.glow-text {
    text-shadow: var(--text-glow) !important; /* Re-apply glow OVER the stroke/fill */
}
body.dark-mode .outlined-text.glow-text {
    text-shadow: var(--text-glow-dark-mode) !important;
}

/* Ensure gradient text with outline/glow maintains transparency for gradient */
.gradient-text.outlined-text,
.gradient-text.glow-text,
.gradient-text.outlined-text.glow-text {
    color: transparent !important; /* Keep gradient visible */
    -webkit-text-fill-color: transparent !important; /* Ensure fill is transparent */
}
/* Apply combined effect only if both classes are present */
.gradient-text.outlined-text.glow-text {
     text-shadow: var(--text-glow) !important;
     -webkit-text-stroke: 1px var(--outline-color-light);
     stroke: 1px var(--outline-color-light);
}
body.dark-mode .gradient-text.outlined-text.glow-text {
     text-shadow: var(--text-glow-dark-mode) !important;
     -webkit-text-stroke-color: var(--outline-color-dark);
     stroke: var(--outline-color-dark);
}

/* Headings on Parallax: Glow Only (No Outline/Fill override) */
#services.parallax .glow-text,
#events.parallax .glow-text,
#testimonials.parallax .glow-text {
    text-shadow: var(--text-glow); /* Apply glow */
    -webkit-text-stroke: none; /* Ensure no accidental stroke */
    stroke: none;
    color: var(--text-light); /* Ensure base color is light on parallax */
}
body.dark-mode #services.parallax .glow-text,
body.dark-mode #events.parallax .glow-text,
body.dark-mode #testimonials.parallax .glow-text {
     text-shadow: var(--text-glow-dark-mode);
     color: var(--text-light); /* Still light text in dark mode */
}
/* --- End Issue 5 Fix --- */

.centered-text {
    text-align: center;
}

.optional, .required-star {
    font-size: 0.85em;
    font-weight: normal;
    color: var(--text-muted-light);
}
.required-star {
    color: var(--error-color);
    margin-left: 2px;
}

.card-hover {
   transition: transform var(--transition-speed) var(--transition-cubic),
               box-shadow var(--transition-speed) var(--transition-cubic);
}
.card-hover:hover,
.card-hover:focus-within {
    transform: translateY(-6px) scale(1.02);
    box-shadow: var(--shadow-interactive-hover);
}

/* Links */
a {
    color: var(--link-color);
    text-decoration: none;
    transition: color var(--transition-speed-fast) var(--transition-ease);
}
a:hover, a:focus {
    color: var(--link-hover-color);
    text-decoration: underline;
    outline: none;
}
a:focus-visible {
    outline: 2px solid var(--link-color);
    outline-offset: 2px;
    border-radius: var(--border-radius-sm);
}
body.dark-mode a:focus-visible {
     outline-color: var(--link-hover-color);
}
/* Email links need specific styling if different */
.email-link {
    word-break: break-all; /* Prevent long emails breaking layout */
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
    font-weight: var(--heading-font-weight);
    line-height: var(--heading-line-height);
    margin-bottom: var(--spacing-md);
    color: inherit; /* Inherit color by default - overridden where needed */
}
h1 { font-size: clamp(2em, 5vw, 2.8em); }
h2 { font-size: clamp(1.8em, 4vw, 2.4em); }
h3 { font-size: clamp(1.4em, 3vw, 1.8em); }


/* ==========================================================================
   3. Preloader, Scroll Progress & Custom Cursor
   ========================================================================== */
.preloader {
    position: fixed;
    inset: 0;
    background-color: var(--bg-light);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    transition: opacity var(--transition-speed-slow) ease-in-out;
}
body.dark-mode .preloader {
    background-color: var(--bg-dark);
}
.preloader-logo img {
    max-width: 100px;
    margin-bottom: var(--spacing-md);
    animation: pulseLogo 1.5s infinite ease-in-out;
}
@keyframes pulseLogo {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.85; }
}
.preloader-dots {
    display: flex;
    gap: var(--spacing-sm);
}
.dot {
    width: 12px;
    height: 12px;
    background-color: var(--primary-color);
    border-radius: 50%;
    animation: bounceDot 1.4s infinite ease-in-out both;
}
.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
body.dark-mode .dot { background-color: var(--secondary-color); }
@keyframes bounceDot {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
}

.scroll-progress {
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 5px;
    background: var(--primary-color);
    z-index: var(--z-scroll-progress);
    transition: width 0.1s linear;
    box-shadow: 0 0 10px var(--primary-color);
    border-radius: 0 2px 2px 0;
}
body.dark-mode .scroll-progress {
     background: var(--secondary-color);
     box-shadow: 0 0 10px var(--secondary-color);
}

/* --- Issue 4 & 7: Custom Cursor Fix & Pulse Effect --- */
.cursor {
    position: fixed;
    width: 16px;
    height: 16px;
    /* left: 0; top: 0; */ /* Removed: JS handles position via x/y */
    background-color: var(--primary-color);
    border-radius: var(--border-radius-circle);
    pointer-events: none;
    z-index: var(--z-cursor);
    opacity: 0;
    /* transform: translate(-50%, -50%) scale(1); */ /* Removed translate: JS handles */
    transform: scale(1); /* Keep scale for effects */
    border: 2px solid rgba(255,255,255,0.5);
    mix-blend-mode: difference;
    transition: width var(--transition-speed-fast) var(--transition-cubic),
                height var(--transition-speed-fast) var(--transition-cubic),
                transform var(--transition-speed-fast) var(--transition-cubic),
                opacity var(--transition-speed) var(--transition-ease),
                background-color var(--transition-speed) var(--transition-ease),
                border-color var(--transition-speed) var(--transition-ease);
    will-change: transform; /* Hint browser for transform/position changes by JS */
}
body.cursor-ready .cursor {
    opacity: 1;
}
.cursor.hover {
    transform: scale(2.5); /* Keep scale transform */
    background-color: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.7);
}
.cursor.click {
    transform: scale(0.8); /* Keep scale transform */
    transition-duration: 0.1s;
}
/* Issue 7: Cursor Pulse */
.cursor.pulse-effect {
     animation: pulseCursor 2s infinite ease-in-out;
}
@keyframes pulseCursor {
    0%, 100% { box-shadow: 0 0 0 0px rgba(255, 255, 255, 0.3); }
    50% { box-shadow: 0 0 0 6px rgba(255, 255, 255, 0); }
}
@media (pointer: coarse) or (hover: none) {
    .cursor { display: none !important; }
}
/* --- End Issue 4 & 7 --- */


/* ==========================================================================
   4. Particles Background
   ========================================================================== */
.particles-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: var(--z-back);
    opacity: 0.3;
    transition: opacity var(--transition-speed) var(--transition-ease);
}
body.dark-mode .particles-container {
    opacity: 0.35;
}

/* ==========================================================================
   5. Header & Navigation (Revised for Mobile Nav Fix)
   ========================================================================== */
#main-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: var(--z-header);
    padding: 0;
    border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
    transition: transform var(--transition-speed) var(--transition-cubic),
                background var(--transition-speed) var(--transition-ease),
                box-shadow var(--transition-speed) var(--transition-ease),
                border-color var(--transition-speed) var(--transition-ease),
                backdrop-filter var(--transition-speed) var(--transition-ease);
    border-top: none;
    border-left: none;
    border-right: none;
    background: var(--glass-bg-light);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border-bottom: var(--border-width) solid var(--glass-border-light);
    box-shadow: var(--shadow-sm);
}

.header-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-xs) var(--spacing-md);
    background: rgba(0, 0, 0, 0.03);
    font-size: 0.85em;
    color: var(--text-muted-light);
    border-bottom: var(--border-width) solid rgba(0, 0, 0, 0.02);
    transition: height var(--transition-speed) var(--transition-cubic),
                padding var(--transition-speed) var(--transition-cubic),
                opacity var(--transition-speed) var(--transition-ease) 0.1s,
                visibility var(--transition-speed) var(--transition-ease) 0.1s,
                border-bottom var(--transition-speed) var(--transition-ease);
    height: 35px;
    overflow: hidden;
}
body.dark-mode .header-top-bar {
    background: rgba(255, 255, 255, 0.02);
    border-bottom-color: rgba(255, 255, 255, 0.04);
}
#current-time {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    flex-shrink: 0;
}
#current-time i { color: var(--primary-color); }
body.dark-mode #current-time i { color: var(--secondary-color); }
.tech-trivia-container {
    flex-grow: 1;
    text-align: center;
    margin: 0 var(--spacing-sm);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.tech-trivia { display: inline-block; max-width: 100%; font-size: 0.95em; }
#trivia-icon { margin-right: var(--spacing-xs); opacity: 0.8; }

#darkModeToggle {
    padding: 6px 14px; font-size: 0.9em; border-radius: var(--border-radius-pill);
    background-image: var(--dark-mode-btn-bg-light); color: var(--text-dark); gap: 8px;
    min-width: 120px; justify-content: center; border: none;
    transition: background-image var(--transition-speed) var(--transition-ease),
                color var(--transition-speed) var(--transition-ease),
                transform var(--transition-speed-fast) var(--transition-ease),
                box-shadow var(--transition-speed) var(--transition-cubic);
    box-shadow: var(--shadow-sm); flex-shrink: 0; cursor: pointer; display: inline-flex;
    align-items: center; overflow: hidden;
}
#darkModeToggle .icon-container { display: inline-flex; transition: transform var(--transition-speed) var(--transition-ease); }
#darkModeToggle i { transition: color var(--transition-speed) var(--transition-ease); color: #ff8f00; }
#darkModeToggle .mode-button-text { transition: color var(--transition-speed) var(--transition-ease); }
body.dark-mode #darkModeToggle { background-image: var(--dark-mode-btn-bg-dark); color: var(--text-light); box-shadow: var(--shadow-dark-sm); }
body.dark-mode #darkModeToggle i { color: #c3aeff; }
#darkModeToggle:hover, #darkModeToggle:focus-visible { transform: scale(1.05); box-shadow: var(--shadow-md); outline: none; }
body.dark-mode #darkModeToggle:hover, body.dark-mode #darkModeToggle:focus-visible { box-shadow: var(--shadow-dark-md); }
#darkModeToggle:hover .icon-container, #darkModeToggle:focus-visible .icon-container { transform: rotate(15deg); }
#darkModeToggle:active { transform: scale(1); box-shadow: var(--shadow-sm); }

.header-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm) var(--spacing-md);
    gap: var(--spacing-sm);
    transition: padding var(--transition-speed) var(--transition-cubic);
}
.logo-container { display: flex; flex-shrink: 0; perspective: 1200px; }
.logo-container a { display: block; line-height: 0; }

.flipping-logo {
    width: 60px; height: 60px; max-width: 100%; object-fit: contain;
    border-radius: var(--border-radius-circle); box-shadow: 0 0 15px rgba(0, 160, 0, 0.4);
    transform-style: preserve-3d; animation: coinFlip 6s infinite ease-in-out;
    background-color: rgba(255,255,255,0.3); border: 1px solid var(--glass-border-light);
    transition: width var(--transition-speed) var(--transition-cubic), height var(--transition-speed) var(--transition-cubic);
}
body.dark-mode .flipping-logo { background-color: rgba(50,50,50,0.3); border-color: var(--glass-border-dark); box-shadow: 0 0 15px rgba(76, 175, 80, 0.5); }
@keyframes coinFlip { 0% { transform: rotateY(0deg); } 45% { transform: rotateY(0deg); } 50% { transform: rotateY(180deg); } 95% { transform: rotateY(180deg); } 100% { transform: rotateY(360deg); } }

.header-titles { text-align: center; flex-grow: 1; margin: 0 var(--spacing-sm); min-width: 0; transition: opacity var(--transition-speed) var(--transition-ease), visibility var(--transition-speed) var(--transition-ease); }
#main-header h1 { font-size: clamp(1.8em, 4vw, 2.4em); margin: 0; line-height: 1.1; }
#typing-effect { min-height: 1.4em; display: block; font-size: clamp(1em, 2.5vw, 1.2em); color: var(--primary-color); margin-top: var(--spacing-xs); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 300; height: 1.4em; line-height: 1.4em; }
body.dark-mode #typing-effect { color: var(--text-light); }

/* --- Issue 1: Hamburger Menu and Mobile Nav --- */
/* Hamburger Toggle Button */
.hamburger {
    display: none; /* Hidden by default, shown in media query */
    padding: 10px; cursor: pointer; transition: opacity 0.15s linear; border: none;
    background-color: transparent; z-index: var(--z-hamburger); /* High z-index */
    order: 3; /* Keep on right */
    color: var(--text-dark); /* Inherit */
    position: relative; /* Needed for z-index */
}
body.dark-mode .hamburger { color: var(--text-light); }
.hamburger-box { width: 30px; height: 24px; display: inline-block; position: relative; }
.hamburger-inner, .hamburger-inner::before, .hamburger-inner::after {
    width: 30px; height: 3px; background-color: currentColor; border-radius: 3px; position: absolute;
    transition: transform 0.22s cubic-bezier(0.55, 0.055, 0.675, 0.19), top 0.1s 0.2s ease-in, bottom 0.1s 0.2s ease-in, opacity 0.1s ease-in;
}
.hamburger-inner { display: block; top: 50%; margin-top: -1.5px; }
.hamburger-inner::before { content: ""; display: block; top: -10px; }
.hamburger-inner::after { content: ""; display: block; bottom: -10px; }
/* Active Hamburger State (X shape) */
.hamburger.is-active .hamburger-inner { transform: rotate(225deg); transition-delay: 0.12s; transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); }
.hamburger.is-active .hamburger-inner::before { top: 0; opacity: 0; transition: top 0.1s ease-out, opacity 0.1s 0.12s ease-out; }
.hamburger.is-active .hamburger-inner::after { bottom: 0; transform: rotate(-90deg); transition: bottom 0.1s ease-out, transform 0.22s 0.12s cubic-bezier(0.215, 0.61, 0.355, 1); }

/* Desktop Navigation (Hidden on small screens) */
.main-nav.desktop-nav {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    border-top: var(--border-width) solid var(--border-light);
    transition: height var(--transition-speed) var(--transition-cubic),
                padding var(--transition-speed) var(--transition-cubic),
                opacity var(--transition-speed) var(--transition-ease),
                visibility var(--transition-speed) var(--transition-ease),
                transform var(--transition-speed) var(--transition-cubic),
                border-top var(--transition-speed) var(--transition-ease);
    height: auto;
    overflow: hidden;
}
/* Hide desktop nav on mobile */
@media (max-width: 768px) { .main-nav.desktop-nav { display: none; } }

/* Mobile Off-Canvas Navigation Container */
.main-nav.mobile-nav {
    display: flex; flex-direction: column; align-items: stretch; /* Full width links */
    position: fixed; top: 0; left: 0; width: 85%; max-width: 300px; /* Slightly smaller max */
    height: 100vh; height: 100dvh; /* Dynamic viewport height */
    background: var(--bg-surface-light);
    padding: var(--spacing-xl) var(--spacing-md) var(--spacing-md); /* Top padding for space */
    padding-top: 60px; /* Explicit top padding */
    border-right: var(--border-width) solid var(--border-light);
    box-shadow: var(--shadow-lg);
    transform: translateX(-105%); /* Start further off-screen */
    transition: transform 0.4s var(--transition-cubic);
    overflow-y: auto;
    z-index: var(--z-mobile-nav); /* Above overlay, below hamburger */
    visibility: hidden; /* Hidden initially */
    opacity: 0; /* Fade in */
    transition: transform 0.4s var(--transition-cubic), visibility 0.4s, opacity 0.4s ease;
}
body.dark-mode .main-nav.mobile-nav { background: var(--bg-surface-dark); border-right-color: var(--border-dark); box-shadow: var(--shadow-dark-lg); }

/* Mobile Navigation Active State */
body.nav-active .main-nav.mobile-nav {
    transform: translateX(0);
    visibility: visible;
    opacity: 1;
}

/* Mobile Nav Overlay */
.mobile-nav-overlay {
    content: '';
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.6); /* Darker overlay */
    z-index: var(--z-mobile-nav-overlay); /* Below mobile nav */
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.4s ease, visibility 0s 0.4s;
    pointer-events: none; /* Non-interactive initially */
    -webkit-tap-highlight-color: transparent;
    backdrop-filter: blur(2px); /* Subtle blur */
    -webkit-backdrop-filter: blur(2px);
}
body.nav-active .mobile-nav-overlay {
    opacity: 1;
    visibility: visible;
    pointer-events: auto; /* Allow click to close */
    transition: opacity 0.4s ease, visibility 0s 0s, backdrop-filter 0.4s ease;
}

/* Mobile Nav Close Button */
.mobile-nav-close {
    position: absolute;
    top: var(--spacing-sm);
    right: var(--spacing-sm);
    background: none; border: none; color: var(--text-muted-light);
    font-size: 1.8em; line-height: 1; cursor: pointer;
    padding: var(--spacing-xs); z-index: calc(var(--z-mobile-nav) + 1); /* Above nav content */
    transition: color var(--transition-speed) ease, transform var(--transition-speed) ease;
}
.mobile-nav-close:hover, .mobile-nav-close:focus { color: var(--error-color); transform: scale(1.1) rotate(90deg); outline: none;}
body.dark-mode .mobile-nav-close { color: var(--text-muted-dark); }

/* Nav Links (Shared Styles) */
.nav-link {
    display: inline-flex; align-items: center; gap: var(--spacing-xs);
    padding: 8px 16px; color: var(--text-dark); text-decoration: none;
    font-weight: 500; border-radius: var(--border-radius-pill);
    transition: background-color var(--transition-speed) var(--transition-ease),
                color var(--transition-speed) var(--transition-ease);
    position: relative; overflow: hidden;
}
body.dark-mode .nav-link { color: var(--text-light); }
.nav-link i { color: var(--primary-color); transition: color var(--transition-speed) var(--transition-ease); }
body.dark-mode .nav-link i { color: var(--secondary-color); }

/* Desktop Nav Link Hover/Focus */
.desktop-nav .nav-link:hover,
.desktop-nav .nav-link:focus {
    color: var(--primary-color); background-color: rgba(0, 160, 0, 0.05);
    text-decoration: none; outline: none;
}
body.dark-mode .desktop-nav .nav-link:hover,
body.dark-mode .desktop-nav .nav-link:focus {
    color: var(--secondary-color); background-color: rgba(76, 175, 80, 0.1);
}
/* Desktop Nav Underline Effect */
.desktop-nav .nav-link::after {
    content: ''; position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%);
    width: 0; height: 2px; background: var(--primary-color);
    transition: width var(--transition-speed) var(--transition-ease-out);
}
body.dark-mode .desktop-nav .nav-link::after { background: var(--secondary-color); }
.desktop-nav .nav-link:hover::after,
.desktop-nav .nav-link:focus::after { width: 60%; }

/* Active Nav Link Style (Scrollspy) */
.nav-link.active {
    color: var(--text-light); background-color: var(--primary-color);
    box-shadow: var(--shadow-inset);
}
.nav-link.active i { color: var(--text-light); }
.desktop-nav .nav-link.active::after { display: none; } /* Hide underline on active desktop link */
body.dark-mode .nav-link.active { background-color: var(--secondary-color); color: var(--text-dark); }
body.dark-mode .nav-link.active i { color: var(--text-dark); }

/* Mobile Nav Link Specific Styles */
.mobile-nav .nav-link {
    width: 100%; padding: 14px 20px; font-size: 1.1em; justify-content: flex-start;
    border-radius: var(--border-radius-sm); background: transparent;
    border-bottom: 1px solid var(--border-light);
    color: var(--text-dark); /* Explicit mobile link color */
}
.mobile-nav .nav-link:last-of-type { border-bottom: none; }
body.dark-mode .mobile-nav .nav-link { background: transparent; border-bottom-color: var(--border-dark); color: var(--text-light); }
.mobile-nav .nav-link:hover,
.mobile-nav .nav-link:focus,
.mobile-nav .nav-link.active {
    background-color: rgba(0, 160, 0, 0.08);
    color: var(--primary-color);
    box-shadow: none;
}
.mobile-nav .nav-link.active i { color: var(--primary-color); }
body.dark-mode .mobile-nav .nav-link:hover,
body.dark-mode .mobile-nav .nav-link:focus,
body.dark-mode .mobile-nav .nav-link.active {
    background-color: rgba(76, 175, 80, 0.15);
    color: var(--secondary-color);
}
body.dark-mode .mobile-nav .nav-link.active i { color: var(--secondary-color); }
/* --- End Issue 1 Fix --- */

/* Header Shrink Styles */
#main-header.header-shrunk { box-shadow: var(--shadow-md); }
body.dark-mode #main-header.header-shrunk { box-shadow: var(--shadow-dark-md); }
#main-header.header-shrunk .header-top-bar { height: 0; padding-top: 0; padding-bottom: 0; opacity: 0; visibility: hidden; border-bottom: none; }
#main-header.header-shrunk .header-main { padding-top: var(--spacing-xs); padding-bottom: var(--spacing-xs); }
#main-header.header-shrunk .flipping-logo { width: 45px; height: 45px; }
#main-header.header-shrunk h1 { font-size: clamp(1.5em, 3vw, 2em); }
#main-header.header-shrunk #typing-effect { font-size: clamp(0.8em, 2vw, 1em); min-height: 1.2em; height: 1.2em; line-height: 1.2em; }
/* Hide desktop nav when shrunk (only if desktop nav is visible) */
@media (min-width: 769px) {
    #main-header.header-shrunk .main-nav.desktop-nav { height: 0; padding-top: 0; padding-bottom: 0; opacity: 0; visibility: hidden; border-top: none; }
}


/* ==========================================================================
   6. Scrolling Text Bar
   ========================================================================== */
.scrolling-text-container {
    background: var(--primary-color); color: var(--text-light); padding: var(--spacing-sm) 0;
    white-space: nowrap; overflow: hidden; width: 100%; z-index: var(--z-sticky);
    box-shadow: var(--shadow-sm); position: relative;
}
body.dark-mode .scrolling-text-container { background: var(--secondary-color); color: var(--text-dark); }
.scrolling-text-content { display: inline-block; padding-left: 100%; animation: scroll-text 30s linear infinite; font-size: 0.95em; font-weight: 500; margin: 0; will-change: transform; }
.scrolling-text-content span { display: inline-block; margin-right: 60px; }
@keyframes scroll-text { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
.scrolling-text-container:hover .scrolling-text-content { animation-play-state: paused; }


/* ==========================================================================
   7. Main Content & Sections
   ========================================================================== */
main { /* Padding top handled by JS */ }

section {
    margin: var(--spacing-lg) auto; padding: var(--spacing-lg) var(--spacing-md);
    width: 90%; max-width: 1100px; position: relative; overflow: visible;
    border-radius: var(--border-radius-lg);
}
.section-animation { opacity: 0; /* GSAP handles reveal */ }

.welcome {
    padding-top: var(--spacing-md); padding-bottom: var(--spacing-lg);
    position: relative; overflow: hidden;
}
.welcome::before { content: ''; position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(160deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%); opacity: 0.5; pointer-events: none; z-index: 0; }
body.dark-mode .welcome::before { background: linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 60%); opacity: 0.7; }
.welcome > * { position: relative; z-index: 1; }

.location-content { padding: var(--spacing-lg); }
.location-content p { margin-bottom: var(--spacing-md); }

.parallax {
    background-attachment: scroll; background-position: center center; background-repeat: no-repeat;
    background-size: cover; position: relative; color: var(--text-light); /* Base color */
}
@media (min-width: 1024px) and (prefers-reduced-motion: no-preference) {
    .parallax { background-attachment: fixed; }
}
.parallax::before { content: ''; position: absolute; inset: 0; background: rgba(0, 0, 0, 0.6); z-index: 0; pointer-events: none; border-radius: inherit; transition: background var(--transition-speed) var(--transition-ease); }
.parallax > * { position: relative; z-index: 1; }

.services.parallax { background-image: url('https://img.freepik.com/free-photo/motherboard-circuit-technology-background-gradient-green_53876-124656.jpg'); }
.events.parallax { background-image: url('https://m.media-amazon.com/images/I/81QWPvOKCFL.jpg'); }
.testimonials.parallax {
    background-color: var(--bg-light);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23a0a0a0' fill-opacity='0.06'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
body.dark-mode .testimonials.parallax {
    background-color: var(--bg-dark);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23cccccc' fill-opacity='0.04'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
.testimonials.parallax::before { background: rgba(255, 255, 255, 0.4); }
body.dark-mode .testimonials.parallax::before { background: rgba(0, 0, 0, 0.7); }

/* ==========================================================================
   8. Components
   ========================================================================== */

/* Hero Section */
.hero { padding: var(--spacing-xl) var(--spacing-md); text-align: center; min-height: 65vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; border-radius: 0; background: var(--hero-gradient); color: var(--text-light); }
.hero-video { position: absolute; top: 50%; left: 50%; min-width: 100%; min-height: 100%; width: auto; height: auto; object-fit: cover; transform: translate(-50%, -50%); z-index: -2; opacity: 0.1; filter: grayscale(60%) brightness(0.8); }
.hero-overlay-animated { position: absolute; inset: 0; background: linear-gradient(110deg, rgba(0, 160, 0, 0.1) 0%, rgba(76, 175, 80, 0.05) 50%, rgba(0, 160, 0, 0.1) 100%); background-size: 200% 200%; animation: gradientShift 15s ease infinite; z-index: -1; opacity: 0.7; }
body.dark-mode .hero-overlay-animated { opacity: 0.5; }
@keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
.hero-content { max-width: 850px; padding: var(--spacing-lg); position: relative; z-index: 1; }
.hero-title { margin-bottom: var(--spacing-md); }
.hero-text { font-size: 1.2em; margin-bottom: var(--spacing-lg); text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.6); max-width: 700px; margin-left: auto; margin-right: auto; }

/* --- Buttons (Issue 3 & 7) --- */
.button-container { display: flex; gap: var(--spacing-md); justify-content: center; margin-top: var(--spacing-lg); flex-wrap: wrap; }
.modern-button {
    background: var(--button-gradient-green); /* Default to green */
    border: none; color: var(--text-light); padding: 14px 32px; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: var(--spacing-sm); font-size: var(--font-size-base); font-weight: 500; border-radius: var(--border-radius-pill); cursor: pointer; transition: all var(--transition-speed) var(--transition-cubic); position: relative; overflow: hidden; box-shadow: var(--shadow-green); /* Default shadow */
    transform: perspective(1px) translateZ(0); -webkit-tap-highlight-color: transparent;
}
.modern-button:hover { text-decoration: none; }
/* Shine effect */
.modern-button::before { content: ''; position: absolute; top: 0; left: -80%; z-index: 1; width: 60%; height: 100%; background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,.4) 100%); transform: skewX(-25deg); transition: left var(--transition-speed-slow) var(--transition-ease); pointer-events: none; }
.modern-button:hover::before { left: 120%; }
/* Hover/Focus State */
.modern-button:hover, .modern-button:focus-visible { transform: translateY(-4px); background: var(--button-gradient-green-hover); box-shadow: var(--shadow-green-hover); color: var(--text-light); outline: none; }
.modern-button:focus-visible { /* Optional: Add distinct outline for focus */ }
.modern-button:active { transform: translateY(-1px); box-shadow: var(--shadow-green); transition-duration: var(--transition-speed-fast); }
.modern-button.primary { font-weight: 700; }
.modern-button.secondary { background: var(--secondary-color); box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3); }
.modern-button.secondary:hover, .modern-button.secondary:focus-visible { background: var(--primary-color); box-shadow: 0 6px 20px rgba(76, 175, 80, 0.5); }
.modern-button.small { padding: 10px 24px; font-size: 0.9em; gap: var(--spacing-xs); }
/* Button icon/text */
.button-text, .modern-button i { position: relative; z-index: 2; }
.modern-button i { transition: transform var(--transition-speed) var(--transition-cubic); }
.modern-button:hover i { transform: scale(1.15) rotate(5deg); }

/* Issue 3: Button Color Variations */
.modern-button.button-blue { background: var(--button-gradient-blue); box-shadow: var(--shadow-blue); color: var(--text-light); }
.modern-button.button-blue:hover, .modern-button.button-blue:focus-visible { background: var(--button-gradient-blue-hover); box-shadow: var(--shadow-blue-hover); }
.modern-button.button-blue.secondary { background: var(--blue-color); box-shadow: var(--shadow-blue); }
.modern-button.button-blue.secondary:hover, .modern-button.button-blue.secondary:focus-visible { background: var(--blue-hover-color); box-shadow: var(--shadow-blue-hover); }

.modern-button.button-yellow { background: var(--button-gradient-yellow); box-shadow: var(--shadow-yellow); color: var(--text-dark); /* Yellow needs dark text */ }
.modern-button.button-yellow:hover, .modern-button.button-yellow:focus-visible { background: var(--button-gradient-yellow-hover); box-shadow: var(--shadow-yellow-hover); color: var(--text-dark); }
.modern-button.button-yellow.secondary { background: var(--yellow-color); box-shadow: var(--shadow-yellow); color: var(--text-dark); }
.modern-button.button-yellow.secondary:hover, .modern-button.button-yellow.secondary:focus-visible { background: var(--yellow-hover-color); box-shadow: var(--shadow-yellow-hover); color: var(--text-dark); }

/* Issue 7: Green Button Pulse Effect */
.modern-button.pulse-effect-green { animation: pulseGreen 2.5s infinite cubic-bezier(0.66, 0, 0, 1); }
@keyframes pulseGreen {
  to { box-shadow: 0 0 0 18px rgba(0, 160, 0, 0); }
}
/* Keep hover effect intensity */
.modern-button.pulse-effect-green:hover,
.modern-button.pulse-effect-green:focus-visible {
    animation-name: none; /* Pause pulse on hover/focus */
    box-shadow: var(--shadow-green-hover);
}
/* --- End Buttons --- */


/* Services Section */
.service-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--spacing-lg); padding: var(--spacing-lg) 0; }
.service { padding: var(--spacing-lg); text-align: center; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; }
.service-icon { display: inline-block; margin-bottom: var(--spacing-md); transition: transform var(--transition-speed) var(--transition-cubic); }
.service-icon i { font-size: 3.2em; color: var(--primary-color); animation: float 3s infinite ease-in-out; }
body.dark-mode .service-icon i { color: var(--secondary-color); }
.service:hover .service-icon { transform: scale(1.1) rotate(-5deg); }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
.service h3 { margin-bottom: var(--spacing-sm); font-size: 1.4em; /* Color set by theme rules */ }
.service > p:first-of-type { flex-grow: 1; }
.extra-info { font-size: 0.9em; color: var(--text-muted-light); /* Uses theme rules */ margin-top: var(--spacing-sm); margin-bottom: var(--spacing-md); min-height: 3.4em; }
.service .modern-button { margin-top: auto; align-self: center; }

/* Supported OS */
.supported-os { margin-top: var(--spacing-xl); padding-top: var(--spacing-lg); border-top: var(--border-width) solid rgba(255, 255, 255, 0.2); }
body.dark-mode .supported-os { border-top-color: rgba(255, 255, 255, 0.15); }
.supported-os-title { margin-bottom: var(--spacing-lg); font-weight: 500; /* Text shadow applied via parallax rule */ }
.os-logo-scroller { width: 100%; overflow: hidden; -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%); mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%); }
.os-logo-track { display: flex; width: max-content; animation: scroll-logos 40s linear infinite; will-change: transform; }
.os-logo-scroller:hover .os-logo-track { animation-play-state: paused; }
@keyframes scroll-logos { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
.os-logo { height: 50px; width: 50px; object-fit: contain; margin: 0 var(--spacing-md); filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.2)); transition: transform var(--transition-speed) var(--transition-ease); flex-shrink: 0; vertical-align: middle; }
.os-logo:hover { transform: scale(1.2); }
body.dark-mode .os-logo { filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.4)); }
body.dark-mode .os-logo.apple-dark-invert { filter: invert(1) drop-shadow(2px 2px 3px rgba(0,0,0,0.4)); }

/* Modals */
.modal {
    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);
    z-index: var(--z-modal-backdrop); display: flex; align-items: center;
    justify-content: center; padding: var(--spacing-md); opacity: 0;
    transition: opacity var(--transition-speed) var(--transition-ease), backdrop-filter var(--transition-speed) var(--transition-ease);
    overflow-y: auto; /* Fallback scroll */
    display: none; /* Start hidden */
}
.modal.active { display: flex; opacity: 1; } /* Use flex to show */
.modal-content {
    padding: var(--spacing-lg); max-width: 650px; width: 100%; text-align: left;
    position: relative; transform: scale(0.95) translateY(10px); opacity: 0;
    transition: transform var(--transition-speed) var(--transition-cubic), opacity var(--transition-speed) var(--transition-ease-out);
    z-index: var(--z-modal-content); margin: auto; border-radius: var(--border-radius-md);
    max-height: 90vh; overflow-y: auto; /* Allow content scroll */
}
.modal.active .modal-content { transform: scale(1) translateY(0); opacity: 1; }
.modal-close { position: absolute; top: var(--spacing-sm); right: var(--spacing-sm); background: none; border: none; font-size: 2em; line-height: 1; color: var(--text-muted-light); cursor: pointer; transition: color var(--transition-speed) var(--transition-ease), transform var(--transition-speed) var(--transition-ease); padding: var(--spacing-xs); z-index: 1; }
.modal-close:hover, .modal-close:focus { color: var(--primary-color); transform: scale(1.2) rotate(90deg); outline: none; }
body.dark-mode .modal-close { color: var(--text-muted-dark); }
body.dark-mode .modal-close:hover, body.dark-mode .modal-close:focus { color: var(--accent-color); }
.modal-title { margin-bottom: var(--spacing-md); padding-right: calc(var(--spacing-sm) + 30px); font-size: 1.6em; display: flex; align-items: center; gap: var(--spacing-sm); color: var(--primary-color); border-bottom: 1px solid var(--border-light); padding-bottom: var(--spacing-sm); }
body.dark-mode .modal-title { color: var(--secondary-color); border-bottom-color: var(--border-dark); }
.modal-body { margin-top: var(--spacing-md); margin-bottom: var(--spacing-lg); line-height: 1.8; }
.modal-body ul { list-style: disc; margin-left: var(--spacing-md); padding-left: var(--spacing-sm); margin-top: var(--spacing-sm); }
.modal-body li { margin-bottom: var(--spacing-sm); }
.modal-footer { border-top: var(--border-width) solid var(--border-light); padding-top: var(--spacing-md); margin-top: var(--spacing-lg); display: flex; justify-content: flex-end; gap: var(--spacing-sm); }
body.dark-mode .modal-footer { border-top-color: var(--border-dark); }
.modal-close-alt { background: var(--text-muted-light); color: var(--text-dark); box-shadow: none; }
.modal-close-alt:hover, .modal-close-alt:focus-visible { background: var(--text-muted-light); filter: brightness(0.9); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
body.dark-mode .modal-close-alt { background: var(--text-muted-dark); color: var(--text-dark); }
body.dark-mode .modal-close-alt:hover, body.dark-mode .modal-close-alt:focus-visible { filter: brightness(1.1); }

/* --- Stats Section (Issue 2 Fix) --- */
.stats { background: var(--cta-gradient); color: var(--text-light); }
.stats p { color: rgba(255, 255, 255, 0.9); }
.stats-container {
    display: flex; /* Use Flexbox */
    flex-wrap: wrap; /* Allow wrapping */
    justify-content: center; /* Center items, including last row */
    gap: var(--spacing-lg);
    padding: var(--spacing-lg) 0;
    max-width: 1000px;
    margin: var(--spacing-lg) auto 0;
}
.stat-item {
    padding: var(--spacing-md) var(--spacing-sm);
    transition: transform var(--transition-speed) var(--transition-cubic),
                box-shadow var(--transition-speed) var(--transition-cubic),
                background-color var(--transition-speed) var(--transition-ease);
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-md);
    border: var(--border-width) solid rgba(255, 255, 255, 0.15);
    text-align: center;
    flex: 0 1 180px; /* Flex settings: Don't grow, shrink allowed, basis 180px */
    min-width: 150px; /* Minimum width */
}
.stat-item:hover { background-color: rgba(255, 255, 255, 0.2); /* Inherits card-hover transform/shadow */ }
.stat-number { font-size: clamp(2em, 5vw, 2.8em); font-weight: 700; display: block; margin-bottom: var(--spacing-xs); color: var(--accent-color); line-height: 1.1; }
.stat-label { font-size: 0.95em; font-weight: 400; display: block; color: rgba(255, 255, 255, 0.85); }
/* --- End Issue 2 Fix --- */

/* Gallery */
.gallery-container { display: flex; overflow-x: auto; gap: var(--spacing-md); padding: var(--spacing-md) 4px var(--spacing-lg); scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: thin; scrollbar-color: var(--primary-color) rgba(0,0,0,0.05); }
.gallery-container::-webkit-scrollbar { height: 8px; }
.gallery-container::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 4px;}
.gallery-container::-webkit-scrollbar-thumb { background-color: var(--primary-color); border-radius: 4px; }
body.dark-mode .gallery-container::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
body.dark-mode .gallery-container::-webkit-scrollbar-thumb { background-color: var(--secondary-color); }
.gallery-item { flex: 0 0 clamp(220px, 30vw, 300px); position: relative; overflow: hidden; border-radius: var(--border-radius-md); cursor: pointer; scroll-snap-align: center; box-shadow: var(--shadow-interactive); outline-offset: 3px; transition: box-shadow var(--transition-speed) var(--transition-cubic); }
.gallery-item:focus-visible { outline: 2px solid var(--primary-color); }
.gallery-item img { width: 100%; height: 200px; object-fit: cover; display: block; transition: transform var(--transition-speed-slow) var(--transition-cubic); }
.gallery-item:hover img { transform: scale(1.08); }

/* Lightbox */
.lightbox { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.9); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); z-index: var(--z-lightbox-backdrop); align-items: center; justify-content: center; padding: var(--spacing-sm); opacity: 0; transition: opacity var(--transition-speed) var(--transition-ease), backdrop-filter var(--transition-speed) var(--transition-ease); display: none; } /* Start hidden */
.lightbox.active { display: flex; opacity: 1; }
.lightbox-image { display: block; max-width: calc(100% - var(--spacing-sm) * 2); max-height: calc(100% - var(--spacing-xl)); border-radius: var(--border-radius-sm); transition: transform var(--transition-speed) var(--transition-cubic), opacity var(--transition-speed) ease-out; transform: scale(0.9); opacity: 0; cursor: default; z-index: var(--z-lightbox-content); box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
.lightbox.active .lightbox-image { transform: scale(1); opacity: 1; transition-delay: 0.05s; }
.lightbox-close { position: absolute; top: var(--spacing-md); right: var(--spacing-md); color: rgba(255, 255, 255, 0.8); font-size: 2.5em; line-height: 1; background: none; border: none; cursor: pointer; transition: color var(--transition-speed) var(--transition-ease), transform var(--transition-speed) var(--transition-ease); padding: var(--spacing-sm); z-index: calc(var(--z-lightbox-content) + 1); text-shadow: 0 1px 3px rgba(0,0,0,0.5); }
.lightbox-close:hover, .lightbox-close:focus { color: var(--text-light); transform: scale(1.2) rotate(90deg); outline: none; }

/* Testimonials */
.carousel-container { position: relative; max-width: 750px; margin: var(--spacing-lg) auto 0; overflow: hidden; min-height: 300px; }
.testimonial-slider { display: flex; position: relative; min-height: inherit; }
.testimonial { flex-shrink: 0; width: 100%; padding: var(--spacing-lg); box-sizing: border-box; opacity: 0; position: absolute; top: 0; left: 0; transition: opacity var(--transition-speed-slow) var(--transition-cubic), visibility 0s var(--transition-speed-slow); visibility: hidden; }
.testimonial[aria-hidden="false"] { opacity: 1; position: relative; visibility: visible; transition: opacity var(--transition-speed-slow) var(--transition-cubic), visibility 0s 0s; }
.quote-icon { color: var(--primary-color); font-size: 2em; margin-bottom: var(--spacing-sm); display: inline-block; opacity: 0.8; }
body.dark-mode .quote-icon { color: var(--secondary-color); }
.testimonial blockquote { margin: 0; padding: 0; }
.testimonial blockquote p { margin-bottom: var(--spacing-md); font-style: italic; font-size: 1.1em; line-height: 1.6; }
.testimonial-author { margin-top: var(--spacing-md); font-style: normal; font-weight: 500; color: var(--primary-color); text-align: right; font-size: 0.95em; }
body.dark-mode .testimonial-author { color: var(--secondary-color); }
.testimonial-author cite { font-style: normal; }
.carousel-control { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0, 160, 0, 0.5); border: none; color: var(--text-light); padding: 0; width: 44px; height: 44px; border-radius: var(--border-radius-circle); cursor: pointer; transition: all var(--transition-speed) var(--transition-cubic); z-index: var(--z-content); box-shadow: var(--shadow-sm); display: flex; align-items: center; justify-content: center; }
.carousel-control i { font-size: 1.2em; line-height: 1; }
.carousel-prev { left: var(--spacing-sm); }
.carousel-next { right: var(--spacing-sm); }
.carousel-control:hover, .carousel-control:focus { background: var(--primary-color); transform: translateY(-50%) scale(1.1); box-shadow: var(--shadow-md); outline: none; }
.carousel-control:focus-visible { outline: 3px solid var(--accent-color); outline-offset: 2px; }
body.dark-mode .carousel-control { background: rgba(76, 175, 80, 0.5); }
body.dark-mode .carousel-control:hover, body.dark-mode .carousel-control:focus { background: var(--secondary-color); }

/* Case Studies & Blog Preview */
.case-study-grid, .blog-preview-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--spacing-lg); padding: var(--spacing-lg) 0; }
.case-study, .blog-post-preview { padding: var(--spacing-lg); display: flex; flex-direction: column; }
.case-study h3, .blog-post-preview h3 { margin-bottom: var(--spacing-sm); color: var(--primary-color); font-size: 1.3em; }
body.dark-mode .case-study h3, body.dark-mode .blog-post-preview h3 { color: var(--secondary-color); }
.case-study p, .blog-post-preview p { flex-grow: 1; margin-bottom: var(--spacing-md); }
.case-study .modern-button, .blog-post-preview .modern-button { margin-top: auto; align-self: center; }

/* Events */
.event-timeline { display: flex; flex-direction: column; gap: var(--spacing-lg); margin-top: var(--spacing-lg); position: relative; padding-left: 60px; max-width: 850px; margin-left: auto; margin-right: auto; }
.event-timeline::before { content: ''; position: absolute; top: 10px; left: 20px; width: 4px; height: calc(100% - 20px); background: var(--primary-color); border-radius: 2px; opacity: 0.3; }
body.dark-mode .event-timeline::before { background: var(--secondary-color); opacity: 0.4; }
.event-card { position: relative; padding: var(--spacing-md); display: grid; grid-template-columns: 80px 1fr; gap: var(--spacing-md); align-items: start; /* Color set by theme rules */ }
.event-card::after { content: ''; position: absolute; top: 18px; left: -42px; width: 18px; height: 18px; background: var(--secondary-color); border: 4px solid var(--primary-color); border-radius: var(--border-radius-circle); z-index: var(--z-base); transition: transform var(--transition-speed) var(--transition-cubic); }
body.dark-mode .event-card::after { background: var(--primary-color); border-color: var(--secondary-color); }
.event-card:hover::after { transform: scale(1.2); }
.event-date { grid-column: 1 / 2; font-weight: bold; color: var(--primary-color); text-align: right; padding-top: 3px; font-size: 0.9em; white-space: normal; }
body.dark-mode .event-date { color: var(--secondary-color); }
.event-content { grid-column: 2 / 3; }
.event-content h3 { margin-bottom: var(--spacing-xs); font-size: 1.3em; /* Color set by theme */ }
.event-content .modern-button { margin-top: var(--spacing-md); }

/* Tech Timeline */
.timeline { position: relative; padding-left: 50px; margin-top: var(--spacing-lg); max-width: 700px; margin-left: auto; margin-right: auto; }
.timeline::before { content: ''; position: absolute; top: 5px; left: 18px; width: 4px; height: calc(100% - 10px); background: var(--primary-color); border-radius: 2px; opacity: 0.2; }
body.dark-mode .timeline::before { background: var(--secondary-color); opacity: 0.3; }
.timeline-item { position: relative; padding: var(--spacing-xs) 0 var(--spacing-lg) var(--spacing-lg); border: none; background: transparent; box-shadow: none; margin-bottom: 0; }
.timeline-item::after { content: ''; position: absolute; top: 9px; left: -9px; width: 14px; height: 14px; background: var(--secondary-color); border: 3px solid var(--primary-color); border-radius: var(--border-radius-circle); z-index: var(--z-base); transition: transform var(--transition-speed) var(--transition-cubic); }
body.dark-mode .timeline-item::after { background: var(--primary-color); border-color: var(--secondary-color); }
.timeline-item:hover::after { transform: scale(1.2); }
.timeline-year { font-weight: bold; color: var(--primary-color); display: inline-block; margin-bottom: var(--spacing-xs); font-size: 1.2em; }
body.dark-mode .timeline-year { color: var(--secondary-color); }
.timeline-description { color: var(--text-muted-light); /* Uses theme rule */ font-size: 1em; line-height: 1.6; }

/* Contact Section */
.contact-grid { display: grid; grid-template-columns: 1fr; gap: var(--spacing-xl); max-width: 1000px; margin: var(--spacing-lg) auto 0; }
@media (min-width: 768px) { .contact-grid { grid-template-columns: minmax(280px, 1fr) 2fr; } }
.contact-info h3, .contact-form-container h3 { margin-bottom: var(--spacing-lg); font-weight: 500; font-size: 1.5em; }
.contact-item { display: flex; align-items: flex-start; gap: var(--spacing-md); padding: var(--spacing-sm) 0; border-bottom: var(--border-width) solid var(--border-light); }
.contact-item:last-child { border-bottom: none; }
.contact-item i { color: var(--primary-color); font-size: 1.5em; margin-top: 5px; flex-shrink: 0; width: 1.5em; text-align: center; }
body.dark-mode .contact-item i { color: var(--secondary-color); }
.contact-item strong { display: block; margin-bottom: var(--spacing-xs); font-weight: 500; }
.contact-item address { font-style: normal; line-height: 1.6; }
.contact-item address a { font-size: 0.9em; display: inline-block; margin-top: var(--spacing-xs); }
/* Contact Form */
.contact-form { display: grid; gap: var(--spacing-md); }
.form-group { position: relative; display: flex; flex-direction: column; }
.form-label { display: block; font-weight: 500; margin-bottom: var(--spacing-xs); }
.form-input, .form-textarea { width: 100%; padding: 14px 16px; border: var(--border-width) solid var(--border-light); border-radius: var(--border-radius-sm); font-size: var(--font-size-base); background: var(--bg-surface-light); color: var(--text-dark); transition: border-color var(--transition-speed) var(--transition-ease), box-shadow var(--transition-speed) var(--transition-ease), background var(--transition-speed) var(--transition-ease); line-height: 1.5; }
body.dark-mode .form-input, body.dark-mode .form-textarea { background: var(--bg-surface-dark); color: var(--text-light); border-color: var(--border-dark); }
.form-input::placeholder, .form-textarea::placeholder { color: var(--text-muted-light); opacity: 0.7; }
body.dark-mode .form-input::placeholder, body.dark-mode .form-textarea::placeholder { color: var(--text-muted-dark); }
.form-input:focus, .form-textarea:focus { border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(0, 160, 0, 0.2); outline: none; background: var(--bg-surface-light); }
body.dark-mode .form-input:focus, body.dark-mode .form-textarea:focus { border-color: var(--secondary-color); background: var(--bg-surface-dark); box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.3); }
.form-textarea { resize: vertical; min-height: 140px; }
.form-input.invalid, .form-textarea.invalid { border-color: var(--error-color) !important; box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.2) !important; }
.form-error { color: var(--error-color); font-size: 0.85em; margin-top: var(--spacing-xs); display: none; }
.form-error:not(:empty) { display: block; }
.form-footer { display: flex; flex-direction: column; align-items: flex-start; gap: var(--spacing-sm); margin-top: var(--spacing-xs); }
.form-submit-button { width: auto; justify-self: start; }
.form-submit-button:disabled { opacity: 0.7; cursor: not-allowed; }
.form-submit-button:disabled::before { display: none; }
.form-status { margin-top: 0; font-weight: 500; display: none; padding: var(--spacing-xs) var(--spacing-sm); border-radius: var(--border-radius-sm); width: 100%; }
.form-status.loading { color: var(--text-muted-light); }
.form-status.success { color: var(--success-color); background-color: rgba(40, 167, 69, 0.1); border: 1px solid rgba(40, 167, 69, 0.2); }
.form-status.error { color: var(--error-color); background-color: rgba(220, 53, 69, 0.1); border: 1px solid rgba(220, 53, 69, 0.2); }
body.dark-mode .form-status.success { color: #a3e9a4; background-color: rgba(40, 167, 69, 0.2); border-color: rgba(40, 167, 69, 0.4); }
body.dark-mode .form-status.error { color: #f8d7da; background-color: rgba(220, 53, 69, 0.2); border-color: rgba(220, 53, 69, 0.4); }

/* Map */
#map { width: 100%; height: 400px; margin: var(--spacing-lg) 0; border-radius: var(--border-radius-md); box-shadow: var(--shadow-md); border: var(--border-width) solid var(--border-light); z-index: var(--z-base); background-color: #eee; }
body.dark-mode #map { border-color: var(--border-dark); background-color: #333; }
.leaflet-popup-content-wrapper { border-radius: var(--border-radius-sm) !important; background: var(--bg-surface-light) !important; color: var(--text-dark) !important; box-shadow: var(--shadow-md) !important; }
body.dark-mode .leaflet-popup-content-wrapper { background: var(--bg-surface-dark) !important; color: var(--text-light) !important; box-shadow: var(--shadow-dark-md) !important; }
.leaflet-popup-content { font-size: 0.95em; line-height: 1.6; margin: 10px 15px !important; }
.leaflet-popup-content strong { color: var(--primary-color); }
body.dark-mode .leaflet-popup-content strong { color: var(--secondary-color); }
.leaflet-popup-tip { background: var(--bg-surface-light) !important; box-shadow: var(--shadow-sm) !important; }
body.dark-mode .leaflet-popup-tip { background: var(--bg-surface-dark) !important; box-shadow: var(--shadow-dark-sm) !important; }
.leaflet-control-attribution { font-size: 0.8em !important; background: rgba(255, 255, 255, 0.7) !important; padding: 2px 6px !important; border-radius: var(--border-radius-sm) 0 0 0 !important; }
body.dark-mode .leaflet-control-attribution { background: rgba(0, 0, 0, 0.6) !important; color: rgba(255,255,255,0.7) !important; }
body.dark-mode .leaflet-control-attribution a { color: #aaa !important; }

/* Footer */
.main-footer { margin-top: var(--spacing-xl); padding: var(--spacing-lg) var(--spacing-md); text-align: center; border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0; border-bottom: none; border-left: none; border-right: none; color: var(--text-muted-light); opacity: 0; transform: translateY(40px); transition: opacity var(--transition-speed-slow) var(--transition-ease-out), transform var(--transition-speed-slow) var(--transition-cubic); }
.main-footer.visible { opacity: 1; transform: translateY(0); }
body.dark-mode .main-footer { color: var(--text-muted-dark); }
.footer-content { max-width: 1100px; margin: 0 auto; }
.copyright { font-size: 0.9em; margin-bottom: var(--spacing-md); }
.social-links { margin: var(--spacing-md) 0; display: flex; justify-content: center; gap: var(--spacing-lg); }
.social-links a { color: var(--text-muted-light); font-size: 1.8em; transition: all var(--transition-speed) var(--transition-cubic); display: inline-block; }
body.dark-mode .social-links a { color: var(--text-muted-dark); }
.social-links a:hover, .social-links a:focus { color: var(--primary-color); transform: scale(1.25) rotate(8deg); outline: none; }
body.dark-mode .social-links a:hover, body.dark-mode .social-links a:focus { color: var(--secondary-color); }
.footer-links { margin-top: var(--spacing-md); font-size: 0.9em; }
.footer-links a { color: var(--text-muted-light); text-decoration: none; margin: 0 var(--spacing-sm); transition: color var(--transition-speed) var(--transition-ease); }
.footer-links a:hover, .footer-links a:focus { color: var(--primary-color); text-decoration: underline; outline: none; }
body.dark-mode .footer-links a { color: var(--text-muted-dark); }
body.dark-mode .footer-links a:hover, body.dark-mode .footer-links a:focus { color: var(--secondary-color); }

/* Floating Elements */
.floating-elements { position: fixed; bottom: var(--spacing-lg); right: var(--spacing-lg); z-index: var(--z-floating); display: flex; flex-direction: column; align-items: flex-end; gap: var(--spacing-sm); }
.chat-bubble { background: var(--primary-color); color: var(--text-light); padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--border-radius-pill); font-size: 0.95em; box-shadow: var(--shadow-green); cursor: pointer; transition: transform var(--transition-speed) var(--transition-cubic), box-shadow var(--transition-speed) var(--transition-cubic); display: none; align-items: center; gap: var(--spacing-xs); }
.chat-bubble:hover { transform: scale(1.1) translateX(-5px); box-shadow: var(--shadow-green-hover); }
.floating-buttons { display: flex; flex-direction: column; gap: var(--spacing-sm); }
.floating-action-button { background: var(--secondary-color); color: var(--text-light); border: none; border-radius: var(--border-radius-circle); width: 50px; height: 50px; font-size: 1.4em; cursor: pointer; transition: all var(--transition-speed) var(--transition-cubic); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-interactive); }
.floating-action-button i { line-height: 1; }
.floating-action-button:hover, .floating-action-button:focus { transform: scale(1.15) rotate(15deg); box-shadow: var(--shadow-interactive-hover); background: var(--primary-color); outline: none; }
.floating-action-button:focus-visible { outline: 3px solid var(--accent-color); outline-offset: 2px; }
body.dark-mode .floating-action-button { background-color: var(--secondary-color); box-shadow: var(--shadow-dark-md); }
body.dark-mode .floating-action-button:hover, body.dark-mode .floating-action-button:focus { background-color: var(--primary-color); box-shadow: var(--shadow-dark-lg); }
/* Music Button */
.floating-action-button.music-button { background: var(--primary-color); transition: background-color var(--transition-speed) ease-out; }
.floating-action-button.music-button.muted { background: var(--text-muted-light); color: var(--text-dark); }
body.dark-mode .floating-action-button.music-button { background: var(--secondary-color); }
body.dark-mode .floating-action-button.music-button.muted { background: #555; color: var(--text-muted-dark); }
/* Scroll Top Button */
.scroll-top-btn { background: var(--primary-color); /* Starts hidden via inline style from JS */ }
.scroll-top-btn:hover, .scroll-top-btn:focus { background: var(--secondary-color); }


/* ==========================================================================
   9. Responsive Design
   ========================================================================== */

/* Medium Devices */
@media (max-width: 992px) {
    :root { --font-size-base: 15px; --spacing-lg: 2rem; --spacing-xl: 3rem; }
    section { width: 92%; padding: var(--spacing-lg) var(--spacing-sm); }
    .stats-container { gap: var(--spacing-md); flex-basis: 160px; } /* Adjust basis if needed */
    .service-grid, .case-study-grid, .blog-preview-grid { gap: var(--spacing-md); }
    .contact-grid { gap: var(--spacing-lg); }
    #main-header h1 { font-size: 2em; }
    #typing-effect { font-size: 1.1em; height: 1.3em; min-height: 1.3em; line-height: 1.3em;}
    .flipping-logo { width: 55px; height: 55px; }
    .tech-trivia-container { display: none; }
}

/* Small Devices (Tablets/Phones) - Where Mobile Nav Activates */
@media (max-width: 768px) {
    :root { --font-size-base: 14px; }
    h1 { font-size: 2em; } h2 { font-size: 1.8em; } h3 { font-size: 1.4em; }
    #main-header h1 { font-size: 1.8em; }
    .hamburger { display: inline-block; } /* Show hamburger */
    .scrolling-text-container { padding: var(--spacing-sm) 0; }
    .scrolling-text-content { font-size: 0.9em; animation-duration: 25s; }
    .hero { min-height: 60vh; }
    .service-grid, .case-study-grid, .blog-preview-grid { grid-template-columns: 1fr; }
    .stats-container { gap: var(--spacing-md); flex-basis: 140px; } /* Smaller basis */
    .gallery-item { flex-basis: clamp(180px, 50vw, 240px); }
    .event-timeline { padding-left: 45px; }
    .event-card { grid-template-columns: 60px 1fr; }
    .event-card::after { left: -32px; width: 14px; height: 14px; border-width: 3px; }
    .event-date { font-size: 0.85em; }
    .floating-elements { bottom: var(--spacing-md); right: var(--spacing-md); }
    .floating-action-button { width: 45px; height: 45px; font-size: 1.3em; }
    .chat-bubble { display: none !important; }
    .timeline { padding-left: 40px; }
    .timeline-item::after { left: -7px; }
}

/* Extra Small Devices */
@media (max-width: 480px) {
    :root { --font-size-base: 13px; --spacing-md: 1rem; --spacing-lg: 1.5rem; --spacing-xl: 2.5rem;}
    h1 { font-size: 1.8em; } h2 { font-size: 1.6em; } h3 { font-size: 1.3em; }
    #main-header h1 { font-size: 1.6em; }
    #typing-effect { font-size: 0.95em; height: 1.2em; min-height: 1.2em; line-height: 1.2em; }
    .header-main { padding: var(--spacing-sm) var(--spacing-sm); }
    .header-top-bar { padding-left: var(--spacing-sm); padding-right: var(--spacing-sm); }
    .flipping-logo { width: 45px; height: 45px; }
    #darkModeToggle { font-size: 0.8em; padding: 5px 10px; min-width: auto; gap: 4px; }
    .main-nav.mobile-nav { width: 90%; max-width: 280px; }
    .hero { min-height: 55vh; }
    .hero-text { font-size: 1em; }
    .button-container { gap: var(--spacing-sm); }
    .modern-button { padding: 12px 24px; font-size: 0.95em; }
    .modern-button.small { padding: 8px 18px; }
    .stats-container { gap: var(--spacing-sm); flex-basis: 120px; } /* Even smaller basis */
    .stat-number { font-size: 2em; }
    .os-logo-track { animation-duration: 30s; }
    .os-logo { height: 40px; width: 40px; margin: 0 var(--spacing-sm); }
    .carousel-control { width: 35px; height: 35px; }
    .carousel-prev { left: var(--spacing-xs); }
    .carousel-next { right: var(--spacing-xs); }
    .floating-elements { bottom: var(--spacing-sm); right: var(--spacing-sm); gap: var(--spacing-xs); }
    .floating-action-button { width: 40px; height: 40px; font-size: 1.2em; }
    .contact-grid { gap: var(--spacing-lg); }
    .contact-info, .contact-form-container { padding: var(--spacing-sm); }
}