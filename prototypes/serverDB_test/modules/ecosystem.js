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
let boundary = new Rectangle(D.worldSize.width / 2, D.worldSize.height / 2, D.worldSize.width / 2, D.worldSize.height / 2);
// const debug = require('debug')('ecosystem'); 


class Ecosystem {
    //do I need a if (!(this instanceof Ecosystem))??
    constructor(ecoSetup) {
        if(typeof ecoSetup === "number"){
            console.log("setting up new ecosystem");
            this.width = D.worldSize.width;
            this.height = D.worldSize.height;
            // this.critterID = 0; //just for IDs
            this.critters = []; //the agents currently in the ecosystem    
            this.corpses = []; //currently decomposing critters
            this.supply = []; //the food that exists in the ecosystem
        
            this.conduit = new Conduit();
            this.worldLife = 0;
            this.critterCount = 0;
            //create initial population -- need "new"?
            for (let i = 0; i < ecoSetup; i++) {
                this.critters.push(new Critter(D.generate_ID(), {god: "August", primary: this.conduit.getRandomTarget(), secondary: this.conduit.getRandomTarget()}));
                this.critterCount++;
                // this.critterID++;
                this.worldLife += 100;
            }
        } else if (typeof ecoSetup === "object") {
            console.log("setting up ecosystem from save");
            this.width = D.worldSize.width;
            this.height = D.worldSize.height;
            this.critters = []; //the agents currently in the ecosystem    
            this.corpses = []; //currently decomposing critters
            this.supply = [];

            // let newCon = new Conduit();
            // console.log("NEW CON" + JSON.stringify(new Conduit()));
            // console.log("db con" + JSON.stringify(this.conduit));
            // console.log(newCon instanceof Conduit);
            // console.log(this.conduit instanceof Conduit);

            // great, okay, so have to remake the stuff after db...
            this.conduit = new Conduit(ecoSetup.conduit);
            this.worldLife = 0;
            this.critterCount = 0;
            
            for (let dbCritter of ecoSetup.ecoLog.critters){
                let critter = new Critter(dbCritter);
                this.critters.push(critter);
                this.critterCount++;
                this.worldLife += critter.life;
            }
            for (let dbFood of ecoSetup.ecoLog.supply) {
                let food = new Food(dbFood);
                this.supply.push(food);
                this.worldLife += food.amount;
            }
            for (let dbCorpse of ecoSetup.ecoLog.corpses) {
                let corpse = new Corpse(dbCorpse);
                this.corpses.push(corpse);
            }

            // for (let thing of ecoSetup.ecoLog){
            //     if (thing instanceof Critter) {
            //         this.critters.push(thing);
            //         this.critterCount++;
            //         this.worldLife += thing.life;
            //     }
            //     if (thing instanceof Food) {
            //         this.supply.push(thing);
            //         this.worldLife += thing.amount;
            //     }
            //     if (thing instanceof Corpse) {
            //         this.corpses.push(thing);
            //     }
            // }
        } else {
            console.log("ecosystem set up error: " + ecoSetup);
            console.log(typeof ecoSetup);
            console.log(typeof ecoSetup === "number");
        }
        console.log("ecosystem ready");
        //doing this here so that funds and ecosystem will be ready from start -- nope...
        // world.emit('fundsUpdate', this.conduit);
        // world.emit("statsUpdate", {critterCount: this.critterCount, worldLife: this.worldLife.toFixed(2)});
    }

    save() {
        let ecoLog = {
            critters: this.critters,
            supply: this.supply,
            corpses: this.corpses
        }
        console.log("ecosystem saved");
        return ecoLog;
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
    
        //update the main critter actions (move, eat, mate)
        let mates = [];
        this.critters.forEach( (critter) => {
            //all serverside critter stuff
            // console.log(JSON.stringify(this.qtree.points))

            let [snack, mate] = critter.live(critter, this.qtree);
            //critter eats
            if (snack != undefined) { //for now just for splicing food that the critter has eaten
                //update supply, updates, and qtree -- don't need to do updates because will get it on the next run?
                let snackIndex = this.supply.findIndex( (element) => {
                    return element.id == snack.id
                    // if (element.id == snack.id){
                    //     return true
                    // }
                });
                // let snackUpdate = updates.supply.findIndex( (element) => {
                    // return element.id == snack.id
                // });
                // console.log(snackIndex, "dfdf", "snack.id")
                this.supply.splice(snackIndex, 1);
                // console.log(critter.name + " has eaten: " + snack.id);
                // let snackQtree = this.qtree.points -- no way to remove? just going to add a property to food
                let foodRange = new Circle(critter.position.x, critter.position.y, critter.r + 10);
                this.qtree.remove(foodRange, snack, "ID");
            }
            //critter mates -- to be resolved in checkForMates() below
            if (mate != undefined) {
                mates.push({self: critter, mate: mate});
            } else {
                critter.mateTimer -= 1;
            }
        });

        //feed and fuck
        // this.checkForFood(); //now in run
        this.checkForMates(mates);

        //check for donations/excretions/deaths and then display
        this.critters.forEach( (critter) => {
            //check for donations
            let funds = critter.donate();
            if(funds != null) {
                // console.log("donation: " + JSON.stringify(funds.d1) + " " + JSON.stringify(funds.d2));
                this.deposit(funds.d1, funds.d2)
            };
            //check for food and death
            let excretion = critter.excrete();
            if(excretion != null) {
                if (excretion.death != null) {
                    // console.log("death: " + excretion.death.name);
                    this.die(excretion.death)
                }
                if (excretion.makeFood != null) {
                    // console.log("food at: " + JSON.stringify(excretion.makeFood.foodPos));
                    this.makeFood(excretion.makeFood.amount, excretion.makeFood.foodPos);
                }
            }
            //update socket display positions
            updates.critters.push(critter.display()); //just the p5side display stuff
        });
    
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
        // this.critters.push(new Critter(this.critterID, {god: "August", primary: this.conduit.getRandomTarget(), secondary: this.conduit.getRandomTarget()}));
        this.critters.push(new Critter(D.generate_ID(), {god: "August", primary: this.conduit.getRandomTarget(), secondary: this.conduit.getRandomTarget()}));
        this.critterCount++;
        // this.critterID++;
        this.worldLife += 100;
        backupDB();
        world.emit("statsUpdate", {critterCount: this.critterCount, worldLife: this.worldLife});
    }

    makeFood(amount, pos) {
        this.supply.push(new Food(amount, pos));
        world.emit("statsUpdate", {critterCount: this.critterCount, worldLife: this.worldLife});
    }

    //critter dies, splice from critters and add corpse
    die(deadCritter) {
        this.critters.forEach( (critter, index) => {
            if (critter == deadCritter) {
                this.corpses.push(new Corpse({position: {x: critter.position.x, y: critter.position.y}, r: critter.r}));
                this.critters.splice(index, 1);
                return;
            }
        });
        this.critterCount--;
        this.ecosystemEmit("stats", {critterCount: this.critterCount, worldLife: this.worldLife});
    }
    /* //now using graze method in flocking.js for quadtree usage
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
                    // let snack = critter.feed()
                });
            }
        });
    }
    */

    checkForMates(mates) {
        //now the mates are triggering in flocking for quadtree usage, but the ecosystem makes babies here
        //just check for pair matches first
        let pairs = [];
        for (let i = mates.length - 1; i >= 0; i--) {
            for (let j = 0; j < i; j++) { //so won't overlap with same pair again
                // console.log(JSON.stringify(mates));
                if (mates[i].self.id == mates[j].mate.id){
                    pairs.push({A: mates[i].self, B: mates[j].self});
                }
            }
        }
        //then make babies from the matched pairs
        pairs.forEach( (parents) => {
            //reset mateTimers
            parents.A.mateTimer += parents.A.refractoryPeriod;
            parents.B.mateTimer += parents.B.refractoryPeriod;
            //give to baby from parents
            let parentSacrificeA = parents.A.life * parents.A.parentalSacrifice;
            parents.A.life -= parentSacrificeA;
            let parentSacrificeB = parents.B.life * parents.B.parentalSacrifice;
            parents.B.life -= parentSacrificeB;
            let inheritance = parentSacrificeA + parentSacrificeB;
            //make da bebe
            // this.critterID++; //not using anymore right? will keep just in case
            this.critterCount++;
            this.ecosystemEmit("stats", {critterCount: this.critterCount, worldLife: this.worldLife});
            let newBaby = new Critter(D.generate_ID(), {parentA: parents.A, parentB: parents.B, inheritance: inheritance});
            // console.log("new baby at: " + JSON.stringify(newBaby.position));
            parents.A.offspring.push({name: newBaby.name})
            parents.B.offspring.push({name: newBaby.name})
            this.critters.push(newBaby);
        });

        if (pairs.length != 0) {
            backupDB();
        }


        /* //old way
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
                            // console.log("new baby from " + this.critters[i].name + " and " + this.critters[j].name);
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
        */
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

    clickInfo(position, client){ //add point to quad tree and send message to client if critter overlaps
        // console.log(position.x, position.y, client)
        let clickQtree = new QuadTree(boundary, 4); //4 arbitrary capacity, can test later
        this.critters.forEach( (critter) => {
            //first add to qtree so can send it in .live
            let point = new Point(critter.position.x, critter.position.y, critter);
            clickQtree.insert(point);
        });
        let checkRadius = new Circle(position.x, position.y, 30); //might have overlap, but want to prevent hard to click critters
        let foundCritter = clickQtree.query(checkRadius);
        // console.log(JSON.stringify(foundCritter));
        //sending to specific client even though only one world because will eventually want this individualized
        // world.broadcast.to(client).emit('clickInfo', foundCritter);
        if(foundCritter.length != 0){
            world.emit('clickInfo', {position: position, critter: foundCritter[0].data, client: client}); //hmmm i need to learn more about sockets... TODO

        }
    }

}

module.exports = Ecosystem;