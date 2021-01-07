//Ecosystem -- top level manager
//critter and agent are interchangable terms

//I feel like it's bad to have a long line of dependent modules (i.e. eco requires critter requires...) but not sure how else to do it atm...
const Critter = require("./critter");
const Food = require("./food");
const Corpse = require("./corpse");
const D = require("./defaults");
// var d = new D();
const Conduit = require("./conduit");
const {QuadTree, Point, Circle, Rectangle} = require("./quadtree");
var boundary = new Rectangle(D.worldSize.width / 2, D.worldSize.height / 2, D.worldSize.width / 2, D.worldSize.height / 2);

class Ecosystem {
    //do I need a if (!(this instanceof Ecosystem))??
    constructor(numAgents) {
        this.width = D.worldSize.width;
        this.height = D.worldSize.height;
        this.critterID = 0; //just for IDs
        this.critters = []; //the agents currently in the ecosystem    
        this.corpses = []; //currently decomposing critters
        this.supply = []; //the food that exists in the ecosystem
    
        this.conduit = new Conduit();
        this.worldLife = 0;
        this.critterCount = 0;
        //create initial population -- need "new"?
        for (let i = 0; i < numAgents; i++) {
            this.critters.push(new Critter(this.critterID, {god: "August", primary: this.conduit.getRandomTarget(), secondary: this.conduit.getRandomTarget()}));
            this.critterCount++;
            this.critterID++;
            this.worldLife += 100;
        }

        //not setting up quadtree here because new one every run
    }

    run() {
        //quadtree
        this.qtree = new QuadTree(boundary, 4); //4 arbitrary capacity, can test later

        //for sockets
        let updates = {
            supply: [],
            critters: [],
            corpses: []
        };
    
        //show all the food + add to qtree
        this.supply.forEach( (food) => {
            let point = new Point(food.position.x, food.position.y, food);
            this.qtree.insert(point);
            updates.supply.push(food.display()); //might want to eventually separate ripe function, but since one line, for now is fine
        });

        //separating all the critter blocks so they all change before looking at each other
        this.critters.forEach( (critter) => {
            //first add to qtree so can send it in .live
            let point = new Point(critter.position.x, critter.position.y, critter);
            this.qtree.insert(point);
        });
    
        //update all the critters then check for eating/reproducing
        this.critters.forEach( (critter) => {
            //all serverside critter stuff
            // critter.live(this.critters); //sending list for flock -- but want to use qtree instead because "snapshot"
            critter.live(this.qtree);
        });

        this.critters.forEach( (critter) => {
            //check for donations
            let funds = critter.donate();
            if(funds != null) {
                console.log("donation: " + JSON.stringify(funds.d1) + " " + JSON.stringify(funds.d2));
                this.deposit(funds.d1, funds.d2)
            };
            //check for food and death
            let excretion = critter.excrete();
            if(excretion != null) {
                if (excretion.death != null) {
                    console.log("death: " + excretion.death.name);
                    this.die(excretion.death)
                }
                if (excretion.makeFood != null) {
                    console.log("food at: " + JSON.stringify(excretion.makeFood.foodPos));
                    this.makeFood(excretion.makeFood.amount, excretion.makeFood.foodPos);
                }
            }
            //update socket display positions
            updates.critters.push(critter.display()); //just the p5side display stuff
        });

        //feed and fuck
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

    spawnRandomCritter() {
        this.critters.push(new Critter(this.critterID, {god: "August", primary: this.conduit.getRandomTarget(), secondary: this.conduit.getRandomTarget()}));
        this.critterCount++;
        this.critterID++;
        this.worldLife += 100;
        world.emit("statsUpdate", {critterCount: this.critterCount, worldLife: this.worldLife});
    }

    makeFood(amount, pos) {
        this.supply.push(new Food(amount, pos));
    }

    //critter dies, splice from critters and add corpse
    die(deadCritter) {
        this.critters.forEach( (critter, index) => {
            if (critter == deadCritter) {
                this.corpses.push(new Corpse({x: critter.position.x, y: critter.position.y}, critter.r));
                this.critters.splice(index, 1);
                return;
            }
        });
        this.critterCount--;
        this.ecosystemEmit("stats", {critterCount: this.critterCount, worldLife: this.worldLife});
    }

    checkForFood() {
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

    checkForMates() {
        //not doing forEach in favor of previous more optimized version, need to find a better way though
    
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
                            console.log("new baby from " + this.critters[i].name + " and " + this.critters[j].name);
                            this.critterID++;
                            this.critterCount++;
                            this.ecosystemEmit("stats", {critterCount: this.critterCount, worldLife: this.worldLife});
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

    deposit(donation1, donation2) {
        //scale to cents -- 1 life force = $0.01
        let d1 = donation1.amount * 0.01;
        let d2 = donation2.amount * 0.01;
        this.conduit.fundsRaised[donation1.target] += d1;
        this.conduit.fundsRaised[donation2.target] += d2;
        this.conduit.totalRaised += d1 + d2;
        this.worldLife -= (d1 + d2) * 100; //clunky
        world.emit('fundsUpdate', this.conduit);
        // console.log("conduit " + this.conduit.fundsRaised["program E"]);
        this.ecosystemEmit("stats", {critterCount: this.critterCount, worldLife: this.worldLife.toFixed(2)});
    }

    // good or bad?
    ecosystemEmit(type, update){
        if(type == "stats"){
            world.emit("statsUpdate", update);
        }
    }

}

module.exports = Ecosystem;