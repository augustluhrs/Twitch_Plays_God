class Corpse {
    constructor (corpse) {
        this.position = corpse.position;
        this.r = corpse.r;
        //not using random decay anymore
        this.decayTimer = corpse.decayTimer || 1000;
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
