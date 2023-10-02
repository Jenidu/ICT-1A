
const canvas = document.getElementById("wavesCanvas");
const ctx = canvas.getContext("2d");
const ship = document.getElementById("shipCanvas");
const ship_ctx = ship.getContext("2d");

const img = new Image();
img.src = "Images/Ship.png";

ship.addEventListener('mouseover', () => {
    if (!travel) {
        ship.width = 220, ship.height = 220;
        ship.style.cursor = "pointer";
    }
});

ship.addEventListener('mouseout', () => {
    ship.width = 200, ship.height = 200;
});

window.addEventListener('resize', UpdateCanSize);

function UpdateCanSize(){
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight - 20;
}

// Wave properties
h = 60;
amplitude = 40;
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
let ship_pos = 0.2, ship_end_pos = [0.3, 0.5, 0.7];
let direction = 1, speed_change = 0, travel = 0, page = -1;

function NextPage(){

    if (!travel) {
        switch (page) {
            case (-1):
                ExplainObjects();
                travel = 1, direction = -1, page++;  //forwards
                break;
            case (0):
                AddWeights();
                travel = 1, direction = -1, page++;  //forwards
                break;
            case (1):
                ExplainStrings();
                travel = 1, direction = -1, page++;  //forwards
                break;
            case (2):
                ExplainObjects();
                travel = -1, direction = 1, page = 0;  //backswards
                break;            
        }
        speed_change = 1;
        ship.width = 200, ship.height = 200;
        ship.style.cursor = "auto";
    }
}

img.onload = function draw()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas
    if (speed_change) {
        for (let i = 0; i < 20; i++)  /* Change wave speed */
            phase_speed[i] += 0.05 * travel;
        speed_change = 0;
    }
    if (travel) {  //Ship sails forward or backwards
        ship_pos = (canvas.width * ship_pos + travel) / canvas.width;  /* Move 'ship_pos' 1 pixel forward */
        if (travel == 1 ? canvas.width * ship_pos >= canvas.width * ship_end_pos[page] :
        canvas.width * ship_pos < canvas.width * ship_end_pos[page]) {
            for (let i = 0; i < 20; i++)  /* Wave speed back to normal */
                phase_speed[i] -= 0.05 * travel;
            travel = 0;
        }
    }
    ship_ctx.scale(direction, 1);
    ship_ctx.drawImage(img, 0, 0, ship.width * direction, ship.height);
    createLine();

    requestAnimationFrame(draw);  // Request the next frame
}

function createLine(){

    for (let h_pos = 1; h_pos*300 < canvas.height * 2; h_pos++) {

        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 1)
        {
            const y = (h + h_pos*300) / 2 + amplitude * Math.sin(frequency[h_pos] * x + phase_current[h_pos] + w_rand[h_pos]);
            ctx.lineTo(x, y);
            if (h_pos == 2) {  //The wave that the ship sails on
                ship.style.top = ((h + h_pos*300) / 2 + amplitude * Math.sin(frequency[h_pos] * (canvas.width*ship_pos) + phase_current[h_pos] + w_rand[h_pos]) - 180) + 'px';
                ship.style.left = (canvas.width * ship_pos - 80) + 'px';
                rotation = 0.25 * Math.sin(2 * (frequency[h_pos] * (canvas.width*ship_pos) + phase_current[h_pos] + w_rand[h_pos])) * (travel ? 0.5 : 1);  //Slow down oscillation, when ship is sped up 
                ship.style.transform = 'rotate(' + rotation + 'rad)';
            }
        }
        ctx.strokeStyle = "blue"; // Wave color
        ctx.lineWidth = 10;
        ctx.stroke();
    }
    for (i = 0; i < 20; i += 1)  // Update the phase to make the waves move horizontally
        phase_current[i] += phase_speed[i];
}

function ExplainObjects(){
    // console.log("objects");
}

function AddWeights(){
    // console.log("weights");
}

function ExplainStrings(){
    // console.log("strings");
}




