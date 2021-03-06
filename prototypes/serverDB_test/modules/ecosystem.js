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
            console.log("new ecosystem");
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
                this.critters.push(new Critter("ecosystem", D.generate_ID(), {god: "August", primary: this.conduit.getRandomTarget(), secondary: this.conduit.getRandomTarget()}));
                this.critterCount++;
                // this.critterID++;
                this.worldLife += 1;
            }
        } else if (typeof ecoSetup === "object") {
            console.log("ecosystem from save");
            this.width = D.worldSize.width;
            this.height = D.worldSize.height;
            this.critters = []; //the agents currently in the ecosystem    
            this.corpses = []; //currently decomposing critters
            this.supply = []; //fud

            // great, okay, so have to remake the stuff after db...
            this.conduit = new Conduit(ecoSetup.donations);
            this.worldLife = 0;
            this.critterCount = 0;
            
            //this is the same after db update
            for (let dbFood of ecoSetup.ecosystem.supply) {
                let food = new Food(dbFood);
                this.supply.push(food);
                this.worldLife += food.amount;
            }
            for (let dbCorpse of ecoSetup.ecosystem.corpses) {
                let corpse = new Corpse(dbCorpse);
                this.corpses.push(corpse);
            }
            for (let dbCritter of ecoSetup.ecosystem.critters) {
                let critter = new Critter("db", dbCritter);
                this.critters.push(critter);
                this.critterCount++;
                this.worldLife += critter.life;
            }   
            // //this is going to be really weird, going to have to frankenstein the critters together
            // //first need to get all critters from ecosystem then grab corresponding info from critter db -- will erase any dead critters
            // for (let ecoDBCritter of ecoSetup.ecosystem.critters){
            //     let frankenCritter = {};
            //     for (let key of Object.keys(ecoDBCritter)){
            //         frankenCritter[key] = ecoDBCritter[key];
            //     }
            //     let noMatch = true;
            //     for (let critDBCritter of ecoSetup.critters) {
            //         if (ecoDBCritter.id == critDBCritter.id) {
            //             for (let key of Object.keys(critDBCritter)){
            //                 frankenCritter[key] = critDBCritter[key];
            //             }
            //             noMatch = false;
            //         }
            //     }

            //     if(noMatch) {
            //         console.log("no match: " + frankenCritter.id)
            //     } else { //preventing error on clientside of having critters with no display stats
            //         let critter = new Critter("db", frankenCritter);
            //         this.critters.push(critter);
            //         this.critterCount++;
            //         this.worldLife += critter.life;
            //     }
            // }
        } else {
            console.log("ecosystem set up error: " + ecoSetup);
            console.log(typeof ecoSetup);
        }
        console.log("ecosystem ready");
        //doing this here so that funds and ecosystem will be ready from start -- nope...
        // world.emit('fundsUpdate', this.conduit);
        // world.emit("statsUpdate", {critterCount: this.critterCount, worldLife: this.worldLife.toFixed(2)});
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

        //for backup
        let needsBackup = false;
    
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
                // console.log('ilikeu');
            } else {
                // critter.mateTimer -= 1;
                critter.mateTimer++;
            }
        });

        //feed and fuck
        // this.checkForFood(); //now in run
        if(this.critterCount <= 500) { // arbitrary pop threshold for now
            this.checkForMates(mates);
        }

        //check for donations/excretions/deaths and then display
        this.critters.forEach( (critter) => {
            //check for donations
            let funds = critter.donate();
            if(funds != null) {
                // console.log("donation: " + JSON.stringify(funds.d1) + " " + JSON.stringify(funds.d2));
                // this.deposit(funds.d1, funds.d2)
                this.deposit(funds);
                needsBackup = true;
            };
            //check for food and death
            let excretion = critter.excrete();
            if(excretion != null) {
                if (excretion.death != null) {
                    // console.log("death: " + excretion.death.name);
                    this.die(excretion.death)
                    needsBackup = true;
                }
                if (excretion.makeFood != null) {
                    // console.log("food at: " + JSON.stringify(excretion.makeFood.foodPos));
                    this.makeFood(excretion.makeFood.amount, excretion.makeFood.foodPos);
                    needsBackup = true;  
                }
            }
            //update socket display positions
            updates.critters.push(critter.display()); //just the p5side display stuff
        });
    
        //decay, show, and remove corpses
        this.corpses.forEach( (corpse, index) => { //need third param, corpses?
            //decay then check for full decay
            if (corpse.decay()) { //absolution
                this.corpses.splice(index, 1);
            } else {
                updates.corpses.push(corpse.display());
            }
        });

        if(needsBackup) {
            // backupEcosystem(); //now only doing this on interval in server
        }
    
        return updates;
    }

    spawnCritterFromUser(critter) {
        //create critter and check Conduit
        this.critters.push(new Critter("user", critter));
        this.conduit.checkNewCritterTargets(critter.donations) //other donation stuff happens in .deposit()

        //update stats
        this.critterCount++;
        this.worldLife += critter.life;

        //server update
        // backupDB();
        // backupCritters();
        // addCritterToDB(critter);
        backupEcosystem();
        world.emit("statsUpdate", {critterCount: this.critterCount, worldLife: this.worldLife});
    }

    spawnRandomCritter() {
        // this.critters.push(new Critter(this.critterID, {god: "August", primary: this.conduit.getRandomTarget(), secondary: this.conduit.getRandomTarget()}));
        this.critters.push(new Critter("ecosystem", D.generate_ID(), {god: "August", primary: this.conduit.getRandomTarget(), secondary: this.conduit.getRandomTarget()}));
        this.critterCount++;
        // this.critterID++;
        this.worldLife += 1;
        // backupDB();
        // backupCritters(); //need to backup eco now too or else might not exist on crash -- what was the point then?
        // addCritterToDB(critter);
        // backupEcosystem(); //now only doing this on interval in server
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
                if (mates[i].self.id == mates[j].mate.id && mates[i].mate.id == mates[j].self.id){ //adding the double check in case throuple...
                    pairs.push({A: mates[i].self, B: mates[j].self});
                }
            }
        }
        //then make babies from the matched pairs
        pairs.forEach( (parents) => {
            //reset mateTimers
            // parents.A.mateTimer += parents.A.refractoryPeriod;
            // parents.B.mateTimer += parents.B.refractoryPeriod;
            parents.A.mateTimer = 0;
            parents.B.mateTimer = 0;
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
            let newBaby = new Critter("ecosystem", D.generate_ID(), {parentA: parents.A, parentB: parents.B, inheritance: inheritance});
            // console.log("new baby at: " + JSON.stringify(newBaby.position));
            console.log(`new baby: ${newBaby.name}`);
            parents.A.offspring.push({name: newBaby.name})
            parents.B.offspring.push({name: newBaby.name})
            this.critters.push(newBaby);
            // addCritterToDB(newBaby);
        });

        if (pairs.length != 0) {
            // backupCritters();
           backupEcosystem();
            // backupDB(); // hmm async or no?
            // console.log("async test");
        }
    }

    // deposit(donation1, donation2) {
    deposit(donations) {
        let d1 = donations[0].amount;
        let d2 = donations[1].amount;
        let totalDonation = this.conduit.makeDonation(donations);
        // this.conduit.totalRaised += d1 + d2;
        this.conduit.totalRaised += totalDonation;
        
        // console.log(typeof this.worldLife);
        // console.log(`1: ${this.worldLife}`)
        // console.log(totalDonation);
        // this.worldLife -= (d1 + d2);
        this.worldLife -= parseFloat(totalDonation.toFixed(2)); //this is so fucking ridiculous
        this.worldLife = parseFloat(this.worldLife.toFixed(2));
        // console.log(typeof this.worldLife);
        // console.log(`2: ${this.worldLife}`)
        world.emit('fundsUpdate', this.conduit);
        // console.log(typeof this.worldLife);
        // console.log(`3: ${this.worldLife}`)
        world.emit("statsUpdate", {critterCount: this.critterCount, worldLife: this.worldLife});
        // console.log(typeof this.worldLife);
        // console.log(`4: ${this.worldLife}`)
        
        backupDonations();
        backupEcosystem();
        // this.ecosystemEmit("stats", {critterCount: this.critterCount, worldLife: this.worldLife});
    }

    // good or bad? bad
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

    save() { //old, no longer using
        let ecoLog = {
            critters: this.critters,
            supply: this.supply,
            corpses: this.corpses
        }
        console.log("ecosystem saved");
        return ecoLog;
    }

    backupAll() { //le sigh
        backupDonations(); 
        backupEcosystem();
        // backupCritters();
    }

    backupEcosystem(){ //all dynamic info
        // let dynamicCritters = [];
        // for (let critter of this.critters) {
        //     let dynCritter = critter.stripToDynamic();
        //     dynamicCritters.push(dynCritter);
        // }
        let ecoLog = {
            supply: this.supply,
            corpses: this.corpses,
            // critters: dynamicCritters
            critters: this.critters
        }
        return ecoLog;
    }

    //not using anymore
    // backupCritters(){ //only need static info
    //     let staticCritters = [];
    //     for (let critter of this.critters){
    //         let statCritter = critter.stripToStatic();
    //         staticCritters.push(statCritter);
    //     }
    //     return staticCritters;
    // }
}

module.exports = Ecosystem;