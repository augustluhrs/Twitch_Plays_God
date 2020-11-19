function Corpse(pos, r) {
    this.position = pos;
    this.r = r;
    //not using random decay anymore
    this.decayTimer = 1000;
}

Corpse.prototype.decay = () => {
    this.decayTimer -= 1;
    if (this.decayTimer <= 0){
        return true; //fully decayed
    } else {
        return false;
    }
}

Corpse.prototype.display = () => {
    let fade = this.decayTimer / 1000 * 255;
    return {x: this.position.x, y: this.position.y, r: this.r, fade: fade}; 
}

module.exports = Corpse;
