class Ecosystem {
  constructor(num) {
    //at start of world
    this.critters = [];
    this.mateDistance = 3; //arbitrary for testing

    for (let i = 0; i < num; i++) {
      // let newPos = createVector(random(width), random(height));
      // let newDNA = new DNA();
      // this.critters.push(new Critter(newPos, newDNA));
      this.critters.push(new Critter());

    }
  }

  //currently not using this, but good placeholder for adding new agents
  // birthNewBaby(x, y) {
  //   //birth a new baby at position x,y
  //   let babyPos = createVector(x, y);
  //   let dna = new DNA();
  //   this.critters.push(new Critter(babyPos, dna));
  // }

  run() {
    //TODO rename to something different than critter.run()
    for (let i = this.critters.length - 1; i >= 0; i--) {
      this.critters[i].run();
    }
    this.checkForMates();
  }

  checkForMates() {
    //for the reproduction check
    let matePool = [];
    this.critters.forEach((c) => {
      matePool.push(c);
    }); //trying this instead of forloop

    // for (let i = matePool.length - 1; i >= 0; i--) { // but forloop here because removing while running?
    for (let i = this.critters.length - 1; i >= 0; i--){
      if (this.critters[i].mateTimer <= 0 && this.critters[i].lifeForce >= this.critters[i].DNA.minLifeToReproduce) { //using <= just to be safe
        // for (let j = matePool.length - 2; j >= 0; j--) {
        // for (let j = this.critters.length - 2; j >= 0; j--) {
        for (let j = 0; j < i; j++) { //really trying to not overlap with self

          if (this.critters[j].mateTimer <= 0 && this.critters[j].lifeForce >= this.critters[j].DNA.minLifeToReproduce) { //if both parents are ready
            if (
              dist(
                this.critters[i].position.x,
                this.critters[i].position.y,
                this.critters[j].position.x,
                this.critters[j].position.y
              ) <= this.mateDistance
            ) {
              console.log("mate found at " + this.critters[i].position.x + " " + this.critters[i].position.y);
              //start refractory period, NEED to do this before sending DNA or else baby will be DTF?
              this.critters[i].mateTimer += this.critters[i].DNA.refractoryPeriod;
              this.critters[j].mateTimer += this.critters[j].DNA.refractoryPeriod;
              console.log("parentA Life Force: " + this.critters[i].lifeForce + " and minLifeNeeded: " + this.critters[i].DNA.minLifeToReproduce);
              console.log("parentB Life Force: " + this.critters[j].lifeForce + " and minLifeNeeded: " + this.critters[j].DNA.minLifeToReproduce);

              let parentSacrificeA = this.critters[i].lifeForce * this.critters[i].DNA.parentalSacrifice;
              this.critters[i].lifeForce -= parentSacrificeA;
              let parentSacrificeB = this.critters[j].lifeForce * this.critters[j].DNA.parentalSacrifice;
              this.critters[j].lifeForce -= parentSacrificeB;
              let inheritance = parentSacrificeA + parentSacrificeB;
              console.log("inheritance = " + inheritance);
              // let newBaby = this.critters[i].reproduce(this.critters[j].DNA);
              let newBaby = new Critter(this.critters[i], this.critters[j], inheritance);
              this.critters.push(newBaby);

              //don't need to push new baby array at end because if push, goes to end and therefore won't mess with critter indexes?

            }
          }
        }
      } else {
        this.critters[i].mateTimer -= 1;
      }
    // matePool.splice(i, 1); //need to remove or will mate with self
  }
}
}