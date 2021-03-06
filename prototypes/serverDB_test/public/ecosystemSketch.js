//no food, critter buttons now

let ecosystemInstance = function(e) {
    //have to add e. to variables we want to access globally
    e.ecosystem; //undefined at first so server set up works

    let monitor = {
        position: {x: 0, y: 0},
        size: {w: 0, h: 0},
        shape: null,
        overlay: 0
    };

    // e.funds = {
    //     sorted: []
    // };

    e.donations = {
        sorted: [],
        total: 0
    };
    
    e.stats = {
        critterCount: 0,
        worldLife: 0
    }
    
    //buttons
    e.isCreating = false;
    e.isReadyToSpawn = false;
    let notFirstClick = 0;
    
    //click Info overlay
    let infoGraphics;
    e.overlay = {
        w: 400,
        h: 800,
        position: {x: 0,y: 0},
        critter: {},
        textSize: 25
    }
    e.isDisplayingInfo = false;
    

    //assets
    let godIcon;
    e.preload = () => {
        monitor.shape = e.loadImage("assets/rounded_rectangle.png");
        godIcon = e.loadImage("assets/godIcon.jpg"); 
    }

    e.setup = () => {
        e.createCanvas(page.width, page.height);
        e.ellipseMode(e.CENTER);
        e.rectMode(e.CENTER);
        e.imageMode(e.CENTER);
        e.textAlign(e.CENTER);
        e.noStroke();

        monitor.size.w = e.width/8;
        monitor.size.h = e.height/3;
        monitor.position.x = e.width - monitor.size.w
        monitor.position.y = e.height - monitor.size.h

        infoGraphics = e.createGraphics(e.overlay.w, e.overlay.h);

        //scrollable donations list -- hmmm but this will cover the critters... should make collapsable
        let listWidth = e.width / 6 + "px";
        let listHeight = e.height / 3 + "px";

        //having issues with this not being declared in time
        // e.createDiv()
        //     .parent("ecosystemCanvas")
        //     .id("orgList")
        //     .position(7 * e.width / 8, 2 * e.height/3)
        //     .style("height", listHeight)
        //     .style("width", listWidth)
        //     .style("overflow", "scroll");

        //nvm don't need this because gets fundsUpdate on load?
        e.select("#orgList")
            .position(5 * e.width / 6, 2 * e.height/3)
            .style("height", listHeight)
            .style("width", listWidth)
            .style("overflow", "scroll");
        // e.createDiv(`TOTAL RAISED: $${parseFloat(e.donations.total.toFixed(2))}`)
        //     .parent("orgList")
        //     .class("orgDivs")
        // for (let org of e.donations.sorted) {
        //    e.createDiv(`${org.target}: $${parseFloat(org.funds.toFixed(2))}`)
        //     .parent("orgList")
        //     .class("orgDivs")
        // }
    }

    e.draw = () => {
        e.background(200, 240, 255);
        if(e.ecosystem != undefined){
            // e.monitorFunds(); //now only doing this when getting a funds update
            e.drawEcosystem(); //switching order so panel doesn't cover up
            e.displayStats();
            if (e.isReadyToSpawn) {
                // only shows after create Critter button pressed
                notFirstClick++;
                e.push();
                e.fill(0);
                e.noStroke();
                e.textAlign(e.CENTER, e.CENTER);
                e.textSize(e.height / 10);
                e.text("Click to Drop Critter into Ecosystem", e.width / 2 , e.height / 4)
                e.colorMode(e.HSL);
                e.fill(newCritter.color);
                // e.noStroke();
                e.ellipse(e.mouseX, e.mouseY, e.map(newCritter.r, 0, 1, 5, 50));
                e.pop();
            } else if(e.isDisplayingInfo) {
                e.displayInfoOverlay(e.overlay.critter)
            }
        } else {
            e.textSize(100);
            e.text("waiting for server to set up", e.width/2, e.height/2);
        }
    }

    e.mousePressed = () => {
        if (e.isReadyToSpawn && notFirstClick > 1) {
            //drops critter into scene if in bounds
            if(e.mouseX >= 10 &&
                e.mouseX <= e.width - 10 &&
                e.mouseY >= 10 &&
                e.mouseY <= e.height - 10) {
                    //send server the critter info
                    newCritter.positionArray = [e.mouseX, e.mouseY];
                    socket.emit("newCritter", newCritter);
                    //update user data in server -- for now just mainSketch obj
                    userData.funds -= parseFloat(newCritter.life.toFixed(2));
                    userData.funds = parseFloat(userData.funds.toFixed(2)); // i fucking hate this issue


                    //reset
                    e.isReadyToSpawn = false;
                    e.isCreating = false;
                    document.getElementById("defaultCanvas2").remove();
                    document.getElementById("creationSpan").remove();
                    document.getElementById("orgList").style.display = "inherit"; //brings back org list, no idea what the style it's inheriting is
                    mainSketch.modeButton.html("Create New Critter");
                    notFirstClick = 0;
                }
        } else { 
            //for checking critter info
            if (e.isDisplayingInfo) {
                e.isDisplayingInfo = false;
            } else {
                socket.emit("clickInfo", {position: {x: e.mouseX, y: e.mouseY}});
            }
        }
    }

    e.drawEcosystem = () => {
        //draw the corpses
        e.ecosystem.corpses.forEach( (corpse) => { //x,y,r,fade
            e.fill(255,255,255,corpse.fade);
            e.ellipse(corpse.position.x, corpse.position.y, corpse.r); 
        });    
    
        //draw the food
        e.ecosystem.supply.forEach( (food) => { //x,y,fade
            e.fill(0, food.fade);
            e.rect(food.position.x, food.position.y, 5);
        });
    
        //draw the critters
        e.ecosystem.critters.forEach( (critter) => { //position,r,color,life,isReadyToMate
            e.drawCritter(critter);
        });
    }

    e.drawCritter = (critter) => {
        //adding HSL color mode now
        e.push();
        e.colorMode(e.HSL, 360, 100, 100, 1);
        //for lifeForce aura
        // let fadedColor = e.color(critter.color[0] * 255, critter.color[1]  * 255, critter.color[2]  * 255, 100);
        let fadedColor = e.color(critter.color[0] * 360, critter.color[1]  * 100, critter.color[2]  * 100, 0.4); //alpha scale to 1 //hmm maybe not color issue?
        // console.log(fadedColor);
        e.fill(fadedColor);
        e.ellipse(critter.position.x, critter.position.y, critter.r + e.map(critter.life, 0, 5, 0, critter.r)); //ugh this was still set to earlier life range
        
        //show ring if ready to mate -- white HSL is 0, 0, 100
        e.noFill();
        if(critter.isReadyToMate){
            // e.stroke(255);
            e.stroke(0, 0, 100);
        }
        // e.ellipse(critter.position.x, critter.position.y, critter.r + e.map(critter.life, 0, 10, 0, critter.r / 2));
        // e.ellipse(critter.position.x, critter.position.y, 3 * critter.r / 4);
        e.ellipse(critter.position.x, critter.position.y, critter.r + e.map(critter.minLifeToReproduce, 0, 5, 0, critter.r));

    
        //base critter
        // let critCol = e.color(critter.color[0] * 255, critter.color[1] * 255, critter.color[2] * 255);
        let critCol = e.color(critter.color[0] * 360, critter.color[1]  * 100, critter.color[2]  * 100);

        e.fill(critCol);
        e.noStroke();
        e.ellipse(critter.position.x, critter.position.y, critter.r); 
        e.pop();
    }

    // let drawBaby = (critter) => {
    //     //for lifeForce aura
    //     // let fadedColor = e.color(critter.color[0] * 255, critter.color[1]  * 255, critter.color[2]  * 255, 100);
    //     // e.fill(fadedColor);
    //     // e.ellipse(critter.position.x, critter.position.y, critter.r + e.map(critter.life, 0, 100, 0, critter.r / 2));
        
    //     //show ring if ready to mate
    //     // e.noFill();
    //     // if(critter.isReadyToMate){
    //     //     e.stroke(255);
    //     // }
    //     // e.ellipse(critter.position.x, critter.position.y, critter.r + e.map(critter.life, 0, 200, 0, critter.r / 2));
    
    //     //base critter
    //     // let critCol = e.color(critter.color[0] * 255, critter.color[1] * 255, critter.color[2] * 255);
    //     e.fill(newCritter.color);
    //     e.noStroke();
    //     e.ellipse(mouseX, mouseY, newCritter.r); 
    // }

    e.monitorFunds = () => { 
        // console.log("monitor Funds")
        // for (let child of document.getElementById("orgList").children) {
        //     console.log(child);
        //     child.remove();
        // }
        //not sure why i can't just remove the children, weird dupe bugs, just removing whole thing and remaking
        if(!e.isCreating){ //had to put this here because fundsUpdate during creation would make it appear
            e.select("#orgList").remove();
            let listWidth = e.width / 6 + "px";
            let listHeight = e.height / 3 + "px";
            e.createDiv()
                .parent("ecosystemCanvas")
                .id("orgList")
                .class("scroll-hide")
                .position(5 * e.width / 6, 2 * e.height/3)
                .style("height", listHeight)
                .style("width", listWidth)
                .style("overflow", "scroll");
            e.createDiv(`TOTAL RAISED: $${parseFloat(e.donations.total.toFixed(2))}`)
                .parent("orgList")
                .class("orgDivs")
            e.createDiv(`&nbsp;`) //space after TOTAL -- should proabably use something else eventually (https://stackoverflow.com/questions/3416454/how-to-make-an-empty-div-take-space)
                .parent("orgList")
                .class("orgDivs")
            // for(let i = 0; i<10; i++) { //just for testing scroll -- eventually might need to show some other way that the list continues
            for (let org of e.donations.sorted) {
                e.createDiv(`${org.target}: $${parseFloat(org.funds.toFixed(2))}`)
                    .parent("orgList")
                    .class("orgDivs")
            }
        }
        // }
        /* OLD WAY
        //draw the shape background -- need to make this transparent somehow
        e.fill(0);
        e.textAlign(e.LEFT, e.CENTER);
    
        e.image(monitor.shape, monitor.position.x, monitor.position.y, monitor.size.w * 2, monitor.size.h * 2);
        let monitorOffset = {x: monitor.position.x - monitor.size.w + 20, y: monitor.position.y - monitor.size.h /2}
        let sectionSize = monitor.size.h / (e.donations.sorted.length + 1); //fence postttt
        e.textSize(sectionSize * 0.5);
        e.donations.sorted.forEach( (org) => {
            // e.text(org["target"] + ": $" + org["funds"], monitorOffset.x, monitorOffset.y);
            e.text(`${org["target"]}: $${parseFloat(org["funds"].toFixed(2))}`, monitorOffset.x, monitorOffset.y);
            
            monitorOffset.y += sectionSize; //better to use index?
        });
        // e.donations.sorted.forEach( (fund) => {
        //     e.text(fund[0] + ": $" + fund[1], monitorOffset.x, monitorOffset.y);
        //     monitorOffset.y += sectionSize; //better to use index?
        // });
        e.text("Total Donated: $" + parseFloat(e.donations.total).toFixed(2), monitorOffset.x, monitorOffset.y);
        */
    }

    e.displayStats = () => {
        e.fill(0);
        e.textSize(40);
        e.text(`My Funds: $${userData.funds}`, e.width / 4, e.height - 50);
        e.text("Critter Count: " + e.stats.critterCount, e.width/2, e.height - 50);
        e.text("Life in World: $" + parseFloat(e.stats.worldLife).toFixed(2), 3 * e.width/4, e.height - 50); //need to make sure it's a float everytime I want to round?
    }

    e.displayInfoOverlay = (critter) => {
        infoGraphics.push();
        infoGraphics.clear();
        infoGraphics.textAlign(e.CENTER);
        infoGraphics.noStroke();
        infoGraphics.imageMode(e.CENTER);
        e.colorMode(e.HSL);
        infoGraphics.colorMode(infoGraphics.HSL); //diff?
        let critterColor = e.color(critter.color[0] * 360, critter.color[1]  * 100, critter.color[2]  * 100);
        let fadedColor = e.color(critter.color[0] * 360, critter.color[1]  * 100, critter.color[2]  * 100, .4);
        // console.log(fadedColor);
        // let critterColor = e.color(critter.color[0] * 255, critter.color[1]  * 255, critter.color[2]  * 255);
        // let fadedColor = e.color(critter.color[0] * 255, critter.color[1]  * 255, critter.color[2]  * 255, 100);
        // let backgroundColor = color((1 - critter.color[0]) * 255, (1 - critter.color[1])  * 255, (1 - critter.color[2])  * 255, 100);
        // infoGraphics.background(backgroundColor);
        // infoGraphics.colorMode(e.RGB); //critter colors retain HSL but fills are still RGB? no apparently not? or was it error with the colormode in the first place?

        infoGraphics.colorMode(e.RGB);
        infoGraphics.background(255, 100);
        infoGraphics.colorMode(e.HSL);
    
        
        //name at top
        // infoGraphics.fill(critterColor);
        infoGraphics.fill(0, 0, 0);
        infoGraphics.textSize(e.overlay.textSize + 10);
        infoGraphics.text(critter.name, e.overlay.w / 2, e.overlay.h / 12);
    
        //critter display -- doubled radius of all for visibility
        //for lifeForce aura
        infoGraphics.fill(fadedColor);
        infoGraphics.ellipse(e.overlay.w / 2, e.overlay.h / 5, (critter.r + e.map(critter.life, 0, 5, 0, critter.r)) * 2);
        //show ring if ready to mate
        infoGraphics.noFill();
        if(critter.mateTimer >= critter.refractoryPeriod && critter.life >= critter.minLifeToReproduce){ //isReadyToMate
        //     infoGraphics.stroke(0, 0, 100);
        // }
        // if(critter.isReadyToMate){
            // e.stroke(255);
            infoGraphics.strokeWeight(4);
            infoGraphics.stroke(0, 0, 100);
        }
        // infoGraphics.ellipse(e.overlay.w / 2, e.overlay.h / 5, critter.r * 2 + e.map(critter.life, 0, 10, 0, critter.r));
        infoGraphics.ellipse(e.overlay.w / 2, e.overlay.h / 5, (critter.r + e.map(critter.minLifeToReproduce, 0, 5, 0, critter.r)) * 2);

        //base critter
        infoGraphics.fill(critterColor);
        infoGraphics.noStroke();
        infoGraphics.ellipse(e.overlay.w / 2, e.overlay.h / 5, critter.r * 2); 
    
        //critter stats
        infoGraphics.fill(0, 0, 0);
        infoGraphics.textAlign(e.LEFT, e.CENTER);
        infoGraphics.textSize(e.overlay.textSize);
        //life stats
        infoGraphics.text("LIFE: " + critter.life.toFixed(2), e.overlay.w / 24, e.overlay.h / 24 + e.overlay.h / 4);
        infoGraphics.text("Poop Rate: " + critter.excretionRate.toFixed(2), e.overlay.w / 24, 2 * e.overlay.h / 24 + e.overlay.h / 4);
        //space then donation stats
        infoGraphics.text("1: " + critter.donations[0].target + " -- donated: " + critter.donations[0].total.toFixed(2), e.overlay.w / 24, 4 * e.overlay.h / 24 + e.overlay.h / 4);
        infoGraphics.text("2: " + critter.donations[1].target + " -- donated: " + critter.donations[1].total.toFixed(2), e.overlay.w / 24, 5 * e.overlay.h / 24 + e.overlay.h / 4);
        infoGraphics.text("Min Life b4 Donation: " + critter.minLifeToDonate.toFixed(2), e.overlay.w / 24, 6 * e.overlay.h / 24 + e.overlay.h / 4);
        // infoGraphics.text("Donation Timer: " + (floor(critter.donationRate) - critter.donationTimer), e.overlay.w / 24, 8 * e.overlay.h / 24 + e.overlay.h / 4);
        infoGraphics.text("Donation Percentage: " + critter.donationPercentage.toFixed(2) * 100 + "%", e.overlay.w / 24, 7 * e.overlay.h / 24 + e.overlay.h / 4);
        //space then mate stats
        infoGraphics.text("Min Life b4 Mate: " + critter.minLifeToReproduce.toFixed(2), e.overlay.w / 24, 9 * e.overlay.h / 24 + e.overlay.h / 4);
        // infoGraphics.text("Mate Timer: " + critter.mateTimer.toFixed(2), e.overlay.w / 24, 12 * e.overlay.h / 24 + e.overlay.h / 4);
        infoGraphics.text("Inheritance Percentage: " + critter.parentalSacrifice.toFixed(2) * 100 + "%", e.overlay.w / 24, 10 * e.overlay.h / 24 + e.overlay.h / 4);
        infoGraphics.text("Num Offspring: " + critter.offspring.length, e.overlay.w / 24, 11 * e.overlay.h / 24 + e.overlay.h / 4);
        
        //space then parents -- ooh draw!
        // infoGraphics.fill(critterColor); //parentcolor?
        //first gen vs children
        infoGraphics.textAlign(e.CENTER);
        infoGraphics.text("PARENTS:", e.overlay.w / 2, 19 * e.overlay.h / 24)
        if (critter.ancestry.parents.length == 1) {
            infoGraphics.text(critter.ancestry.parents[0].name, e.overlay.w / 2, 10 * e.overlay.h / 12);
            infoGraphics.image(godIcon, e.overlay.w / 2, 11 * e.overlay.h / 12, 80, 80);
        } else {
            infoGraphics.text(critter.ancestry.parents[0].name, e.overlay.w / 4, 10 * e.overlay.h / 12);
            // infoGraphics.colorMode(e.HSL);
            infoGraphics.fill(critter.ancestry.parents[0].color[0] * 360, critter.ancestry.parents[0].color[1] * 100, critter.ancestry.parents[0].color[2] * 100);
            infoGraphics.ellipse(e.overlay.w / 4, 11 * e.overlay.h / 12, critter.ancestry.parents[0].r);
            // infoGraphics.fill(critterColor);
            infoGraphics.fill(0, 0, 0); //this is HSL
            infoGraphics.text(critter.ancestry.parents[1].name, 3 * e.overlay.w / 4, 10 * e.overlay.h / 12);
            infoGraphics.fill(critter.ancestry.parents[1].color[0] * 360, critter.ancestry.parents[1].color[1] * 100, critter.ancestry.parents[1].color[2] * 100);
            infoGraphics.ellipse(3 * e.overlay.w / 4, 11 * e.overlay.h / 12, critter.ancestry.parents[1].r);
            // infoGraphics.colorMode(e.RGB);
        }
    
        //make sure e.overlay is not off screen
        if(e.overlay.position.x <= e.overlay.w / 2) {e.overlay.position.x = e.overlay.w / 2 + 20};
        if(e.overlay.position.x >= e.width - e.overlay.w / 2) {e.overlay.position.x = e.width - e.overlay.w / 2 - 20};
        if(e.overlay.position.y <= e.overlay.h / 2) {e.overlay.position.y = e.overlay.h / 2 + 20};
        if(e.overlay.position.y >= e.height - e.overlay.h / 2) {e.overlay.position.y = e.height - e.overlay.h / 2 - 20};
    
        //draw e.overlay to canvas
        e.image(infoGraphics, e.overlay.position.x, e.overlay.position.y);
        e.colorMode(e.RGB); //whyyyyy
        infoGraphics.pop();
    }
}

/*
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
*/