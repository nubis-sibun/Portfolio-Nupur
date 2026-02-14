const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
const particleCount = 100; // Between 50-100
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

// Palette of subtle pastel colors to cycle through (Hue values)
// We will cycle broadly around these or just use HSL logic
const baseSpeed = 0.001;
let globalTime = 0;

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;

        // Organic Movement Props
        this.angle = Math.random() * Math.PI * 2; // Initial angle around cursor
        this.baseRadius = 250 + Math.random() * 500; // Base distance from center
        this.radiusScale = Math.random(); // How much this particle reacts to the "pulse"
        this.pulseSpeed = 0.002 + Math.random() * 0.003; // Individual pulse speed
        this.angleSpeed = (Math.random() - 0.5) * 0.005; // orbit speed

        // Inertia
        this.easing = 0.02 + Math.random() * 0.03;
        this.size = 2 + Math.random() * 4;

        // Color Props
        // Assign a random offset in the HSL spectrum
        this.hueOffset = Math.random() * 360;
        this.colorSpeed = 0.2 + Math.random() * 0.5;
    }

    update() {
        // 1. Jellyfish/Bubble Movement: Radius Pulse
        // The radius expands and contracts over time (sine wave)
        // Global time + individual offset makes it organic but coordinated
        const pulse = Math.sin(globalTime * 2 + this.hueOffset) * 50 * this.radiusScale;
        const currentRadius = this.baseRadius + pulse;

        // 2. Slow Orbiting/Drift
        this.angle += this.angleSpeed;

        // Calculate target based on mouse + organic offset
        const targetX = mouse.x + Math.cos(this.angle) * currentRadius;
        const targetY = mouse.y + Math.sin(this.angle) * currentRadius;

        // 3. Follow Mouse with Inertia
        this.x += (targetX - this.x) * this.easing;
        this.y += (targetY - this.y) * this.easing;

        // 4. Color Cycling - Google/Confetti Palette
        // We pick a base Hue from the palette + a tiny random drift
        // Palette: Blue (217), Red (355), Yellow (45), Green (150)
        // Ensure hue is constant for the particle but saturation changes

        // Define palette logic in update or constructor? 
        // Better to set Base Hue in constructor and just vary saturation here.
        // But since I can't edit constructor in this chunk easily without context, 
        // I will use a deterministic hash or just assign it based on index/random property.
        // Let's rely on 'hueOffset' which is random 0-360. We can map it to nearest palette color.

        let baseHue;
        if (this.hueOffset < 90) baseHue = 45; // Yellow
        else if (this.hueOffset < 180) baseHue = 150; // Green
        else if (this.hueOffset < 270) baseHue = 217; // Blue
        else baseHue = 355; // Red

        // Oscillate saturation significantly as requested
        // From pastel (low sat) to vibrant (high sat)
        // Range: 50% to 100%
        const saturationPulse = Math.sin(globalTime * 4 + this.hueOffset);
        const currentSaturation = 75 + (saturationPulse * 25); // 75 +/- 25 -> [50, 100]

        // Lightness slightly varying for depth
        const lightness = 60 + Math.sin(globalTime + this.hueOffset) * 10;

        // Using HSLA
        this.color = `hsla(${baseHue}, ${currentSaturation}%, ${lightness}%, 0.8)`;
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
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    globalTime += 0.01; // Advance time

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animate);
}

init();
animate();
