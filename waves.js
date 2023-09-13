// Get the canvas element and its context
const canvas = document.getElementById("wavesCanvas");
const ctx = canvas.getContext("2d");

// Set the canvas dimensions
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 20;

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

async function draw() {
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas

    for (let h_pos = 1; h_pos*110 < canvas.height * 2; h_pos += 1) {

        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 1)
        {
            const y = (h + h_pos*110) / 2 + amplitude * Math.sin(frequency[h_pos] * x + phase_current[h_pos] + w_rand[h_pos]);
            ctx.lineTo(x, y);
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