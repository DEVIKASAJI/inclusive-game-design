// scripts/calm-quest.js

const canvas = document.getElementById('balloon-canvas');
const ctx = canvas.getContext('2d');
let balloonY = 400;
let balloonVY = 0;
let holding = false;
let stars = [];
let starCount = 0;
let prompt = document.getElementById('breath-prompt');
let starCountDiv = document.getElementById('star-count');

// Generate stars at random heights
function spawnStar() {
    stars.push({ x: 400, y: 100 + Math.random() * 400, collected: false });
}
setInterval(spawnStar, 2000);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw sky
    ctx.fillStyle = "#b3e0ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    ctx.fillStyle = "#ffd700";
    stars.forEach(star => {
        if (!star.collected) ctx.beginPath(), ctx.arc(star.x, star.y, 10, 0, 2 * Math.PI), ctx.fill();
    });

    // Draw balloon
    ctx.beginPath();
    ctx.ellipse(100, balloonY, 30, 40, 0, 0, 2 * Math.PI);
    ctx.fillStyle = "#ff6f61";
    ctx.fill();

    // Draw basket
    ctx.fillStyle = "#a0522d";
    ctx.fillRect(85, balloonY + 40, 30, 20);

    // Draw string
    ctx.strokeStyle = "#333";
    ctx.beginPath();
    ctx.moveTo(100, balloonY + 40);
    ctx.lineTo(100, balloonY + 60);
    ctx.stroke();
}

function update() {
    // Balloon movement
    if (holding) {
        balloonVY -= 0.2; // go up
        prompt.textContent = "Inhale... (hold)";
    } else {
        balloonVY += 0.1; // gentle fall
        prompt.textContent = "Exhale... (release)";
    }
    balloonVY *= 0.98; // air resistance
    balloonY += balloonVY;
    if (balloonY < 60) balloonY = 60, balloonVY = 0;
    if (balloonY > 540) balloonY = 540, balloonVY = 0;

    // Move stars
    stars.forEach(star => {
        if (!star.collected) star.x -= 2;
        // Collision
        if (!star.collected && Math.abs(star.x - 100) < 30 && Math.abs(star.y - balloonY) < 40) {
            star.collected = true;
            starCount++;
            starCountDiv.textContent = `Stars: ${starCount}`;
        }
    });

    draw();
    requestAnimationFrame(update);
}

// Controls
function setHolding(val) { holding = val; }
canvas.addEventListener('mousedown', () => setHolding(true));
canvas.addEventListener('mouseup', () => setHolding(false));
canvas.addEventListener('touchstart', e => { e.preventDefault(); setHolding(true); });
canvas.addEventListener('touchend', e => { e.preventDefault(); setHolding(false); });
window.addEventListener('keydown', e => { if (e.code === 'Space') setHolding(true); });
window.addEventListener('keyup', e => { if (e.code === 'Space') setHolding(false); });

draw();
update();
