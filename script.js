/* ============================================
   One Time Photography - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initHeader();
    initMobileMenu();
    initHeroSlider();
    initLazyLoading();
    initSmoothScroll();
    initFormValidation();
    initLightbox();
});

/* ============================================
   Sticky Header
   ============================================ */
function initHeader() {
    const header = document.getElementById('header');
    if (!header) return;

    // Check if page has a hero section (dark background)
    const hasHero = document.querySelector('.hero');

    // If no hero section, always keep header in scrolled state
    if (!hasHero) {
        header.classList.add('scrolled');
        return;
    }

    let lastScroll = 0;
    const scrollThreshold = 50;

    function updateHeader() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    }

    // Throttle scroll events for performance
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                updateHeader();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Initial check
    updateHeader();
}

/* ============================================
   Mobile Menu
   ============================================ */
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!menuToggle || !nav) return;

    menuToggle.addEventListener('click', function() {
        menuToggle.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            menuToggle.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
            menuToggle.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

/* ============================================
   Hero Slider
   ============================================ */
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length <= 1) return;

    let currentSlide = 0;
    const slideInterval = 6000; // 6 seconds

    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    // Auto-advance slides
    setInterval(nextSlide, slideInterval);
}

/* ============================================
   Lazy Loading Images
   ============================================ */
function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ('loading' in HTMLImageElement.prototype) {
        // Native lazy loading supported
        images.forEach(img => {
            img.addEventListener('load', function() {
                img.classList.add('loaded');
            });
            // Check if already loaded (cached)
            if (img.complete) {
                img.classList.add('loaded');
            }
        });
    } else {
        // Fallback for older browsers using IntersectionObserver
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

/* ============================================
   Smooth Scroll
   ============================================ */
function initSmoothScroll() {
    // Handle anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerHeight = document.getElementById('header')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ============================================
   Form Validation
   ============================================ */
function initFormValidation() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault(); // Always prevent default form submission

            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                // Remove previous error styling
                field.classList.remove('error');

                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                }

                // Email validation
                if (field.type === 'email' && field.value.trim()) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(field.value)) {
                        isValid = false;
                        field.classList.add('error');
                    }
                }

                // Phone validation (basic)
                if (field.type === 'tel' && field.value.trim()) {
                    const phoneRegex = /^[\d\s\-+()]{10,}$/;
                    if (!phoneRegex.test(field.value)) {
                        isValid = false;
                        field.classList.add('error');
                    }
                }
            });

            if (!isValid) {
                // Focus first invalid field
                const firstError = form.querySelector('.error');
                if (firstError) {
                    firstError.focus();
                }
                return;
            }

            // Handle contact form submission (Netlify Forms)
            if (form.classList.contains('contact-form')) {
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;

                try {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Sending...';

                    // Submit to Netlify Forms
                    const formData = new FormData(form);

                    const response = await fetch('/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams(formData).toString()
                    });

                    if (response.ok) {
                        // Show success message
                        form.innerHTML = `
                            <div style="text-align: center; padding: 40px 20px;">
                                <h3 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 16px; color: var(--gold);">Thank You!</h3>
                                <p style="font-size: 1rem; opacity: 0.9;">We've received your enquiry and will get back to you within 24-48 hours.</p>
                            </div>
                        `;
                    } else {
                        throw new Error('Submission failed');
                    }
                } catch (error) {
                    console.error('Form submission error:', error);
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                    alert('Sorry, there was an error submitting your enquiry. Please try again or contact us directly.');
                }
            }
        });

        // Remove error styling on input
        form.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('input', function() {
                this.classList.remove('error');
            });
        });
    });
}

/* ============================================
   Fade In Animation on Scroll
   ============================================ */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if (animatedElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
}

/* ============================================
   Lightbox Gallery
   ============================================ */
function initLightbox() {
    // Create lightbox HTML structure
    const lightboxHTML = `
        <div class="lightbox" id="lightbox">
            <div class="lightbox-overlay"></div>
            <div class="lightbox-content">
                <button class="lightbox-close" aria-label="Close gallery">&times;</button>
                <button class="lightbox-nav lightbox-prev" aria-label="Previous image">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <div class="lightbox-image-container">
                    <img class="lightbox-image" src="" alt="Gallery image">
                    <div class="lightbox-loader"></div>
                </div>
                <button class="lightbox-nav lightbox-next" aria-label="Next image">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
                <div class="lightbox-counter"></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);

    // Lightbox elements
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const lightboxLoader = lightbox.querySelector('.lightbox-loader');
    const lightboxCounter = lightbox.querySelector('.lightbox-counter');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const overlay = lightbox.querySelector('.lightbox-overlay');

    let currentGallery = [];
    let currentIndex = 0;

    // Open lightbox with gallery
    window.openGallery = function(gallery, startIndex = 0) {
        if (!gallery || gallery.length === 0) return;

        currentGallery = gallery;
        currentIndex = startIndex;

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';

        loadImage(currentIndex);
        updateCounter();
        updateNavButtons();
    };

    // Load image
    function loadImage(index) {
        lightboxImage.style.opacity = '0';
        lightboxLoader.style.display = 'block';

        const img = new Image();
        img.onload = function() {
            lightboxImage.src = currentGallery[index];
            lightboxImage.style.opacity = '1';
            lightboxLoader.style.display = 'none';
        };
        img.onerror = function() {
            lightboxLoader.style.display = 'none';
            lightboxImage.src = '';
            lightboxImage.alt = 'Failed to load image';
        };
        img.src = currentGallery[index];
    }

    // Update counter
    function updateCounter() {
        lightboxCounter.textContent = `${currentIndex + 1} / ${currentGallery.length}`;
    }

    // Update nav buttons visibility
    function updateNavButtons() {
        prevBtn.style.display = currentGallery.length > 1 ? 'flex' : 'none';
        nextBtn.style.display = currentGallery.length > 1 ? 'flex' : 'none';
    }

    // Navigate to previous image
    function prevImage() {
        currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
        loadImage(currentIndex);
        updateCounter();
    }

    // Navigate to next image
    function nextImage() {
        currentIndex = (currentIndex + 1) % currentGallery.length;
        loadImage(currentIndex);
        updateCounter();
    }

    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        currentGallery = [];
        currentIndex = 0;
    }

    // Event listeners
    prevBtn.addEventListener('click', prevImage);
    nextBtn.addEventListener('click', nextImage);
    closeBtn.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', closeLightbox);

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;

        switch(e.key) {
            case 'ArrowLeft':
                prevImage();
                break;
            case 'ArrowRight':
                nextImage();
                break;
            case 'Escape':
                closeLightbox();
                break;
        }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextImage(); // Swipe left = next
            } else {
                prevImage(); // Swipe right = prev
            }
        }
    }
}
