//working title for all the donation input/output & funds checking, etc.
//will be an object that is loaded from the db and interacts with the db throughout

function Conduit(){
    this.placesToDonate = ["foundation A", "non-profit B", "org C", "school D", "program E"];
    this.fundsRaised = {
        "foundation A": 0,
        "non-profit B": 0,
        "org C": 0,
        "school D": 0,
        "program E": 0
    };
}

// Conduit.prototype.getRandomTarget = () => {
//     let r = Math.floor(Math.random() * this.placesToDonate.length);
//     let target = this.placesToDonate[r];
//     return target;
// }
//wtf why does anonymous not work?
Conduit.prototype.getRandomTarget = function getRandomTarget() {
    let r = Math.floor(Math.random() * this.placesToDonate.length);
    let target = this.placesToDonate[r];
    console.log(target);
    return target;
}

// Conduit.prototype.getRandomTarget = (c) => {
//     let r = Math.floor(Math.random() * c.placesToDonate.length);
//     let target = c.placesToDonate[r];
//     return target;
// }

// checkFundsRaised() {
//     let totalRaised = 0;
//     for (let place in this.fundsRaised) {
//       totalRaised += this.fundsRaised[place];
//     }
//     console.log('total funds raised = $' + totalRaised / 100);
//   }

module.exports = Conduit;