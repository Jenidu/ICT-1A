
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
amplitude = 40;

const frequency = [];
const w_rand = [];
const phase_current = [];
const phase_speed = [];
for (let i = 0; i < 20; i += 1) {
    w_rand[i]= Math.random() * 6;
    frequency[i] = Math.random() * 0.01 + 0.01;
    phase_current[i] = 0;  // Initial phase
    if (i % 2 == 0)
    // if (((i+1) % 4) != 0)
        phase_speed[i] = Math.random() * 0.01 + 0.01;
    else
        phase_speed[i] = Math.random() * -0.01 - 0.01;
}
let direction = 1, dirc_change = 0, clicked = 0;
let ship_x = 650, ship_x_end = 1000;

function ChangeDirection(){
    if (!clicked)
        direction = -1, dirc_change = 1, clicked = 1;
}

img.onload = function draw() {
    
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight - 20;

    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas
    if (dirc_change) {
        ship_ctx.clearRect(0, 0, ship.width, ship.height);
        dirc_change = 0;
        for (let i = 0; i < 20; i += 1) {
            phase_speed[i] += 0.05;
        }
    }

    if (direction == -1 && ship_x < ship_x_end) {  //Ship sails forward
        ship_x += 1;
        if (ship_x >= ship_x_end) {
            for (let i = 0; i < 20; i += 1) {
                phase_speed[i] -= 0.05;
            }
        }
    }

    ship_ctx.scale(direction, 1);
    ship_ctx.drawImage(img, 0, 0, ship.width * direction, ship.height);

    for (let h_pos = 1; h_pos*300 < canvas.height * 2; h_pos += 1) {

        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 1)
        {
            const y = (h + h_pos*300) / 2 + amplitude * Math.sin(frequency[h_pos] * x + phase_current[h_pos] + w_rand[h_pos]);
            ctx.lineTo(x, y);
            if (h_pos == 2) {  //The wave that the ship sails on
                ship.style.top = ((h + h_pos*300) / 2 + amplitude * Math.sin(frequency[h_pos] * ship_x + phase_current[h_pos] + w_rand[h_pos]) - (ship.height-20)) + 'px';
                ship.style.left = (ship_x - 80) + 'px';
                rotation = 0.25 * Math.sin(2 * (frequency[h_pos] * ship_x + phase_current[h_pos] + w_rand[h_pos])) *
                (direction == -1 && ship_x < ship_x_end ? 0.5 : 1);  //Slow down oscillation, when ship is sped up 
                ship.style.transform = 'rotate(' + rotation + 'rad)';
            }
        }
        ctx.strokeStyle = "blue"; // Wave color
        ctx.lineWidth = 10;
        ctx.stroke();
    }
    for (i = 0; i < 20; i += 1) {  // Update the phase to make the waves move horizontally
        phase_current[i] += phase_speed[i];
    }

    requestAnimationFrame(draw);  // Request the next frame
}

// draw();  // Start the animation