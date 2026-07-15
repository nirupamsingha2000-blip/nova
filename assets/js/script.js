document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.querySelector('.custom-cursor');
    const magneticButtons = document.querySelectorAll('.magnetic');
    const themeToggle = document.querySelector('.theme-toggle');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const contactForm = document.querySelector('#contact-form');
    const newsletterForm = document.querySelector('.newsletter-form');
    const backToTop = document.querySelector('.back-to-top');
    const portal = document.querySelector('.student-portal');
    const portalLoginBtn = document.querySelector('.portal-login-btn');
    const portalClose = document.querySelector('.portal-close');
    const portalLoginForm = document.querySelector('.portal-login-form');
    const progressChart = document.querySelector('#progressChart');
    const teacherPortal = document.querySelector('.teacher-portal');
    const teacherLoginBtn = document.querySelector('.teacher-login-btn');
    const teacherClose = document.querySelector('.teacher-close');
    const teacherLoginForm = document.querySelector('.teacher-login-form');
    const teacherActions = document.querySelectorAll('.teacher-action');
    const attendanceButtons = document.querySelectorAll('.attendance-row button');
    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const updateCursor = () => {
        current.x += (pointer.x - current.x) * 0.18;
        current.y += (pointer.y - current.y) * 0.18;
        if (cursor) {
            cursor.style.left = `${current.x}px`;
            cursor.style.top = `${current.y}px`;
        }
        requestAnimationFrame(updateCursor);
    };

    // Cursor label helper
    const setCursorState = (state, label) => {
        if (!cursor) return;
        cursor.classList.remove('morph','glow');
        if (state === 'morph') cursor.classList.add('morph');
        if (state === 'glow') cursor.classList.add('glow');
        const span = cursor.querySelector('.label') || (function(){ const s=document.createElement('span'); s.className='label'; cursor.appendChild(s); return s; })();
        span.textContent = label || '';
    };

    window.addEventListener('mousemove', (event) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        if (cursor) {
            cursor.classList.remove('hidden');
        }
    });

    window.addEventListener('mouseleave', () => {
        if (cursor) {
            cursor.classList.add('hidden');
        }
    });

    window.addEventListener('mouseenter', () => {
        if (cursor) {
            cursor.classList.remove('hidden');
        }
    });

    const setTheme = (theme) => {
        const isLight = theme === 'light';
        document.body.classList.toggle('light-theme', isLight);
        if (themeToggle) {
            themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
        }
        localStorage.setItem('projectNovaTheme', theme);
    };

    const savedTheme = localStorage.getItem('projectNovaTheme');
    if (savedTheme === 'light') {
        setTheme('light');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const nextTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
            setTheme(nextTheme);
        });
    }

    const closeMobileMenu = () => {
        if (navLinks) {
            navLinks.classList.remove('mobile-open');
        }
        if (mobileMenuToggle) {
            mobileMenuToggle.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
        }
    };

    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('mobile-open');
            mobileMenuToggle.classList.toggle('active', isOpen);
            mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        document.querySelectorAll('.nav-actions a, .nav-actions button').forEach(el => {
            el.addEventListener('click', closeMobileMenu);
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        });
    }

    magneticButtons.forEach(button => {
        let isHovering = false;

        const reset = () => {
            button.style.transform = 'translate3d(0,0,0) scale(1)';
            button.style.transition = 'transform .35s cubic-bezier(.23,1,.32,1)';
            if (cursor) cursor.classList.remove('cursor-hover');
            isHovering = false;
        };

        button.addEventListener('mousemove', (event) => {
            const rect = button.getBoundingClientRect();
            const x = event.clientX - (rect.left + rect.width / 2);
            const y = event.clientY - (rect.top + rect.height / 2);
            const strength = 0.23;
            button.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0) scale(1.03)`;
            button.style.transition = 'transform .12s ease-out';
            if (cursor && !cursor.classList.contains('cursor-hover')) {
                cursor.classList.add('cursor-hover');
            }
            isHovering = true;
        });

        button.addEventListener('mouseleave', reset);
        button.addEventListener('mouseover', () => {
            if (cursor) cursor.classList.add('cursor-hover');
            isHovering = true;
        });
        // ripple on click
        button.addEventListener('click', (e) => {
            const el = e.currentTarget;
            if (!el.classList.contains('ripple')) return;
            const rect = el.getBoundingClientRect();
            const wave = document.createElement('span');
            wave.className = 'ripple-wave';
            const size = Math.max(rect.width, rect.height) * 0.9;
            wave.style.width = wave.style.height = size + 'px';
            wave.style.left = (e.clientX - rect.left - size/2) + 'px';
            wave.style.top = (e.clientY - rect.top - size/2) + 'px';
            el.appendChild(wave);
            setTimeout(()=> wave.remove(), 700);
        });
    });

    // Contextual AI cursor: change on hover of key elements
    const contextualMap = [
        {sel:'.course-card', state:'morph', label:'Explore'},
        {sel:'.primary-btn, .btn-primary, a.btn-primary, .magnetic.primary-btn', state:'morph', label:'Explore'},
        {sel:'.portal-login-btn', state:'morph', label:'Student'},
        {sel:'.teacher-login-btn', state:'morph', label:'Teacher'},
        {sel:'.course-card .course-icon, .why-icon, .social-link', state:'glow', label:''}
    ];

    contextualMap.forEach(map => {
        document.querySelectorAll(map.sel).forEach(el => {
            el.addEventListener('mouseenter', () => setCursorState(map.state, map.label));
            el.addEventListener('mouseleave', () => setCursorState('', ''));
        });
    });

    const submitToFormspree = async (form, { onSuccess, onError }) => {
        if (form.action.includes('REPLACE_WITH_CONTACT_FORM_ID')) {
            onError('This form is not connected yet — sign up at formspree.io and add your form ID.');
            return;
        }
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' }
            });
            if (response.ok) {
                onSuccess();
            } else {
                onError('Something went wrong sending that. Please call or WhatsApp us instead.');
            }
        } catch (err) {
            onError('Could not reach the server. Please call or WhatsApp us instead.');
        }
    };

    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const status = contactForm.querySelector('.form-status');
            const submitBtn = contactForm.querySelector('.form-submit');

            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }

            if (submitBtn) submitBtn.disabled = true;
            if (status) {
                status.textContent = 'Sending your enquiry...';
                status.classList.remove('error');
                status.classList.remove('success');
            }

            submitToFormspree(contactForm, {
                onSuccess: () => {
                    contactForm.classList.add('sent');
                    if (status) {
                        status.textContent = 'Thanks! We have received your enquiry and will get back to you soon.';
                        status.classList.add('success');
                    }
                    contactForm.reset();
                    if (submitBtn) submitBtn.disabled = false;
                },
                onError: (message) => {
                    if (status) {
                        status.textContent = message;
                        status.classList.add('error');
                    }
                    if (submitBtn) submitBtn.disabled = false;
                }
            });
        });
    }

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const status = document.querySelector('.newsletter-status');
            const emailInput = newsletterForm.querySelector('input[type="email"]');

            if (!newsletterForm.checkValidity()) {
                newsletterForm.reportValidity();
                return;
            }

            if (status) {
                status.textContent = 'Submitting...';
                status.classList.remove('error');
            }

            submitToFormspree(newsletterForm, {
                onSuccess: () => {
                    if (status) status.textContent = 'You are in. Science updates will reach your inbox.';
                    if (emailInput) emailInput.value = '';
                },
                onError: (message) => {
                    if (status) {
                        status.textContent = message;
                        status.classList.add('error');
                    }
                }
            });
        });
    }

    if (backToTop) {
        const settleBackToTop = () => {
            backToTop.classList.toggle('visible', window.pageYOffset > 650);
        };

        window.addEventListener('scroll', settleBackToTop);
        settleBackToTop();

        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    const drawProgressChart = () => {
        if (!progressChart) return;
        const ctx = progressChart.getContext('2d');
        const width = progressChart.width;
        const height = progressChart.height;
        const scores = [62, 68, 74, 79, 84, 86, 91];
        const padding = 34;

        ctx.clearRect(0, 0, width, height);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';

        for (let i = 0; i < 4; i += 1) {
            const y = padding + ((height - padding * 2) / 3) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        const points = scores.map((score, index) => {
            const x = padding + ((width - padding * 2) / (scores.length - 1)) * index;
            const y = height - padding - ((score - 50) / 50) * (height - padding * 2);
            return { x, y };
        });

        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#4F46E5');
        gradient.addColorStop(1, '#06B6D4');

        ctx.beginPath();
        points.forEach((point, index) => {
            if (index === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
        });
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#06B6D4';
            ctx.shadowColor = '#06B6D4';
            ctx.shadowBlur = 14;
            ctx.fill();
            ctx.shadowBlur = 0;
        });
    };

    const openPortal = () => {
        if (!portal) return;
        portal.classList.add('open');
        portal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        setTimeout(drawProgressChart, 120);
    };

    const closePortal = () => {
        if (!portal) return;
        portal.classList.remove('open');
        portal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    if (portalLoginBtn) {
        portalLoginBtn.addEventListener('click', openPortal);
    }

    if (portalClose) {
        portalClose.addEventListener('click', closePortal);
    }

    if (portal) {
        portal.addEventListener('click', (event) => {
            if (event.target.classList.contains('portal-backdrop')) {
                closePortal();
            }
        });
    }

    if (portalLoginForm) {
        portalLoginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            openPortal();
            drawProgressChart();
        });
    }

    window.addEventListener('resize', drawProgressChart);

    const openTeacherPortal = () => {
        if (!teacherPortal) return;
        teacherPortal.classList.add('open');
        teacherPortal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closeTeacherPortal = () => {
        if (!teacherPortal) return;
        teacherPortal.classList.remove('open');
        teacherPortal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    if (teacherLoginBtn) {
        teacherLoginBtn.addEventListener('click', openTeacherPortal);
    }

    if (teacherClose) {
        teacherClose.addEventListener('click', closeTeacherPortal);
    }

    if (teacherPortal) {
        teacherPortal.addEventListener('click', (event) => {
            if (event.target.classList.contains('teacher-backdrop')) {
                closeTeacherPortal();
            }
        });
    }

    if (teacherLoginForm) {
        teacherLoginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            openTeacherPortal();
        });
    }

    const setFaqItemOpen = (item, open) => {
        const answer = item.querySelector('.faq-answer');
        item.classList.toggle('open', open);
        item.querySelector('.faq-question').setAttribute('aria-expanded', String(open));
        answer.style.maxHeight = open ? `${answer.scrollHeight}px` : '0px';
    };

    document.querySelectorAll('.faq-item .faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const item = question.closest('.faq-item');
            const isOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item.open').forEach(openItem => {
                if (openItem !== item) setFaqItemOpen(openItem, false);
            });
            setFaqItemOpen(item, !isOpen);
        });
    });

    const whatsappFab = document.querySelector('.whatsapp-fab');
    if (whatsappFab) {
        const phone = whatsappFab.dataset.phone;
        const message = encodeURIComponent('Hi! I would like to know more about Project NOVA courses.');
        whatsappFab.href = `https://wa.me/${phone}?text=${message}`;
    }

    attendanceButtons.forEach(button => {
        button.addEventListener('click', () => {
            const row = button.closest('.attendance-row');
            if (!row) return;
            row.querySelectorAll('button').forEach(item => item.classList.remove('active', 'present'));
            button.classList.add('active');
        });
    });

    teacherActions.forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.teacher-tool-card');
            const status = card ? card.querySelector('.teacher-status') : null;
            button.textContent = 'Saved';
            setTimeout(() => {
                button.textContent = button.dataset.originalText || 'Done';
            }, 1200);
            if (status) {
                status.textContent = 'Announcement sent to the selected batch.';
            }
        });
        button.dataset.originalText = button.textContent;
    });

    // AI assistant behavior removed from landing page

    const loader = document.getElementById('page-loader');
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.loader-percent') || document.querySelector('.progress-text');
    const skipCinematicLoader = localStorage.getItem('novaLoaderSeen') === '1';
    let progress = 0;

    const updateProgressUI = (value) => {
        if (progressFill) progressFill.style.width = `${value}%`;
        if (progressText) progressText.textContent = `${value}%`;
    };

    // On a first visit, animations.js runs the full cinematic intro and is
    // responsible for hiding the loader once it finishes — this handler only
    // takes over the (much faster) hide on repeat visits, so the two paths
    // don't race and cut the intro off early.
    const progressTimer = skipCinematicLoader ? null : setInterval(() => {
        if (progress >= 97) return;
        progress = Math.min(97, progress + Math.floor(Math.random() * 6) + 1);
        updateProgressUI(progress);
    }, 90);

    if (skipCinematicLoader) {
        window.addEventListener('load', () => {
            updateProgressUI(100);
            setTimeout(() => {
                if (loader) loader.classList.add('loaded');
            }, 200);
        });
    }

    updateCursor();

    if (window.tsParticles) {
        tsParticles.load('tsparticles', {
            fullScreen: {
                enable: false,
                zIndex: 1
            },
            particles: {
                number: {
                    value: 55,
                    density: {
                        enable: true,
                        area: 800
                    }
                },
                color: {
                    value: '#38bdf8'
                },
                shape: {
                    type: 'circle'
                },
                opacity: {
                    value: 0.65,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 0.75,
                        opacity_min: 0.2,
                        sync: false
                    }
                },
                size: {
                    value: { min: 1.5, max: 4 }
                },
                links: {
                    enable: true,
                    distance: 120,
                    color: '#38bdf8',
                    opacity: 0.18,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1.2,
                    direction: 'none',
                    random: true,
                    straight: false,
                    outModes: 'out'
                }
            },
            interactivity: {
                detectsOn: 'canvas',
                events: {
                    onHover: {
                        enable: true,
                        mode: 'grab'
                    },
                    onClick: {
                        enable: true,
                        mode: 'repulse'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 180,
                        links: {
                            opacity: 0.4
                        }
                    },
                    repulse: {
                        distance: 120,
                        strength: 0.8
                    }
                }
            },
            retinaDetect: true
        });
    }

        /* -----------------------
           UI polish scripts
           - navbar shrink on scroll
           - animated counters
        ------------------------- */
        const navbar = document.querySelector('.navbar');
        const counters = document.querySelectorAll('.counter');
        let countersStarted = false;

        const handleNavShrink = () => {
            if (!navbar) return;
            if (window.scrollY > 72) navbar.classList.add('shrink');
            else navbar.classList.remove('shrink');
        };

        const runCounters = () => {
            if (countersStarted) return;
            counters.forEach(el => {
                const target = Number(el.dataset.target) || 0;
                const duration = 1200;
                const start = performance.now();
                const step = (now) => {
                    const t = Math.min(1, (now - start) / duration);
                    el.textContent = Math.floor(t * target);
                    if (t < 1) requestAnimationFrame(step);
                    else el.textContent = target + (el.dataset.suffix || '');
                };
                requestAnimationFrame(step);
            });
            countersStarted = true;
        };

        handleNavShrink();
        window.addEventListener('scroll', () => {
            handleNavShrink();
            // start counters when trust strip is in viewport
            const trust = document.querySelector('.trust-strip');
            if (trust && !countersStarted) {
                const r = trust.getBoundingClientRect();
                if (r.top < window.innerHeight && r.bottom > 0) runCounters();
            }
        });

        /* Reveal-on-scroll for course cards and testimonials */
        const revealEls = document.querySelectorAll('.reveal');
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    revealObserver.unobserve(e.target);
                }
            });
        }, { threshold: 0.12 });
        revealEls.forEach(el => revealObserver.observe(el));

        /* CTA entrance animation */
        const cta = document.querySelector('.cta-section');
        if (cta) {
            const ctaObs = new IntersectionObserver(entries => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        cta.classList.add('visible');
                        ctaObs.unobserve(cta);
                    }
                });
            }, { threshold: 0.16 });
            ctaObs.observe(cta);
        }
});
