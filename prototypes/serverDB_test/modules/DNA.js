//class for the heritable traits (genotypes)

class DNA {
    constructor(_DNA) {
        if (_DNA != undefined) {
            if (_DNA.genes != undefined) { // baby -- need to generate from genes because that's whats being manipulated in crossover
                this.genes = [];
                for (let [i,gene] of _DNA.genes.entries()) {
                    this.genes[i] = gene;
                }
                //this is so whack -- gotta redo TODO
                this.color = this.genes[0];
                this.r = this.genes[1];
                this.maxSpeed = this.genes[2];
                this.refractoryPeriod = this.genes[3];
                this.parentalSacrifice = this.genes[4];
                this.minLifeToReproduce = this.genes[5];
                this.excretionRate = this.genes[6];
                this.mutationRate = this.genes[7];
                this.minLifeToDonate = this.genes[8];
                this.donationPercentage = this.genes[9];
                this.donationRate = this.genes[10];
                // this.color = _DNA.color;
                // this.r = _DNA.r;
                // this.maxSpeed = _DNA.maxSpeed;
                // this.refractoryPeriod = _DNA.refractoryPeriod;
                // this.parentalSacrifice = _DNA.parentalSacrifice;
                // this.minLifeToReproduce = _DNA.minLifeToReproduce;
                // this.excretionRate = _DNA.excretionRate;
                // this.mutationRate = _DNA.mutationRate;
                // this.minLifeToDonate = _DNA.minLifeToDonate;
                // this.donationPercentage = _DNA.donationPercentage;
                // this.donationRate = _DNA.donationRate;
                // this.genes = _DNA.genes;
            } else if (_DNA != undefined) { // user created, doesn't have genes... 
                this.color = _DNA.color;
                this.r = _DNA.r;
                this.maxSpeed = _DNA.maxSpeed;
                this.refractoryPeriod = _DNA.refractoryPeriod;
                this.parentalSacrifice = _DNA.parentalSacrifice;
                this.minLifeToReproduce = _DNA.minLifeToReproduce;
                this.excretionRate = _DNA.excretionRate;
                this.mutationRate = _DNA.mutationRate;
                this.minLifeToDonate = _DNA.minLifeToDonate;
                this.donationPercentage = _DNA.donationPercentage;
                this.donationRate = _DNA.donationRate;
                this.genes = [
                    this.color,
                    this.r,
                    this.maxSpeed,
                    this.refractoryPeriod,
                    this.parentalSacrifice,
                    this.minLifeToReproduce,
                    this.excretionRate,
                    this.mutationRate,
                    this.minLifeToDonate,
                    this.donationPercentage,
                    this.donationRate
                ]
            } else {
                console.log("DNA weird error")
            }
    } else { //brand new DNA -- totally random
        this.color = [Math.random(), Math.random(), Math.random()];
        this.r = Math.random();
        this.maxSpeed = Math.random();
        this.refractoryPeriod = Math.random();
        this.parentalSacrifice = Math.random();
        this.minLifeToReproduce = Math.random();
        this.excretionRate = (this.r + this.maxSpeed)/2;
        this.mutationRate = Math.random() * 0.05;
        this.minLifeToDonate = Math.random();
        this.donationPercentage = Math.random();
        this.donationRate = Math.random();
        //probably could redo this layout, but fine for now
        this.genes = [
            this.color,
            this.r,
            this.maxSpeed,
            this.refractoryPeriod,
            this.parentalSacrifice,
            this.minLifeToReproduce,
            this.excretionRate,
            this.mutationRate,
            this.minLifeToDonate,
            this.donationPercentage,
            this.donationRate
        ]
    }
            //damn need to do this for both after user creation changes -- no wait, if creating from DNA, needs to generate from genes not other way
        // this.genes = [
        //     this.color,
        //     this.r,
        //     this.maxSpeed,
        //     this.refractoryPeriod,
        //     this.parentalSacrifice,
        //     this.minLifeToReproduce,
        //     this.excretionRate,
        //     this.mutationRate,
        //     this.minLifeToDonate,
        //     this.donationPercentage,
        //     this.donationRate
        // ]
    }
}

module.exports = DNA;