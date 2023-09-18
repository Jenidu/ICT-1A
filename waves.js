
const canvas = document.getElementById("wavesCanvas");
const ctx = canvas.getContext("2d");
const ship = document.getElementById("shipCanvas");
const ship_ctx = ship.getContext("2d");

// const img = document.getElementById("shipImg");
const img = new Image();
img.src = "Images/Ship.png";

ship.addEventListener('click', () => {
    ship.classList.add('rotate-ship');
});

// Wave properties
h = 60;
amplitude = 25;

const frequency = [];
const w_rand = [];
const phase_current = [];
const phase_speed = [];
for (let i = 0; i < 50; i += 1) {
    w_rand[i]= Math.random() * 6;
    frequency[i] = Math.random() * 0.015 + 0.025;
    phase_current[i] = 0;  // Initial phase
    if (i % 2 == 0)
        phase_speed[i] = Math.random() * 0.01 + 0.01;
    else
        phase_speed[i] = Math.random() * -0.01 - 0.01;
}
direction = 1, dirc_change = 0;

function ChangeDirection(){
    direction = -1, dirc_change = 1;
}

img.onload = function draw() {
    
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight - 20;

    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas
    if (dirc_change) {
        ship_ctx.clearRect(0, 0, ship.width, ship.height);
        dirc_change = 0;
        for (let i = 0; i < 50; i += 1) {
            phase_speed[i] += 0.06;
        }
    }

    ship_ctx.scale(direction, 1);
    ship_ctx.drawImage(img, 0, 0, ship.width * direction, ship.height);

    for (let h_pos = 1; h_pos*110 < canvas.height * 2; h_pos += 1) {

        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 1)
        {
            const y = (h + h_pos*110) / 2 + amplitude * Math.sin(frequency[h_pos] * x + phase_current[h_pos] + w_rand[h_pos]);
            ctx.lineTo(x, y);
            if (h_pos == 6) {  //The wave that the ship sails on
                ship.style.top = ((h + h_pos*110) / 2 + amplitude * Math.sin(frequency[h_pos] * 650 + phase_current[h_pos] + w_rand[h_pos])) + 'px';
                rotation = ((h + h_pos*110) / 2 + amplitude * Math.cos(frequency[h_pos] * 650 + phase_current[h_pos] + w_rand[h_pos]));
                ship.style.transform = 'rotate(' + rotation + 'deg)';
            }
        }
        ctx.strokeStyle = "blue"; // Wave color
        ctx.lineWidth = 5;
        ctx.stroke();
    }
    for (i = 0; i < 50; i += 1) {  // Update the phase to make the waves move horizontally
        phase_current[i] += phase_speed[i];
    }

    requestAnimationFrame(draw);  // Request the next frame
}

draw();  // Start the animation