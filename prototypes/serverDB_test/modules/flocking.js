//Shiffman's flocking algos
// https://p5js.org/examples/simulate-flocking.html

const Victor = require("victor");
const Critter = require("./critter");
const D = require("./defaults");
const { Circle } = require("./quadtree");
var d = new D(); //i've gotta be doing something wrong...

//just for calculating the flocking forces, actual position is outside
class Boid {
    constructor(critter) {
        this.acceleration = new Victor(0, 0);
        this.velocity = new Victor(d.map(Math.random(), 0, 1, -1, 1), d.map(Math.random(), 0, 1, -1, 1));
        // this.position is external, this boid is just for motion force, but still need for qtree?
        this.position = critter.position;
        // this.posVector = new Victor(this.position.x, this.position.y);
        this.perceptionRadius = critter.perceptionRadius || 50;
        this.maxSpeed = critter.maxSpeed;
        this.maxForce = critter.maxForce || 0.05;
        this.desiredSeparation = critter.desiredSeparation || 25;
        this.separationBias = critter.separationBias || 5; //go down if ready to mate
        this.desiredFlockSize = critter.desiredFlockSize || 100; //neighbor distance
        this.alignmentBias = critter.alignmentBias || 1;
        this.cohesionBias = critter.cohesionBias || 1.5;
        this.hunger = critter.hunger || 10; //to mult food seeking
    }

    // run (critters) {
    run (qtree) {
        let surroundings = this.lookAround(qtree);
        this.flock(surroundings.neighbors);
        this.graze(surroundings.foodAround);
        this.bounds();
        this.update();
        this.position.add(this.velocity); //forgot i need to update this position too
        return this.velocity;
    }

    lookAround (qtree) {
        let perception = new Circle(this.position.x, this.position.y, this.perceptionRadius);
        let allAround = qtree.query(perception);
        let surroundings = {
            neighbors: [],
            foodAround: []
        };

        allAround.forEach( (thing) => {
            //no diff here between using undefined and null?
            if (thing.data.DNA != undefined) { //is a critter
                surroundings.neighbors.push(thing.data);
            } else if (thing.data.ripeRate != undefined) { //is a food
                surroundings.foodAround.push(thing.data);
            } else {
                console.log("what the hell are you? " + thing.data);
            }


            //can't do this because of circular dependency?
            // if (thing.data instanceof Critter) {
            //     surroundings.neighbors.push(thing);
            // } else if (thing.data instanceof Food) {
            //     surroundings.foodAround.push(thing);
            // } else {
            //     console.log("what the hell are you? " + thing);
            // }
        })

        return surroundings; //becomes "critters" for flocking
    }

    flock (critters) {
        let separation = this.separation(critters);
        let alignment = this.alignment(critters);
        let cohesion = this.cohesion(critters);

        separation.multiply(new Victor(this.separationBias, this.separationBias));
        alignment.multiply(new Victor(this.alignmentBias, this.alignmentBias));
        cohesion.multiply(new Victor(this.cohesionBias, this.cohesionBias));

        this.applyForce(separation);
        this.applyForce(alignment);
        this.applyForce(cohesion);
    }

    graze (foodAround) {
        foodAround.forEach( (food) => {
            //fine to do this for each b/c food drive is heavier? 
            //will they get stuck between food? maybe should check for biggest food? or depends...
            let foodVec = new Victor(food.position.x, food.position.y);
            let hunger = this.seek(foodVec);
            hunger.multiply(new Victor(this.hunger, this.hunger));
            this.applyForce(hunger);
        });
    }

    bounds() {
        if (this.position.x > d.width - 10) {this.applyForce(new Victor(-1, 0))}
        if (this.position.x < 10) {this.applyForce(new Victor(1, 0))}
        if (this.position.y > d.height - 10) {this.applyForce(new Victor(0, -1))}
        if (this.position.y < 10) {this.applyForce(new Victor(0, 1))}
    }

    update() {
        // console.log(this.acceleration);
        this.velocity.add(this.acceleration);
        this.velocity = this.limit(this.velocity, this.maxSpeed);
        this.acceleration.multiply(new Victor(0, 0));
    }

    applyForce (force) {
        //could add mass or other things later, redundant for now
        this.acceleration.add(force);
    }

    limit (vector, max) { //DIY p5.Vector.limit since Victor.limit isn't the same
        //normalize then mult by max
        vector.normalize();
        vector.multiply(new Victor(max, max));
        return vector;
    }

    seek (target) { //not sure if this is necessary, but might be able to use for food?
        let desired = target.subtract(this.position);
        desired.normalize();
        desired.multiply(new Victor(this.maxSpeed, this.maxSpeed));
        let steer = desired.subtract(this.velocity);
        // let test = this.limit(steer, this.maxForce);
        // console.log("test " + test);
        steer = this.limit(steer, this.maxForce);
        // console.log(steer);
        return steer;
    }

    separation (critters) {
        let steer = new Victor(0, 0);
        let count = 0;
        //for every boid, check if too close
        for (let critter of critters) {
            let d = this.position.distance(critter.position);
            if (d > 0 && d < this.desiredSeparation) {
                let diff = this.position.clone(); //this.position is getting subtracted from!! without clone it was messing with this.position!! WHAT IS A REFERENCE
                diff.subtract(critter.position);
                diff.normalize();
                diff.divide(new Victor(d, d));
                steer.add(diff);
                count++;
            }
        }

        if (count > 0) {
            // console.log('count ' + count);
            steer.divide(new Victor(count, count));
        }

        if (steer.magnitude() > 0) {
            // console.log("separation steer before " + steer);
            steer.normalize();
            steer.multiply(new Victor(this.maxSpeed, this.maxSpeed));
            steer.subtract(this.velocity);
            steer = this.limit(steer, this.maxForce);
            // console.log("separation steer after " + steer);
        }

        return steer;
    }

    alignment (critters) {
        //should eventually have some sort of leadership variable that modifies this
        let sum = new Victor(0, 0);
        let count = 0;
        for (let critter of critters) {
            let d = this.position.distance(critter.position);
            if (d > 0 && d < this.desiredFlockSize) {
                sum.add(critter.boid.velocity);
                count++;
            }
        }

        if (count > 0) {
            sum.divide(new Victor(count, count));
            sum.normalize();
            sum.multiply(new Victor(this.maxSpeed, this.maxSpeed));
            let steer = sum.subtract(this.velocity);
            // console.log("alignment steer before " + steer);
            steer = this.limit(steer, this.maxForce);
            // console.log("alignment steer after " + steer);
            
            return steer;
        } else {
            return new Victor(0, 0);
        }
    }

    cohesion (critters) { 
        let sum = new Victor(0, 0);
        let count = 0;
        for (let critter of critters) {
            let d = this.position.distance(critter.position);
            if (d > 0 && d < this.desiredFlockSize) {
                sum.add(critter.position);
                count++;
            }
        }

        if (count > 0) {
            sum.divide(new Victor(count, count));
            return this.seek(sum)
        } else {
            return new Victor(0, 0);
        }
    }
}

module.exports = Boid;