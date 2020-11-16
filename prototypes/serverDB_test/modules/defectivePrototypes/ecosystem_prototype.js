//Ecosystem -- top level manager
//critter and agent are interchangable terms

//I feel like it's bad to have a long line of dependent modules (i.e. eco requires critter requires...) but not sure how else to do it atm...
const Critter = require("./critter");
const Food = require("./food");
const Corpse = require("./corpse");
const d = require("./defaults");
var Conduit = require("./conduit");

function Ecosystem(numAgents) {
    //do I need a if (!(this instanceof Ecosystem))??

    this.width = d.width;
    this.height = d.height;
    this.critterCount = 0; //just for IDs
    this.critters = []; //the agents currently in the ecosystem    
    this.corpses = []; //currently decomposing critters
    this.supply = []; //the food that exists in the ecosystem

    this.conduit = new Conduit();

    //create initial population -- need "new"?
    for (let i = 0; i < numAgents; i++) {
        this.critters.push(new Critter(this.critterCount, {god: "August", primary: this.conduit.getRandomTarget(), secondary: this.conduit.getRandomTarget()}));
        this.critterCount++;
    }
}

Ecosystem.prototype.run = () => {
    let updates = {
        supply: [],
        critters: [],
        corpses: []
    }; //trying for client display, hope it won't be too slow

    //show all the food
    this.supply.forEach( (food) => {
        updates.supply.push(food.display()); //might want to eventually separate ripe function, but since one line, for now is fine
    });

    //update all the critters then check for eating/reproducing
    this.critters.forEach( (critter) => {
        critter.live(); //all serverside critter stuff
        updates.critters.push(critter.display()); //just the p5side display stuff
    });
    this.checkForFood();
    this.checkForMates();

    //decay, show, and remove corpses
    //does forEach get messed up if splicing? TODO check
    this.corpses.forEach( (corpse, index) => { //need third param, corpses?
        //decay then check for full decay
        if (corpse.decay()) { //absolution
            this.corpses.splice(index, 1);
        } else {
            updates.corpses.push(corpse.display());
        }
    });

    return updates;
}

Ecosystem.prototype.makeFood = (amount, pos) => {
    this.supply.push(new Food(amount, pos));
}

//critter dies, splice from critters and add corpse
Ecosystem.prototype.die = (deadCritter) => {
    this.critters.forEach( (critter, index) => {
        if (critter == deadCritter) {
            this.corpses.push(new Corpse({x: critter.position.x, y: critter.position.y}, critter.r));
            this.critters.splice(index, 1);
            return;
        }
    });
}

Ecosystem.prototype.checkForFood = () => {
    this.supply.forEach( (food, index) => {
        if (food.ripeRate <= 0) {
            this.critters.forEach( (critter) => {
                //doing DIY dist() b/c no p5
                // if (Math.sqrt(Math.pow((critter.position.x - food.position.x), 2) + Math.pow((critter.position.y - food.position.y), 2)) <= critter.r) {
                if (Math.hypot((critter.position.x - food.position.x), (critter.position.y - food.position.y)) <= critter.r) {
                    critter.lifeForce += food.amount;
                    this.supply.splice(index, 1);
                }
            });
        }
    });
}

Ecosystem.prototype.checkForMates = () => {
    //not doing this in favor of previous more optimized version, need to find a better way though
    // this.critters.forEach( (critterA) => {
    //     if (critterA.mateTimer <= 0 && critterA.lifeForce >= critterA.minLifeToReproduce) { //if can mate

    //     }
    // });

    for (let i = this.critters.length - 1; i >= 0; i--) {
        if (this.critters[i].mateTimer <= 0 && this.critters[i].lifeForce >= this.critters[i].minLifeToReproduce) { //if can mate
            for (let j = 0; j < i; j++) { //really trying to not overlap with self
                if (this.critters[j].mateTimer <= 0 && this.critters[j].lifeForce >= this.critters[j].minLifeToReproduce) { //if both parents are ready
                    if (Math.hypot((this.critters[i].position.x - this.critters[j].position.x), (this.critters[i].position.y - this.critters[j].position.y)) 
                    <= ((this.critters[i].r / 2) + (this.critters[j].r / 2))) { //close enough to mate
                        //reset mateTimers
                        this.critters[i].mateTimer += this.critters[i].refractoryPeriod;
                        this.critters[j].mateTimer += this.critters[j].refractoryPeriod;
                        //give to baby from parents
                        let parentSacrificeA = this.critters[i].lifeForce * this.critters[i].parentalSacrifice;
                        this.critters[i].lifeForce -= parentSacrificeA;
                        let parentSacrificeB = this.critters[j].lifeForce * this.critters[j].parentalSacrifice;
                        this.critters[j].lifeForce -= parentSacrificeB;
                        let inheritance = parentSacrificeA + parentSacrificeB;
                        //make new baby
                        this.critterCount++;
                        let newBaby = new Critter(this.critterCount, {parentA: this.critters[i], parentB: this.critters[j], inheritance: inheritance});
                        this.critters.push(newBaby);
                    }
                }
            }
        } else {
            this.critters[i].mateTimer -= 1;
        }
    }
}

Ecosystem.prototype.donate = (donation1, donation2) => {
    this.conduit.fundsRaised[donation1.target] += donation1.amount;
    this.conduit.fundsRaised[donation2.target] += donation2.amount;
}

module.exports = Ecosystem;