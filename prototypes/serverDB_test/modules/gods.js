// just for keeping user funds for now

class Gods {
    constructor (gods) {
        if (gods != undefined){
            this.gods = gods;
        } else {
            this.gods = []; //array so can insert in db
        }
    }

    addGod (god) {
        this.gods.push(god);
    }

    updateRecords (id, donation) {

    }

    login (username, password) {

    }

    backup () {
        return this.gods;
    }
}

module.exports = Gods;