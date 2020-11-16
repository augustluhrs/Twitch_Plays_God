//working title for all the donation input/output & funds checking, etc.
//will be an object that is loaded from the db and interacts with the db throughout

class Conduit{
    constructor() {
        this.placesToDonate = ["foundation A", "non-profit B", "org C", "school D", "program E"];
        this.fundsRaised = {
            "foundation A": 0,
            "non-profit B": 0,
            "org C": 0,
            "school D": 0,
            "program E": 0
        };
    }
    getRandomTarget(){
        let r = Math.floor(Math.random() * this.placesToDonate.length);
        let target = this.placesToDonate[r];
        return target;
    }
 
}

module.exports = Conduit;