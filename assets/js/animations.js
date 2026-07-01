// Scroll animations, glass navbar and count animation for Project NOVA

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lenis for buttery smooth scrolling
    let lenis;
    let useLenis = false;
    if (window.Lenis) {
        try {
            lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smooth: true,
                direction: 'vertical'
            });
            useLenis = true;
        } catch (e) {
            console.warn('Lenis init failed, falling back to native scroll', e);
            lenis = null;
            useLenis = false;
        }
    }
    const navbar = document.querySelector('.navbar');
    const animateElements = document.querySelectorAll('[data-animate]');
    const tiltCards = document.querySelectorAll('.tilt-card');

    const settleNavbar = () => {
        if (window.pageYOffset > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', settleNavbar);
    settleNavbar();

    if (window.VanillaTilt) {
        VanillaTilt.init(tiltCards, {
            max: 15,
            speed: 350,
            glare: true,
            'max-glare': 0.2,
            scale: 1.02,
            easing: 'cubic-bezier(.03,.98,.52,.99)'
        });
    }

    // Premium scramble animated numbers
    const countTargets = document.querySelectorAll('.result-card h3, .about .stat h3');
    const scramble = (el, finalText) => {
        const duration = 1600;
        const start = performance.now();
        const chars = '0123456789';
        const final = finalText.replace(/[^0-9]/g, '');
        const showLong = (Math.random() > 0.5);
        const longSeed = '05123879150270410500';
        const tick = (now) => {
            const t = Math.min(1, (now - start) / duration);
            const ease = 1 - Math.pow(1 - t, 3);
            if (t < 0.85) {
                // show either long seed or random digits
                if (showLong && t < 0.6) {
                    el.textContent = longSeed.slice(0, Math.floor(longSeed.length * (t / 0.6))) + (finalText.match(/%/) ? '%' : '+');
                } else {
                    let out = '';
                    for (let i = 0; i < Math.max(2, final.length); i++) out += chars[Math.floor(Math.random() * chars.length)];
                    el.textContent = out + (finalText.match(/%/) ? '%' : '+');
                }
            } else if (t < 0.99) {
                // start resolving to final number
                const digitsToShow = Math.floor(final.length * (t - 0.85) / 0.14);
                el.textContent = final.slice(0, digitsToShow) + Array(Math.max(0, final.length - digitsToShow)).fill('0').join('') + (finalText.match(/%/) ? '%' : '+');
            } else {
                el.textContent = final + (finalText.match(/%/) ? '%' : '+');
                return;
            }
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };

    const counterObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const targetText = el.textContent.trim();
            scramble(el, targetText);
            obs.unobserve(entry.target);
        });
    }, { root: null, threshold: 0.5 });

    countTargets.forEach(el => counterObserver.observe(el));

    const animationObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const delay = parseFloat(el.dataset.delay || 0) || 0;
            el.style.transitionDelay = `${delay}s`;
            el.classList.add('visible');
            obs.unobserve(el);
        });
    }, { root: null, threshold: 0.2, rootMargin: '0px 0px -100px 0px' });

    animateElements.forEach(el => animationObserver.observe(el));

    // Timeline animation
    const timelineItems = document.querySelectorAll('.timeline-item[data-timeline]');
    const timelineProgress = document.querySelector('.timeline-progress');

    if (timelineItems.length && timelineProgress) {
        const timelineObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const index = parseInt(entry.target.dataset.timeline) || 0;
                const progressWidth = ((index + 1) / timelineItems.length) * 92 + '%';
                timelineProgress.style.width = progressWidth;
                entry.target.classList.add('active');
            });
        }, { root: null, threshold: 0.5 });

        timelineItems.forEach(item => timelineObserver.observe(item));
    }

    // Testimonial carousel
    const carousel = document.querySelector('.testimonial-carousel');
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    let currentSlide = 0;
    let autoSlideTimer;

    const showSlide = (index) => {
        currentSlide = (index + slides.length) % slides.length;
        if (carousel) {
            carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
        }
        dots.forEach(dot => dot.classList.remove('active'));
        if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    };

    const startAutoSlide = () => {
        autoSlideTimer = setInterval(() => {
            showSlide(currentSlide + 1);
        }, 5000);
    };

    const resetAutoSlide = () => {
        clearInterval(autoSlideTimer);
        startAutoSlide();
    };

    if (prevBtn) prevBtn.addEventListener('click', () => {
        showSlide(currentSlide - 1);
        resetAutoSlide();
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
        showSlide(currentSlide + 1);
        resetAutoSlide();
    });

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            showSlide(parseInt(dot.dataset.slide));
            resetAutoSlide();
        });
    });

    if (carousel) {
        carousel.addEventListener('dragstart', () => resetAutoSlide(), false);
        startAutoSlide();
    }
    
    // Cinematic loader orchestration
    const pageLoader = document.getElementById('page-loader');
    if (pageLoader) {
        const progressFill = pageLoader.querySelector('.progress-fill');
        const progressText = pageLoader.querySelector('.loader-percent') || pageLoader.querySelector('.progress-text');
        const steps = Array.from(pageLoader.querySelectorAll('.loader-steps li'));
        const logo = pageLoader.querySelector('.loader-logo');
        const heroContent = document.querySelector('.hero-content');
        const heroVisual = document.querySelector('.hero-visual');
        const orb = document.querySelector('.orb');
        const navbarEl = document.querySelector('.navbar');
        const heroButtons = document.querySelector('.hero-buttons');

        const showStep = (index, delay = 600, pct) => new Promise(resolve => {
            setTimeout(() => {
                if (steps[index]) steps[index].classList.add('show');
                if (typeof pct === 'number') {
                    progressFill.style.width = pct + '%';
                    if (progressText) progressText.textContent = pct + '%';
                }
                resolve();
            }, delay);
        });

        (async function cinematic() {
            try {
                await showStep(0, 420, 12);
                await showStep(1, 680, 34);
                await showStep(2, 680, 58);
                await showStep(3, 680, 79);
                await showStep(4, 700, 97);

                await new Promise(r => setTimeout(r, 420));
                progressFill.style.width = '100%';
                if (progressText) progressText.textContent = '100%';

                // animate loader identity ticker
                const identityEl = pageLoader.querySelector('#loader-identity');
                if (identityEl) {
                    const modules = ['Electrostatics','Projectile Motion','Organic Chemistry','Matrices','Artificial Intelligence','Ready.'];
                    for (let i=0;i<modules.length;i++){
                        identityEl.textContent = modules[i] + ' •••';
                        await new Promise(r=>setTimeout(r, 420 + i*120));
                    }
                    identityEl.textContent = 'Everything assembles.';
                    await new Promise(r=>setTimeout(r, 420));
                }

                if (logo) logo.classList.add('logo-explode');
                await new Promise(r => setTimeout(r, 360));

                // trigger particle explosion from canvas (if available)
                const explCanvas = document.getElementById('loader-explosion-canvas');
                if (explCanvas && window.createLoaderExplosion) {
                    try { window.createLoaderExplosion(explCanvas); } catch (e) { console.warn(e); }
                }

                // hide loader and reveal page pieces
                pageLoader.classList.add('loaded');

                if (heroContent) {
                    heroContent.classList.add('visible', 'cinematic-show');
                }
                if (heroVisual) heroVisual.classList.add('visible', 'cinematic-show');
                if (orb) orb.classList.add('assemble');
                if (navbarEl) navbarEl.classList.add('show');
                if (heroButtons) heroButtons.classList.add('show');

            } catch (e) {
                console.error('Loader sequence error', e);
                pageLoader.classList.add('loaded');
            }
        })();
    }

    // Ensure loader doesn't block input forever: force-hide after 6.5s
    setTimeout(() => {
        const loaderEl = document.getElementById('page-loader');
        if (loaderEl && !loaderEl.classList.contains('loaded')) {
            console.warn('Forcing loader hide to avoid blocking input');
            loaderEl.classList.add('loaded');
        }
    }, 6500);

    // RAF loop to drive Lenis and scroll-linked reveals + hero physics
    const revealEls = Array.from(document.querySelectorAll('[data-animate]'));

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    const updateScrollDriven = () => {
        const vh = window.innerHeight;
        revealEls.forEach(el => {
            const rect = el.getBoundingClientRect();
            // distance of element center to viewport center
            const elCenter = rect.top + rect.height / 2;
            const dist = Math.abs(elCenter - vh / 2);
            const maxDist = vh * 0.8;
            let prog = clamp(1 - dist / maxDist, 0, 1);
            // slightly ease
            prog = Math.pow(prog, 0.9);
            el.style.setProperty('--reveal-progress', prog);
        });

        // Hero physics interaction
        const hero = document.querySelector('.hero-visual');
        const orb = document.querySelector('.orb');
        const nucleus = document.querySelector('.nucleus');
        const particlesEl = document.getElementById('tsparticles');
        if (hero && orb) {
            // read mouse vars if set
            const mx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hero-mouse-x')) || 0;
            const my = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hero-mouse-y')) || 0;
            const bend = clamp(Math.hypot(mx, my) * 0.06, 0, 6);
            document.documentElement.style.setProperty('--page-bend', bend);
            // nucleus glow based on proximity
            const glow = clamp(0.6 + Math.hypot(mx, my) * 0.02, 0.6, 2);
            document.documentElement.style.setProperty('--nucleus-glow', glow);
            // speed up particles if present
            try {
                if (window.tsParticles && window.tsParticles.dom && window.tsParticles.dom().length) {
                    // attempt to modify particle velocity if API allows
                    const p = window.tsParticles.dom()[0];
                    if (p && p.interactivity) {
                        // gentle nudge: increase zIndex or opacity as visual cue
                        particlesEl.style.opacity = clamp(0.6 + glow * 0.2, 0.6, 1);
                    }
                }
            } catch (e) { }
        }
    };

    const raf = (time) => {
        if (useLenis && lenis) {
            try { lenis.raf(time); } catch (e) { console.warn('Lenis raf error', e); useLenis = false; }
        }
        updateScrollDriven();
        requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    // Safety: detect if scrolling is effectively blocked and gracefully disable Lenis
    (function detectScrollStuck() {
        const el = document.scrollingElement || document.documentElement;
        let last = el.scrollTop;
        let stuckCount = 0;
        function onWheel() {
            // check shortly after wheel event whether scroll changed
            setTimeout(() => {
                const now = el.scrollTop;
                if (now === last) {
                    stuckCount++;
                } else {
                    stuckCount = 0;
                }
                last = now;
                if (stuckCount >= 3 && useLenis) {
                    console.warn('Scrolling appears stuck — disabling Lenis fallback to native scroll');
                    useLenis = false;
                    if (lenis && lenis.destroy) try { lenis.destroy(); } catch(e){}
                }
            }, 80);
        }
        window.addEventListener('wheel', onWheel, { passive: true });
        window.addEventListener('touchmove', onWheel, { passive: true });
    })();

    // Hero mouse interaction: update CSS vars and nudge electrons
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        heroVisual.addEventListener('mousemove', (e) => {
            const r = heroVisual.getBoundingClientRect();
            const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
            const y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
            document.documentElement.style.setProperty('--hero-mouse-x', x.toFixed(3));
            document.documentElement.style.setProperty('--hero-mouse-y', y.toFixed(3));

            // electrons react: apply small offset per electron
            const electrons = heroVisual.querySelectorAll('.orbit span.electron');
            electrons.forEach((el, i) => {
                const depth = (i % 3) / 3 + 0.5;
                const tx = x * 14 * depth;
                const ty = y * 10 * depth;
                el.style.transform = `translate(${ -50 + tx }%, ${ ty }%)`;
                el.style.boxShadow = `0 0 ${12 * (1 + Math.abs(x) + Math.abs(y))}px rgba(56,189,248,${0.6 + Math.abs(x) * 0.4})`;
            });
        });

        heroVisual.addEventListener('mouseleave', () => {
            document.documentElement.style.setProperty('--hero-mouse-x', 0);
            document.documentElement.style.setProperty('--hero-mouse-y', 0);
            const electrons = heroVisual.querySelectorAll('.orbit span.electron');
            electrons.forEach((el) => {
                el.style.transform = '';
                el.style.boxShadow = '';
            });
        });
    }

    // Page transition handling for internal links
    const transitionOverlay = document.getElementById('page-transition-overlay');
    document.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href');
        // only intercept internal anchors and same-page links
        if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')===false) return;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const target = a.getAttribute('href');
            if (transitionOverlay) {
                transitionOverlay.classList.add('active');
                // small explosion effect in center
                const canvas = document.createElement('canvas');
                canvas.style.position='absolute'; canvas.style.inset='0'; canvas.style.width='100%'; canvas.style.height='100%'; canvas.style.pointerEvents='none';
                transitionOverlay.appendChild(canvas);
                try { if (window.createLoaderExplosion) window.createLoaderExplosion(canvas); } catch(e){}
            }
            setTimeout(() => {
                window.location.href = target;
            }, 650);
        });
    });
});
