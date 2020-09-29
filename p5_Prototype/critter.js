//class for the lilboys

class Critter {
    //   constructor(pos, _DNA) {
    constructor(parentA, parentB, inheritance) {
        //new critter
        // this.position = pos.copy(); //b/c a vector
        this.xOff = random(1000); //for perlin noise
        this.yOff = random(1000);
        if (parentA == null || parentB == null) {
            this.position = createVector(random(width), random(height));
            this.DNA = new DNA();
            this.lifeForce = random(50, 150); //adjust later
        } else {
            this.position = createVector(parentA.position.x, parentB.position.y); //not the best way but w/e for now
            //crossover here now
            if(random()<0.5){
                this.DNA = parentA.DNA;
            } else {
                this.DNA = parentB.DNA;
            }

            this.lifeForce = inheritance;

            //mutation

        }

        //   this.dna = new DNA(); //in ecosystem
        // this.DNA = _DNA;

        //redundant
        this.maxSpeed = this.DNA.maxSpeed;
        this.color = this.DNA.color;
        this.r = this.DNA.r;


        this.mateTimer = Math.floor(random(100, 1000));
    }

    run() {
        this.update();
        this.borders();
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
        if (this.position.x > this.width + this.r) this.position.x = -r;
        if (this.position.y > this.height + this.r) this.position.y = -r;
    }

    display() {
        ellipseMode(CENTER);
        noStroke();
        this.color.setRed(map(this.lifeForce, 0, 150, 0, 255));
        fill(this.color);
        ellipse(this.position.x, this.position.y, this.r);
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