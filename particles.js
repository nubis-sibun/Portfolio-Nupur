const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
// Configuration for the radial pattern
// More rays, more density to look like lines
const rays = 35;            // Increased rays for defined lines
const dotsPerRay = 15;      // Dots along each ray
const particleCount = rays * dotsPerRay;

let mouse = { x: null, y: null };

// Resize handling
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

// Mouse tracking
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// Initial mouse position (center)
mouse.x = width / 2;
mouse.y = height / 2;

let globalTime = 0;

// Requested Palette (Plum, Dark Blue, Orange, Red-Brown)
const palette = [
    '#82f4b1', // Muted Plum
    '#30c67c', // Dark Purple-Grey
    '#6fe3e1', // Sandy Orange
    '#5257e5' // Terra Cotta

];

// Helper to convert hex to rgb for opacity control
function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
}

class Particle {
    constructor(rayIndex, dotIndex, totalRays, totalDots) {
        // Initialize at random position
        this.x = Math.random() * width;
        this.y = Math.random() * height;

        // Pattern Positioning (The "Ray" State)
        // ------------------------------------------
        // Calculate the ideal angle for this ray
        const idealAngle = (rayIndex / totalRays) * Math.PI * 2;

        // Calculate the ideal distance from center
        const minRadius = 250;
        const maxRadius = 750; // Extend further out
        const radiusStep = (maxRadius - minRadius) / totalDots;
        const idealRadius = minRadius + (dotIndex * radiusStep);

        // Pattern Imperfection (The "Random" State)
        // -----------------------------------------

        // TIGHTER ANGLE jitter to sharpen the rays
        // Previously 0.15, now much smaller to keep them in lines
        this.angleOffset = (Math.random() - 0.5) * 0.02;

        // Randomize radius more significantly along the ray so they aren't perfect rings
        this.radiusOffset = (Math.random() - 0.5) * (radiusStep * 0.8);

        this.baseAngle = idealAngle + this.angleOffset;
        this.baseRadius = idealRadius + this.radiusOffset;

        // Store unique offset for per-ray pulsing
        this.rayIndex = rayIndex;
        this.dotIndex = dotIndex;

        // Inertia (smooth movement to target)
        this.easing = 0.05 + Math.random() * 0.05;

        // Size: Particles get slightly larger further out
        this.size = 1.5 + (dotIndex / totalDots) * 2;

        // Color Props
        // Assign a random color from the palette
        this.colorHex = palette[Math.floor(Math.random() * palette.length)];
        this.colorRgb = hexToRgb(this.colorHex);

        // Individual pulse offset for opacity
        this.pulseOffset = Math.random() * Math.PI * 2;
    }

    update() {
        // 1. Calculate Target Position in the Pattern
        // -------------------------------------------

        // ROTATION: Organic back-and-forth (Clockwise <-> Anti-clockwise)
        // Uses variable sine waves to create a random-feeling slow drift
        const globalRotation = Math.sin(globalTime * 0.15) * 0.4 + Math.sin(globalTime * 0.42) * 0.15;

        // RAY PULSE: Instead of a ripple ring, we want the whole ray to breathe or move
        // We use the rayIndex to offset the phase, so each ray pulses independently
        // and we use dotIndex to make it flow outward

        // This pulse affects the RADIUS (pushing out and in)
        // Coordinated movement along the ray
        const rayPulse = Math.sin(globalTime * 2 + this.rayIndex * 0.5) * 20;

        // Adding a flow movement along the ray
        const flow = Math.sin(globalTime * 3 + this.dotIndex * 0.2) * 5;

        const linearRadius = this.baseRadius + rayPulse + flow;
        const currentAngle = this.baseAngle + globalRotation;

        // SHAPE TRANSFORMATION: Circle -> Rounded Square (Squircle)
        // ---------------------------------------------------------
        // We use the Superellipse formula to stretch the radius at the corners
        // Formula: scale = 1 / ( |cos(theta)|^n + |sin(theta)|^n )^(1/n)
        // n = 2 is a circle, n = 4 is a rounded square
        const roundness = 4; // Adjustable: Higher = sharper corners
        const absCos = Math.abs(Math.cos(currentAngle));
        const absSin = Math.abs(Math.sin(currentAngle));

        // Calculate scale factor to morph circle radius into square radius
        const shapeScale = 1 / Math.pow(Math.pow(absCos, roundness) + Math.pow(absSin, roundness), 1 / roundness);

        // Apply shape scale to the radius
        const squareRadius = linearRadius * shapeScale;

        // Calculate where this particle *wants* to be
        const targetX = mouse.x + Math.cos(currentAngle) * squareRadius;
        const targetY = mouse.y + Math.sin(currentAngle) * squareRadius;

        // 2. Move Particle with Inertia
        this.x += (targetX - this.x) * this.easing;
        this.y += (targetY - this.y) * this.easing;

        // 3. SIZE ANIMATION (Traveling Wave)
        // ----------------------------------
        // Base size logic: larger outside (preserved but animated)
        // We create a "wave" of size that travels from center to outside (or vice versa)
        // by offsetting sin wave with dotIndex.

        const sizeWave = Math.sin(globalTime * 4 - this.dotIndex * 0.5); // " - dotIndex" makes wave move out

        // Map wave (-1 to 1) to a size range, e.g., 0.5x to 2.5x original
        // We also keep the "larger outer" trend as a baseline
        const baseSizeMetric = 1.5 + (this.dotIndex / 15) * 2; // Original static logic reference

        // Combine baseline with wave
        this.size = baseSizeMetric + (sizeWave * 1.5);

        // Clamp minimum size so they don't disappear negatively
        if (this.size < 0.5) this.size = 0.5;

        // 4. Color Logic
        // Pulse opacity for "breathing" effect
        const opacity = 0.6 + Math.sin(globalTime * 2 + this.pulseOffset) * 0.2;
        this.color = `rgba(${this.colorRgb}, ${opacity})`;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

function init() {
    particles = [];
    // Create particles in a radial grid pattern
    for (let i = 0; i < rays; i++) {
        for (let j = 0; j < dotsPerRay; j++) {
            particles.push(new Particle(i, j, rays, dotsPerRay));
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    globalTime += 0.01;

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animate);
}

init();
animate();