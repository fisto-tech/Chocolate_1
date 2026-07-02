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

    // 2. Define Hero Text Animation (Left to Right)
    const playHeroTextAnimation = () => {
        const tl = gsap.timeline();
        
        tl.fromTo(".hero-subtitle", 
            { opacity: 0, x: -50 },
            { opacity: 1, x: 0, duration: 1, ease: "power3.out" }
        );

        tl.fromTo(".hero-title", 
            { opacity: 0, x: -50 },
            { opacity: 1, x: 0, duration: 1.2, ease: "power3.out" },
            "-=0.6"
        );

        tl.fromTo(".hero-desc",
            { opacity: 0, x: -50 },
            { opacity: 1, x: 0, duration: 1, ease: "power3.out" },
            "-=0.8"
        );

        tl.fromTo(".hero-btn",
            { opacity: 0, x: -50 },
            { opacity: 1, x: 0, duration: 1, ease: "power3.out" },
            "-=0.8"
        );
    };

    // 3. Wait for video to finish before showing text
    const video = document.getElementById("heroVideo");
    if (video) {
        // If the video has already ended (unlikely on load, but safe to check)
        if (video.ended) {
            playHeroTextAnimation();
        } else {
            // Listen for the 'ended' event
            video.addEventListener('ended', playHeroTextAnimation, { once: true });
        }
    } else {
        // Fallback if video isn't found
        playHeroTextAnimation();
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
    const frameCount = 192;
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
        
        const img = images[seq.frame];
        
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Stretch the image to fill the entire canvas
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
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
            end: "+=500%", // Pins for 500vh of scroll distance to make the animation play slowly
            pin: true,
            scrub: 0.5,
        },
        onUpdate: render
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

    // 7. Move the text section towards the top
    tl.to("#gallery-hero-text-section", {
        y: "-28vh",
        duration: 1.5,
        ease: "power2.inOut"
    }, 3.5);

    // 8. At the same time, elegantly fade out everything EXCEPT the main title
    tl.to([
        "#gallery-hero-icon", 
        "#gallery-hero-subtitle", 
        "#gallery-hero-text"
    ], {
        opacity: 0,
        duration: 1.0,
        ease: "power2.inOut"
    }, 3.5);
    
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

window.addEventListener("load", () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    initAnimations();
    initCanvasScroll();
    initGalleryAnimation();
});
