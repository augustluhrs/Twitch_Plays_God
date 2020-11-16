class Corpse {
    constructor(pos,r) {
        this.position = pos;
        this.r = r;
        //not using random decay anymore
        this.decayTimer = 1000;
    }
    decay() {
        this.decayTimer -= 1;
        if (this.decayTimer <= 0){
            return true; //fully decayed
        } else {
            return false;
        }
    }

    display() {
        let fade = this.decayTimer / 1000 * 255;
        return {position: this.position, r: this.r, fade: fade}; 
    }
}

module.exports = Corpse;
