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
    // console.log("stats: ");
    // console.log(update);
    stats.critterCount = update.critterCount;
    stats.worldLife = update.worldLife;
});

socket.on('clickInfo', (data) => {
    console.log(data.critter)
    if (data.client == socket.id && data.critter != undefined) {
        // console.log('info received');
        // infoDiv.show();
        // textAlign("CENTER")
        // ellipseMode("CENTER");
        

        //ugh have to convert to relative coords?...
        overlay.x = data.position.x;
        overlay.y = data.position.y;
        overlay.critter = data.critter;

        // infoGraphics.textAlign(CENTER);
        // infoGraphics.noStroke();
        // // infoGraphics.clear();
        // // infoGraphics.background(data.critter.color[0], data.critter.color[1], data.critter.color[2])
        // infoGraphics.background(200, 100);
        // // infoGraphics.fill(255,255,255);
        // infoGraphics.fill(0,0,0);
        // // infoGraphics.textSize(20);
        // infoGraphics.text(data.critter.name, overlay.w/2, overlay.y - overlay.h/2 + 20); //this bad too TODO fix
        // // infoGraphics.background(data.critter.color);
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
// let infoDiv;
let infoGraphics;
// let overlayWidth = 200;
// let overlayHeight = 200;
let overlay = {
    w: 200,
    h: 200,
    x: 0,
    y: 0,
    critter: {name: 'placeholder', color: [0, 0, 0]}
}
let isDisplayingInfo = false;


//assets
function preload(){
    monitor.shape = loadImage("assets/rounded_rectangle.png"); 
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

    // infoDiv = createDiv('test')
    // .position(width/2, height/2)
    // .id('infoDiv');

    infoGraphics = createGraphics(overlay.w, overlay.h);
    
    // .parent('infoDiv')
    // .background(255,0,122);
}

function draw() {
    background(200, 240, 255);
    
    monitorFunds();
    drawEcosystem(); //switching order so panel doesn't cover up
    displayStats();
    displayInfoOverlay();
}

function mousePressed(){
    //just getting rid of overlay with click for now
    // infoDiv.hide();
    // isDisplayingInfo = false;
    if (mouseX > 50 && mouseX < width - 50 &&
        mouseY > 50 && mouseY < height - 50 && isFoodSprinkleOn){ //for food sprinkle
            console.log("food sprinkle");
            socket.emit("newFood", {position: {x: mouseX, y: mouseY}});
    } else { 
        //for checking critter info
        if (isDisplayingInfo) {
            isDisplayingInfo = false;
            // infoGraphics.clear();
        } else {
            socket.emit("clickInfo", {position: {x: mouseX, y: mouseY}});
            // isDisplayingInfo = true;
        }
        // socket.emit("clickInfo", {position: {x: mouseX, y: mouseY}});
        // isDisplayingInfo = true;
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
        //radius mapping
        // let mappedR = map(critter.r, 0, 1, 5, 50);
        
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
    });
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

function displayInfoOverlay(){
    infoGraphics.clear();
    infoGraphics.textAlign(CENTER);
    infoGraphics.noStroke();
    // infoGraphics.clear();
    // infoGraphics.background(200, 100);
    // infoGraphics.fill(255,255,255);
    
    infoGraphics.background(overlay.critter.color[0] * 255, overlay.critter.color[1] * 255, overlay.critter.color[2] * 255, 100);
    infoGraphics.fill(0);
    infoGraphics.textSize(20);
    infoGraphics.text(overlay.critter.name, overlay.w / 2, overlay.h / 2); //this bad too TODO fix

    // infoGraphics.text(overlay.critter.name, overlay.w/2, overlay.y - overlay.h/2 + 20); //this bad too TODO fix
    
    if (isDisplayingInfo) {
        image(infoGraphics, overlay.x, overlay.y);
    } else {
        // console.log('?')
    }
}