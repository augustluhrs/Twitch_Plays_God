//class for the heritable traits (genotypes)

function DNA(_DNA) {
    if (_DNA != null) {
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
        this.genes = _DNA.genes;
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
}

module.exports = DNA;