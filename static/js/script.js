// script.js
document.addEventListener('DOMContentLoaded', function() {
    // ================= CAROUSEL CODE =================
    const carousel = document.querySelector('.carousel');
    const imageGroups = document.querySelectorAll('.image-trio');
    let currentIndex = 0;
    const isMobile = window.innerWidth <= 768;
    let imageWidth;
    let autoScrollInterval;
    let interactionTimeout;
    const autoScrollDelay = 5000;
    const resumeAutoScrollDelay = 10000;
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');

    function preloadImages() {
        const imagesToPreload = document.querySelectorAll('.image-wrapper img'); // Select all carousel images
        imagesToPreload.forEach(img => {
            const tempImage = new Image(); // Create a new Image object
            tempImage.src = img.src;      // Set its src to the image's src - this starts the download
            tempImage.loading = 'eager'; // Force eager loading for preloading

            tempImage.onload = () => {
                console.log(`Preloaded image: ${img.src}`); // Log when image is loaded
            };
            tempImage.onerror = () => {
                console.error(`Failed to preload image: ${img.src}`); // Log if preloading fails
            };
        });
        console.log('Preloading initiated for all carousel images.'); // Log preloading start
    }

    function initCarousel() {
        if (!carousel || !imageGroups.length) return;
        
        carousel.innerHTML = ''; // Clear existing carousel
        currentIndex = 0;

        // Re-append image groups
        for (let group of imageGroups) {
            carousel.appendChild(group.cloneNode(true));
        }
        // Re-select image groups after clearing and cloning
        const currentImageGroups = document.querySelectorAll('.image-trio');

        // Clone first and last groups for smooth infinite scroll (do this AFTER re-appending)
        carousel.appendChild(currentImageGroups[0].cloneNode(true));
        carousel.insertBefore(currentImageGroups[currentImageGroups.length - 1].cloneNode(true), carousel.firstChild);

        if (isMobile) {
            imageWidth = carousel.offsetWidth; // Get width after DOM is ready and mobile styles applied

            // Set loading="eager" attribute for carousel images on mobile (still doing this)
            const carouselImages = carousel.querySelectorAll('.image-wrapper img');
            carouselImages.forEach(img => {
                img.setAttribute('loading', 'eager'); // Force eager loading on mobile
            });
        }

        // Adjust initial position
        currentIndex = 1;
        updateCarousel(false);

        startAutoScroll(); // Start auto-scroll on initialization
    }

    function updateCarousel(animate = true) {
        if (!carousel) return;
        
        if (!animate) {
            carousel.style.transition = 'none';
        }
        let offset;
        if (isMobile) {
            offset = currentIndex * -100; // Full width of one image group in mobile (100%)
        } else {
            offset = currentIndex * -100; // Original desktop logic (100% per trio)
        }
        carousel.style.transform = `translateX(${offset}%)`;
        if (!animate) {
            carousel.offsetHeight; // Force reflow
            carousel.style.transition = 'transform 0.8s cubic-bezier(0.6, 0, 0.2, 1)';
        }
    }

    function nextTrio() {
        currentIndex++;
        updateCarousel();

        // If we're at the cloned last group, jump to real first group
        if (currentIndex === imageGroups.length + 1) {
            setTimeout(() => {
                currentIndex = 1;
                updateCarousel(false);
            }, 800);
        }
    }

    function prevTrio() {
        currentIndex--;
        updateCarousel();

        // If we're at the cloned first group, jump to real last group
        if (currentIndex === 0) {
            setTimeout(() => {
                currentIndex = imageGroups.length;
                updateCarousel(false);
            }, 800);
        }
    }

    function startAutoScroll() {
        if (!autoScrollInterval) {
            autoScrollInterval = setInterval(nextTrio, autoScrollDelay);
        }
    }

    function stopAutoScroll() {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }

    function resetAutoScrollTimer() {
        stopAutoScroll();
        clearTimeout(interactionTimeout);
        interactionTimeout = setTimeout(startAutoScroll, resumeAutoScrollDelay);
    }

    if (carousel) {
        // Initialize carousel if it exists
        if (prevButton && nextButton) {
            prevButton.addEventListener('click', () => {
                prevTrio();
                resetAutoScrollTimer();
            });

            nextButton.addEventListener('click', () => {
                nextTrio();
                resetAutoScrollTimer();
            });
        }

        let touchStartX = 0;
        carousel.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
            resetAutoScrollTimer();
        });

        carousel.addEventListener('touchend', e => {
            const touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 50) nextTrio();
            else if (touchEndX - touchStartX > 50) prevTrio();
            resetAutoScrollTimer();
        });

        // Make sure links in carousel work properly
        const imageLinks = document.querySelectorAll('.image-wrapper a');
        imageLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Don't intercept link clicks for navigation
                e.stopPropagation();
            });
        });

        // Call preloadImages BEFORE initCarousel to start preloading immediately
        preloadImages();
        initCarousel();
        
        // Only add resize listener if carousel exists
        window.addEventListener('resize', () => {
            initCarousel();
        });
    }

    // ================= CONTACT FORM CODE =================
    const contactForm = document.getElementById('contactForm');
    const formResult = document.getElementById('formResult');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent the form from submitting normally
            
            // Show pending message
            if (formResult) {
                formResult.textContent = "Sending your message...";
                formResult.className = "form-result pending";
                formResult.style.display = "block";
            }
            
            // Get form data
            const formData = new FormData(contactForm);
            const object = Object.fromEntries(formData);
            
            // Check if access key is present and not empty
            const accessKey = object.access_key;
            if (!accessKey) {
                console.error("Web3Forms access key is missing or empty");
                if (formResult) {
                    formResult.textContent = "Configuration error: Missing API key. Please contact the site administrator.";
                    formResult.className = "form-result error";
                }
                return;
            }
            
            // Debug log
            console.log('Submitting form with payload:', object);
            const json = JSON.stringify(object);
            
            // Submit to Web3Forms API
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            })
            .then(async (response) => {
                let json;
                try {
                    json = await response.json();
                    console.log('Web3Forms API response:', json);
                } catch (e) {
                    console.error('Failed to parse API response', e);
                    json = { message: "Failed to parse response" };
                }
                
                if (formResult) {
                    if (response.status == 200) {
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
                    // Hide the message after 5 seconds
                    setTimeout(() => {
                        formResult.style.display = "none";
                    }, 5000);
                }
            });
        });
    }
});