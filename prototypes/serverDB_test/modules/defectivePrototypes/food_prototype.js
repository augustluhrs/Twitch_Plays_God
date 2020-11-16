const d = require("./defaults");

function Food(amount, pos) {
    this.amount = amount;
    this.position = pos;
    this.ripeRate = 100;
}

Food.prototype.display = () => {
    if(this.ripeRate > 0){
        this.ripeRate -= 1;
    }
    //using DIY p5.map -- how do i use p5 with node??
    let ripeFade = d.map(this.ripeRate, 100, 0, 80, 255);
    return {x: this.position.x, y: this.position.y, fade: ripeFade}; //to display over socket
}

module.exports = Food;