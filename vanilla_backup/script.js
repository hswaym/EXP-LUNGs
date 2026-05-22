console.clear();

// --- Configuration ---
const frameCount = 240;
const imagePath = (index) => `scroll/ezgif-frame-${index.toString().padStart(3, '0')}.png`;
const canvas = document.getElementById("lung-sequence");
const ctx = canvas.getContext("2d");
const images = [];
let imagesLoaded = 0;

// Set container height for scrolling (800vh equivalent)
const scrollFactor = 30; // pixels per frame to scroll
const storyHeight = frameCount * scrollFactor;
document.getElementById('story-container').style.height = `${storyHeight}px`;

// Elements
const loader = document.getElementById('loader');
const loaderProgress = document.querySelector('.loader-progress');
const navbar = document.getElementById('navbar');

// --- Preload Images ---
function preloadImages() {
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.onload = () => {
            imagesLoaded++;
            // Update loader bar
            const progress = (imagesLoaded / frameCount) * 100;
            loaderProgress.style.width = `${progress}%`;

            if (imagesLoaded === frameCount) {
                init();
            }
        };
        img.onerror = () => {
            console.error(`Failed to load image: ${imagePath(i)}`);
            imagesLoaded++; // count as loaded to avoid hanging
            if (imagesLoaded === frameCount) {
                init();
            }
        }
        img.src = imagePath(i);
        images.push(img);
    }
}

// --- Canvas Drawing Logic ---
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    // Normalize coordinate system to use css pixels
    ctx.scale(dpr, dpr);

    // Set rendering quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    renderFrame(currentFrame);
}

let currentFrame = 0;
function renderFrame(index) {
    if (!images[index]) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = images[index];

    // Calculate aspect ratio fit (object-fit: cover) against the CSS size (window.innerWidth/Height)
    // because we already scaled the context by dpr
    const ratio = Math.max(window.innerWidth / img.width, window.innerHeight / img.height);
    const centerShift_x = (window.innerWidth - img.width * ratio) / 2;
    const centerShift_y = (window.innerHeight - img.height * ratio) / 2;

    // Draw with slight overscaling to ensure no edge gaps, pure black bg handles the rest
    ctx.drawImage(img, 0, 0, img.width, img.height,
        centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
}

// --- GSAP Scrollytelling Initialization ---
function init() {
    // Hide Loader
    loader.style.opacity = '0';
    document.body.classList.remove('loading');
    setTimeout(() => { loader.style.display = 'none'; }, 1000);

    // Initial Render
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // 1. Navbar Fade In
    gsap.to(navbar, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
            trigger: "body",
            start: "top -50px",
            toggleActions: "play none none reverse"
        }
    });

    // 2. Main Image Sequence Timeline
    const sequenceTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".story-container",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5, // Smooth scrubbing
        }
    });

    // Animate an object holding the frame index
    const playhead = { frame: 0 };
    sequenceTl.to(playhead, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        onUpdate: () => {
            currentFrame = Math.round(playhead.frame);
            requestAnimationFrame(() => renderFrame(currentFrame));
        }
    });

    // 3. Text Chapter Animations
    const chapters = document.querySelectorAll('.chapter');

    chapters.forEach((chapter, index) => {
        const block = chapter.querySelector('.content-block');

        // We calculate triggers based on percentages from the prompt.
        // We can simply map these to the 800vh container via GSAP's start/end mechanism.

        gsap.fromTo(block,
            {
                opacity: 0,
                y: 50,
            },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                scrollTrigger: {
                    trigger: chapter,
                    start: index === 0 ? "top bottom" : "top center+=200", // First chapter starts almost immediately
                    end: "center center",
                    scrub: 1,
                }
            }
        );

        // Fade out
        gsap.to(block, {
            opacity: 0,
            y: -50,
            scrollTrigger: {
                trigger: chapter,
                start: index === chapters.length - 1 ? "bottom top" : "center center", // Last chapter doesn't fade out
                end: index === chapters.length - 1 ? "bottom top-=100" : "bottom center-=200",
                scrub: 1,
            }
        });
    });

    // Note: The specific frame boundaries (0-10%, 10-25%) are inherently handled 
    // by standard HTML section heights mapping to scroll height naturally, 
    // but the `chapter` heights as 100vh spread over the scrolling container
    // might overlap if not spaced correctly. 
    // To achieve the EXACT percentage pacing with `sections`, 
    // we set custom heights or space them out in CSS/JS.

    setupPacing(chapters);
}

// Adjust chapter top margins to align with specific scroll logic beats
function setupPacing(chapters) {
    const totalHeight = storyHeight - window.innerHeight; // Scrollable distance

    const pacing = [
        0.0,   // Chapter 1: Hero (visible at 0%)
        0.175, // Chapter 2: Glass (10-25%, peak at 17.5%)
        0.325, // Chapter 3: Bronchial (25-40%, peak at 32.5%)
        0.45,  // Chapter 4: Vascular (40-50%, peak at 45%)
        0.56,  // Chapter 5: Lobar (50-62%, peak at 56%)
        0.67,  // Chapter 6: Alveolar (62-72%, peak at 67%)
        0.77,  // Chapter 7: Interior (72-82%, peak at 77%)
        0.86,  // Chapter 8: Exploded (82-90%, peak at 86%)
        0.98   // Chapter 9: Reassembly (90-100%, peak at 98%)
    ];

    // Instead of margin pushing, we make chapters absolute positioned
    // based on the total scroll container height to accurately match frames.
    const container = document.querySelector('.chapters');
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = `${storyHeight}px`;

    chapters.forEach((chap, i) => {
        chap.style.position = 'absolute';
        chap.style.width = '100%';
        // Center the chapter at the specified percentage of the total height
        const topPx = pacing[i] * totalHeight;
        chap.style.top = `${topPx}px`;
        // Keep height 100vh for centering content
    });
}

// Start loading
preloadImages();
