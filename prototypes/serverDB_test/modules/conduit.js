//working title for all the donation input/output & funds checking, etc.
//will be an object that is loaded from the db and interacts with the db throughout

class Conduit{
    constructor(conduit) {
        if(conduit != undefined){
            this.donations = conduit.donations;
            this.totalRaised = conduit.totalRaised;
        } else { //new conduit -- defaults to four targets
            this.donations = [ //array so can sort
                //maybe eventually will need other class to generate these objects
                {   target: "NAACP",
                    funds : 0,
                    link : "https://naacp.org/take-action/"
                },
                {   target: "Critical Role Foundation",
                    funds : 0,
                    link : "https://critrole.com/foundation/"
                },
                {   target: "Processing Foundation",
                    funds : 0,
                    link : "https://processingfoundation.org/"
                },
                {   target: "PETA",
                    funds : 0,
                    link : "https://www.peta.org/"
                }
            ]
            this.totalRaised = 0;
        }  
    }
    //updates after socket message -- in ecosystem
    // makeDonation(target, donation) {
    makeDonation(donations) {
        let targetA = donations[0].target;
        let targetB = donations[1].target;
        let donationA = donations[0].amount;
        let donationB = donations[1].amount;
        console.log(donations);

        //hate that i can't think of a better all-encompassing name for this object
        for (let org of this.donations) {
            if (org["target"] == targetA) {
                org["funds"] += parseFloat(donationA.toFixed(2));
            }
            if (org["target"] == targetB) {
                org["funds"] += parseFloat(donationB.toFixed(2));
            }
        }
        // console.log("before");
        // console.log(this.donations);
        //sort for use by client side scroll -- sorting by object properties thanks to https://flaviocopes.com/how-to-sort-array-of-objects-by-property-javascript/
        this.donations = this.donations.sort((a, b) => {
            // (a.funds < b.funds) ? 1 : -1 //less than because sorting biggest first
            if (a.funds < b.funds) { return 1 }
            else { return -1 }
        });
        // console.log("after");
        // console.log(this.donations);
        // backupDonations();
        //update total Raised in ecosystem because then sends the update of worldLIfe too
        // console.log(`askdfljasdlfk ${donationA + donationB}`)
        return parseFloat((donationA + donationB).toFixed(2)); //ughhhh
    }
    //might eventually need a separate sort/update function if too much sorting is too expensive

    checkNewCritterTargets (donations) { //confusing b/c critter.donations and donation message are objects with "target" "amount" "total"
        let targetA = donations[0].target;
        let targetB = donations[1].target;
        let newOrgA = true;
        let newOrgB = true;
        for (let org of this.donations) {
            if (org["target"] == targetA) {
                newOrgA = false;
            }
            if (org["target"] == targetB) {
                newOrgB = false;
            }
        }
        //new donation target
        if (newOrgA) {
            this.donations.push({
                target: targetA,
                funds: 0,
                link: null
            })     
        }
        if (newOrgB) {
            this.donations.push({
                target: targetB,
                funds: 0,
                link: null
            })     
        }  
    }

    //only for spawning random critters
    getRandomTarget(){
        let r = Math.floor(Math.random() * this.donations.length);
        let target = Object.keys(this.donations[r])[0];
        return target;
    }

    backup() {
        return this; // need to test if works TODO
    }
}

module.exports = Conduit;