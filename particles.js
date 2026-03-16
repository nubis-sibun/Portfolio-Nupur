/* ===========================
   Nupur Portfolio - Scripts
   Cursor, Nav, Hamburger, Reveal, Modal, Particles
   =========================== */

// ---- Custom Cursor ----
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

function animateCursor() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top = ry + 'px';
    requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a,button,.clickable').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.style.width = '16px'; cursor.style.height = '16px';
        cursorRing.style.width = '52px'; cursorRing.style.height = '52px';
        cursorRing.style.borderColor = 'var(--blue)';
    });
    el.addEventListener('mouseleave', () => {
        cursor.style.width = '10px'; cursor.style.height = '10px';
        cursorRing.style.width = '36px'; cursorRing.style.height = '36px';
        cursorRing.style.borderColor = 'var(--ink)';
    });
});

// ---- Nav Scroll ----
window.addEventListener('scroll', () => {
    document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 50);
});

// ---- Hamburger ----
document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.add('open');
    document.body.style.overflow = 'hidden';
});
document.getElementById('closeMenu').addEventListener('click', closeM);
document.querySelectorAll('.m-links a').forEach(a => a.addEventListener('click', closeM));

function closeM() {
    document.getElementById('mobileMenu').classList.remove('open');
    document.body.style.overflow = '';
}

// ---- Scroll Reveal ----
const observer = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
        if (e.isIntersecting) {
            e.target.style.transitionDelay = (i * 0.05) + 's';
            e.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ---- PDF Modal ----
function openModal(url) {
    document.getElementById('pdf-iframe').src = url + '#toolbar=0&navpanes=0';
    document.getElementById('pdf-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(e) {
    if (e) e.preventDefault();
    document.getElementById('pdf-modal').classList.remove('active');
    setTimeout(() => document.getElementById('pdf-iframe').src = '', 350);
    document.body.style.overflow = '';
}

// ---- Particle Canvas ----
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let w, h, particles = [], mouse = { x: null, y: null };
const RAYS = 28, DOTS = 12;
const palette = ['#1A3FD8', '#3B5BDB', '#6B6560', '#0D0D0D'];

function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
mouse.x = w / 2;
mouse.y = h / 2;

function hexRgb(hex) {
    const b = parseInt(hex.slice(1), 16);
    return `${(b >> 16) & 255},${(b >> 8) & 255},${b & 255}`;
}

class P {
    constructor(ri, di) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        const ang = (ri / RAYS) * Math.PI * 2;
        const minR = 200, maxR = 700;
        const step = (maxR - minR) / DOTS;
        this.aOff = (Math.random() - 0.5) * 0.025;
        this.rOff = (Math.random() - 0.5) * (step * 0.7);
        this.baseAngle = ang + this.aOff;
        this.baseRadius = minR + di * step + this.rOff;
        this.easing = 0.04 + Math.random() * 0.04;
        this.size = 1 + (di / DOTS) * 2.5;
        this.ri = ri;
        this.di = di;
        this.rgb = hexRgb(palette[Math.floor(Math.random() * palette.length)]);
        this.phase = Math.random() * Math.PI * 2;
    }

    update(t) {
        const rot = Math.sin(t * 0.12) * 0.3 + Math.sin(t * 0.38) * 0.1;
        const pulse = Math.sin(t * 1.8 + this.ri * 0.5) * 18;
        const flow = Math.sin(t * 2.8 + this.di * 0.2) * 4;
        const r = this.baseRadius + pulse + flow;
        const a = this.baseAngle + rot;
        const n = 4;
        const sc = 1 / Math.pow(Math.pow(Math.abs(Math.cos(a)), n) + Math.pow(Math.abs(Math.sin(a)), n), 1 / n);
        const tx = mouse.x + Math.cos(a) * r * sc;
        const ty = mouse.y + Math.sin(a) * r * sc;
        this.x += (tx - this.x) * this.easing;
        this.y += (ty - this.y) * this.easing;
        const sw = Math.sin(t * 3.5 - this.di * 0.5);
        this.size = Math.max(0.4, (1 + (this.di / DOTS) * 2) + sw * 1.2);
        const op = Math.max(0, Math.min(0.45, 0.25 + Math.sin(t * 1.5 + this.phase) * 0.08));
        this.color = `rgba(${this.rgb},${op})`;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

for (let i = 0; i < RAYS; i++) {
    for (let j = 0; j < DOTS; j++) {
        particles.push(new P(i, j));
    }
}

let t = 0;
function loop() {
    ctx.clearRect(0, 0, w, h);
    t += 0.01;
    particles.forEach(p => { p.update(t); p.draw(); });
    requestAnimationFrame(loop);
}
loop();