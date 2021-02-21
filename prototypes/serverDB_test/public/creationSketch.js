//for the critter creation menu

let creationInstance = function(c) { //should change to c?
    //all normal coords are p5 canvas coords,
    //but all DOM elements are page coords, which are the same as the canvas coords but with Y + 135
    let pageOffset = page.height / 8; //wait no idea whats happening... is it something with the pos of the parents???
    let fontLarge, fontMedium, fontSmall;

    //top left && bottom left
    let nameInput, godInput;
    let primarySelect, secondarySelect, primaryInput, secondaryInput;
    let startingLifeSlider, startingLife;

    //top middle
    let critterDisplay = {
        x: 0,
        y: 0,
        speed: 1.5,
        dir: 1,
        show: function() {
            this.speed = c.map(bodySlider.xVal, 0, 1, 0, 500) / 100;
            if (this.x > 10 * c.width / 16 || this.x < 6 * c.width / 16) {
                this.dir *= -1;
            }
            this.x += this.speed * this.dir;
            drawCritter(this.x, this.y, false, false);
            // let critterCol = colorPicker.color();
            // let lifeForce = c.color(critterCol.levels[0], critterCol.levels[1], critterCol.levels[2], 100);
            // c.fill(lifeForce);
            // let critterR = c.map(bodySlider.yVal, 0, 1, 5, 50);
            // c.ellipse(this.x, this.y, critterR + c.map(startingLifeSlider.value(), 0, 10, 0, 4 * critterR));
            // c.fill(critterCol);
            // c.ellipse(this.x, this.y, c.map(bodySlider.yVal, 0, 1, 5, 50));
        }
    }
    let colorPicker;
    
    //bottom middle
    let donationCooldownSlider, donationPercentageSlider, donationMinLifeSlider;
    let matingCooldownSlider, matingPercentageSlider, matingMinLifeSlider;

    //top right
    let snail, elephant, leopard, rabbit;
    let bodySlider = {
        xPos: 0, //the position of the circle indicator
        yPos: 0,
        xVal: .5, //the slider values
        yVal: .5,
        xCenter: 0, //sets the center of the slider object
        yCenter: 0,
        w: 0,
        h: 0,
        show: function() {
            //background rectangle
            // c.fill(150, 100);
            c.fill(45, 225, 194, 100);
            c.rect(this.xCenter, this.yCenter, this.w, this.h, 10); //rounded corners
            
            //axes(?)
            c.stroke(0,100);
            c.line(this.xCenter - this.w / 2, this.yCenter, this.xCenter + this.w / 2, this.yCenter);
            c.line(this.xCenter, this.yCenter - this.h / 2, this.xCenter, this.yCenter + this.h / 2);
            
            //category images slightly faded
            let highlight = 100;
            if (this.xVal < .5 && this.yVal < .5) {
                highlight = 255
            }
            c.tint(255, highlight);
            c.image(snail, this.xCenter - this.w / 4, this.yCenter + this.h / 4);
            if (this.xVal < .5 && this.yVal > .5) {
                highlight = 255;
            } else {
                highlight = 100;
            }
            c.tint(255, highlight);
            c.image(elephant, this.xCenter - this.w / 4, this.yCenter - this.h / 4);
            if (this.xVal > .5 && this.yVal > .5) {
                highlight = 255;
            } else {
                highlight = 100;
            }
            c.tint(255, highlight);
            c.image(leopard, this.xCenter + this.w / 4, this.yCenter - this.h / 4);
            if (this.xVal > .5 && this.yVal < .5) {
                highlight = 255;
            } else {
                highlight = 100;
            }
            c.tint(255, highlight);
            c.image(rabbit, this.xCenter + this.w / 4, this.yCenter + this.h / 4);

            //indicator ellipse
            c.stroke(0);
            c.fill(255);
            c.ellipse(this.xPos, this.yPos, this.w / 12);

            //poop slider
            let poopY = this.yCenter + 3 * this.h / 5;
            c.stroke(100);
            c.line(this.xCenter - this.w / 2, poopY, this.xCenter + this.w / 2, poopY);
            let dogPoopX = c.map(this.xVal + this.yVal, 0, 2, this.xCenter - this.w / 2, this.xCenter + this.w / 2);
            let poopSize = c.map(this.xVal + this.yVal, 0, 2, 20, 50);
            c.tint(255, 255);
            c.image(dogPoop, dogPoopX, poopY, poopSize, poopSize);  
        }
    };

    //bottom right
    let creationButton;

    //preload assets
    c.preload = () => {
        //icons from icons8.com  
        snail = c.loadImage("assets/snail.png");
        elephant = c.loadImage("assets/elephant.png");
        leopard = c.loadImage("assets/leopard.png");
        rabbit = c.loadImage("assets/rabbit.png");
        dogPoop = c.loadImage("assets/dogPoop.png");
    }

    //setup and draw
    c.setup = () => {
        //overall canvas stuff
        c.createCanvas(page.width, page.height);
        c.ellipseMode(c.CENTER);
        c.rectMode(c.CENTER);
        c.imageMode(c.CENTER);
        c.textAlign(c.CENTER, c.CENTER);
        fontLarge = .5 * c.height / 9;
        // fontMedium = .25 * c.height / 9;
        fontSmall = .2 * c.height / 9;

        //creating container so easy to remove when getting rid of creation screen
        c.createSpan()
            .id("creationSpan")
            .parent("creationCanvas");
            // .size(c.width, c.height);

        //top left && bottom left
        nameInput = c.createInput('Critter Name')
            .parent("creationSpan")
            .position(c.width / 16, 1.25 * c.height / 9)
            .size(2 * c.width / 16, .25 * c.height / 9)
            // .input(() => { //just for reset, nvm couldn't backspace all the way
            //     if (nameInput.value() == ""){
            //         nameInput.value("Critter Name");
            //     }
            // })
        godInput = c.createInput('God\'s Name (Yours)')
            .parent("creationSpan")
            .position(c.width / 16, 2.25 * c.height / 9)
            .size(2 * c.width / 16, .25 * c.height / 9)
        primarySelect = c.createSelect()
            .position(c.width / 16, 4 * c.height / 9)
            .size(3 * c.width / 16, .25 * c.height / 9)
            .parent("creationSpan")
            .changed(selectChange);
        secondarySelect = c.createSelect()
            .position(c.width / 16, 6 * c.height / 9)
            .size(3 * c.width / 16, .25 * c.height / 9)
            .parent("creationSpan")
            .changed(selectChange);
        startingLifeSlider = c.createSlider(.01, 10, .80, .01)
            .position(c.width / 16, 8 * c.height / 9)
            .size(3 * c.width / 16, .25 * c.height / 9)
            .parent("creationSpan");

        //top middle
        critterDisplay.x = 8 * c.width / 16;
        critterDisplay.y = 1.5 * c.height / 9;
        colorPicker = c.createColorPicker('#22AAFF')
            .position(7 * c.width / 16, 3 * c.height / 9)
            .size(2 * c.width / 16, c.height / 9)
            .parent("creationSpan");

        //bottom middle
        donationCooldownSlider = c.createSlider(10000, 3600000, 300000, 10000)
            .parent("creationSpan")
            .position(7.75 * c.width / 16, 5.1 * c.height / 9)
            .size(2.5 * c.width / 16, .25 * c.height / 9)
        donationPercentageSlider = c.createSlider(.01, 1, .5, .01)
            .parent("creationSpan")
            .position(7.75 * c.width / 16, 5.6 * c.height / 9)
            .size(2.5 * c.width / 16, .25 * c.height / 9)
        donationMinLifeSlider = c.createSlider(.01, 5, .5, .01)
            .parent("creationSpan")
            .position(7.75 * c.width / 16, 6.1 * c.height / 9)
            .size(2.5 * c.width / 16, .25 * c.height / 9)
        matingCooldownSlider = c.createSlider(10000, 3600000, 300000, 10000)
            .parent("creationSpan")
            .position(7.75 * c.width / 16, 7.1 * c.height / 9)
            .size(2.5 * c.width / 16, .25 * c.height / 9)
        matingPercentageSlider = c.createSlider(.01, 1, .5, .01)
            .parent("creationSpan")
            .position(7.75 * c.width / 16, 7.6 * c.height / 9)
            .size(2.5 * c.width / 16, .25 * c.height / 9)
        matingMinLifeSlider = c.createSlider(.01, 5, .5, .01)
            .parent("creationSpan")
            .position(7.75 * c.width / 16, 8.1 * c.height / 9)
            .size(2.5 * c.width / 16, .25 * c.height / 9)

        //top right
        bodySlider.xCenter = 13 * c.width / 16;
        bodySlider.yCenter = 2.5 * c.height / 9;
        bodySlider.w = 3 * c.width / 16;
        bodySlider.h = 3 * c.width / 16; //square for now
        bodySlider.xPos = bodySlider.xCenter;
        bodySlider.yPos = bodySlider.yCenter;

        //bottom right
        creationButton = c.createButton("CREATE CRITTER")
            .class("button")
            .parent("creationSpan")
            .position(13.25 * c.width / 16, 7.25 * c.height / 9)
            .size(2 * c.width / 16, c.height / 9)
            .mousePressed(c.createCritter);
    };

    c.draw = () => {
        c.clear();
        c.background(200, 255, 200, 225);

        //text stuff
        c.textAlign(c.LEFT, c.CENTER);
        c.noStroke();
        
        //top left && bottom left
        c.fill(0);
        c.textSize(fontLarge);
        c.text(`${nameInput.value()}`, .5 * c.width / 16, c.height / 9);
        c.text(`${godInput.value()}`, .5 * c.width / 16, 2 * c.height / 9);
        c.text("Donation Target A", .5 * c.width / 16, 3.5 * c.height / 9);
        c.text("Donation Target B", .5 * c.width / 16, 5.5 * c.height / 9);
        c.text(`Starting Life: $${startingLifeSlider.value()}`, .5 * c.width / 16, 7.5 * c.height / 9);

        //top middle
        critterDisplay.show();

        //bottom middle
        c.fill(0);
        c.textSize(fontLarge);
        c.text(`Giving`, 5.5 * c.width / 16, 4.75 * c.height / 9);
        drawCritter(6.5 * c.width / 16, 5.75 * c.height / 9, false, true)
        c.text(`Mating`, 5.5 * c.width / 16, 6.75 * c.height / 9);
        drawCritter(6.5 * c.width / 16, 7.75 * c.height / 9, true, false);

        c.textSize(fontSmall);
        c.text(`Donation Cooldown: ${donationCooldownSlider.value() / 1000} seconds`, 7.75 * c.width / 16, 5 * c.height / 9);
        c.text(`Donation Percentage: ${donationPercentageSlider.value() * 100}%`, 7.75 * c.width / 16, 5.5 * c.height / 9);
        c.text(`Minimum Life Needed: $${donationMinLifeSlider.value()}`, 7.75 * c.width / 16, 6 * c.height / 9);
        c.text(`Mating Cooldown: ${matingCooldownSlider.value() / 1000} seconds`, 7.75 * c.width / 16, 7 * c.height / 9);
        c.text(`Mating Percentage: ${matingPercentageSlider.value() * 100}%`, 7.75 * c.width / 16, 7.5 * c.height / 9);
        c.text(`Minimum Life Needed: $${matingMinLifeSlider.value()}`, 7.75 * c.width / 16, 8 * c.height / 9);
        
        //top right
        bodySlider.show();

        //bottom right
        c.fill(0);
        c.textSize(fontSmall);
        c.textAlign(c.RIGHT, c.BOTTOM); //kind of doing this backwards...
        c.text(`Critter Starting Life:\nEquilibrium Tax:\nGenesis Tax:\nTotal Cost:\n\nAvailable Funds:\nFunds after Creation:`, 12.75 * c.width / 16, 7 * c.height / 9);
        // c.text(`Critter Starting Life:\nEquilibrium Tax:\nGenesis Tax:\nTotal Cost:\n\nAvailable Funds:\nFunds after Creation:`, 11 * c.width / 16, 5.5 * c.height / 9, 12.75 * c.width / 16, 7 * c.height / 9);
        c.textAlign(c.LEFT, c.BOTTOM);
        // let startLife = startingLifeSlider.value().toFixed(2);
        let startLife = startingLifeSlider.value();
        let equTax = startLife * .1;
        if(equTax < .1){equTax = .1};
        // equTax = equTax.toFixed(2);
        let genTax = 0.05;
        c.text(`$${startLife.toFixed(2)}\n$${equTax.toFixed(2)}\n$${genTax}\n$${(startLife + equTax + genTax).toFixed(2)}\n\n$${userData.funds.toFixed(2)}\n$${(userData.funds - startLife - equTax - genTax).toFixed(2)}`, 13.25 * c.width / 16, 7 * c.height / 9);


        //trying to fix bug where critter doesn't show
        if (isNaN(critterDisplay.x)) {
            console.log('no critter, resetting');
            critterDisplay.x = 8 * c.width / 16;
            critterDisplay.y = 1.5 * c.height / 9;
        }
    };

    c.mouseDragged = () => {
        //for 2d slider
        if(c.mouseX >= bodySlider.xCenter - bodySlider.w / 2 &&
            c.mouseX <= bodySlider.xCenter + bodySlider.w / 2 &&
            c.mouseY >= bodySlider.yCenter - bodySlider.h / 2 &&
            c.mouseY <= bodySlider.yCenter + bodySlider.h / 2) {
                bodySlider.xPos = c.mouseX;
                bodySlider.yPos = c.mouseY;
                bodySlider.xVal = c.map(bodySlider.xPos, bodySlider.xCenter - bodySlider.w / 2, bodySlider.xCenter + bodySlider.w / 2, 0, 1);
                bodySlider.yVal = c.map(bodySlider.yPos, bodySlider.yCenter - bodySlider.h / 2, bodySlider.yCenter + bodySlider.h / 2, 1, 0);
            }
    }

    function selectChange(){
        primarySelect.disable(secondarySelect.value());
        secondarySelect.disable(primarySelect.value());
    }

    function drawCritter(x, y, mating, giving){
        c.push();
        let critterCol = colorPicker.color();
        let lifeForce = c.color(critterCol.levels[0], critterCol.levels[1], critterCol.levels[2], 100);
        c.fill(lifeForce);
        let critterR = c.map(bodySlider.yVal, 0, 1, 5, 50);
        c.ellipse(x, y, critterR + c.map(startingLifeSlider.value(), 0, 10, 0, 4 * critterR));
        c.fill(critterCol);
        c.ellipse(x, y, c.map(bodySlider.yVal, 0, 1, 5, 50));
        if(mating){
            c.noFill();
            c.stroke(255);
            c.strokeWeight(4);
            c.ellipse(x, y, critterR + c.map(matingMinLifeSlider.value(), 0, 10, 0, 4 * critterR));
        }
        if(giving){
            c.textSize(fontSmall);
            c.text("✨", x + c.random(-100, 75), y + c.random(-80, 0));
        }
        c.pop();
    }
    
    c.createCritter = () => {
        console.log('creating critter');
    }
};

/* -- old way before switching to instance mode
let nameInput;

function setupCreation (menu) {
    nameInput = menu.createInput('critter name')
        .position(creationMenu.w/2, creationMenu.h / 20)
        .size(creationMenu.w/8, creationMenu.h/12)
        .attribute("title", "type critter name here");
}

function displayCreation (menu) {
    menu.clear();
    menu.background(200, 255, 200, 230);
    image(menu, width/2, height/2);
}
*/