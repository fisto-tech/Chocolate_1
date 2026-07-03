gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    smooth: true,
})

lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => { lenis.raf(time * 1000) })
gsap.ticker.lagSmoothing(0)

const initAnimations = () => {
    // 1. Animate Navigation immediately on load
    gsap.fromTo(".nav-item", 
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.2 }
    );

    // 2. Define Hero Text Animation Loop
    const video = document.getElementById("heroVideo");
    let heroTl;

    const buildHeroTimeline = () => {
        heroTl = gsap.timeline({ 
            paused: true,
            onComplete: () => {
                // Wait 1 second after text appears, then hide it
                gsap.delayedCall(1, () => heroTl.reverse());
            },
            onReverseComplete: () => {
                // Once text is completely hidden, restart the video
                if (video) {
                    video.currentTime = 0;
                    video.play();
                }
            }
        });
        
        heroTl.fromTo(".hero-subtitle", 
            { opacity: 0, x: -50 },
            { opacity: 1, x: 0, duration: 1, ease: "power3.out" }
        );

        heroTl.fromTo(".hero-title", 
            { opacity: 0, x: -50 },
            { opacity: 1, x: 0, duration: 1.2, ease: "power3.out" },
            "-=0.6"
        );

        heroTl.fromTo(".hero-desc",
            { opacity: 0, x: -50 },
            { opacity: 1, x: 0, duration: 1, ease: "power3.out" },
            "-=0.8"
        );

        heroTl.fromTo(".hero-btn",
            { opacity: 0, x: -50 },
            { opacity: 1, x: 0, duration: 1, ease: "power3.out" },
            "-=0.8"
        );
    };

    buildHeroTimeline();

    // 3. Start the loop sequence
    if (video) {
        if (video.ended) {
            heroTl.play();
        } else {
            // Listen for the 'ended' event to trigger text animation
            video.addEventListener('ended', () => {
                heroTl.play();
            });
        }
    } else {
        // Fallback if video isn't found
        heroTl.play();
    }

    // 4. Scroll parallax setup
    gsap.to("#hero .relative.z-10", {
        scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: true
        },
        y: 150,
        opacity: 0,
        ease: "none"
    });
};

const initCanvasScroll = () => {
    const canvas = document.getElementById("frameCanvas");
    if (!canvas) return;

    const context = canvas.getContext("2d");
    const frameCount = 288; // Swapped to Chocolate_2 sequence
    const currentFrame = (index) => `./assets/Chocolate_2/${String(index + 1).padStart(5, '0')}.webp`;

    const images = [];
    const seq = { frame: 0 };

    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);
    }

    const render = () => {
        if (!images[seq.frame] || !images[seq.frame].complete) return;
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const img = images[seq.frame];
        
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Object-cover style: maintain aspect ratio, fill the canvas
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const canvasAspect = canvas.width / canvas.height;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        if (canvasAspect > imgAspect) {
            // Canvas is wider than image — fit width
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgAspect;
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
        } else {
            // Canvas is taller than image — fit height
            drawHeight = canvas.height;
            drawWidth = canvas.height * imgAspect;
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
        }
        
        context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    const textOverlay = document.getElementById('frame-text-overlay');
    const TEXT_START = 266; // frame index (0-based) for frame 00267
    const TEXT_END   = 287; // frame index (0-based) for frame 00288
    const TEXT_FADE  = 8;   // frames to fade in/out

    const updateOverlay = () => {
        if (!textOverlay) return;
        const f = seq.frame;
        let opacity = 0;
        if (f >= TEXT_START && f <= TEXT_END) {
            const fadeIn  = Math.min((f - TEXT_START) / TEXT_FADE, 1);
            const fadeOut = Math.min((TEXT_END - f) / TEXT_FADE, 1);
            opacity = Math.min(fadeIn, fadeOut);
        }
        textOverlay.style.opacity = opacity;
    };

    images[0].onload = render;
    window.addEventListener("resize", render);

    gsap.to(seq, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        scrollTrigger: {
            trigger: "#frame-section",
            start: "top top",
            end: "+=500%",
            pin: true,
            scrub: 0.5,
        },
        onUpdate: () => { render(); updateOverlay(); }
    });
};

const initGalleryAnimation = () => {
    const gallerySection = document.getElementById("gallery-section");
    if (!gallerySection) return;

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#gallery-section",
            start: "top top",
            end: "+=600%", // Extended to give enough scroll distance for the whole sequence
            pin: true,
            scrub: 1,
        }
    });

    // 1. Marquee movement for the three rows
    // Row 1 and 3 move left
    tl.fromTo("#gallery-row-1", { x: "0vw" }, { x: "-20vw", duration: 1, ease: "power1.inOut" }, 0);
    tl.fromTo("#gallery-row-3", { x: "0vw" }, { x: "-20vw", duration: 1, ease: "power1.inOut" }, 0);
    
    // Row 2 moves right to center. It starts off-screen left, and arrives perfectly at x=0.
    tl.fromTo("#gallery-row-2", { x: "-20vw" }, { x: "0vw", duration: 1, ease: "power1.inOut" }, 0);

    // 2. Fade out all non-target gallery items
    tl.to(".gallery-item", {
        opacity: 0,
        scale: 0.8,
        duration: 1,
        ease: "power2.inOut"
    }, 0.5);

    // 3. Un-tilt the slope without scaling the container
    tl.to("#gallery-container", {
        rotation: 0,
        duration: 1.5,
        ease: "power2.inOut"
    }, 0.5);

    // 4. Animate the target card to its original full-screen size (100vw x 100vh)
    tl.to("#gallery-hero-wrapper", {
        width: "100vw",
        height: "100vh",
        borderRadius: "0px",
        duration: 1.5,
        ease: "power2.inOut"
    }, 0.5);
    
    tl.to("#gallery-hero-img", {
        borderRadius: "0px",
        duration: 1.5,
        ease: "power2.inOut"
    }, 0.5);

    // 5. Fade in the clear overlay
    tl.to("#gallery-hero-content", {
        opacity: 1,
        duration: 1,
        ease: "power2.out"
    }, 2.0); // Starts right when the zoom animation is finishing

    // 6. Animate the text into the center
    tl.to([
        "#gallery-hero-icon", 
        "#gallery-hero-subtitle", 
        "#gallery-hero-title", 
        "#gallery-hero-text"
    ], {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.15,
        ease: "back.out(1.7)"
    }, 2.2);

    // 7. Move the text section towards the top smoothly before cards appear
    const isLargeScreen = window.innerWidth >= 1024;
    const textShift = isLargeScreen ? "-24vh" : "-20vh";
    
    tl.to("#gallery-hero-text-section", {
        y: textShift,
        duration: 1.5,
        ease: "power2.inOut"
    }, 3.5);
    
    if (isLargeScreen) {
        // Desktop: Fade out subtitle/desc only, keep title visible
        tl.to([
            "#gallery-hero-icon", 
            "#gallery-hero-subtitle", 
            "#gallery-hero-text"
        ], {
            opacity: 0,
            duration: 1.2,
            ease: "power2.inOut"
        }, 3.5);
    } else {
        // Mobile/Tablet: Fade out ALL text elements including the title
        tl.to([
            "#gallery-hero-icon", 
            "#gallery-hero-subtitle", 
            "#gallery-hero-title",
            "#gallery-hero-text"
        ], {
            opacity: 0,
            duration: 1.2,
            ease: "power2.inOut"
        }, 3.5);
    }

    // 9. Enable pointer events on the cards wrapper
    tl.to("#gallery-hero-cards", {
        opacity: 1,
        pointerEvents: "auto",
        duration: 0.1
    }, 3.5);

    // 10. Stagger in the product cards
    tl.to(".product-card", {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
    }, 4.0);
};

const initCanvasScroll2 = () => {
    const canvas = document.getElementById("frameCanvas2");
    if (!canvas) return;

    const context = canvas.getContext("2d");
    const frameCount = 176; // Swapped to Chocolate_1 sequence
    const currentFrame = (index) => `./assets/Chocolate_1/${String(index + 1).padStart(5, '0')}.webp`;

    const images = [];
    const seq = { frame: 0 };

    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);
    }

    const render = () => {
        if (!images[seq.frame] || !images[seq.frame].complete) return;
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Calculate scaling to cover the whole canvas (object-cover equivalent)
        const scale = Math.max(canvas.width / images[seq.frame].width, canvas.height / images[seq.frame].height);
        const x = (canvas.width - images[seq.frame].width * scale) / 2;
        const y = (canvas.height - images[seq.frame].height * scale) / 2;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(images[seq.frame], x, y, images[seq.frame].width * scale, images[seq.frame].height * scale);
    };

    // Render the first frame once the first image is loaded
    images[0].onload = render;

    // Redraw on resize
    window.addEventListener("resize", render);

    gsap.to(seq, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        scrollTrigger: {
            trigger: "#frame-section-2",
            start: "top top",
            end: "+=300%", // Provides a good scrolling distance
            scrub: 1,
            pin: true
        },
        onUpdate: render
    });
};

const initMobileMenu = () => {
    const btn = document.getElementById("mobile-menu-btn");
    const closeBtn = document.getElementById("mobile-menu-close");
    const menu = document.getElementById("mobile-menu");
    const links = document.querySelectorAll(".mobile-link");

    if (!btn || !closeBtn || !menu) return;

    // Let GSAP handle the visibility and opacity
    menu.classList.remove("transition-opacity", "duration-300", "pointer-events-none", "opacity-0");
    gsap.set(menu, { autoAlpha: 0, display: "none" });

    // Create the smooth animation timeline
    const tl = gsap.timeline({ paused: true, reversed: true });
    
    tl.to(menu, { autoAlpha: 1, display: "flex", duration: 0.4, ease: "power2.inOut" });
    tl.fromTo(links, 
        { y: 40, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power3.out" }, 
        "-=0.2"
    );

    const toggleMenu = () => {
        tl.reversed() ? tl.play() : tl.reverse();
    };

    btn.addEventListener("click", toggleMenu);
    closeBtn.addEventListener("click", toggleMenu);

    links.forEach(link => {
        link.addEventListener("click", () => {
            tl.reverse();
        });
    });
};

const initSectionReveals = () => {
    // 1. Features Banner
    const features = document.querySelectorAll(".bg-\\[\\#eee5db\\] .grid > div");
    if (features.length > 0) {
        gsap.fromTo(features, 
            { y: 30, opacity: 0 },
            { 
                y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out",
                scrollTrigger: { trigger: features[0].parentElement, start: "top 90%" }
            }
        );
    }

    // 2. Section Headers (What We Do, Testimonials, Contact Info, Footer Top)
    const headers = document.querySelectorAll(
        "#what-we-do > div:first-child, " +
        "#testimonials-section > div:first-child, " +
        "#contact-section .flex-col.justify-center, " +
        "#footer > div > div:first-child"
    );
    gsap.utils.toArray(headers).forEach(header => {
        gsap.fromTo(header, 
            { y: 40, opacity: 0 },
            { 
                y: 0, opacity: 1, duration: 1, ease: "power3.out",
                scrollTrigger: { trigger: header, start: "top 85%" }
            }
        );
    });

    // 3. What We Do Timeline Rows
    const timelineRows = document.querySelectorAll("#what-we-do .max-w-\\[1600px\\] > div");
    gsap.utils.toArray(timelineRows).forEach((row, index) => {
        // Alternate sliding direction based on row index
        const startX = index % 2 === 0 ? -100 : 100;
        
        gsap.fromTo(row,
            { x: startX, opacity: 0 },
            { 
                x: 0, opacity: 1, duration: 1.2, ease: "power3.out",
                scrollTrigger: { trigger: row, start: "top 85%" }
            }
        );
    });

    // 4. Testimonials Cards
    const testimonials = document.querySelectorAll("#testimonials-section .bg-\\[\\#110a06\\]");
    gsap.utils.toArray(testimonials).forEach((testi, index) => {
        const startX = index % 2 === 0 ? -100 : 100;
        gsap.fromTo(testi,
            { x: startX, opacity: 0 },
            { 
                x: 0, opacity: 1, duration: 1.2, ease: "power3.out",
                scrollTrigger: { trigger: testi, start: "top 90%" }
            }
        );
    });

    // 5. Contact Form
    const contactForm = document.querySelector("#contact-section .bg-\\[\\#110a06\\]");
    if (contactForm) {
        gsap.fromTo(contactForm,
            { x: 30, opacity: 0 },
            { 
                x: 0, opacity: 1, duration: 1, ease: "power3.out",
                scrollTrigger: { trigger: contactForm, start: "top 85%" }
            }
        );
    }

    // 6. Footer Bottom
    const footerBottom = document.querySelector("#footer > div > div:last-child");
    if (footerBottom) {
        gsap.fromTo(footerBottom,
            { opacity: 0 },
            { 
                opacity: 1, duration: 1, ease: "power2.inOut",
                scrollTrigger: { trigger: footerBottom, start: "top 95%" }
            }
        );
    }
};

window.addEventListener("load", () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    initAnimations();
    initCanvasScroll();
    initGalleryAnimation();
    initCanvasScroll2();
    initMobileMenu();
    initSectionReveals();
});
