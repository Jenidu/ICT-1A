
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

    R_scale = config.ExplainObjects.R_scale;
    R_animation = config.ExplainObjects.R_animation;

    W_wait = config.AddWeights.W_wait;
    W_animation = config.AddWeights.W_animation;
    W_incr = config.AddWeights.W_incr;
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
let R_travel = 0, W_travel1 = 0, W_travel2 = 0, weight = 0;

function NextPage(){

    if (!travel) {
        switch (page) {
            case (-1):
                R_travel = 0, travel = 1, direction = -1;  //forwards
                page++;
                break;
            case (0):
                travel = 1, direction = -1;  //forwards
                page++;
                break;
            case (1):
                W_travel1 = 0, W_travel2 = 0;
                travel = 1, direction = -1;  //forwards
                page++;
                break;
            case (2):
                weight += W_incr, travel = 1, direction = -1;  //forwards
                page++;
                break;
            case (3):
                R_travel = 0, travel = -1, direction = 1;  //backswards
                page = 0;
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
        switch (page) {  /* Which rendering accurs at which page */
            case (0):
                ExplainObjects();
                break;
            case(1):
                ExplainNeurons();
                break;
            case (2):
                AddWeights();
                break;
            case (3):
                ExplainStrings();
                break;
        }
    }
}

function ExplainObjects(){

    x = canvas.width/2 - R_scale/2;
    y = canvas.height/2 + R_scale/2 + 50;

    ctx.beginPath();
    ctx.moveTo(x - R_travel, y); /* R0 */
    ctx.lineTo(x - R_travel, y + R_scale);

    ctx.moveTo(x+R_travel, y);  /* R1 */
    ctx.quadraticCurveTo(x + R_scale*0.9 + R_travel, y + R_scale/4, x + R_travel, y + R_scale/2);  // Draw a quadratic Bézier curve

    ctx.moveTo(x + R_travel, y + R_scale/2 + R_travel); /* R2 */
    ctx.lineTo(x + R_scale*0.4 + R_travel, y + R_scale + R_travel);

    ctx.lineWidth = 10;
    ctx.strokeStyle = '#000';

    if (R_travel == R_animation) {
        ctx.font = "50px Arial";  /* Font for the 'title' */
        ctx.fillText("Each line corresponds to a symbol", x - 320, y - 100);
        ctx.stroke();

        ctx.font = "40px Arial";  /* Font for R0, R1, R2 */
        ctx.fillText("'R0'", x - R_travel - 90, y + R_scale/2);
        ctx.fillText("'R1'", x + R_travel + 40, y);
        ctx.fillText("'R2'", x + R_travel + 40, y + R_scale/2 + R_travel + 40);
    }
    ctx.stroke();

    R_travel += (R_travel < R_animation)
}

function ExplainNeurons(){

    x = canvas.width/2;
    y = canvas.height/2 + 120;

    ctx.font = "45px Arial";
    ctx.fillText("Each neuron stores the information of a symbol", x-470, y-120);

    ctx.beginPath();
    ctx.arc(x - 300, y + 80, 18, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y + 20, 20, 0, 2 * Math.PI);
    ctx.arc(x + 310, y + 70, 20, 0, 2 * Math.PI);
    ctx.fill();

    ctx.font = "35px Arial";  /* Font for the 'neuron' */
    ctx.fillText("Neuron 1", x - 350, y + 50);
    ctx.fillText("Neuron 2", x - 80, y - 15);
    ctx.fillText("Neuron 3", x + 260, y + 40);

    ctx.font = "25px Arial";  /* Font for the symbol */
    ctx.fillText("(R0)", x - 270, y + 80);
    ctx.fillText("(R1)", x - 70, y + 15);
    ctx.fillText("(R2)", x + 340, y + 70);
}

function AddWeights(){

    x = canvas.width/2;
    y = canvas.height/2 + 120;

    if (W_travel2 < W_animation) {
        ctx.font = "40px Arial";
        ctx.fillText("Neurons are connected together because,", x-350, y-150);
        ctx.fillText("the symbols were found close together", x-320, y-110);
    }
    else {
        ctx.font = "40px Arial";
        ctx.fillText("The connection between the neurons is correct thus,",x-460,y-150);
        ctx.fillText("the weight gets increased",x-230,y-110);
    }
    ctx.strokeStyle = '#000';
    for (d = 0; d <= 180; d += 180)
    {
        ctx.beginPath();
        ctx.moveTo(x - 125, y + d); // Start point
        ctx.lineTo(x + 125, y + d); // End point
        ctx.closePath();
        ctx.lineWidth = 12;
        ctx.stroke();

        // Draw the arrowhead
        ctx.beginPath();
        ctx.moveTo(x + 155, y + d); // Tip of the arrowhead
        ctx.lineTo(x + 125, y+30 + d); // Left point
        ctx.lineTo(x + 125, y-30 + d); // Right point
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x - 180, y-5 + d, 18, 0, 2 * Math.PI);  //First neuron
        ctx.arc(x + 200, y-5 + d, 18, 0, 2 * Math.PI);  //Second neuron
        ctx.closePath();
        ctx.fill();

        ctx.font = "30px Arial";  /* Font for the weight */
        ctx.fillText(weight + (W_travel2 >= W_animation ? W_incr : 0), x-25, y-20 + d);
        if (W_travel1 == W_wait && W_travel2 < W_animation)
        ctx.fillText("+" + W_incr, x - 43, y-20 + (W_travel2 - W_animation) + d);
    }
    ctx.font = "30px Arial";  /* Font for the 'neuron' */
    ctx.fillText("Neuron 1", x - 275, y - 35);
    ctx.fillText("Neuron 2", x + 160, y - 35);
    ctx.fillText("Neuron 2", x - 275, y-35 + 180);
    ctx.fillText("Neuron 3", x + 160, y-35 + 180);

    ctx.font = "20px Arial";  /* Font for the symbol */
    ctx.fillText("(R0)", x - 250, y - 10);
    ctx.fillText("(R1)", x + 230, y - 10);
    ctx.fillText("(R1)", x - 250, y-10 + 180);
    ctx.fillText("(R2)", x + 230, y-10 + 180);

    W_travel1 += (W_travel1 < W_wait);
    W_travel2 += (W_travel1 == W_wait && W_travel2 < W_animation) * 0.7;
}

function ExplainStrings(){

x = canvas.width/2 + 80;
y = canvas.height/2;

ctx.font = "40px Arial";  /* Font for the title */
ctx.fillText("Once the weights are 1.00,", x-340, y);
ctx.fillText("the connection becomes permanent", x-400, y+40);

ctx.font = "35px Arial";
ctx.fillText("Neuron 1 to neuron 3 is a string", x-350, y+ 250);

//Once these weights are at 1.00, the neurons are connected into strings.
ctx.strokeStyle = '#000';

for (d = 0; d <= 300; d += 300)
{
    ctx.beginPath();
    ctx.moveTo(x-350 + d, y + 150); // Start point
    ctx.lineTo(x-150 + d, y + 150); // End point
    ctx.closePath();
    ctx.lineWidth = 12;
    ctx.stroke();

    // Draw the arrowhead
    ctx.beginPath();
    ctx.moveTo(x-125 + d, y + 150); // Tip of the arrowhead
    ctx.lineTo(x-150 + d, y + 125);
    ctx.lineTo(x-150 + d, y + 175);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x - 90 + d, y + 145, 18, 0, 2 * Math.PI);  //Second neuron
    ctx.closePath();
    ctx.fill();

    ctx.font = "30px Arial";  /* Font for the weight */
    ctx.fillText("1.00", x-275 + d, y + 130);
}
ctx.beginPath();
ctx.arc(x - 390, y + 145, 18, 0, 2 * Math.PI);  //First neuron
ctx.closePath();
ctx.fill();

ctx.fillText("Neuron 1",x - 450 , y + 115);
ctx.fillText("Neuron 2",x - 150 , y + 115);
ctx.fillText("Neuron 3",x + 150 , y + 115);


}
