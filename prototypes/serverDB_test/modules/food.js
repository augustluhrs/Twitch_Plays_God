const D = require("./defaults");
// var d = new D();

class Food {
    constructor(food, pos) {
        if (typeof food === "number") {
            this.amount = food;
            this.position = pos;
            this.ripeRate = 100;
            this.id = D.generate_ID();
            // this.hasBeenEaten = false;
        } else { //create from db
            this.amount = food.amount;
            this.position = food.position;
            this.ripeRate = food.ripeRate;
            this.id = food.id;
        }
       
    }

    display() {
        if(this.ripeRate > 0){
            this.ripeRate -= 1;
        }
        //using DIY p5.map
        let ripeFade = D.map(this.ripeRate, 100, 0, 80, 255);
        return {position: this.position, fade: ripeFade}; //to display over socket
    }
}

module.exports = Food;