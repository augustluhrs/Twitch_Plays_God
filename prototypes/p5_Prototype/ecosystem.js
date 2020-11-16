class Ecosystem {
// function Ecosystem(){
  constructor(num) {
    //at start of world
    this.width = windowWidth;
    this.height = windowHeight;
    this.critters = [];
    this.critterCount = 0;
    this.corpses = [];
    this.supply = [];
    this.mateDistance = 3; //arbitrary for testing
    this.fundsRaised = {
      "foundation A": 0,
      "non-profit B": 0,
      "org C": 0,
      "school D": 0,
      "program E": 0
    };

    for (let i = 0; i < num; i++) {
      // let newPos = createVector(random(width), random(height));
      // let newDNA = new DNA();
      // this.critters.push(new Critter(newPos, newDNA));
      this.critters.push(new Critter());
    }
  }
  name(){
    //doing this a weird way because classes aren't hoisted and havent figured out different way
    for (let i = 0; i < this.critters.length; i++) {
      this.critters[i].name = i.toString();
      this.critters[i].ancestry = {child: i.toString(), parents:["august"]}; //okay so if user, one parent. assign in creator
      // this.critters[i].ancestry["parents"][0] = i.toString();
      this.critterCount++;
    }
  }

  checkFundsRaised(){
    let totalRaised = 0;
    for(let place in this.fundsRaised){
      totalRaised += this.fundsRaised[place];
    }
    console.log('total funds raised = $' + totalRaised/100);
  }

  run() {
    for (let i = this.supply.length - 1; i >= 0; i--) {
      this.supply[i].display();
    }

    //TODO rename to something different than critter.run()
    for (let i = this.critters.length - 1; i >= 0; i--) {
      this.critters[i].run();
    }
    this.checkForFood();
    this.checkForMates();


    for (let i = this.corpses.length - 1; i >= 0; i--) {
      let absolution = this.corpses[i].decay(); //idk what name lol
      this.corpses[i].display();
      if (absolution) {
        this.corpses.splice(i, 1);
        // console.log('corpse fully decomposed');
      }
    }
  }

  makeFood(amount, pos) {
    this.supply.push(new Food(amount, pos));
    // console.log(this.supply.length + " : " + pos);
  }

  decompose(deadCritter) {
    for (let i = 0; i < this.critters.length; i++) { //don't need to go backward because returning after 1?
      if (this.critters[i] == deadCritter) { //if this doesn't work, need to check id/name
        // console.log('dead critter at: ' + this.critters[i].position.x + " " + this.critters[i].position.y);
        console.log("critter " + this.critters[i].name + " is dead");
        //TODO add a dead body
        // let corpseR = //i don't understand pointers/references...
        let corpsePos = {
          x: this.critters[i].position.x,
          y: this.critters[i].position.y
        };
        this.corpses.push(new Corpse(corpsePos, this.critters[i].r))
        this.critters.splice(i, 1);
        return;
      }
    };
  }

  checkForFood() {
    for (let i = this.critters.length - 1; i >= 0; i--) {
      for (let j = this.supply.length - 1; j >= 0; j--) {
        if (this.supply[j].ripeRate <= 0) {
          if (dist(this.critters[i].position.x, this.critters[i].position.y, this.supply[j].position.x, this.supply[j].position.y) < this.critters[i].r) {
            this.critters[i].lifeForce += this.supply[j].amount;
            this.supply.splice(j, 1);
            // console.log(i + " nommed");
          }
        }
      }
    }
  }

  checkForMates() {
    //for the reproduction check
    let matePool = [];
    this.critters.forEach((c) => {
      matePool.push(c);
    }); //trying this instead of forloop

    // for (let i = matePool.length - 1; i >= 0; i--) { // but forloop here because removing while running?
    for (let i = this.critters.length - 1; i >= 0; i--) {
      if (this.critters[i].mateTimer <= 0 && this.critters[i].lifeForce >= this.critters[i].minLifeToReproduce) { //using <= just to be safe
        // for (let j = matePool.length - 2; j >= 0; j--) {
        // for (let j = this.critters.length - 2; j >= 0; j--) {
        for (let j = 0; j < i; j++) { //really trying to not overlap with self

          if (this.critters[j].mateTimer <= 0 && this.critters[j].lifeForce >= this.critters[j].minLifeToReproduce) { //if both parents are ready
            if (
              dist(
                this.critters[i].position.x,
                this.critters[i].position.y,
                this.critters[j].position.x,
                this.critters[j].position.y
              ) <= (this.critters[i].r/2) + (this.critters[j].r/2) //not this.mateDistance anymore
            ) {
              // console.log("mate found at " + this.critters[i].position.x + " " + this.critters[i].position.y);
              //start refractory period, NEED to do this before sending DNA or else baby will be DTF?
              this.critters[i].mateTimer += this.critters[i].refractoryPeriod;
              this.critters[j].mateTimer += this.critters[j].refractoryPeriod;
              // console.log("parentA Life Force: " + this.critters[i].lifeForce + " and minLifeNeeded: " + this.critters[i].minLifeToReproduce);
              // console.log("parentB Life Force: " + this.critters[j].lifeForce + " and minLifeNeeded: " + this.critters[j].minLifeToReproduce);

              let parentSacrificeA = this.critters[i].lifeForce * this.critters[i].parentalSacrifice;
              this.critters[i].lifeForce -= parentSacrificeA;
              let parentSacrificeB = this.critters[j].lifeForce * this.critters[j].parentalSacrifice;
              this.critters[j].lifeForce -= parentSacrificeB;
              let inheritance = parentSacrificeA + parentSacrificeB;
              // console.log("inheritance = " + inheritance);
              // let newBaby = this.critters[i].reproduce(this.critters[j]);
              let newBaby = new Critter(this.critters[i], this.critters[j], inheritance);
              this.critters.push(newBaby);
              console.log('new baby ' + newBaby.name + '! ' + ' from ' + this.critters[i].name + " and " + this.critters[j].name);
              this.critterCount++;
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