document.addEventListener('DOMContentLoaded', function () {
    // ======== ELEMENT HOOKS ========
    const desktopSection = document.getElementById('desktop-gallery');
    const desktopCarousel = desktopSection ? desktopSection.querySelector('.carousel') : null;
    const mobileSection = document.getElementById('mobile-gallery');
    const mobileList = mobileSection ? mobileSection.querySelector('.mobile-list') : null;

    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');

    // ======== EXPERIENCE SWITCH ========
    const widthQuery = window.matchMedia('(max-width: 768px)');
    const coarsePointer = window.matchMedia('(hover: none) and (pointer: coarse)');

    // Prefer mobile on touch devices; else fall back to width
    let variant = (coarsePointer.matches || widthQuery.matches) ? 'mobile' : 'desktop';
    document.body.classList.toggle('is-mobile', variant === 'mobile');

    // Load photos + render appropriate experience
    loadAndRender(variant);

    function onMediaChange() {
        const newVariant = (coarsePointer.matches || widthQuery.matches) ? 'mobile' : 'desktop';
        if (newVariant === variant) return;
        variant = newVariant;
        document.body.classList.toggle('is-mobile', variant === 'mobile');
        teardownDesktop();
        teardownMobile();
        clearContainers();
        loadAndRender(variant);
    }
    if (typeof widthQuery.addEventListener === 'function') {
        widthQuery.addEventListener('change', onMediaChange);
    } else if (typeof widthQuery.addListener === 'function') {
        widthQuery.addListener(onMediaChange);
    }
    if (typeof coarsePointer.addEventListener === 'function') {
        coarsePointer.addEventListener('change', onMediaChange);
    } else if (typeof coarsePointer.addListener === 'function') {
        coarsePointer.addListener(onMediaChange);
    }

    // ======== API ========
    async function fetchPhotos(which) {
        const res = await fetch('/api/photos?variant=' + which);
        let data;
        try { data = await res.json(); }
        catch (e) { throw new Error('Failed to parse photo JSON'); }
        if (!res.ok) throw new Error((data && data.error) || 'Failed to load photos');
        return data.photos || [];
    }

    async function loadAndRender(which) {
        try {
            const photos = await fetchPhotos(which);
            if (which === 'desktop') renderDesktop(photos);
            else renderMobile(photos);
        } catch (err) {
            console.error(err);
        }
    }

    function clearContainers() {
        if (desktopCarousel) desktopCarousel.innerHTML = '';
        if (mobileList) mobileList.innerHTML = '';
        if (desktopSection) {
            desktopSection.classList.remove('is-ready');
            desktopSection.style.display = 'none'; // ensure hidden until ready
        }
        // Clear mobile indicators
        if (mobileSection) {
            const existingIndicators = mobileSection.querySelector('.mobile-indicators');
            if (existingIndicators) {
                existingIndicators.remove();
            }
        }
    }

    // ======== DESKTOP CAROUSEL ========
    let currentIndex = 1; // account for clones
    let autoScrollInterval = null;
    let interactionTimeout = null;

    const AUTO_SCROLL_DELAY = 5000;         // 5s
    const RESUME_AUTO_SCROLL_DELAY = 10000; // 10s

    // ======== MOBILE CAROUSEL ========
    let mobileCurrentIndex = 0;
    let mobileAutoScrollInterval = null;
    let mobileInteractionTimeout = null;
    let mobilePhotosArray = [];
    let mobileIndicators = [];

    function renderDesktop(photos) {
        if (!desktopSection || !desktopCarousel) return;
        if (!photos.length) {
            desktopSection.classList.remove('is-ready');
            desktopSection.style.display = 'none';
            return;
        }

        // Build groups of three
        const groups = [];
        for (let i = 0; i < photos.length; i += 3) {
            const group = photos.slice(i, i + 3);
            groups.push(group);
        }

        // Clear & (re)build carousel DOM
        desktopCarousel.innerHTML = '';
        const realGroups = [];

        groups.forEach((group) => {
            const trio = document.createElement('div');
            trio.className = 'image-trio';
            group.forEach((photo, j) => {
                const wrap = document.createElement('div');
                wrap.className = 'image-wrapper';
                const a = document.createElement('a');
                a.href = photo.view_url;
                const img = document.createElement('img');
                img.src = photo.url;
                img.alt = 'Automotive Photography';
                img.loading = (realGroups.length === 0 && j === 0) ? 'eager' : 'lazy';
                a.appendChild(img);
                wrap.appendChild(a);
                trio.appendChild(wrap);
            });
            desktopCarousel.appendChild(trio);
            realGroups.push(trio);
        });

        if (!realGroups.length) {
            desktopSection.classList.remove('is-ready');
            desktopSection.style.display = 'none';
            return;
        }

        // Clone first & last for seamless loop
        const firstClone = realGroups[0].cloneNode(true);
        const lastClone = realGroups[realGroups.length - 1].cloneNode(true);
        desktopCarousel.appendChild(firstClone);
        desktopCarousel.insertBefore(lastClone, desktopCarousel.firstChild);

        // GPU hints
        desktopCarousel.style.willChange = 'transform';
        desktopCarousel.style.backfaceVisibility = 'hidden';
        desktopCarousel.style.webkitBackfaceVisibility = 'hidden';

        // Start at index 1 (first real group)
        currentIndex = 1;
        updateCarousel(false, realGroups.length);

        // Wire controls
        if (prevButton && nextButton) {
            prevButton.onclick = function () { prevTrio(realGroups.length); resetAutoScrollTimer(realGroups.length); };
            nextButton.onclick = function () { nextTrio(realGroups.length); resetAutoScrollTimer(realGroups.length); };
        }

        // Auto-scroll
        startAutoScroll(realGroups.length);
        // Preload visibles
        preloadVisibleAndAdjacentImages(realGroups.length);

        // Mark as ready and show (desktop only). CSS will keep it hidden on small widths.
        desktopSection.classList.add('is-ready');
        desktopSection.style.display = 'block';
    }

    function updateCarousel(animate, realLen) {
        if (!desktopCarousel) return;
        const offset = currentIndex * -100;

        if (!animate) {
            desktopCarousel.style.transition = 'none';
        } else {
            desktopCarousel.style.transition = 'transform 0.5s ease-out';
        }
        desktopCarousel.style.transform = 'translate3d(' + offset + '%, 0, 0)';

        if (!animate) {
            // force reflow, then restore transition timing
            // eslint-disable-next-line no-unused-expressions
            desktopCarousel.offsetHeight;
            desktopCarousel.style.transition = 'transform 0.5s ease-out';
        }
        preloadVisibleAndAdjacentImages(realLen);
    }

    function nextTrio(realLen) {
        currentIndex++;
        updateCarousel(true, realLen);
        if (currentIndex === realLen + 1) {
            setTimeout(function () {
                currentIndex = 1;
                updateCarousel(false, realLen);
            }, 500);
        }
    }

    function prevTrio(realLen) {
        currentIndex--;
        updateCarousel(true, realLen);
        if (currentIndex === 0) {
            setTimeout(function () {
                currentIndex = realLen;
                updateCarousel(false, realLen);
            }, 500);
        }
    }

    function startAutoScroll(realLen) {
        if (!autoScrollInterval) {
            autoScrollInterval = setInterval(function () { nextTrio(realLen); }, AUTO_SCROLL_DELAY);
        }
    }

    function stopAutoScroll() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        }
    }

    function resetAutoScrollTimer(realLen) {
        stopAutoScroll();
        clearTimeout(interactionTimeout);
        interactionTimeout = setTimeout(function () { startAutoScroll(realLen); }, RESUME_AUTO_SCROLL_DELAY);
    }

    function teardownDesktop() {
        stopAutoScroll();
        clearTimeout(interactionTimeout);
    }

    function preloadVisibleAndAdjacentImages(realLen) {
        if (!desktopCarousel) return;

        const allTrios = desktopCarousel.querySelectorAll('.image-trio');
        if (!allTrios.length) return;

        const visibleIndex = currentIndex;      // includes clones; ok for selection
        const len = allTrios.length;
        const nextIndex = (visibleIndex + 1) % len;
        const prevIndex = (visibleIndex - 1 + len) % len;

        const priorityImages = []
            .concat(Array.prototype.slice.call(allTrios[visibleIndex].querySelectorAll('img')))
            .concat(Array.prototype.slice.call(allTrios[nextIndex].querySelectorAll('img')))
            .concat(Array.prototype.slice.call(allTrios[prevIndex].querySelectorAll('img')));

        priorityImages.forEach(function (img) {
            if (!img.dataset.preloaded) {
                const t = new Image();
                t.src = img.src;
                t.loading = 'eager';
                t.onload = function () { img.dataset.preloaded = 'true'; };
            }
        });

        setTimeout(function () {
            const remaining = Array.prototype.slice.call(desktopCarousel.querySelectorAll('img'))
                .filter(function (img) { return !img.dataset.preloaded; });
            remaining.forEach(function (img) {
                const t = new Image();
                t.src = img.src;
                t.loading = 'lazy';
                t.onload = function () { img.dataset.preloaded = 'true'; };
            });
        }, 1000);
    }

    // ======== MOBILE GALLERY ========
    function renderMobile(photos) {
        if (!mobileSection || !mobileList) return;
        if (!photos.length) return;

        // Store photos for carousel functionality
        mobilePhotosArray = photos;
        mobileCurrentIndex = 0;

        // Build mobile carousel
        const frag = document.createDocumentFragment();
        for (let idx = 0; idx < photos.length; idx++) {
            const p = photos[idx];
            const link = document.createElement('a');
            link.className = 'mobile-card';
            link.href = p.view_url;

            const img = document.createElement('img');
            img.src = p.url;
            img.alt = 'Photo ' + (idx + 1);
            img.loading = idx < 2 ? 'eager' : 'lazy';
            img.decoding = 'async';

            link.appendChild(img);
            frag.appendChild(link);
        }
        mobileList.innerHTML = '';
        mobileList.appendChild(frag);

        // Add indicators
        createMobileIndicators(photos.length);

        // Initialize carousel position
        updateMobileCarousel(false);

        // Start auto-scroll
        startMobileAutoScroll();

        // Add touch event listeners
        addMobileTouchListeners();

        // GPU hints
        mobileList.style.willChange = 'transform';
        mobileList.style.backfaceVisibility = 'hidden';
        mobileList.style.webkitBackfaceVisibility = 'hidden';
    }

    function updateMobileCarousel(animate) {
        if (!mobileList) return;

        // Calculate horizontal offset - each card is 100% + margin
        // Account for both width (100%) and margin-right (20px)
        const cardWidth = mobileSection.offsetWidth; // Container width
        const cardMargin = 20; // Margin between cards
        const totalCardWidth = cardWidth + cardMargin;
        const offset = mobileCurrentIndex * -totalCardWidth;

        if (!animate) {
            mobileList.style.transition = 'none';
        } else {
            mobileList.style.transition = 'transform 0.5s cubic-bezier(0.6, 0, 0.2, 1)';
        }

        mobileList.style.transform = 'translateX(' + offset + 'px)';

        if (!animate) {
            // Force reflow, then restore transition timing
            mobileList.offsetHeight;
            mobileList.style.transition = 'transform 0.5s cubic-bezier(0.6, 0, 0.2, 1)';
        }

        // Update indicators
        updateMobileIndicators();

        // Preload adjacent images
        preloadMobileImages();
    }

    function nextMobilePhoto() {
        if (!mobilePhotosArray.length) return;
        mobileCurrentIndex = (mobileCurrentIndex + 1) % mobilePhotosArray.length;
        updateMobileCarousel(true);
    }

    function prevMobilePhoto() {
        if (!mobilePhotosArray.length) return;
        mobileCurrentIndex = (mobileCurrentIndex - 1 + mobilePhotosArray.length) % mobilePhotosArray.length;
        updateMobileCarousel(true);
    }

    function goToMobilePhoto(index) {
        if (!mobilePhotosArray.length || index < 0 || index >= mobilePhotosArray.length) return;
        mobileCurrentIndex = index;
        updateMobileCarousel(true);
    }

    function startMobileAutoScroll() {
        if (!mobileAutoScrollInterval && mobilePhotosArray.length > 1) {
            mobileAutoScrollInterval = setInterval(nextMobilePhoto, AUTO_SCROLL_DELAY);
        }
    }

    function stopMobileAutoScroll() {
        if (mobileAutoScrollInterval) {
            clearInterval(mobileAutoScrollInterval);
            mobileAutoScrollInterval = null;
        }
    }

    function resetMobileAutoScrollTimer() {
        stopMobileAutoScroll();
        clearTimeout(mobileInteractionTimeout);
        mobileInteractionTimeout = setTimeout(startMobileAutoScroll, RESUME_AUTO_SCROLL_DELAY);
    }

    function teardownMobile() {
        stopMobileAutoScroll();
        clearTimeout(mobileInteractionTimeout);
    }

    function createMobileIndicators(count) {
        // Remove existing indicators
        const existingIndicators = mobileSection.querySelector('.mobile-indicators');
        if (existingIndicators) {
            existingIndicators.remove();
        }

        if (count <= 1) return;

        const indicatorsContainer = document.createElement('div');
        indicatorsContainer.className = 'mobile-indicators';

        mobileIndicators = [];
        for (let i = 0; i < count; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'mobile-indicator';
            indicator.addEventListener('click', () => {
                goToMobilePhoto(i);
                resetMobileAutoScrollTimer();
            });
            indicatorsContainer.appendChild(indicator);
            mobileIndicators.push(indicator);
        }

        mobileSection.appendChild(indicatorsContainer);
    }

    function updateMobileIndicators() {
        mobileIndicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === mobileCurrentIndex);
        });
    }

    function preloadMobileImages() {
        if (!mobilePhotosArray.length) return;

        const len = mobilePhotosArray.length;
        const nextIndex = (mobileCurrentIndex + 1) % len;
        const prevIndex = (mobileCurrentIndex - 1 + len) % len;

        // Preload current, next, and previous images
        [mobileCurrentIndex, nextIndex, prevIndex].forEach(index => {
            const cards = mobileList.querySelectorAll('.mobile-card');
            if (cards[index]) {
                const img = cards[index].querySelector('img');
                if (img && !img.dataset.preloaded) {
                    const preloadImg = new Image();
                    preloadImg.src = img.src;
                    preloadImg.onload = () => { img.dataset.preloaded = 'true'; };
                }
            }
        });
    }

    function addMobileTouchListeners() {
        if (!mobileSection) return;

        let startX = 0;
        let isDragging = false;
        let hasInteracted = false;

        mobileSection.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            hasInteracted = false;
        }, { passive: true });

        mobileSection.addEventListener('touchmove', (e) => {
            if (!isDragging) return;

            const currentX = e.touches[0].clientX;
            const diffX = startX - currentX;

            // Prevent default scrolling if we're swiping horizontally within the carousel
            if (Math.abs(diffX) > 10) {
                e.preventDefault();
                hasInteracted = true;
            }
        }, { passive: false });

        mobileSection.addEventListener('touchend', (e) => {
            if (!isDragging || !hasInteracted) return;

            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;

            // Swipe threshold
            if (Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swiped left - go to next photo
                    nextMobilePhoto();
                } else {
                    // Swiped right - go to previous photo
                    prevMobilePhoto();
                }
                resetMobileAutoScrollTimer();
            }

            isDragging = false;
            hasInteracted = false;
        }, { passive: true });
    }

    // ======== CONTACT FORM (unchanged) ========
    const contactForm = document.getElementById('contactForm');
    const formResult = document.getElementById('formResult');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            if (formResult) {
                formResult.textContent = "Sending your message...";
                formResult.className = "form-result pending";
                formResult.style.display = "block";
            }

            const formData = new FormData(contactForm);
            const object = Object.fromEntries(formData);
            const accessKey = object.access_key;

            if (!accessKey) {
                console.error("Web3Forms access key is missing or empty");
                if (formResult) {
                    formResult.textContent = "Configuration error: Missing API key. Please contact the site administrator.";
                    formResult.className = "form-result error";
                }
                return;
            }

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(object)
            })
            .then(async (response) => {
                let json;
                try { json = await response.json(); }
                catch { json = { message: "Failed to parse response" }; }

                if (formResult) {
                    if (response.status === 200) {
                        formResult.textContent = "Message sent successfully!";
                        formResult.className = "form-result success";
                        contactForm.reset();
                    } else {
                        console.error('Error response:', response.status, json);
                        formResult.textContent = json.message || "Something went wrong!";
                        formResult.className = "form-result error";
                    }
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
                if (formResult) {
                    formResult.textContent = "Network error. Please try again.";
                    formResult.className = "form-result error";
                }
            })
            .finally(function() {
                if (formResult) {
                    setTimeout(() => { formResult.style.display = "none"; }, 5000);
                }
            });
        });
    }

    // ======== ENHANCED FUNCTIONALITY FOR NEW PAGES ========

    // Initialize GSAP and ScrollTrigger
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        initAnimations();
    }

    // Calendly Integration
    initCalendlyIntegration();

    // Portfolio Filtering
    initPortfolioFilters();

    // Smooth Scrolling
    initSmoothScrolling();

    function initAnimations() {
        // Hero title animation
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            const titleLines = heroTitle.querySelectorAll('.title-line');
            gsap.set(titleLines, { y: 100, opacity: 0 });
            gsap.to(titleLines, {
                y: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.2,
                ease: "power3.out",
                delay: 0.5
            });
        }

        // Hero description animation
        const heroDescription = document.querySelector('.hero-description');
        if (heroDescription) {
            gsap.set(heroDescription, { y: 50, opacity: 0 });
            gsap.to(heroDescription, {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power3.out",
                delay: 1.2
            });
        }

        // Hero actions animation
        const heroActions = document.querySelector('.hero-actions');
        if (heroActions) {
            gsap.set(heroActions, { y: 50, opacity: 0 });
            gsap.to(heroActions, {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power3.out",
                delay: 1.5
            });
        }

        // Scroll indicator animation
        const scrollIndicator = document.querySelector('.scroll-arrow');
        if (scrollIndicator) {
            gsap.to(scrollIndicator, {
                y: 10,
                duration: 1.5,
                repeat: -1,
                yoyo: true,
                ease: "power2.inOut"
            });
        }

        // Section animations with ScrollTrigger
        gsap.utils.toArray('.section-title').forEach(title => {
            gsap.set(title, { y: 50, opacity: 0 });
            ScrollTrigger.create({
                trigger: title,
                start: "top 80%",
                onEnter: () => {
                    gsap.to(title, {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        ease: "power3.out"
                    });
                }
            });
        });

        // Approach items animation
        gsap.utils.toArray('.approach-item').forEach((item, index) => {
            gsap.set(item, { y: 50, opacity: 0 });
            ScrollTrigger.create({
                trigger: item,
                start: "top 85%",
                onEnter: () => {
                    gsap.to(item, {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        ease: "power3.out",
                        delay: index * 0.2
                    });
                }
            });
        });

        // Process steps animation
        gsap.utils.toArray('.process-step').forEach((step, index) => {
            gsap.set(step, { x: -50, opacity: 0 });
            ScrollTrigger.create({
                trigger: step,
                start: "top 85%",
                onEnter: () => {
                    gsap.to(step, {
                        x: 0,
                        opacity: 1,
                        duration: 1,
                        ease: "power3.out",
                        delay: index * 0.3
                    });
                }
            });
        });

        // Stats animation
        gsap.utils.toArray('.stat-item').forEach((stat, index) => {
            const numberElement = stat.querySelector('.stat-number');
            if (numberElement) {
                const finalValue = numberElement.textContent;
                gsap.set(numberElement, { textContent: "0" });

                ScrollTrigger.create({
                    trigger: stat,
                    start: "top 85%",
                    onEnter: () => {
                        gsap.to({ value: 0 }, {
                            value: parseInt(finalValue),
                            duration: 2,
                            ease: "power2.out",
                            delay: index * 0.2,
                            onUpdate: function() {
                                numberElement.textContent = Math.round(this.targets()[0].value) + (finalValue.includes('+') ? '+' : '') + (finalValue.includes('%') ? '%' : '');
                            }
                        });
                    }
                });
            }
        });

        // Gallery items animation
        gsap.utils.toArray('.gallery-item').forEach((item, index) => {
            gsap.set(item, { scale: 0.8, opacity: 0 });
            ScrollTrigger.create({
                trigger: item,
                start: "top 90%",
                onEnter: () => {
                    gsap.to(item, {
                        scale: 1,
                        opacity: 1,
                        duration: 0.8,
                        ease: "back.out(1.7)",
                        delay: (index % 3) * 0.1
                    });
                }
            });
        });
    }

    function initCalendlyIntegration() {
        // Calendly booking buttons
        const bookingButtons = document.querySelectorAll('#bookingBtn, #heroBookingBtn, #finalBookingBtn, #aboutBookingBtn, #portfolioBookingBtn, #quickBookingBtn');

        bookingButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();

                // Always open Calendly in new window/tab to avoid inline embedding issues
                window.open('https://calendly.com/allgasnobrakes-tuta/30min', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
            });
        });
    }

    function initPortfolioFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const galleryItems = document.querySelectorAll('.gallery-item');

        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filter = this.dataset.filter;

                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                // Filter gallery items
                galleryItems.forEach(item => {
                    const category = item.dataset.category;

                    if (filter === 'all' || category === filter) {
                        item.style.display = 'block';
                        if (typeof gsap !== 'undefined') {
                            gsap.fromTo(item,
                                { opacity: 0, scale: 0.8 },
                                { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
                            );
                        }
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });

        // Load more functionality
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', function() {
                // This would typically load more images via AJAX
                // For now, we'll just show a message
                this.textContent = 'Loading...';
                setTimeout(() => {
                    this.textContent = 'No more images to load';
                    this.disabled = true;
                }, 1000);
            });
        }
    }

    function initSmoothScrolling() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Parallax scroll effect for hero sections
        const heroSections = document.querySelectorAll('.hero-section, .about-hero, .portfolio-hero, .contact-hero');

        if (heroSections.length > 0 && typeof gsap !== 'undefined') {
            heroSections.forEach(hero => {
                gsap.to(hero, {
                    yPercent: -50,
                    ease: "none",
                    scrollTrigger: {
                        trigger: hero,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }
                });
            });
        }
    }

    // Navigation highlight based on scroll position
    function initNavigationHighlight() {
        const navLinks = document.querySelectorAll('.nav-link');
        const currentPath = window.location.pathname;

        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
    }

    initNavigationHighlight();

    // ======== HAMBURGER MENU FUNCTIONALITY ========
    function initHamburgerMenu() {
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        const mobileBookingBtn = document.getElementById('mobileBookingBtn');

        if (!hamburgerBtn || !mobileMenu) return;

        let isMenuOpen = false;

        function toggleMenu() {
            isMenuOpen = !isMenuOpen;
            hamburgerBtn.classList.toggle('active', isMenuOpen);
            mobileMenu.classList.toggle('active', isMenuOpen);

            // Prevent body scroll when menu is open
            document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        }

        function closeMenu() {
            if (isMenuOpen) {
                isMenuOpen = false;
                hamburgerBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        }

        // Hamburger button click
        hamburgerBtn.addEventListener('click', toggleMenu);

        // Close menu when clicking on navigation links
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close menu when clicking on mobile booking button
        if (mobileBookingBtn) {
            mobileBookingBtn.addEventListener('click', closeMenu);
        }

        // Close menu when clicking outside the menu content
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                closeMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isMenuOpen) {
                closeMenu();
            }
        });

        // Close menu on resize to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && isMenuOpen) {
                closeMenu();
            }
        });
    }

    initHamburgerMenu();
});
