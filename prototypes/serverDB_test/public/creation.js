//for the critter creation menu


let creationSketch = function(p) {

    let nameInput, godInput;
    let snail, elephant, tiger, rabbit;
    let speedCheckbox;
    // let critterSizeMax = 50; //TODO where should I declare this globally? rn it's critter.js line 103
    // p.preload = function() {
    //     snail = p.loadImage("assets/snail.png")
    //     elephant = p.loadImage("assets/elephant.png")
    //     tiger = p.loadImage("assets/tiger.png")
    //     rabbit = p.loadImage("assets/rabbit.png")
    // }

    let critterDisplay = {
        x: 0,
        y: 0,
        speed: 1.5,
        dir: 1,
        color: color(255, 0, 255),
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
            p.fill(this.color);
            p.ellipse(this.x, this.y, p.map(bodySlider.yVal, 0, 1, 5, 50));
        }
    }
    
    let bodySlider = {
        xPos: 0, //the position of the circle indicator
        yPos: 0,
        xVal: .5, //the slider values
        yVal: .5,
        xCenter: 0, //sets the center of the slider object
        yCenter: 0,
        w: 0,
        h: 0,
        show: function(){
            //background rectangle
            p.fill(150, 100);
            p.rect(this.xCenter, this.yCenter, this.w, this.h, 10); //rounded corners
            //axes(?)
            p.stroke(0,100);
            p.line(this.xCenter - this.w / 2, this.yCenter, this.xCenter + this.w / 2, this.yCenter);
            p.line(this.xCenter, this.yCenter - this.h / 2, this.xCenter, this.yCenter + this.h / 2);
            //category images slightly faded
            // p.tint(255, 150);
            // p.image(snail, this.xCenter - this.w / 4, this.yCenter + this.h / 4);
            // p.image(elephant, this.xCenter - this.w / 4, this.yCenter - this.h / 4);
            // p.image(tiger, this.xCenter + this.w / 4, this.yCenter - this.h / 4);
            // p.image(rabbit, this.xCenter + this.w / 4, this.yCenter + this.h / 4);
            //indicator ellipse
            p.stroke(0);
            p.fill(255);
            p.ellipse(this.xPos, this.yPos, this.w / 12);
        }
    };

    p.setup = function() {
        p.createCanvas(1500, 800);
        p.rectMode(CENTER);
        p.imageMode(CENTER);
        // gui = p.createGui();
        //left edge, top, right, bottom, minX, maxX, minY, maxY
        // bodySlider = createSlider2d("Body Slider", p.width / 24, 3 * p.height / 5, 5 * p.width / 24, 4 * p.height / 5, 0, 1, 0, 1);

        critterDisplay.x = p.width / 2;
        critterDisplay.y = p.height / 4;
        speedCheckbox = p.createCheckbox("show speed", true)
            .position(p.width / 2, -3 * p.height / 5) //WTF why is it relative to bottom???
            .parent("critterCreation")
            .style("position", "relative");

        bodySlider.xCenter = p.width / 6;
        bodySlider.yCenter = 3 * p.height / 4;
        bodySlider.w = p.width / 6;
        bodySlider.h = p.width / 6; //square for now
        bodySlider.xPos = bodySlider.xCenter;
        bodySlider.yPos = bodySlider.yCenter;
    };

    p.draw = function() {
        p.background(200, 255, 200);
        
        //top left -- Names

        //top middle -- critter display
        critterDisplay.show();

        //top right -- color picker

        //bottom left -- body slider
        bodySlider.show();

        //bottom middle -- donations

        //bottom right -- sex
        
    };

    p.mouseDragged = function() {
        if(p.mouseX >= bodySlider.xCenter - bodySlider.w / 2 &&
            p.mouseX <= bodySlider.xCenter + bodySlider.w / 2 &&
            p.mouseY >= bodySlider.yCenter - bodySlider.h / 2 &&
            p.mouseY <= bodySlider.yCenter + bodySlider.h / 2) {
                bodySlider.xPos = p.mouseX;
                bodySlider.yPos = p.mouseY;
                bodySlider.xVal = bodySlider.xPos / (bodySlider.w / 2 + bodySlider.xCenter);
                bodySlider.yVal = 1 - (bodySlider.yPos / (bodySlider.h / 2 + bodySlider.yCenter)); //inverse b/c goes to top right instead of bottom right
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