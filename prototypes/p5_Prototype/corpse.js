class Corpse{
    constructor(pos, r){
        this.position = pos;
        this.r = r;
        this.decayTimer = random(100,1000);
        this.decayRate = this.decayTimer; //don't have a good name for this, just for map
    }
    decay(){
        this.decayTimer -= 1;
        if (this.decayTimer <= 0){
            return true; //fully decayed
        } else {
            return false;
        }
    }

    display(){
        let fade = map(this.decayTimer, this.decayRate, 0, 255, 0);
        fill(255,255,255,fade);
        ellipse(this.position.x, this.position.y, this.r);    
    }
}