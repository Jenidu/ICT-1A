
const canvas = document.getElementById("wavesCanvas");
const ctx = canvas.getContext("2d");
const ship = document.getElementById("shipCanvas");
const ship_ctx = ship.getContext("2d");

const img = new Image();

fetch('config.json') //Fetch the JSON file
  .then(response => response.json())
  .then(config => {
    img.src = config.ship.imgSrc;
    ship_size = config.ship.shipSize;
    ship_pos = config.ship.shipStart
    ship_stops = config.ship.anchorings;

    start = config.wave.startH;
    h = config.wave.H;
    amplitude = config.wave.amplitude;
    wave_acc = config.wave.speedUp;
    line_width = config.wave.lineWidth;

    R_scale = config.R_scale;
    R_animation = config.R_animation;
  })
  .catch(error => console.error('Error loading config:', error));

ship.addEventListener('mouseover', () => {
    if (!travel) {
        ship.width = ship_size * 1.1, ship.height = ship_size * 1.1;
        ship.style.cursor = "pointer";
    }
});

ship.addEventListener('mouseout', () => {
    ship.width = ship_size, ship.height = ship_size;
});

window.addEventListener('resize', UpdateCanSize);

function UpdateCanSize(){
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight - 20;
}

// Wave properties
UpdateCanSize();

const frequency = [];
const w_rand = [];
const phase_current = [];
const phase_speed = [];
for (let i = 0; i < 20; i++) {
    w_rand[i]= Math.random() * 6;
    frequency[i] = Math.random() * 0.01 + 0.01;
    phase_current[i] = 0;  // Initial phase
    if (i % 2 == 0)
        phase_speed[i] = Math.random() * 0.01 + 0.01;
    else
        phase_speed[i] = Math.random() * -0.01 - 0.01;
}
let direction = 1, speed_change = 0, travel = 0, page = -1;
let R_travel = 0;

function NextPage(){

    if (!travel) {
        switch (page) {
            case (-1):
                R_travel = 0, travel = 1, direction = -1, page++;  //forwards
                break;
            case (0):
                travel = 1, direction = -1, page++;  //forwards
                break;
            case (1):
                travel = 1, direction = -1, page++;  //forwards
                break;
            case (2):
                travel = -1, direction = 1, page = 0;  //backswards
                break;            
        }
        speed_change = 1;
        ship.width = ship_size, ship.height = ship_size;
        ship.style.cursor = "auto";
    }
}

img.onload = function draw()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas
    if (speed_change) {
        for (let i = 0; i < 20; i++)  /* Change wave speed */
            phase_speed[i] += wave_acc * travel;
        speed_change = 0;
    }
    if (travel) {  //Ship sails forward or backwards
        ship_pos = (canvas.width * ship_pos + travel) / canvas.width;  /* Move 'ship_pos' 1 pixel forward */
        if (travel == 1 ? canvas.width * ship_pos >= canvas.width * ship_stops[page] :
        canvas.width * ship_pos < canvas.width * ship_stops[page]) {
            for (let i = 0; i < 20; i++)  /* Wave speed back to normal */
                phase_speed[i] -= wave_acc * travel;
            travel = 0;
        }
    }
    ship_ctx.scale(direction, 1);
    ship_ctx.drawImage(img, 0, 0, ship.width * direction, ship.height);
    createWaves();
    PageInfo();

    requestAnimationFrame(draw);  // Request the next frame
}

function createWaves(){

    for (let h_pos = 1; h * h_pos < canvas.height * 2; h_pos++) {

        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++)
        {
            const y = (start + h*h_pos) / 2 + amplitude * Math.sin(frequency[h_pos] * x + phase_current[h_pos] + w_rand[h_pos]);
            ctx.lineTo(x, y);
            if (h_pos == 2) {  //The wave that the ship sails on
                ship.style.top = ((start + h*h_pos) / 2 + amplitude * Math.sin(frequency[h_pos] * (canvas.width*ship_pos) + phase_current[h_pos] + w_rand[h_pos]) - 180) + 'px';
                ship.style.left = (canvas.width * ship_pos - 80) + 'px';
                rotation = 0.25 * Math.sin(2 * (frequency[h_pos] * (canvas.width*ship_pos) + phase_current[h_pos] + w_rand[h_pos])) * (travel ? 0.5 : 1);  //Slow down oscillation, when ship is sped up 
                ship.style.transform = 'rotate(' + rotation + 'rad)';
            }
        }
        ctx.strokeStyle = "blue"; // Wave color
        ctx.lineWidth = line_width;
        ctx.stroke();
    }
    for (i = 0; i < 20; i++)  // Update the phase to make the waves move horizontally
        phase_current[i] += phase_speed[i];
}

function PageInfo(){

    if (!travel) {
        ExplainObjects();
    //     switch (page) {  /* Which rendering accurs at which page */
    //         case (0):
    //             ExplainObjects();
    //             break;
    //         case (1):
    //             AddWeights();
    //             break;
    //         case (2):
    //             ExplainStrings();
    //             break;
    //     }
    }
}

function ExplainObjects(){

    x = canvas.width/2 - R_scale/2;
    y = canvas.height/2 + R_scale/2 + 50;

    ctx.beginPath();
    ctx.moveTo(x-R_travel, y); /* R0 */
    ctx.lineTo(x-R_travel, y + R_scale);

    ctx.moveTo(x+R_travel, y);  /* R1 */
    ctx.quadraticCurveTo(x + R_scale*0.9 + R_travel, y + R_scale/4, x + R_travel, y + R_scale/2);  // Draw a quadratic Bézier curve

    ctx.moveTo(x + R_travel, y + R_scale/2 + R_travel); /* R2 */
    ctx.lineTo(x + R_scale*0.4 + R_travel, y + R_scale + R_travel);

    if (R_travel == R_animation) {
        ctx.font = "50px Arial";  /* Font for the 'title' */
        ctx.fillText("Each line corresponds to a symbol", x-320, y-100);
        ctx.stroke();

        ctx.font = "40px Arial";  /* Font for R0, R1, R2 */

        ctx.fillText("'R0'", x - R_travel - 90, y + R_scale/2);
        ctx.fillText("'R1'", x+R_travel + 40, y);
        ctx.fillText("'R2'", x + R_travel + 40, y + R_scale/2 + R_travel + 40);
    }
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#000';

    ctx.stroke();
    // ctx.beginPath();
    // ctx.moveTo(250, 500); // Start point
    // ctx.lineTo(450, 500); // End point
    // ctx.lineWidth = 10;
    // ctx.strokeStyle = '#000';
    // ctx.stroke();

    // // Draw the arrowhead
    // ctx.beginPath();
    // ctx.moveTo(460, 500); // Tip of the arrowhead
    // ctx.lineTo(440, 520); // Left point
    // ctx.lineTo(440, 480); // Right point
    // ctx.closePath();
    // ctx.fillStyle = '#000';
    // ctx.fill();

    R_travel += (R_travel < R_animation)
}

function AddWeights(){

}

function ExplainStrings(){
    // console.log("strings");
}
