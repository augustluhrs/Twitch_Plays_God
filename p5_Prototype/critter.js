//class for the lilboys

class Critter {
    constructor(pos, _dna){
      this.position = pos.copy(); //b/c a vector
      this.xOff = random(1000); //for perlin noise
      this.yOff = random(1000);
      this.dna = _dna; //dna
      this.maxSpeed = random(0,15);
      this.color = color(random(0,150), random(50,255), random(50,255));
      this.r = random(10,30);
    }
    
    run(){
      this.update();
      this.borders();
      this.display();
    }
    update(){
      //perlin noise movement
      let vx = map(noise(this.xOff), 0, 1, -this.maxSpeed, this.maxSpeed);
      let vy = map(noise(this.yOff), 0, 1, -this.maxSpeed, this.maxSpeed);
      let velocity = createVector(vx, vy);
      this.xOff += 0.01;
      this.yOff += 0.01;
  
      this.position.add(velocity);
    }
    borders(){
      if (this.position.x < -this.r) this.position.x = width + this.r;
      if (this.position.y < -this.r) this.position.y = height + this.r;
      if (this.position.x > this.width + this.r) this.position.x = -r;
      if (this.position.y > this.height + this.r) this.position.y = -r;
    }
    display(){
      ellipseMode(CENTER);
      noStroke();
      fill(this.color);
      ellipse(this.position.x, this.position.y, this.r);
    }
    
  }