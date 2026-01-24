/**
 * One Time Photography - Content Loader
 * Dynamically loads and renders content from API
 */

const ContentLoader = {
    /**
     * Initialize content loading based on current page
     */
    async init() {
        const page = this.getCurrentPage();

        // Load settings first (used on all pages)
        await this.loadSettings();

        // Load page headers for inner pages
        await this.loadPageHeader();

        // Load page-specific content
        switch(page) {
            case 'index':
            case '':
                await this.loadHomepage();
                break;
            case 'about':
                await this.loadAbout();
                break;
            case 'stories':
                await this.loadStories();
                break;
            case 'moments':
                await this.loadMoments();
                break;
            case 'packages':
                await this.loadPackages();
                break;
            case 'contact':
                await this.loadContact();
                break;
        }
    },

    /**
     * Load page header from API (for inner pages)
     */
    async loadPageHeader() {
        const pageHeader = document.getElementById('pageHeader');
        if (!pageHeader) return;

        const pageName = pageHeader.dataset.page;
        if (!pageName) return;

        try {
            const data = await API.getPageHeaders();
            if (!data || !data[pageName]) return;

            const headerData = data[pageName];

            // Update title
            const title = document.getElementById('pageTitle');
            if (title && headerData.title) {
                title.textContent = headerData.title;
            }

            // Update subtitle
            const subtitle = document.getElementById('pageSubtitle');
            if (subtitle && headerData.subtitle) {
                subtitle.textContent = headerData.subtitle;
            }

            // Update background image
            if (headerData.backgroundImage) {
                pageHeader.style.backgroundImage = `url('${headerData.backgroundImage}')`;
            }
        } catch (error) {
            console.log('Using default page header');
        }
    },

    /**
     * Get current page name from URL
     */
    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '');
        return filename || 'index';
    },

    /**
     * Load global settings (contact info, social links)
     */
    async loadSettings() {
        const settings = await API.getSettings();
        if (!settings) return;

        // Update WhatsApp links
        const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');
        whatsappLinks.forEach(link => {
            link.href = `https://wa.me/${settings.whatsapp}`;
        });

        // Update contact info in footer/header if needed
        this.updateElement('[data-content="email"]', settings.email);
        this.updateElement('[data-content="phone"]', settings.phone);
        this.updateElement('[data-content="location"]', settings.location);

        // Update social links
        if (settings.social) {
            this.updateLink('[data-social="instagram"]', settings.social.instagram);
            this.updateLink('[data-social="facebook"]', settings.social.facebook);
            this.updateLink('[data-social="pinterest"]', settings.social.pinterest);
        }
    },

    /**
     * Load homepage content
     */
    async loadHomepage() {
        const data = await API.getHomepage();

        if (data) {
            // Hero section
            if (data.hero) {
                this.updateElement('.hero-title', data.hero.title);
                this.updateElement('.hero-subtitle', data.hero.subtitle);
                this.loadHeroSlides(data.hero.slides);
            }

            // Brand statement
            if (data.brandStatement) {
                this.updateElement('.statement-text', data.brandStatement.text);
                this.loadStats('.statement-details', data.brandStatement.stats);
            }

            // Why Choose OTP section (formerly Featured Story)
            if (data.whyChooseOTP) {
                this.loadWhyChooseOTP(data.whyChooseOTP);
            }

            // Selected Stories section header
            if (data.selectedStories) {
                this.updateElement('.selected-stories .section-title', data.selectedStories.title);
                this.updateElement('.selected-stories .section-subtitle', data.selectedStories.subtitle);
                const storiesBtn = document.querySelector('.selected-stories .section-cta .btn');
                if (storiesBtn && data.selectedStories.buttonText) {
                    storiesBtn.textContent = data.selectedStories.buttonText;
                }
            }

            // What we capture section header
            if (data.whatWeCapture) {
                this.updateElement('.what-we-capture .section-title', data.whatWeCapture.title);
                this.updateElement('.what-we-capture .section-subtitle', data.whatWeCapture.subtitle);
                if (data.whatWeCapture.services) {
                    this.loadCaptureCards('.capture-grid', data.whatWeCapture.services);
                }
            }

            // Testimonials
            if (data.testimonials) {
                this.loadTestimonialsRedesigned(data.testimonials);
            }

            // CTA Section
            if (data.cta) {
                this.loadCTA(data.cta);
            }

            // Footer
            if (data.footer) {
                this.loadFooter(data.footer);
            }
        }

        // Stories grid - load featured stories for homepage
        let featuredStories = await API.getFeaturedStories();
        if (featuredStories && featuredStories.length > 0) {
            this.loadStoriesGrid('.stories-grid', featuredStories);
        } else {
            // Fallback to first 6 stories if no featured stories
            const allStories = await API.getStories();
            if (allStories && allStories.length > 0) {
                this.loadStoriesGrid('.stories-grid', allStories.slice(0, 6));
            }
        }

        // Show content after API load (or show fallback if API failed)
        this.showApiContent();
    },

    /**
     * Show all API content sections (removes hidden state)
     */
    showApiContent() {
        document.querySelectorAll('.api-content').forEach(el => {
            el.style.opacity = '1';
            el.classList.add('loaded');
        });
    },

    /**
     * Load hero slides
     */
    loadHeroSlides(slides) {
        const slider = document.querySelector('.hero-slider');
        if (!slider || !slides) return;

        slider.innerHTML = slides.map((slide, index) => `
            <div class="hero-slide ${index === 0 ? 'active' : ''}"
                 style="background-image: url('${slide.image}')"></div>
        `).join('');
    },

    /**
     * Load stats section
     */
    loadStats(selector, stats) {
        const container = document.querySelector(selector);
        if (!container || !stats) return;

        container.innerHTML = stats.map(stat => `
            <div class="statement-stat">
                <span class="stat-number">${stat.number}</span>
                <span class="stat-label">${stat.label}</span>
            </div>
        `).join('');
    },

    /**
     * Load featured story (legacy - kept for compatibility)
     */
    loadFeaturedStory(story) {
        const container = document.querySelector('.featured-story-inner');
        if (!container || !story) return;

        container.innerHTML = `
            <div class="featured-story-image">
                <img src="${story.image}" alt="${story.title}" loading="lazy">
            </div>
            <div class="featured-story-content">
                <span class="featured-label">Featured Story</span>
                <h2>${story.title}</h2>
                <p class="featured-location">${story.location}</p>
                <p class="featured-excerpt">${story.excerpt}</p>
                <a href="stories.html#${story.id}" class="btn btn-secondary">View Full Story</a>
            </div>
        `;
    },

    /**
     * Load Why Choose OTP section
     */
    loadWhyChooseOTP(data) {
        const section = document.querySelector('.why-choose-otp');
        if (!section || !data) return;

        // Update image
        const image = section.querySelector('.why-choose-image img');
        if (image && data.image) {
            image.src = data.image;
            image.alt = data.title || 'Why Choose OTP';
        }

        // Update label
        const label = section.querySelector('.section-label');
        if (label && data.label) {
            label.textContent = data.label;
        }

        // Update title
        const title = section.querySelector('.why-choose-content h2');
        if (title && data.title) {
            title.textContent = data.title;
        }

        // Update subtitle/location
        const subtitle = section.querySelector('.location-text');
        if (subtitle && data.subtitle) {
            subtitle.textContent = data.subtitle;
        }

        // Update description
        const description = section.querySelector('.description-text');
        if (description && data.description) {
            description.textContent = data.description;
        }

        // Update button
        const button = section.querySelector('.btn');
        if (button) {
            if (data.buttonText) button.textContent = data.buttonText;
            if (data.buttonLink) button.href = data.buttonLink;
        }
    },

    /**
     * Load redesigned testimonials with cards
     */
    loadTestimonialsRedesigned(testimonials) {
        const container = document.querySelector('#testimonialsContainer');
        if (!container) return;

        // Update header text
        if (testimonials.title) {
            this.updateElement('.testimonials-section .section-title', testimonials.title);
        }
        if (testimonials.subtitle) {
            this.updateElement('.testimonials-section .section-subtitle', testimonials.subtitle);
        }

        // If items are provided, generate testimonial cards
        if (testimonials.items && testimonials.items.length > 0) {
            container.innerHTML = testimonials.items.map((t, index) => `
                <div class="testimonial-card" data-index="${index}">
                    <p class="testimonial-quote">${t.quote}</p>
                    <div class="testimonial-author">
                        ${t.image ? `<img src="${t.image}" alt="${t.name}" class="testimonial-avatar">` : ''}
                        <div class="testimonial-info">
                            <cite>${t.name}</cite>
                            <span>${t.event}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    },

    /**
     * Load CTA section
     */
    loadCTA(data) {
        const section = document.querySelector('.cta-section');
        if (!section || !data) return;

        // Update background image
        if (data.backgroundImage) {
            const bgImg = section.querySelector('.cta-background img');
            if (bgImg) bgImg.src = data.backgroundImage;
        }

        // Update title
        const title = section.querySelector('h2');
        if (title && data.title) {
            title.textContent = data.title;
        }

        // Update subtitle
        const subtitle = section.querySelector('.cta-subtitle');
        if (subtitle && data.subtitle) {
            subtitle.textContent = data.subtitle;
        }

        // Update primary button
        if (data.primaryButton) {
            const primaryBtn = section.querySelector('.btn-primary');
            if (primaryBtn) {
                if (data.primaryButton.text) primaryBtn.textContent = data.primaryButton.text;
                if (data.primaryButton.link) primaryBtn.href = data.primaryButton.link;
            }
        }

        // Update secondary button
        if (data.secondaryButton) {
            const secondaryBtn = section.querySelector('.btn-secondary');
            if (secondaryBtn) {
                if (data.secondaryButton.text) secondaryBtn.textContent = data.secondaryButton.text;
                if (data.secondaryButton.link) secondaryBtn.href = data.secondaryButton.link;
            }
        }

        // Update booking note
        const note = section.querySelector('.cta-note');
        if (note && data.bookingNote) {
            note.textContent = data.bookingNote;
        }
    },

    /**
     * Load footer content
     */
    async loadFooter(data) {
        const footer = document.querySelector('.footer-redesigned');
        if (!footer) return;

        // Update tagline
        if (data.tagline) {
            this.updateElement('.footer-tagline', data.tagline);
        }

        // Update copyright
        if (data.copyright) {
            const copyrightEl = footer.querySelector('.footer-bottom p');
            if (copyrightEl) copyrightEl.innerHTML = `&copy; ${data.copyright}`;
        }

        // Load contact info from settings
        const settings = await API.getSettings();
        if (settings) {
            this.updateElement('[data-content="footer-email"]', settings.email);
            this.updateElement('[data-content="footer-phone"]', settings.phone);
            this.updateElement('[data-content="footer-location"]', settings.location);

            // Update social links
            const socialContainer = footer.querySelector('#footerSocial');
            if (socialContainer && settings.social) {
                const socialLinks = [];
                if (settings.social.instagram) socialLinks.push(`<a href="${settings.social.instagram}" target="_blank" rel="noopener">Instagram</a>`);
                if (settings.social.facebook) socialLinks.push(`<a href="${settings.social.facebook}" target="_blank" rel="noopener">Facebook</a>`);
                if (settings.social.pinterest) socialLinks.push(`<a href="${settings.social.pinterest}" target="_blank" rel="noopener">Pinterest</a>`);
                if (settings.social.youtube) socialLinks.push(`<a href="${settings.social.youtube}" target="_blank" rel="noopener">YouTube</a>`);
                if (socialLinks.length > 0) {
                    socialContainer.innerHTML = socialLinks.join('');
                }
            }
        }
    },

    /**
     * Load stories grid
     */
    loadStoriesGrid(selector, stories) {
        const container = document.querySelector(selector);
        if (!container || !stories) return;

        container.innerHTML = stories.map(story => `
            <a href="${story.galleryUrl || `stories.html#${story.id}`}" class="story-card" ${story.galleryUrl ? 'target="_blank" rel="noopener"' : ''}>
                <div class="story-image">
                    <img src="${story.thumbnail || story.image}" alt="${story.title}" loading="lazy">
                </div>
                <div class="story-info">
                    <h3>${story.title}</h3>
                    <span>${story.location}</span>
                </div>
            </a>
        `).join('');
    },

    /**
     * Load capture/services cards
     */
    loadCaptureCards(selector, services) {
        const container = document.querySelector(selector);
        if (!container || !services) return;

        container.innerHTML = services.map(service => `
            <div class="capture-card">
                <div class="capture-image">
                    <img src="${service.image}" alt="${service.title}" loading="lazy">
                </div>
                <h3>${service.title}</h3>
                <p>${service.description}</p>
                ${service.features ? `
                    <ul class="capture-features">
                        ${service.features.map(f => `<li>${f}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        `).join('');
    },

    /**
     * Load testimonials (legacy - for other pages)
     */
    loadTestimonials(selector, testimonials) {
        const container = document.querySelector(selector);
        if (!container || !testimonials) return;

        container.innerHTML = testimonials.map(t => `
            <blockquote class="testimonial">
                <p>"${t.quote}"</p>
                <footer>
                    <cite>${t.name}</cite>
                    <span>${t.event}</span>
                </footer>
            </blockquote>
        `).join('');
    },

    /**
     * Load about page
     */
    async loadAbout() {
        const data = await API.getAbout();
        if (!data) return;

        // Main content
        if (data.image) {
            const img = document.querySelector('.about-image img');
            if (img) img.src = data.image;
        }

        if (data.sections) {
            const textContainer = document.querySelector('.about-text');
            if (textContainer) {
                textContainer.innerHTML = data.sections.map(section => `
                    <h2>${section.title}</h2>
                    ${section.paragraphs.map(p => `<p>${p}</p>`).join('')}
                `).join('');
            }
        }

        // Stats
        if (data.stats) {
            this.loadStats('.statement-details', data.stats);
        }

        // Principles
        if (data.principles) {
            this.loadPrinciples('.principles-grid', data.principles);
        }
    },

    /**
     * Load principles/values
     */
    loadPrinciples(selector, principles) {
        const container = document.querySelector(selector);
        if (!container || !principles) return;

        container.innerHTML = principles.map(p => `
            <div class="principle-card">
                <div class="principle-icon">
                    ${p.icon || this.getDefaultIcon()}
                </div>
                <h3>${p.title}</h3>
                <p>${p.description}</p>
            </div>
        `).join('');
    },

    // Store stories data for gallery access
    storiesData: [],

    /**
     * Load stories page
     */
    async loadStories() {
        const stories = await API.getStories();
        if (!stories) return;

        // Store stories data for gallery access
        this.storiesData = stories;

        const container = document.querySelector('.stories-list');
        if (!container) return;

        container.innerHTML = stories.map((story, index) => `
            <article class="story-preview" id="${story.id}">
                <div class="story-preview-image">
                    ${story.galleryUrl ? `<a href="${story.galleryUrl}" target="_blank" rel="noopener">` : ''}
                    <img src="${story.image}" alt="${story.title}" loading="lazy" style="cursor: pointer;">
                    ${story.galleryUrl ? `</a>` : ''}
                </div>
                <div class="story-preview-content">
                    <h2>${story.title}</h2>
                    <p class="location">${story.location}</p>
                    <p>${story.excerpt}</p>
                    ${story.galleryUrl ? `
                        <a href="${story.galleryUrl}" target="_blank" rel="noopener" class="btn btn-secondary">
                            View Gallery
                        </a>
                    ` : ''}
                </div>
            </article>
        `).join('');
    },

    // Store moments data for gallery access
    momentsData: [],

    /**
     * Load moments/portfolio page
     */
    async loadMoments() {
        const moments = await API.getMoments();
        if (!moments) return;

        // Store moments data for gallery access
        this.momentsData = moments;

        const container = document.querySelector('.moments-grid');
        if (!container) return;

        container.innerHTML = moments.map((img, index) => `
            <div class="moment-item" onclick="ContentLoader.openMomentsGallery(${index})" style="cursor: pointer;">
                <img src="${img.url}" alt="${img.alt || 'Wedding moment'}" loading="lazy">
            </div>
        `).join('');
    },

    /**
     * Open gallery lightbox for moments
     */
    openMomentsGallery(startIndex = 0) {
        const galleryUrls = this.momentsData.map(m => m.url);
        if (galleryUrls.length > 0) {
            window.openGallery(galleryUrls, startIndex);
        }
    },

    /**
     * Load packages page
     */
    async loadPackages() {
        const data = await API.getPackages();
        if (!data) return;

        // Intro text
        if (data.intro) {
            const intro = document.querySelector('.packages-intro');
            if (intro) {
                intro.innerHTML = data.intro.map(p => `<p>${p}</p>`).join('');
            }
        }

        // Package cards
        if (data.packages) {
            const grid = document.querySelector('.packages-grid');
            if (grid) {
                grid.innerHTML = data.packages.map(pkg => `
                    <div class="package-card" ${pkg.featured ? 'style="border: 2px solid var(--muted-gold);"' : ''}>
                        ${pkg.featured ? '<span style="display: block; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted-gold); margin-bottom: 16px;">Most Popular</span>' : ''}
                        <h3>${pkg.name}</h3>
                        <p class="package-desc">${pkg.description}</p>
                        <ul class="package-features">
                            ${pkg.features.map(f => `<li>${f}</li>`).join('')}
                        </ul>
                        <p style="font-size: 0.875rem; margin-bottom: 24px; opacity: 0.7;">${pkg.idealFor}</p>
                        <a href="contact.html" class="btn ${pkg.featured ? 'btn-primary' : 'btn-secondary'}">Enquire for Details</a>
                    </div>
                `).join('');
            }
        }

        // Add-ons
        if (data.addons) {
            this.loadAddons('.process-timeline', data.addons);
        }

        // FAQs
        const faqs = await API.getFAQs();
        if (faqs) {
            this.loadFAQs('.faq-grid', faqs);
        }
    },

    /**
     * Load add-on services
     */
    loadAddons(selector, addons) {
        const container = document.querySelector(selector);
        if (!container || !addons) return;

        container.innerHTML = addons.map(addon => `
            <div class="process-step">
                <div class="process-number" style="font-size: 1.5rem;">+</div>
                <div class="process-content">
                    <h3>${addon.title}</h3>
                    <p>${addon.description}</p>
                </div>
            </div>
        `).join('');
    },

    /**
     * Load FAQs
     */
    loadFAQs(selector, faqs) {
        const container = document.querySelector(selector);
        if (!container || !faqs) return;

        container.innerHTML = faqs.map(faq => `
            <div class="faq-item">
                <h3>${faq.question}</h3>
                <p>${faq.answer}</p>
            </div>
        `).join('');
    },

    /**
     * Load contact page
     */
    async loadContact() {
        const data = await API.getContact();
        if (!data) return;

        // Update contact info
        if (data.email) this.updateElement('[data-content="email"]', data.email);
        if (data.phone) this.updateElement('[data-content="phone"]', data.phone);
        if (data.location) this.updateElement('[data-content="location"]', data.location);

        // Update WhatsApp link
        if (data.whatsapp) {
            const whatsappLinks = document.querySelectorAll('[data-content="whatsapp-link"]');
            whatsappLinks.forEach(link => {
                link.href = `https://wa.me/${data.whatsapp}`;
            });
        }

        // Get in Touch section
        if (data.getInTouch) {
            this.updateElement('[data-content="git-title"]', data.getInTouch.title);
            this.updateElement('[data-content="git-description"]', data.getInTouch.description);
            this.updateElement('[data-content="git-additional"]', data.getInTouch.additionalText);
        }

        // Worldwide section
        if (data.worldwide) {
            this.updateElement('[data-content="worldwide-title"]', data.worldwide.title);
            this.updateElement('[data-content="worldwide-description"]', data.worldwide.description);
        }

        // Quick Response section
        if (data.quickResponse) {
            this.updateElement('[data-content="qr-title"]', data.quickResponse.title);
            this.updateElement('[data-content="qr-description"]', data.quickResponse.description);
            const qrButton = document.querySelector('[data-content="qr-button"]');
            if (qrButton && data.quickResponse.buttonText) {
                qrButton.textContent = data.quickResponse.buttonText;
            }
        }

        // Follow Our Work section
        if (data.followWork) {
            this.updateElement('[data-content="fw-title"]', data.followWork.title);
        }

        // Social links
        if (data.social) {
            this.updateLink('[data-social="instagram"]', data.social.instagram);
            this.updateLink('[data-social="facebook"]', data.social.facebook);
            this.updateLink('[data-social="pinterest"]', data.social.pinterest);
        }

        // Form header
        if (data.formHeader) {
            this.updateElement('[data-content="form-title"]', data.formHeader.title);
            this.updateElement('[data-content="form-subtitle"]', data.formHeader.subtitle);
        }

        // FAQ section header
        if (data.faqSectionHeader) {
            this.updateElement('[data-content="faq-section-title"]', data.faqSectionHeader.title);
            this.updateElement('[data-content="faq-section-subtitle"]', data.faqSectionHeader.subtitle);
        }

        // Info sections
        if (data.infoSections) {
            const faqGrid = document.querySelector('.faq-grid');
            if (faqGrid) {
                faqGrid.innerHTML = data.infoSections.map(section => `
                    <div class="faq-item">
                        <h3>${section.title}</h3>
                        <p>${section.content}</p>
                    </div>
                `).join('');
            }
        }
    },

    /**
     * Helper: Update element text content
     */
    updateElement(selector, content) {
        const el = document.querySelector(selector);
        if (el && content) {
            el.innerHTML = content;
        }
    },

    /**
     * Helper: Update link href
     */
    updateLink(selector, href) {
        const el = document.querySelector(selector);
        if (el && href) {
            el.href = href;
        }
    },

    /**
     * Helper: Get default icon SVG
     */
    getDefaultIcon() {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
        </svg>`;
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ContentLoader.init();
});

// Export for use
window.ContentLoader = ContentLoader;
