let ecosystemSketch = function(p) {

}

let canvas;
let ecosystem; //undefined at first so server set up works
// let ecosystem = {
//     corpses: [],
//     supply: [],
//     critters: []
// };

//ui box
let monitor = {
    position: {x: 0, y: 0},
    size: {w: 0, h: 0},
    shape: null,
    overlay: 0
}; //position, size, shape, overlay

let funds = {
    sorted: []
};

let stats = {
    critterCount: 0,
    worldLife: 0
}

//buttons
let newCritterButt;
let foodSprinkleToggle;
let isFoodSprinkleOn = true;
let creationButt;
let isCreating = false;

//click Info overlay
let infoGraphics;
let overlay = {
    w: 400,
    h: 800,
    position: {x: 0,y: 0},
    critter: {},
    textSize: 25
}
let isDisplayingInfo = false;

//critter creation menu
let creation;
let creationMenu = {
    w: 1500,
    h: 800,
    textSize: 40
}


//assets
let godIcon;
function preload(){
    monitor.shape = loadImage("assets/rounded_rectangle.png");
    godIcon = loadImage("assets/godIcon.jpg"); 
}

function setup() {
    //how to get d.width/height?
    canvas = createCanvas(1920,1080);
    // createCanvas(3840,2160);
    
    ellipseMode(CENTER);
    rectMode(CENTER);
    imageMode(CENTER);
    textAlign(CENTER);
    noStroke();

    monitor.size.w = width/8;
    monitor.size.h = height/3;
    monitor.position.x = width - monitor.size.w
    monitor.position.y = height - monitor.size.h

    newCritterButt = createButton("Random Critter")
        .position(width/4, height - 50)
        .size(100, 50)
        .mousePressed( () => {
            socket.emit("newCritter");
            console.log("newRandoCritter");
        });
    foodSprinkleToggle = createButton("Food Sprinkle")
        .position(width/4 - width/8, height - 50)
        .size(100, 50)
        .mousePressed( () => {
            isFoodSprinkleOn = !isFoodSprinkleOn;
            console.log("foodSprinkle toggled to: " + isFoodSprinkleOn);
            if (isFoodSprinkleOn) {
                foodSprinkleToggle.elt.style.backgroundColor = 'gold';
                // foodSprinkleToggle.attribute('backgroundColor', 'gold');
            } else {
                foodSprinkleToggle.elt.style.backgroundColor= 'grey';
            }
        });
    foodSprinkleToggle.elt.style.backgroundColor = 'gold';
    creationButt = createButton("Create New Critter")
        .position(width/4 + width/8, height - 50)
        .size(100, 50)
        .mousePressed( () => {
            isCreating = !isCreating;
        });


    //for the overlays
    infoGraphics = createGraphics(overlay.w, overlay.h);
    creation = createGraphics(creationMenu.w, creationMenu.h);
    // setupCreation(creation);
}

function draw() {
    background(200, 240, 255);
    if(ecosystem != undefined){
        monitorFunds();
        drawEcosystem(); //switching order so panel doesn't cover up
        displayStats();
        if (isCreating) {
            displayCreation(creation);
        } else if(isDisplayingInfo) {
            displayInfoOverlay(overlay.critter)
        }
    } else {
        textSize(100);
        text("waiting for server to set up", width/2, height/2);
    }

}

function mousePressed(){
    if (isCreating) {
        //if creating, no interaction off menu
    } else if (mouseX > 50 && mouseX < width - 50 &&
        mouseY > 50 && mouseY < height - 50 && isFoodSprinkleOn){ 
            //for food sprinkle
            console.log("food sprinkle");
            socket.emit("newFood", {position: {x: mouseX, y: mouseY}});
    } else { 
        //for checking critter info
        if (isDisplayingInfo) {
            isDisplayingInfo = false;
        } else {
            socket.emit("clickInfo", {position: {x: mouseX, y: mouseY}});
        }
    }
}

function drawEcosystem(){
    //draw the corpses
    ecosystem.corpses.forEach( (corpse) => { //x,y,r,fade
        fill(255,255,255,corpse.fade);
        ellipse(corpse.position.x, corpse.position.y, corpse.r); 
    });    

    //draw the food
    ecosystem.supply.forEach( (food) => { //x,y,fade
        fill(0, food.fade);
        rect(food.position.x, food.position.y, 5);
    });

    //draw the critters
    ecosystem.critters.forEach( (critter) => { //position,r,color,life,isReadyToMate
        drawCritter(critter);
    });
}

function drawCritter(critter) {
    //for lifeForce aura
    let fadedColor = color(critter.color[0] * 255, critter.color[1]  * 255, critter.color[2]  * 255, 100);
    fill(fadedColor);
    ellipse(critter.position.x, critter.position.y, critter.r + map(critter.life, 0, 100, 0, critter.r / 2));
    
    //show ring if ready to mate
    noFill();
    if(critter.isReadyToMate){
        stroke(255);
    }
    ellipse(critter.position.x, critter.position.y, critter.r + map(critter.life, 0, 200, 0, critter.r / 2));

    //base critter
    let critCol = color(critter.color[0] * 255, critter.color[1] * 255, critter.color[2] * 255);
    fill(critCol);
    noStroke();
    ellipse(critter.position.x, critter.position.y, critter.r); 
}

function monitorFunds(){
    //draw the shape background -- need to make this transparent somehow
    fill(0);
    textAlign(LEFT, CENTER);

    image(monitor.shape, monitor.position.x, monitor.position.y, monitor.size.w * 2, monitor.size.h * 2);
    let monitorOffset = {x: monitor.position.x - monitor.size.w + 20, y: monitor.position.y - monitor.size.h /2}
    let sectionSize = monitor.size.h / (funds.sorted.length + 1); //fence postttt
    textSize(sectionSize * 0.7);
    funds.sorted.forEach( (fund) => {
        text(fund[0] + ": $" + fund[1], monitorOffset.x, monitorOffset.y);
        monitorOffset.y += sectionSize; //better to use index?
    });
    text("Total Donated: $" + funds.total.toFixed(2), monitorOffset.x, monitorOffset.y);
}

function displayStats(){
    fill(0);
    textSize(40);
    text("Critter Count: " + stats.critterCount, width/2, height - 50);
    text("Life in World: $" + (stats.worldLife / 100).toFixed(2), 3 * width/4, height - 50); //can't "toFixed" b/c starts as 0??
}