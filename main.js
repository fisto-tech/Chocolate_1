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
            end: "+=100%", // Pins for exactly 100vh of scroll distance
            pin: true,
            scrub: 0.5,
        },
        onUpdate: render
    });
};

window.addEventListener("load", () => {
    initAnimations();
    initCanvasScroll();
});
