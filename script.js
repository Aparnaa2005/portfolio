/* ==========================================================================
   NEURAL NETWORK PARTICLE BACKGROUND (CANVAS)
   ========================================================================== */
class ParticleNetwork {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 60;
        this.connectionDistance = 120;
        this.mouse = {
            x: null,
            y: null,
            radius: 150
        };

        this.init();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseleave', () => this.handleMouseLeave());

        this.createParticles();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // Adjust particle density based on screen size
        if (window.innerWidth < 768) {
            this.particleCount = 25;
            this.connectionDistance = 90;
        } else {
            this.particleCount = 60;
            this.connectionDistance = 120;
        }
    }

    handleMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }

    handleMouseLeave() {
        this.mouse.x = null;
        this.mouse.y = null;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.4, // Slow speed for professional look
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 2 + 1
            });
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connections first (so particles sit on top)
        for (let i = 0; i < this.particles.length; i++) {
            const p1 = this.particles[i];
            
            // Connect to other particles
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
                
                if (dist < this.connectionDistance) {
                    const alpha = (1 - dist / this.connectionDistance) * 0.08;
                    this.ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`;
                    this.ctx.lineWidth = 0.8;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }

            // Connect to mouse
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const mouseDist = Math.hypot(p1.x - this.mouse.x, p1.y - this.mouse.y);
                if (mouseDist < this.mouse.radius) {
                    const alpha = (1 - mouseDist / this.mouse.radius) * 0.12;
                    this.ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`; // Subtle blue glow line
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(this.mouse.x, this.mouse.y);
                    this.ctx.stroke();
                }
            }
        }

        // Draw particles
        for (let p of this.particles) {
            this.ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Highlight particles near mouse
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const mouseDist = Math.hypot(p.x - this.mouse.x, p.y - this.mouse.y);
                if (mouseDist < this.mouse.radius) {
                    this.ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, p.radius + 0.5, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }
    }

    update() {
        for (let p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;

            // Bounce off edges
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
        }
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

/* ==========================================================================
   TEXT ROTATOR / TYPEWRITER EFFECT
   ========================================================================== */
class TxtRotate {
    constructor(el, toRotate, period) {
        this.toRotate = toRotate;
        this.el = el;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = '';
        this.tick();
        this.isDeleting = false;
    }

    tick() {
        const i = this.loopNum % this.toRotate.length;
        const fullTxt = this.toRotate[i];

        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.el.innerHTML = '<span class="wrap">' + this.txt + '</span>';

        let delta = 150 - Math.random() * 50;

        if (this.isDeleting) { delta /= 2; }

        if (!this.isDeleting && this.txt === fullTxt) {
            delta = this.period;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.loopNum++;
            delta = 500;
        }

        setTimeout(() => this.tick(), delta);
    }
}

/* ==========================================================================
   DOM INITIALIZATION & EVENTS
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Canvas Particle Background
    new ParticleNetwork('particle-canvas');

    // 2. Initialize Text Rotation
    const elements = document.getElementsByClassName('txt-rotate');
    for (let el of elements) {
        const toRotate = el.getAttribute('data-rotate');
        const period = el.getAttribute('data-period');
        if (toRotate) {
            new TxtRotate(el, JSON.parse(toRotate), period);
        }
    }

    // 3. Navigation Scroll Effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 4. Mobile Menu Toggle
    const menuBtn = document.getElementById('menu-btn');
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuBtn && navbar) {
        menuBtn.addEventListener('click', () => {
            navbar.classList.toggle('active');
            const icon = menuBtn.querySelector('i');
            if (navbar.classList.contains('active')) {
                icon.classList.replace('fa-bars', 'fa-xmark');
            } else {
                icon.classList.replace('fa-xmark', 'fa-bars');
            }
        });

        // Close mobile menu when nav links are clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navbar.classList.remove('active');
                menuBtn.querySelector('i').classList.replace('fa-xmark', 'fa-bars');
            });
        });
    }

    // 5. Scroll Spy (Active link indicator)
    const sections = document.querySelectorAll('section');
    const navSpy = () => {
        const scrollPos = window.scrollY + 120;
        sections.forEach(section => {
            if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${section.getAttribute('id')}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };
    window.addEventListener('scroll', navSpy);

    // 6. Portfolio / Projects Filter Logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioCards = document.querySelectorAll('.portfolio-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active button state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            portfolioCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                // Add soft transition
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9) translateY(10px)';
                
                setTimeout(() => {
                    if (filterValue === 'all' || category === filterValue) {
                        card.style.display = 'flex';
                        // Re-trigger visual layout
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1) translateY(0)';
                        }, 50);
                    } else {
                        card.style.display = 'none';
                    }
                }, 300);
            });
        });
    });

    // 7. Scroll Reveal Animations (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // If it's the skills section, animate progress bars
                if (entry.target.id === 'skills') {
                    animateProgressBars();
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Progress bar animation function
    const animateProgressBars = () => {
        const progressBars = document.querySelectorAll('.progress-bar');
        progressBars.forEach(bar => {
            // Get styled inline width or default data width
            const targetWidth = bar.style.width;
            bar.style.width = '0';
            setTimeout(() => {
                bar.style.width = targetWidth;
            }, 100);
        });
    };

    // 8. Back to Top Button
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }


});
