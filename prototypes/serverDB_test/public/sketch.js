//open and connect the input socket
let socket = io('/');

//listen for the confirmation of connection 
socket.on('connect', function(){
    console.log('connected to server');
});

socket.on('update', (updates) => {
    ecosystem = updates; //issue if this is happening asynch to draw?
});

socket.on('fundsUpdate', (conduit) => {
    let fundsUpdate = conduit.fundsRaised;
    // console.log('funds: ');
    // console.log(conduit);
    let total = conduit.totalRaised;
    //make an array from funds and sort
    //TODO (toFixed "pattern")
    let sorted = Object.keys(fundsUpdate).map((key) => [key, fundsUpdate[key].toFixed(2)]); //two decimal places
    sorted.sort((a, b) => {return b[1] - a[1]});
    // console.log(sorted);

    funds.sorted = sorted;
    funds.total = total;
});

socket.on('statsUpdate', (update) => {
    stats.critterCount = update.critterCount;
    stats.worldLife = update.worldLife;
});

socket.on('clickInfo', (data) => {
    console.log(data.critter)
    if (data.client == socket.id && data.critter != undefined) {
        // console.log('info received');
        overlay.position = data.position;
        overlay.critter = data.critter;
        isDisplayingInfo = true;
    }
});

let canvas;

let ecosystem = {
    corpses: [],
    supply: [],
    critters: []
};

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

    //for the click info overlay
    infoGraphics = createGraphics(overlay.w, overlay.h);
}

function draw() {
    background(200, 240, 255);
    
    monitorFunds();
    drawEcosystem(); //switching order so panel doesn't cover up
    displayStats();
    if(isDisplayingInfo) {displayInfoOverlay(overlay.critter)}
}

function mousePressed(){
    //just getting rid of overlay with click for now
    if (mouseX > 50 && mouseX < width - 50 &&
        mouseY > 50 && mouseY < height - 50 && isFoodSprinkleOn){ //for food sprinkle
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
    text("Life in World: " + floor(stats.worldLife), 3 * width/4, height - 50); //can't "toFixed" b/c starts as 0??
}

function displayInfoOverlay(critter){
    infoGraphics.clear();
    infoGraphics.textAlign(CENTER);
    infoGraphics.noStroke();
    infoGraphics.imageMode(CENTER);
    let critterColor = color(critter.color[0] * 255, critter.color[1]  * 255, critter.color[2]  * 255);
    let fadedColor = color(critter.color[0] * 255, critter.color[1]  * 255, critter.color[2]  * 255, 100);
    let backgroundColor = color((1 - critter.color[0]) * 255, (1 - critter.color[1])  * 255, (1 - critter.color[2])  * 255, 100);
    // infoGraphics.background(backgroundColor);
    infoGraphics.background(255, 100);

    
    //name at top
    // infoGraphics.fill(critterColor);
    infoGraphics.fill(0);
    infoGraphics.textSize(overlay.textSize + 10);
    infoGraphics.text(critter.name, overlay.w / 2, overlay.h / 12);

    //critter display -- doubled radius of all for visibility
    //for lifeForce aura
    infoGraphics.fill(fadedColor);
    infoGraphics.ellipse(overlay.w / 2, overlay.h / 5, critter.r * 2 + map(critter.life, 0, 100, 0, critter.r));
    //show ring if ready to mate
    infoGraphics.noFill();
    if(critter.mateTimer <= 0 && critter.life >= critter.minLifeToReproduce){ //isReadyToMate
        infoGraphics.stroke(255);
    }
    infoGraphics.ellipse(overlay.w / 2, overlay.h / 5, critter.r * 2 + map(critter.life, 0, 200, 0, critter.r));
    //base critter
    infoGraphics.fill(critterColor);
    infoGraphics.noStroke();
    infoGraphics.ellipse(overlay.w / 2, overlay.h / 5, critter.r * 2); 

    //critter stats
    // infoGraphics.fill(critterColor);
    infoGraphics.fill(0);
    infoGraphics.textAlign(LEFT, CENTER);
    infoGraphics.textSize(overlay.textSize);
    //life stats
    infoGraphics.text("LIFE: " + critter.life.toFixed(2), overlay.w / 24, overlay.h / 24 + overlay.h / 4);
    infoGraphics.text("Poop Rate: " + critter.excretionRate.toFixed(2), overlay.w / 24, 2 * overlay.h / 24 + overlay.h / 4);
    // infoGraphics.text("Poop Timer: " + critter.excretionTimer, overlay.w / 24, 3 * overlay.h / 24 + overlay.h / 4);
    //space then donation stats
    infoGraphics.text("1: " + critter.donations[0].target + " -- donated: " + critter.donations[0].total.toFixed(2), overlay.w / 24, 4 * overlay.h / 24 + overlay.h / 4);
    infoGraphics.text("2: " + critter.donations[1].target + " -- donated: " + critter.donations[1].total.toFixed(2), overlay.w / 24, 5 * overlay.h / 24 + overlay.h / 4);
    infoGraphics.text("Min Life b4 Donation: " + critter.minLifeToDonate.toFixed(2), overlay.w / 24, 6 * overlay.h / 24 + overlay.h / 4);
    // infoGraphics.text("Donation Timer: " + (floor(critter.donationRate) - critter.donationTimer), overlay.w / 24, 8 * overlay.h / 24 + overlay.h / 4);
    infoGraphics.text("Donation Percentage: " + critter.donationPercentage.toFixed(2) * 100 + "%", overlay.w / 24, 7 * overlay.h / 24 + overlay.h / 4);
    //space then mate stats
    infoGraphics.text("Min Life b4 Mate: " + critter.minLifeToReproduce.toFixed(2), overlay.w / 24, 9 * overlay.h / 24 + overlay.h / 4);
    // infoGraphics.text("Mate Timer: " + critter.mateTimer.toFixed(2), overlay.w / 24, 12 * overlay.h / 24 + overlay.h / 4);
    infoGraphics.text("Inheritance Percentage: " + critter.parentalSacrifice.toFixed(2) * 100 + "%", overlay.w / 24, 10 * overlay.h / 24 + overlay.h / 4);
    infoGraphics.text("Num Offspring: " + critter.offspring.length, overlay.w / 24, 11 * overlay.h / 24 + overlay.h / 4);
    
    //space then parents -- ooh draw!
    // infoGraphics.fill(critterColor); //parentcolor?
    //first gen vs children
    infoGraphics.textAlign(CENTER);
    infoGraphics.text("PARENTS:", overlay.w / 2, 19 * overlay.h / 24)
    if (critter.ancestry.parents.length == 1) {
        infoGraphics.text(critter.ancestry.parents[0].name, overlay.w / 2, 10 * overlay.h / 12);
        infoGraphics.image(godIcon, overlay.w / 2, 11 * overlay.h / 12, 80, 80);
    } else {
        infoGraphics.text(critter.ancestry.parents[0].name, overlay.w / 4, 10 * overlay.h / 12);
        infoGraphics.fill(critter.ancestry.parents[0].color[0] * 255, critter.ancestry.parents[0].color[1] * 255, critter.ancestry.parents[0].color[2] * 255);
        infoGraphics.ellipse(overlay.w / 4, 11 * overlay.h / 12, critter.ancestry.parents[0].r);
        // infoGraphics.fill(critterColor);
        infoGraphics.fill(0);
        infoGraphics.text(critter.ancestry.parents[1].name, 3 * overlay.w / 4, 10 * overlay.h / 12);
        infoGraphics.fill(critter.ancestry.parents[1].color[0] * 255, critter.ancestry.parents[1].color[1] * 255, critter.ancestry.parents[1].color[2] * 255);
        infoGraphics.ellipse(3 * overlay.w / 4, 11 * overlay.h / 12, critter.ancestry.parents[1].r);

    }

    //make sure overlay is not off screen
    if(overlay.position.x <= overlay.w / 2) {overlay.position.x = overlay.w / 2 + 20};
    if(overlay.position.x >= width - overlay.w / 2) {overlay.position.x = width - overlay.w / 2 - 20};
    if(overlay.position.y <= overlay.h / 2) {overlay.position.y = overlay.h / 2 + 20};
    if(overlay.position.y >= height - overlay.h / 2) {overlay.position.y = height - overlay.h / 2 - 20};

    //draw overlay to canvas
    image(infoGraphics, overlay.position.x, overlay.position.y);
}