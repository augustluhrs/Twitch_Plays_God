class Food{ //overkill? a good placeholder maybe
    constructor(amount, pos){
        this.amount = amount;
        this.position = pos;
        this.ripeRate = 100;
    }

    display(){
        if(this.ripeRate > 0){
            this.ripeRate -= 1;
        }
        let ripeFade = map(this.ripeRate, 100, 0, 100, 255);
        fill(0, ripeFade);
        rect(this.position.x, this.position.y, 5);
    }
}