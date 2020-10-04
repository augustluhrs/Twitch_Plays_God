//class for the heritable traits (genotypes)

class DNA {
    constructor(_DNA) {
        if (_DNA != null) {
            this.color = _DNA.color;
            this.r = _DNA.r;
            this.maxSpeed = _DNA.maxSpeed;
            this.refractoryPeriod = _DNA.refractoryPeriod;
            this.parentalSacrifice = _DNA.parentalSacrifice;
            this.minLifeToReproduce = _DNA.minLifeToReproduce;
            this.excretionRate = _DNA.excretionRate;
            this.mutationRate = _DNA.mutationRate;
            this.genes = _DNA.genes;
        } else {
            //for brand new DNA
            // this.color = color(255, random(50, 255), random(50, 255));
            this.color = color(random(255), random(255), random(255));
            this.r = random(5, 50);
            this.maxSpeed = map(this.r, 5, 50, 15, 0);

            //refractory period before can mate again
            this.refractoryPeriod = Math.floor(random(30, 100)); //doesn't need floor if using <= but w/e
            this.parentalSacrifice = random();
            this.minLifeToReproduce = random(10, 100);
            this.excretionRate = Math.floor(random(1000, 10000));
            this.mutationRate = random() * 0.05;

            this.genes = [
                this.color,
                this.r,
                this.maxSpeed,
                this.refractoryPeriod,
                this.parentalSacrifice,
                this.minLifeToReproduce,
                this.excretionRate,
                this.mutationRate
            ]
        }
    }
}