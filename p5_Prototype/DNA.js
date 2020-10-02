//class for the heritable traits (genotypes)

class DNA {
    constructor() {
        //for brand new DNA
        this.color = color(255, random(50, 255), random(50, 255));
        this.r = random(5, 50);
        this.maxSpeed = map(this.r, 5, 50, 15, 0);
        // this.mateTimer = Math.floor(Math.random(0,100)); 
        //refractory period before can mate again
        this.refractoryPeriod = Math.floor(random(30, 100)); //doesn't need floor if using <= but w/e
        this.parentalSacrifice = random();
        this.minLifeToReproduce = random(10,100);
        this.excretionRate = Math.floor(random(1000, 10000));
    }
}