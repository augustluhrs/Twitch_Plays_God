// just for keeping user funds for now
//each god needs username, password, funds, id, and donation record / misc info
const D = require('./defaults');

class Gods {
    constructor (gods) {
        if (gods != undefined){
            this.gods = gods;
        } else {
            this.gods = []; //array so can insert in db
        }
    }

    addGod (username, password) {
        let god = {
            username: username,
            password: password,
            id: D.generate_ID(),
            funds: 0,
            donations: []
        }
        this.gods.push(god);
    }

    checkFunds(username) {
        for (let god of this.gods) {
            if (username == god.username) {
                return god.funds;
            }
        }
    }

    addFunds(username, amount) { //should use id for this, but fine for now
        for (let god of this.gods) {
            if (username == god.username) {
                god.funds += amount;
            }
            // return god.funds;
        }
        // return 999999 // hmm
    }

    //point of this? should just have updateFunds and do both add and subtract there...
    subtractFunds (username, amount) {
        for (let god of this.gods) {
            if (username = god.username) {
                god.funds -= amount;
            }
        }
    }
    //eventually could combine these two
    updateDonation (id, donation) {

    }

    login (username, password) {
        for (let god of this.gods) {
            if (username == god.username && password == god.password){
                return [true, god]
            }
        }
        return [false, null]
    }

    backup () {
        return this.gods;
    }
}

module.exports = Gods;