const DNA = require("./DNA");
const Victor = require("victor");
const D = require("./defaults"); //this is still weird 1/7/21
// let d = new D();
const lerp = require('lerp');
const Ecosystem = require("./ecosystem");
// const Conduit = require("./conduit");
const Boid = require("./flocking");
const {QuadTree, Point, Circle, Rectangle} = require("./quadtree");
const defaults = require("./defaults");

class Critter {
    constructor (id, deets) {
        //better name for deets? opts

        this.DNA = new DNA(); //will get overwritten if child
        let parentA = deets.parentA;
        let parentB = deets.parentB;

        //name defaults to id
        if(deets['name']){
            this.name = deets.name;
        } else {
            this.name = id.toString();
        }

        //every critter has altruism targets so this should be fine
        let primary = deets.primary;
        let secondary = deets.secondary;
        this.altriusm = [primary, secondary];

        if (parentA == null || parentB == null) { //new beb
            //trying new victor vector library
            this.position = new Victor(Math.random() * D.worldSize.width, Math.random() * D.worldSize.height);
            // this.boid = new Boid(this.position.x, this.position.y);
            this.lifeForce = 100;
            // ecosystem.worldLife += 100; //keep all changes to ecosystem
            //user created so first in family tree
            this.ancestry = {child: this.name, parents: [deets.god]};
        } else {
            let inheritance = deets.inheritance;
            this.ancestry = {child: this.name, parents:[parentA.ancestry, parentB.ancestry]};
            this.position = new Victor(parentA.position.x, parentB.position.y); //not the best way but w/e for now
            // this.boid = new Boid(this.position.x, this.position.y);
            //altruism target crossover
            let parentAtarget, parentBtarget;
            if(Math.random()< 0.75){ //b/c primary is "dominant" gene
                parentAtarget = parentA.altriusm[0];
            } else {
                parentAtarget = parentA.altriusm[1];
            }
            if(Math.random()< 0.75){
                parentBtarget = parentB.altriusm[0];
            } else {
                parentBtarget = parentB.altriusm[1];
            }
            if(Math.random()< 0.5){
                this.altriusm = [parentAtarget, parentBtarget];
            } else {
                this.altriusm = [parentBtarget, parentAtarget];
            }
            //crossover here now
            //color is a mix
            this.DNA.genes[0] = [ //having to lerp each color individually
                lerp(parentA.DNA.genes[0][0], parentB.DNA.genes[0][0], Math.random()),
                lerp(parentA.DNA.genes[0][1], parentB.DNA.genes[0][1], Math.random()),
                lerp(parentA.DNA.genes[0][2], parentB.DNA.genes[0][2], Math.random())
            ];
            //for all genes but color, normal lerp
            for (let i = 1; i < this.DNA.genes.length; i++) { 
                this.DNA.genes[i] = lerp(parentA.DNA.genes[i], parentB.DNA.genes[i], Math.random());
            }

            //mutation
            for (let i = 0; i < 8; i++) {
                if (Math.random() < this.DNA.mutationRate) {
                    //color mutation
                    if (i == 0) {
                        let randColor = [Math.random(), Math.random(), Math.random()];
                        this.DNA.genes[0] = [ //having to lerp each color individually
                            lerp(this.DNA.genes[0][0], randColor[0][0], Math.random() * 0.4),
                            lerp(this.DNA.genes[0][1], randColor[0][1], Math.random() * 0.4),
                            lerp(this.DNA.genes[0][2], randColor[0][2], Math.random() * 0.4)
                        ];
                    } else {
                        this.DNA.genes[i] += D.rand_bm(-1,1,1);; 
                        this.DNA.genes[i] = Math.min(Math.max(this.DNA.genes[i], 0), 1); //DIY constrain
                    }
                }
            }
            this.DNA = new DNA(this.DNA); //hmm, this could be better
            this.lifeForce = inheritance;
        }

        // // now map b/c of normalized genes, display genes not
        this.color = this.DNA.color;
        this.r = D.map(this.DNA.r, 0, 1, 5, 50); //radius between 5-50;
        // this.r = this.DNA.r;
        this.maxSpeed = D.map(this.DNA.maxSpeed, 0, 1, 0, 3); //speed between 0-15
        this.refractoryPeriod = D.map(this.DNA.refractoryPeriod, 0, 1, 0, 1000); //changing from 30-100 to 0-1000
        this.parentalSacrifice = this.DNA.parentalSacrifice; //not mapped because a proportion of life force already
        this.minLifeToReproduce = D.map(this.DNA.minLifeToReproduce, 0, 1, 10, 200); //changing from 10-100 to 10-200
        this.excretionRate = D.map(this.DNA.excretionRate, 0, 1, 10000, 100); //now making size+speed = effort --> excretion
        this.mutationRate = this.DNA.mutationRate; //not really necessary but whatever, keep it uniform
        this.minLifeToDonate = D.map(this.DNA.minLifeToDonate, 0, 1, 1, 200); //hmm, why 200? same as reproduce -- but is that too dangerous?
        this.donationPercentage = this.DNA.donationPercentage;
        this.donationRate = D.map(this.DNA.donationRate, 0, 1, 0, 2000); //twice as long as refractory
        
        //timers
        this.mateTimer = Math.floor(Math.random() * 1000 + 100);
        this.excretionTimer = Math.floor(Math.random() * 500);
        this.donationTimer = Math.floor(Math.random() * 1000);
        this.foodScale = 10; //where else can I set this?

        //at end so flocking has all info
        this.boid = new Boid(this);
    }

    //all the non-display updates
    live(qtree) { 
        //flock
        let [velocity, snack] = this.boid.run(qtree);
        this.position.add(velocity);
        //if eaten food
        if (snack != undefined){
            this.lifeForce += snack.amount;
            return snack;
        }

        // let perception = new Circle(this.position.x, this.position.y, this.perceptionRadius)
        //nvm doing qtree look in flocking b/c that's where perception radius is
        // this.update(qtree); //getting rid of this because update is just flock now
        // this.update(critters); //eventually need to percept through quadtree for these
        // this.borders();
        // have to return upstream so these don't work here?
        // this.excrete();
        // this.donate();
        // this.display();
    }

    excrete() {
        this.excretionTimer++;
        if (this.excretionTimer >= this.excretionRate) {
            this.lifeForce -= this.foodScale;
            let newFood;
            let foodPos = {
                x: this.position.x,
                y: this.position.y
            };
            if (this.lifeForce == 0) { //very unlikely it's exactly 0
                newFood = this.foodScale;
                // Ecosystem.die(this);
                return {death: this, makeFood: {amount: newFood, foodPos: foodPos}}
            } else if (this.lifeForce < 0) {
                // newFood = abs(this.lifeForce); //to make sure it only excretes the amount it had left
                newFood = this.lifeForce + this.foodScale; //amount it had before
                // Ecosystem.die(this);
                return {death: this, makeFood: {amount: newFood, foodPos: foodPos}}
            } else {
                newFood = this.foodScale;
                this.excretionTimer = 0;
                return {makeFood: {amount: newFood, foodPos: foodPos}}
            }
            // Ecosystem.makeFood(newFood, foodPos); //needs a timer so it doesn't pick it back up
        }
        return null;
    }

    donate() {
        this.donationTimer++;
        if(this.lifeForce >= this.minLifeToDonate && this.donationTimer >= this.donationRate){
            this.donationTimer = 0;
            let donation = this.lifeForce * this.donationPercentage;
            this.lifeForce -= donation;
            let primaryDonation = donation * .75; //doing this really laboriously b/c don't want pennies slipping through
            let donation1 = {target: this.altriusm[0], amount: primaryDonation};
            let donation2 = {target: this.altriusm[1], amount: donation - primaryDonation};
            return {d1: donation1, d2: donation2};
            // Ecosystem.donate(donation1, donation2);
            // Conduit.fundsRaised[this.altriusm[0]] += primaryDonation;
            // Conduit.fundsRaised[this.altriusm[1]] += donation - primaryDonation;
        }
        return null; //if no donate

    }

        
    display() {
        let isReadyToMate = false;
        if(this.mateTimer <= 0 && this.lifeForce >= this.minLifeToReproduce){
            isReadyToMate = true;
        }
        //need to convert from Victor
        let pos = {x: this.position.x, y: this.position.y};
        return {position: pos, r: this.r, color: this.color, life: this.lifeForce, isReadyToMate: isReadyToMate};
    }

    feed(qtree) {

    }

    mate(qtree) {

    }

}

module.exports = Critter;