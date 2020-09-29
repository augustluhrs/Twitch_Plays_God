class Ecosystem {
    constructor(num) {
      this.critters = [];
  
      for (let i = 0; i < num; i++) {
        let newPos = createVector(random(width), random(height));
        this.critters.push(new Critter(newPos, 0));
      }
    }
    
    run(){ //TODO rename to something different than critter.run()
  
      for (let i = this.critters.length - 1; i >= 0; i--) {
        this.critters[i].run();
      }
      
    }
  
  
  }
  
  