//for the critter creation menu

let creationInstance = function(c) { //should change to c?
    //all normal coords are p5 canvas coords,
    //but all DOM elements are page coords, which are the same as the canvas coords but with Y + 135
    let pageOffset = page.height / 8; //wait no idea whats happening... is it something with the pos of the parents???
    let fontLarge, fontMedium, fontSmall;

    //top left && bottom left
    let nameInput, godInput;
    let primarySelect, secondarySelect, primaryInput, secondaryInput, lastPrimary, lastSecondary;
    let otherPrimary, otherSecondary;
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
            let poopY = this.yCenter + 3.5 * this.h / 5;
            c.stroke(200);
            c.line(this.xCenter - this.w / 2, poopY, this.xCenter + this.w / 2, poopY);
            let dogPoopX = c.map(this.xVal + this.yVal, 0, 2, this.xCenter - this.w / 2, this.xCenter + this.w / 2);
            let poopSize = c.map(this.xVal + this.yVal, 0, 2, 20, 50);
            c.tint(255, 255);
            c.image(dogPoop, dogPoopX, poopY, poopSize, poopSize); 
            c.fill(0);
            c.noStroke();
            c.textSize(fontSmall);
            c.textAlign(c.LEFT, c.CENTER);
            c.text("Poops Rarely", this.xCenter - this.w / 2, this.yCenter + 4 * this.h / 5);
            c.textAlign(c.RIGHT, c.CENTER);
            c.text("Poops Often", this.xCenter + this.w / 2, this.yCenter + 4 * this.h / 5);
        }
    };

    //bottom right
    let creationButton;
    let startLife, equTax, totalCost, fundsAfter;
    let genTax = 0.05;

    //confirmation menu
    let confirmationMenu;

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
        // c.createSpan()
        //     .id("confirmationSpan")
        //     .parent("creationCanvas");

        //top left && bottom left
        nameInput = c.createInput(newCritter.name)
            .parent("creationSpan")
            .position(c.width / 16, 1.25 * c.height / 9)
            .size(2 * c.width / 16, .25 * c.height / 9)
            .class("whitebox")
            .input(() => { 
                //tried reset, nvm couldn't backspace all the way
                //limiting length
                if (nameInput.value().length > 30){
                    let newVal = nameInput.value().substr(0,30);
                    nameInput.value(newVal);
                }
            })
        godInput = c.createInput(newCritter.ancestry.parents[0].name)
            .parent("creationSpan")
            .position(c.width / 16, 2.5 * c.height / 9)
            .size(2 * c.width / 16, .25 * c.height / 9)
            .class("whitebox")
            .input(() => { 
                //tried reset, nvm couldn't backspace all the way
                //limiting length
                if (godInput.value().length > 30){ // is this racist? how long can usernames be?
                    let newVal = godInput.value().substr(0,30);
                    godInput.value(newVal);
                }
            })
        // primarySelectHolder = c.createSpan()
        //     .class("select-holder")
        //     .parent("creationSpan")
        //     .id("p-holder")
        primarySelect = c.createSelect()
            .id("primarySelect")
            .position(c.width / 16, 4 * c.height / 9)
            .size(3 * c.width / 16, .25 * c.height / 9)
            .parent("creationSpan")
            // .parent("p-holder")
            .class("whitebox")
            // .style("size", "6")
            // .class("select")
            // .option("other")
            .changed(primaryUpdate);
            //okay need to figure out how to limit size of dropdown, initial google didn't help
        // primarySelect.elt.addEventListener("mousedown", () => {
        //     console.log(primarySelect.elt.options.length);
        //     if(primarySelect.elt.options.length>6){
        //         primarySelect.elt.style.size = 6;
        //         // primarySelect.style("size", "6");
        //     }
        // })
        secondarySelect = c.createSelect()
            .id("secondarySelect")
            .position(c.width / 16, 6 * c.height / 9)
            .size(3 * c.width / 16, .25 * c.height / 9)
            .parent("creationSpan")
            .class("whitebox")
            .changed(secondaryUpdate);
        // console.log(conduitData);
        // let targets = Object.keys(conduitData);
        // for (let [i, target] of targets.entries()) {
        for (let org of ecosystemSketch.donations.sorted) {
            let target = org.target;
            primarySelect.option(target);
            secondarySelect.option(target);
            if (target == newCritter.donations[0].target) {
                primarySelect.selected(target);
                lastPrimary = target;
                secondarySelect.disable(target);
            }
            if (target == newCritter.donations[1].target) {
                secondarySelect.selected(target);
                lastSecondary = target;
                primarySelect.disable(target);
            }
            // if (i == 0) {
            //     primarySelect.selected(target);
            //     lastPrimary = target;
            //     secondarySelect.disable(target);
            // }
            // if (i == 1) {
            //     secondarySelect.selected(target);
            //     lastSecondary = target;
            //     primarySelect.disable(target);
            // }
        }
        primarySelect.option("other");
        secondarySelect.option("other");
        otherPrimary = c.createInput("Enter new non-profit")
            .id("otherPrimary")
            .parent("creationSpan")
            .position(c.width / 16, 4.5 * c.height / 9)
            .size(3 * c.width / 16, .25 * c.height / 9)
            .class("whitebox")
            .hide();
        otherSecondary = c.createInput("Enter new non-profit")
            .id("otherSecondary")
            .parent("creationSpan")
            .position(c.width / 16, 6.5 * c.height / 9)
            .size(3 * c.width / 16, .25 * c.height / 9)
            .class("whitebox")
            .hide();
        startingLifeSlider = c.createSlider(.01, userData.funds, newCritter.life, .01)
            .position(c.width / 16, 8 * c.height / 9)
            .size(3 * c.width / 16, .25 * c.height / 9)
            .parent("creationSpan");

        //top middle
        critterDisplay.x = 8 * c.width / 16;
        critterDisplay.y = 3 * c.height / 9;
        // let defaultColor = c.color(newCritter.color[0], newCritter.color[1], newCritter.color[2])
        //need to get color now that it's being set as a string ohh wait can use string in color constructor! but not the way toString formats it?? that's so fucking dumb, or wait, just need to specify
        c.push();
        c.colorMode(c.HSL);
        // let hslColor = [];
        // let colorString = newCritter.color.substr(4, newCritter.color.length); //cut the hsl( from beginning
        // let commaIndex = colorString.indexOf(",");
        // hslColor[0] = parseFloat(colorString.substr(0, commaIndex));
        // colorString = colorString.substr(commaIndex + 1, colorString.length);
        // commaIndex = colorString.indexOf(",");
        // hslColor[1] = parseFloat(colorString.substr(0, commaIndex));
        // colorString = colorString.substr(commaIndex + 1, colorString.length);
        // hslColor[2] = parseFloat(colorString.substr(0, colorString.length - 1)); //just cutting off last )
        // let normalizedColor = [D.map(hslColor[0], 0, 360, 0, 1), D.map(hslColor[1], 0, 100, 0, 1), D.map(hslColor[2], 0, 100, 0, 1)];
        // this.DNA.color = normalizedColor;
        let hslColor = c.color(newCritter.colorPicker);
        // console.log(hslColor);
        colorPicker = c.createColorPicker(hslColor) //issue now that this is a string....
            .position(7 * c.width / 16, .5 * c.height / 9)
            .size(2 * c.width / 16, c.height / 9)
            .parent("creationSpan");
        c.pop();
        //bottom middle
        //not sure if millis is the right rate for cooldown, seems to be 100 per second
        donationCooldownSlider = c.createSlider(1000, 360000, newCritter.donationRate, 1000)
            .parent("creationSpan")
            .position(7.75 * c.width / 16, 5.1 * c.height / 9)
            .size(2.5 * c.width / 16, .25 * c.height / 9)
        donationPercentageSlider = c.createSlider(.01, 1, newCritter.donationPercentage, .01)
            .parent("creationSpan")
            .position(7.75 * c.width / 16, 5.6 * c.height / 9)
            .size(2.5 * c.width / 16, .25 * c.height / 9)
        donationMinLifeSlider = c.createSlider(.01, 5, newCritter.minLifeToDonate, .01)
            .parent("creationSpan")
            .position(7.75 * c.width / 16, 6.1 * c.height / 9)
            .size(2.5 * c.width / 16, .25 * c.height / 9)
        matingCooldownSlider = c.createSlider(1000, 360000, newCritter.refractoryPeriod, 1000)
            .parent("creationSpan")
            .position(7.75 * c.width / 16, 7.1 * c.height / 9)
            .size(2.5 * c.width / 16, .25 * c.height / 9)
        matingPercentageSlider = c.createSlider(.01, 1, newCritter.parentalSacrifice, .01)
            .parent("creationSpan")
            .position(7.75 * c.width / 16, 7.6 * c.height / 9)
            .size(2.5 * c.width / 16, .25 * c.height / 9)
        matingMinLifeSlider = c.createSlider(.01, 5, newCritter.minLifeToReproduce, .01)
            .parent("creationSpan")
            .position(7.75 * c.width / 16, 8.1 * c.height / 9)
            .size(2.5 * c.width / 16, .25 * c.height / 9)

        //top right
        bodySlider.xCenter = 13.5 * c.width / 16;
        bodySlider.yCenter = 2 * c.height / 9;
        bodySlider.w = 3 * c.width / 16;
        bodySlider.h = 3 * c.width / 16; //square for now
        bodySlider.xVal = newCritter.maxSpeed;
        bodySlider.yVal = newCritter.r;
        bodySlider.xPos = c.map(newCritter.maxSpeed, 0, 1, bodySlider.xCenter - bodySlider.w / 2, bodySlider.xCenter + bodySlider.w / 2);
        bodySlider.yPos = c.map(newCritter.r, 1, 0, bodySlider.yCenter - bodySlider.h / 2, bodySlider.yCenter + bodySlider.h / 2);
        // bodySlider.xPos = bodySlider.xCenter;
        // bodySlider.yPos = bodySlider.yCenter;

        //bottom right
        creationButton = c.createButton("CREATE CRITTER")
            .class("button")
            .parent("creationSpan")
            .position(13.25 * c.width / 16, 7.25 * c.height / 9)
            .size(2 * c.width / 16, c.height / 9)
            .mousePressed(c.createCritter);

        //confirmation menu
        // confirmationMenu = c.createGraphics(page.width, page.height)
        //     .parent("confirmationSpan")
        //     .background(21, 96, 100, 150)
        //     .hide();
        // confirmationMenu.createButton("ABORT")
        //     .parent("confirmationSpan")
        //     .class("button")
        //     .position(7 * c.width / 16, 8 * c.height / 9)
        //     .mousePressed(cancelCreate);
    };

    c.draw = () => {
        c.clear();
        // c.background(200, 255, 200, 225); //light green
        c.background(102, 113, 18); //changing to solid for now for better pop and no clutter from underneath text

        //text stuff
        c.textAlign(c.LEFT, c.CENTER);
        c.noStroke();
        
        //top left && bottom left
        c.fill(0);
        c.textSize(fontLarge);
        c.textAlign(c.LEFT, c.CENTER);
        c.text(`${nameInput.value()}`, .5 * c.width / 16, .75 * c.height / 9);
        c.text(`${godInput.value()}`, .5 * c.width / 16, 2 * c.height / 9);
        c.text("Donation Target A", .5 * c.width / 16, 3.5 * c.height / 9);
        c.text("Donation Target B", .5 * c.width / 16, 5.5 * c.height / 9);
        c.text(`Starting Life: $${startingLifeSlider.value()}`, .5 * c.width / 16, 7.5 * c.height / 9);

        //top middle
        critterDisplay.show();
        c.textSize(fontSmall);
        c.textAlign(c.CENTER, c.CENTER);
        c.text("Critter Color", 8 * c.width / 16, 1.75 * c.height / 9)

        //bottom middle
        c.fill(0);
        c.textSize(fontLarge);
        c.textAlign(c.LEFT, c.CENTER);
        c.text(`Giving`, 5.5 * c.width / 16, 4.75 * c.height / 9);
        drawCritter(6.5 * c.width / 16, 5.75 * c.height / 9, false, true)
        c.text(`Mating`, 5.5 * c.width / 16, 6.75 * c.height / 9);
        drawCritter(6.5 * c.width / 16, 7.75 * c.height / 9, true, false);

        c.textSize(fontSmall);
        c.text(`Donation Cooldown: ${donationCooldownSlider.value() / 100} seconds`, 7.75 * c.width / 16, 5 * c.height / 9);
        c.text(`Donation Percentage: ${donationPercentageSlider.value() * 100}%`, 7.75 * c.width / 16, 5.5 * c.height / 9);
        c.text(`Minimum Life Needed: $${donationMinLifeSlider.value()}`, 7.75 * c.width / 16, 6 * c.height / 9);
        c.text(`Mating Cooldown: ${matingCooldownSlider.value() / 100} seconds`, 7.75 * c.width / 16, 7 * c.height / 9);
        c.text(`Mating Percentage: ${matingPercentageSlider.value() * 100}%`, 7.75 * c.width / 16, 7.5 * c.height / 9);
        c.text(`Minimum Life Needed: $${matingMinLifeSlider.value()}`, 7.75 * c.width / 16, 8 * c.height / 9);
        
        //top right
        bodySlider.show();

        //bottom right
        c.fill(0);
        c.noStroke();
        c.textSize(fontSmall);
        c.textAlign(c.RIGHT, c.BOTTOM); //kind of doing this backwards...
        c.text(`Critter Starting Life:\nEquilibrium Tax:\nGenesis Tax:\nTotal Cost:\n\nAvailable Funds:\nFunds after Creation:`, 13.25 * c.width / 16, 7 * c.height / 9);
        // c.text(`Critter Starting Life:\nEquilibrium Tax:\nGenesis Tax:\nTotal Cost:\n\nAvailable Funds:\nFunds after Creation:`, 11 * c.width / 16, 5.5 * c.height / 9, 12.75 * c.width / 16, 7 * c.height / 9);
        c.textAlign(c.LEFT, c.BOTTOM);
        // let startLife = startingLifeSlider.value().toFixed(2);
        startLife = startingLifeSlider.value();
        equTax = startLife * .1;
        if(equTax < .1){equTax = .1};
        // equTax = equTax.toFixed(2);
        // genTax = 0.05;
        totalCost = (startLife + equTax + genTax).toFixed(2);
        fundsAfter = userData.funds.toFixed(2) - parseFloat(totalCost).toFixed(2); //no idea why toFixed isn't working as expected
        fundsAfter = fundsAfter.toFixed(2);
        c.text(`$${startLife.toFixed(2)}\n$${equTax.toFixed(2)}\n$${genTax}\n$${totalCost}\n\n$${userData.funds.toFixed(2)}\n$${fundsAfter}`, 13.75 * c.width / 16, 7 * c.height / 9);
        // c.text(`$${startLife.toFixed(2)}\n$${equTax.toFixed(2)}\n$${genTax}\n$${(startLife + equTax + genTax).toFixed(2)}\n\n$${userData.funds.toFixed(2)}\n$${(userData.funds - startLife - equTax - genTax).toFixed(2)}`, 13.75 * c.width / 16, 7 * c.height / 9);
        if(fundsAfter < 0) {
            creationButton.style("background-color", "red");
            creationButton.html("NOT ENOUGH FUNDS")
        } else {
            creationButton.style("background-color", "#156064");
            creationButton.html("CREATE CRITTER")
        }

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

    //fucking select bullshit, should make PR for p5 or something, ridiculous that you can't enable if you can disable
    function primaryUpdate(){
        let primaryOptions = c.select("#primarySelect");
        let secondaryOptions = c.select("#secondarySelect");
        for (let i = 0; i < primaryOptions.elt.length; i++) {
            if(primaryOptions.elt[i].value == lastPrimary){
                primaryOptions.elt[i].disabled = false;
            }
        }
        for (let j = 0; j < secondaryOptions.elt.length; j++) {
            if(secondaryOptions.elt[j].value == lastPrimary){
                secondaryOptions.elt[j].disabled = false;
            }
        }
        if(primarySelect.value() == "other"){
            c.select("#otherPrimary").show();
        } else {
            c.select("#otherPrimary").hide();
            secondarySelect.disable(primarySelect.value());
            lastPrimary = primarySelect.value();
        }
    }

    function secondaryUpdate(){
        let primaryOptions = c.select("#primarySelect");
        let secondaryOptions = c.select("#secondarySelect");
        for (let i = 0; i < primaryOptions.elt.length; i++) {
            if(primaryOptions.elt[i].value == lastSecondary){
                primaryOptions.elt[i].disabled = false;
            }
        }
        for (let j = 0; j < secondaryOptions.elt.length; j++) {
            if(secondaryOptions.elt[j].value == lastSecondary){
                secondaryOptions.elt[j].disabled = false;
            }
        }
        if(secondarySelect.value() == "other"){
            c.select("#otherSecondary").show();
        } else {
            c.select("#otherSecondary").hide();
            primarySelect.disable(secondarySelect.value());
            lastSecondary = secondarySelect.value();
        }
    }

    // function secondaryUpdate(){
    //     primarySelect.disable(secondarySelect.value());
    //     primarySelect.option(lastSecondary);
    //     secondarySelect.option(lastSecondary);
    //     lastSecondary = secondarySelect.value();
    // }

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
            c.text("✨", x + c.random(-100, 75), y + c.random(-80, 40));
        }
        c.pop();
    }
    
    c.createCritter = () => {
        // console.log('creating critter');
        //not doing confirmation pop up for now
        if (fundsAfter >= 0) {
            newCritter.name = nameInput.value();
            let targetA = primarySelect.value();
            let targetB = secondarySelect.value();
            if (targetA == "other"){targetA = otherPrimary.value()}
            if (targetB == "other"){targetB = otherSecondary.value()}
            newCritter.donations = [{target: targetA, total: 0},{target: targetB, total: 0}];
            // positionArray = [0,0]; //done in ecosystem
            newCritter.life = startingLifeSlider.value();
            newCritter.ancestry = {child: nameInput.value(), parents: [{name: godInput.value()}]};
            // color = colorPicker.color();
            // newCritter.color = colorPicker.value(); //hex now
            //HSL switch
            newCritter.color = colorPicker.color().toString("hsl");
            newCritter.colorPicker = colorPicker.color().toString("#rrggbb");
            // console.log(typeof newCritter.color);
            // console.log(newCritter.color);
            // console.log(newCritter.colorPicker);

            newCritter.maxSpeed = bodySlider.xVal;
            newCritter.r = bodySlider.yVal;
            newCritter.donationRate = donationCooldownSlider.value();
            newCritter.donationPercentage = donationPercentageSlider.value();
            newCritter.minLifeToDonate = donationMinLifeSlider.value();
            newCritter.refractoryPeriod = matingCooldownSlider.value();
            newCritter.parentalSacrifice = matingPercentageSlider.value();
            newCritter.minLifeToReproduce = matingMinLifeSlider.value();

            //update funds in mainSketch
            // userData.funds -= newCritter.life; //nvm only if placed

            //close menu and go back to ecosystem to plop down
            mainSketch.modeButton.html('Abort Critter');
            c.select("#creationSpan").hide();
            c.select("#defaultCanvas2").hide();
            ecosystemSketch.isReadyToSpawn = true;
            // document.getElementById("creationSpan").remove();
            // document.getElementById("defaultCanvas2").remove();
        } 
    }
};