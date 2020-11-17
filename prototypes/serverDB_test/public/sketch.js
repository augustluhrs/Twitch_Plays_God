//open and connect the input socket
let socket = io('/');

//listen for the confirmation of connection 
socket.on('connect', function(){
    console.log('connected to server');
});

socket.on('update', (updates) => {
    ecosystem = updates; //issue if this is happening asynch to draw?
});

let ecosystem = {
    corpses: [],
    supply: [],
    critters: []
};

function setup() {
    //how to get d.width/height?
    createCanvas(1920,1080);
    ellipseMode(CENTER);
    rectMode(CENTER);
    noStroke();
}

function draw() {
    background(200, 240, 255);
    
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