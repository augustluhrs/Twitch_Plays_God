//class for the lilboys

class Critter {
    //   constructor(pos, _DNA) {
    constructor(parentA, parentB, inheritance) {
        //new critter
        // this.position = pos.copy(); //b/c a vector
        this.xOff = random(1000); //for perlin noise
        this.yOff = random(1000);
        this.DNA = new DNA(); //will get overwritten if child
        
        if (parentA == null || parentB == null) {
            // this.position = createVector(random(width), random(height));
            // console.log(ecosystem.width);
            //need a promise or something, not sure why eco.width isn't here
            this.position = createVector(random(100, 800), random(100, 800));
            // this.DNA = new DNA();
            // this.lifeForce = random(50, 150); //adjust later
            this.lifeForce = 100;
        } else {
            this.position = createVector(parentA.position.x, parentB.position.y); //not the best way but w/e for now
            
            //crossover here now
            
            //color is a mix
            this.DNA.genes[0] = lerpColor(parentA.DNA.genes[0], parentB.DNA.genes[0], random());
            //for all genes but color, normal lerp
            for(let i = 1; i < 8; i++){ //hardcoding num genes for now
                this.DNA.genes[i] = lerp(parentA.DNA.genes[i], parentB.DNA.genes[i], random());
                // if(random()<0.5){
                //     this.DNA.genes[i] = parentA.DNA.genes[i];
                // } else {
                //     this.DNA.genes[i] = parentB.DNA.genes[i];
                // }
            }
            this.DNA = new DNA(this.DNA); //hmm, this could be better
            this.lifeForce = inheritance;

            //mutation
            // if(random() < this.DNA.mutationRate){

            // }
        }

        //redundant TODO
        this.maxSpeed = this.DNA.maxSpeed;
        this.color = this.DNA.color;
        this.r = this.DNA.r;


        this.mateTimer = Math.floor(random(100, 1000));
        this.excretionTimer = Math.floor(random(0, 500));
        this.foodScale = 10; //where else can I set this?
    }

    run() {
        this.update();
        this.borders();
        this.excrete();
        this.display();
    }

    update() {
        //perlin noise movement
        let vx = map(noise(this.xOff), 0, 1, -this.maxSpeed, this.maxSpeed);
        let vy = map(noise(this.yOff), 0, 1, -this.maxSpeed, this.maxSpeed);
        let velocity = createVector(vx, vy);
        this.xOff += 0.01;
        this.yOff += 0.01;

        this.position.add(velocity);
    }

    borders() {
        if (this.position.x < -this.r) this.position.x = width + this.r;
        if (this.position.y < -this.r) this.position.y = height + this.r;
        if (this.position.x > ecosystem.width + this.r) this.position.x = -this.r;
        if (this.position.y > ecosystem.height + this.r) this.position.y = -this.r;
    }

    display() {
        ellipseMode(CENTER);
        noStroke();
        // this.color.setRed(map(this.lifeForce, 0, 150, 0, 255));
        fill(this.color);
        ellipse(this.position.x, this.position.y, this.r);
    }

    excrete(){
        this.excretionTimer += 1;
        if(this.excretionTimer >= this.DNA.excretionRate){
            // console.log("excretion at: " + this.position);
            this.lifeForce -= this.foodScale;
            let newFood;
            if(this.lifeForce == 0){ //very unlikely it's exactly 0
                this.die();
                newFood = this.foodScale;
            } else if (this.lifeForce < 0){
                newFood = abs(this.lifeForce); //to make sure it only excretes the amount it had left
                this.die();
            } else {
                newFood = this.foodScale;
                this.excretionTimer = 0;
            }
            let foodPos = {x: this.position.x, y: this.position.y};
            ecosystem.makeFood(newFood, foodPos); //needs a timer so it doesn't pick it back up
        }
    }

    die(){
        ecosystem.decompose(this);
    }

    //TODO find a way to check neighbors without going through whole array
    //wait, i should be checking this in ecosystem to use that array
    /*
    reproduce(otherDNA) { //only happening once per pairing based on array iteration
      //for now just making babyPos offset this parent
      let babyPos = new createVector(this.position.x + random(-3, 3), this.position.y + random(-3, 3));
      let babyDNA;
      //crossover function needed, for now will randomly pick between parent DNA
      if(random()<0.5){
          babyDNA = this.DNA;
      } else {
          babyDNA = otherDNA;
      }

      //mutation

      //send it out
      let babyCritter = new Critter(babyPos, babyDNA);

      return babyCritter;
    }
    */
}