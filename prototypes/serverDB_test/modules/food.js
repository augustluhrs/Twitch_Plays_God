const D = require("./defaults");
var d = new D();
class Food {
    constructor(amount, pos) {
        this.amount = amount;
        this.position = pos;
        this.ripeRate = 100;
    }

    display() {
        if(this.ripeRate > 0){
            this.ripeRate -= 1;
        }
        //using DIY p5.map
        let ripeFade = d.map(this.ripeRate, 100, 0, 80, 255);
        return {position: this.position, fade: ripeFade}; //to display over socket
    }
}

module.exports = Food;