//for the critter creation menu

//no idea why the DOM stuff is weird in instance mode -- TODO find out why relative height is backwards?

let creationSketch = function(p) {
    // let critterSizeMax = 50; //TODO where should I declare this globally? rn it's critter.js line 103
    //top left
    let nameInput, godInput;
    let startingLifeSlider, startingLife;

    //top middle
    let speedCheckbox;
    let critterDisplay = {
        x: 0,
        y: 0,
        speed: 1.5,
        dir: 1,
        // color: color(255, 0, 255),
        show: function() {
            if(speedCheckbox.checked()){
                this.speed = p.map(bodySlider.xVal, 0, 1, 0, 500) / 100;
                if (this.x > 2 * p.width / 3 || this.x < p.width / 3) {
                    this.dir *= -1;
                }
                this.x += this.speed * this.dir;
            } else {
                this.x = p.width / 2;
                this.y = p.height / 4;
            }
            // p.fill(this.color);
            let critterCol = colorPicker.color();
            // console.log(critterCol.levels[0]);
            let lifeForce = p.color(critterCol.levels[0], critterCol.levels[1], critterCol.levels[2], 100);
            // console.log(lifeForce);
            p.fill(lifeForce);
            let critterR = map(bodySlider.yVal, 0, 1, 5, 50);
            p.ellipse(this.x, this.y, critterR + map(startingLifeSlider.value(), 0, 10, 0, 4 * critterR));
            p.fill(critterCol);
            p.ellipse(this.x, this.y, p.map(bodySlider.yVal, 0, 1, 5, 50));
        }
    }
    //top right
    let colorPicker;

    //bottom left
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
            p.fill(150, 100);
            p.rect(this.xCenter, this.yCenter, this.w, this.h, 10); //rounded corners
            
            //axes(?)
            p.stroke(0,100);
            p.line(this.xCenter - this.w / 2, this.yCenter, this.xCenter + this.w / 2, this.yCenter);
            p.line(this.xCenter, this.yCenter - this.h / 2, this.xCenter, this.yCenter + this.h / 2);
            
            //category images slightly faded
            let highlight = 100;
            if (this.xVal < .5 && this.yVal < .5) {
                highlight = 255
            }
            p.tint(255, highlight);
            p.image(snail, this.xCenter - this.w / 4, this.yCenter + this.h / 4);
            if (this.xVal < .5 && this.yVal > .5) {
                highlight = 255;
            } else {
                highlight = 100;
            }
            p.tint(255, highlight);
            p.image(elephant, this.xCenter - this.w / 4, this.yCenter - this.h / 4);
            if (this.xVal > .5 && this.yVal > .5) {
                highlight = 255;
            } else {
                highlight = 100;
            }
            p.tint(255, highlight);
            p.image(leopard, this.xCenter + this.w / 4, this.yCenter - this.h / 4);
            if (this.xVal > .5 && this.yVal < .5) {
                highlight = 255;
            } else {
                highlight = 100;
            }
            p.tint(255, highlight);
            p.image(rabbit, this.xCenter + this.w / 4, this.yCenter + this.h / 4);

            //indicator ellipse
            p.stroke(0);
            p.fill(255);
            p.ellipse(this.xPos, this.yPos, this.w / 12);

            //poop slider
            let poopY = this.yCenter + 3 * this.h / 5;
            p.stroke(100);
            p.line(this.xCenter - this.w / 2, poopY, this.xCenter + this.w / 2, poopY);
            let dogPoopX = map(this.xVal + this.yVal, 0, 2, this.xCenter - this.w / 2, this.xCenter + this.w / 2);
            let poopSize = map(this.xVal + this.yVal, 0, 2, 20, 50);
            p.tint(255, 255);
            p.image(dogPoop, dogPoopX, poopY, poopSize, poopSize);  
        }
    };

    //bottom middle

    //bottom right

    //preload assets
    p.preload = function() {
        //icons from icons8.com  
        snail = p.loadImage("assets/snail.png");
        elephant = p.loadImage("assets/elephant.png");
        leopard = p.loadImage("assets/leopard.png");
        rabbit = p.loadImage("assets/rabbit.png");
        dogPoop = p.loadImage("assets/dogPoop.png");
    }

    //setup and draw
    p.setup = function() {
        //should do class / divs? should learn css...
        p.createCanvas(1500, 800);
        p.ellipseMode(CENTER);
        p.rectMode(CENTER);
        p.imageMode(CENTER);
        p.textAlign(CENTER, CENTER);

        //top left
        startingLifeSlider = p.createSlider(.01, 10, .80, .01)
            .position(p.width / 50, -3 * p.height / 5)
            .size(3 * p.width / 10, 40)
            .parent("critterCreation")
            .style("position", "relative");

        //top middle
        critterDisplay.x = p.width / 2;
        critterDisplay.y = p.height / 4;
        speedCheckbox = p.createCheckbox("show speed", true)
            .position(p.width / 2, -19 * p.height / 20) //WTF why is it relative to bottom???
            .parent("critterCreation")
            .style("position", "relative");
            // .style("margin", "auto");

        //top right
        colorPicker = p.createColorPicker('#22AAFF')
            .position(3 * p.width / 4, -5 * p.height / 6)
            .size(200, 100)
            .parent("critterCreation")
            .style("position", "relative");

        //bottom left
        bodySlider.xCenter = p.width / 6;
        bodySlider.yCenter = 3 * p.height / 4;
        bodySlider.w = p.width / 6;
        bodySlider.h = p.width / 6; //square for now
        bodySlider.xPos = bodySlider.xCenter;
        bodySlider.yPos = bodySlider.yCenter;

        //bottom middle


        //bottom right

    
    };

    p.draw = function() {
        p.background(200, 255, 200);
        
        //top left -- Names
        p.textAlign(LEFT);
        p.textSize(40);
        p.noStroke();
        p.fill(0);
        p.text(`Starting Life: $${startingLifeSlider.value()}`, p.width / 50, 4 * p.height / 10);

        //top middle -- critter display
        critterDisplay.show();

        //top right -- color picker
        // p.fill(colorPicker.color());
        // p.ellipse(3 * p.width / 4, p.height / 4, 100, 100);

        //bottom left -- body slider
        bodySlider.show();

        //bottom middle -- donations

        //bottom right -- sex
        

        //trying to fix bug where critter doesn't show
        // console.log(critterDisplay.x);
        if (isNaN(critterDisplay.x)) {
            console.log('no critter, resetting');
            // p.reset();
            critterDisplay.x = p.width / 2;
            critterDisplay.y = p.height / 4;
        }
    };

    p.mouseDragged = function() {
        //for 2d slider
        if(p.mouseX >= bodySlider.xCenter - bodySlider.w / 2 &&
            p.mouseX <= bodySlider.xCenter + bodySlider.w / 2 &&
            p.mouseY >= bodySlider.yCenter - bodySlider.h / 2 &&
            p.mouseY <= bodySlider.yCenter + bodySlider.h / 2) {
                bodySlider.xPos = p.mouseX;
                bodySlider.yPos = p.mouseY;
                bodySlider.xVal = map(bodySlider.xPos, bodySlider.xCenter - bodySlider.w / 2, bodySlider.xCenter + bodySlider.w / 2, 0, 1);
                bodySlider.yVal = map(bodySlider.yPos, bodySlider.yCenter - bodySlider.h / 2, bodySlider.yCenter + bodySlider.h / 2, 1, 0);
            }
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