/**
 *  TWITCH PLAYS GOD
 * 
 *  Fall 2020 -- August Luhrs
 * 
 * 
 */


/*
    ~ * ~ * ~ * VARIABLES
    ~ * ~ * ~ * 
    ~ * ~ * ~ * 
    ~ * ~ * ~ * 
*/

//create server
let port = process.env.PORT || 8080;
let express = require('express');
let app = express();
let server = require('http').createServer(app).listen(port, function(){
  console.log('Server is listening at port: ', port);
});

//where we look for files
app.use(express.static('public'));

//nedb database stuff
const Datastore = require('nedb');
// let db = new Datastore({filename: "databases/test.db", autoload: true});
// let db = new Datastore({filename: "databases/test.db", autoload: true});
// let backupDB = new Datastore({filename: "databases/backups.db", autoload: true});
let godsDB = new Datastore({filename: "databases/gods.db", autoload: true});
// let crittersDB = new Datastore({filename: "databases/critters.db", autoload: true});
let ecosystemDB = new Datastore({filename: "databases/ecosystem.db", autoload: true});
let donationsDB = new Datastore({filename: "databases/donations.db", autoload: true});
//because different types, could use same db, but want to isolate for testing for now, plus maybe small speed bump?

// const {AsyncNedb} = require('nedb-async');
// let db = new AsyncNedb({filename: "databases/test.db", autoload: true});
// let backupDB = new AsyncNedb({filename: "databases/backups.db", autoload: true});
// let godsDB = new AsyncNedb({filename: "databases/gods.db", autoload: true});
// let critterDB = new AsyncNedb({filename: "databases/critters.db", autoload: true});
// let ecosystemDB = new AsyncNedb({filename: "databases/ecosytem.db", autoload: true});
// let fundsDB = new AsyncNedb({filename: "databases/funds.db", autoload: true});

//gods
const Gods = require("./modules/gods");
let gods;
let users = []; //need to track who's participating in the events
let userIcons = {
    feastIcons: [],
}
//ecosystem
const Ecosystem = require("./modules/ecosystem");
let ecosystem;
// ecosystemSetup();

//donations
let donations = undefined;

//acts of god timer and state
let timerStart = Date.now();
// let timerCurrent = 0;
// let timerVoting = 60; //60 seconds
let actState = "voting";
let lastState = "";
let hasAskedForVotes = false;
let seedCritters = [];

/*
    ~ * ~ * ~ * MAIN FUNCTION
    ~ * ~ * ~ * 
    ~ * ~ * ~ * set up the gods, donations, and ecosystem from their respective DBs. 
    ~ * ~ * ~ * the main update loop is in the setInterval at the bottom
*/

//main
init();
function init() {
    godsSetup();
    donationsSetup(); 
    // ecosystemSetup(); //now in donationSetup
    // ecosystem.backupAll();
}

function godsSetup() {
    console.log("looking for gods");
    godsDB.find({type: "godsUpdate"}, (err, docs) => {
        if (err) {
            console.log("god DB error: " + err);
        }
        if (docs.length != 0) {
            //existing users
            let existingGods = [];
            for (let g of docs[0].gods) { //not doing individual insert yet
                existingGods.push(g);
            }
            gods = new Gods(existingGods);
        } else {
            //no users
            gods = new Gods();
        }
    })
}

async function ecosystemSetup(){
    console.log('setting up ecosystem');
    ecosystemDB.find({type: "ecosystemUpdate"}, (ecoErr, ecoDocs) => {
        if (ecoErr) {console.log("eco setup err: " + ecoErr)};
        if (ecoDocs.length != 0) { //entering callback hell because need conduit db and critter db
            ecosystem = new Ecosystem({ecosystem: ecoDocs[0].ecosystem, donations: donations});
            ecosystem.backupAll();
        } else { //new eco, which means no critters anyway, but should keep track of donations
            // ecosystem = new Ecosystem(0); //want to set up empty but still have donations so need empty eco obj
            let blankEco = {
                supply: [],
                corpses: [],
                critters: [],
                communityFunds: 0,
                genesisFunds: 0
            }
            ecosystem = new Ecosystem({ecosystem: blankEco, donations: donations}); //donations will stay undefined if not found, so conduit constructor still works
            ecosystem.backupAll();
        }
    });
}

function donationsSetup () {
    donationsDB.find({type: "donationsUpdate"}, (donErr, donDocs) => {
        if (donErr) {console.log("donations setup err: " + donErr)};
        if (donDocs.length != 0) {
            donations = donDocs[0].donations;
            console.log('donations found');
            ecosystemSetup();
        } else {
            console.log ('no donations yet or weird donations setup err');
            ecosystemSetup();
        }
    });
}

/*
    ~ * ~ * ~ * DATABASE FUNCTIONS
    ~ * ~ * ~ * 
    ~ * ~ * ~ * database stuff
    ~ * ~ * ~ * the ping pong is bad design, should reformat eventually to just sending the update as an argument
*/

global.backupEcosystem = function(){ //ecosystem
    let ecoLog = ecosystem.backupEcosystem();
    ecosystemDB.update({type: "ecosystemUpdate"}, {type: "ecosystemUpdate", time: Date.now(), ecosystem: ecoLog}, {upsert: true}, (err) => {
        if (err) {
            console.log("ecosystem update err: " + err);
        }
        console.log('ecosystem db updated');
    });
}

// global.backupCritters = function(){ //critters
//     let currentCritters = ecosystem.backupCritters(); //right now not keeping track of any dead critters
//     crittersDB.update({type: "crittersUpdate"}, {type: "crittersUpdate", time: Date.now(), critters: currentCritters}, {upsert: true}, (err) => {
//         if (err) {
//             console.log("critter update err: " + err);
//         }
//         console.log('critters db updated');
//     });
// }

global.backupGods = function(){ //user database 
    let currentGods = gods.backup();
    godsDB.update({type: "godsUpdate"}, {type: "godsUpdate", time: Date.now(), gods: currentGods}, {upsert: true}, (err) => {
        if (err) {
            console.log("god update err: " + err);
        }
        console.log('gods db updated');
    });
}
global.backupDonations = function(){ //donation database
    let donationsBackup = ecosystem.conduit.backup(); //should maybe separate from ecosystem now like gods? do i need to make a separate entry per org? ask matt pros/cons
    donationsDB.update({type: "donationsUpdate"}, {type: "donationsUpdate", time: Date.now(), donations: donationsBackup}, {upsert: true}, (err) => {
        if (err) {
            console.log("donations update err: " + err);
        }
        console.log('donations db updated');
    });
}

// global.addCritterToDB = function(critter){ //critters
//     crittersDB.update({id: critter.id, critter: critter}, {id: critter.id, critter: critter}, {upsert: true}, (err) => {
//         if (err) {
//             console.log("critter solo add err: " + err);
//         }
//     });
//     crittersDB.update({type: "allCritters"}, {$push: {critters: critter}}, {upsert: true}, (err) => {
//         if (err) {
//             console.log("critter to allCritters add err: " + err);
//         }
//     });
//     console.log('critter added to db');
// }

/*
    ~ * ~ * ~ * SOCKET STUFF
    ~ * ~ * ~ * 
    ~ * ~ * ~ *  
    ~ * ~ * ~ * 
*/

//create socket connection
// let io = require('socket.io').listen(server) //outdated??? why did i have a weird version of socketio?
let io = require('socket.io')(server)


//clients
// var world = io.of('/')
global.world = io.of('/') //lol global...

//listen for anyone connecting to default namespace
world.on('connection', function(socket){
    console.log('world: ' + socket.id);
    //add user to user array;
    users.push({id: socket.id, isParticipating: false, rankings: []});
    //removing these so only updates when server is ready... wait no, can't b/c then sketch doesn't have certain variables...
    if(ecosystem != undefined){ //give it current status of everything
        console.log("world has ecosystem")
        world.emit('fundsUpdate', ecosystem.conduit);
        world.emit("statsUpdate", {critterCount: ecosystem.critterCount, worldLife: ecosystem.worldLife, communityFunds: ecosystem.communityFunds}); //toFixed...
        // world.emit("refresh"); //just so reloads if server resets -- nvm it loops, only really need this on my end so w/e
        world.emit("currentAct", {actState: actState});
    }
    
    //new event listeners
    //new critter
    socket.on("newCritter", (data, updates, callback) => {
        if(data == undefined){
            ecosystem.spawnRandomCritter();
        } else {
            //update gods db funds
            gods.subtractFunds(updates.username, updates.totalCost);
            ecosystem.communityFunds += updates.communityFunds;
            ecosystem.genesisFunds += updates.genesisFunds;

            //add orgs to donations conduit so they'll show even if no donations yet
            // ecosystem.conduit.makeDonation(data.donations);
            //nvm, already a checkTargets function, just going to emit a fundsupdate from there

            //create critter
            ecosystem.spawnCritterFromUser(data);
            console.log(`New Critter ${data.name} from ${data.ancestry.parents[0].name}`);
        }
        callback({
            funds: gods.checkFunds(updates.username)
        })
    });

    //food sprinkle
    // socket.on("newFood", (data) => {
    //     // console.log("food sprinkle at: " + JSON.stringify(data.position));
    //     ecosystem.worldLife += 100;
    //     ecosystem.makeFood(100, data.position);
    // });

    //critter info query
    socket.on("clickInfo", (data) => {
        ecosystem.clickInfo(data.position, socket.id); //should just return and emit from here TODO
    });

    socket.on("login", (data, callback) => {
        let [loggedIn, god] = gods.login(data.username, data.password);
        callback({
            authenticated: loggedIn, god: god
        });
        if (loggedIn) {
            console.log(`log in from ${god.username}`);
        }
    });

    //act of god event messages
    socket.on("voting", (data) => { //will send automatically if checked at 0, so timer needs to end past 0 to wait for these
        for (let user of users) {
            if (user.id == socket.id){
                user.isParticipating = data.isParticipating;
                user.rankings = data.rankings;
            }
        }
    });

    socket.on("feastMovement", (data) => {
        let isNewUser = true;
        for (let user of userIcons.feastIcons) {
            if (user.id == socket.id) {
                isNewUser = false;
                user.icon = data.icon;
                user.mouseX = data.mouseX;
                user.mouseY = data.mouseY;
            }
        }
        if (isNewUser) {
            userIcons.feastIcons.push({id: socket.id, mouseX: data.mouseX, mouseY: data.mouseY, icon: data.icon})
        }
    });

    socket.on("foodSprinkle", (data) => {
        // if (data.source == "communityFunds") {
            //defaults to 0.01 since just during feast for now
            let amount = 0.01;
            ecosystem.makeFood(data.source, amount, data.position);
        // }
    });

    socket.on("plantSeedCritter", (data) => {
        seedCritters.push(data.critter);
    });


    // socket.on("checkFunds", (data) => {
    //     // console.log(`Adding Funds: ${data.username} -- ${data.amount}`);
    //     let funds = gods.checkFunds(data.username); 
    //     socket.emit("userFundsUpdate", {funds: funds});
    // });
    

    //secret console commands
    socket.on("backup", () => {
        backupEcosystem();
        backupGods();
        backupDonations();
        ecosystemDB.persistence.compactDatafile();
    });

    socket.on("addGod", (data) => {
        console.log(`Adding God: ${data.username} -- ${data.password}`);
        gods.addGod(data.username, data.password);
        backupGods();
    });

    socket.on("addFunds", (data) => {
        console.log(`Adding Funds: ${data.username} -- ${data.amount}`);
        gods.addFunds(data.username, data.amount); //ah wait, don't need to emit back because not user's client...
        backupGods();
    });

    //listen for this client to disconnect
    socket.on('disconnect', function(){
        console.log('input client disconnected: ' + socket.id);
        //remove from users array
        for (let [i, user] of users.entries()){
            if (user.id == socket.id) {
                users.splice(i, 1);
            }
        }
    });
});

/*
    ~ * ~ * ~ * TIMER EVENTS
    ~ * ~ * ~ * 
    ~ * ~ * ~ * main update loop and ecosystem backup
    ~ * ~ * ~ * 
*/

//main run
setInterval( () => {
    if (ecosystem != undefined){ //taxing?
        let updates = ecosystem.run();
        world.emit("update", updates);

        //for event specific updates that need to happen frequently
        if (actState == "feast") {
            world.emit("feastMovement", userIcons.feastIcons);
        }
    }
}, 10); //TODO is there a better way of doing this?

//less frequent eco update and compaction
setInterval( () => {
    backupEcosystem();
    ecosystemDB.persistence.compactDatafile();
}, 60000)

//timer for acts of god
setInterval( () => {
    let delta = Date.now() - timerStart; //need to reset start or just use modulo? -- should reset to also trigger event
    // let timeLeft = 60 - (Math.floor(delta / 1000) % 60);
    let timeLeft = 60 - Math.floor(delta / 1000);
    // console.log(timeLeft)
    if (timeLeft >= 0) {
        io.emit("timer", {timeLeft: timeLeft});
        //for acts that need something to happen at intervals
        if (actState == "flood") {

        }
    }
    //trigger next event
    if (timeLeft <= 0 && !hasAskedForVotes){ //prob a better way of doing this -- could do it clientside off timer, but want to make sure only happens once from server
        //might be weird to do this here... we have actOfGod() which is at the start of the round, we need one at end
        console.log(actState);
        endRound();
    }
    if (timeLeft <= -3 && lastState != actState){ //now waiting 3 seconds for all "voting" event messages
        setupNextRound();
    }
}, 500);

//acts of god event per round
function endRound(){ //things that happen at the end of round
    hasAskedForVotes = true; //just to prevent it running a bunch
    if (actState == "voting") {
        io.emit("getVotes");
        // hasAskedForVotes = true;
    }
    if (actState == "famine") {
        ecosystem.isFamine = false;
    }
    if(actState == "creation"){
        seedCritters = [];
        io.emit("getSeedCritters");
    }
}
function setupNextRound(){ //things that happen at the beginning of a round
    //this is maybe not the right place for this but its gotta happen at very end
    if (actState == "creation") {
        if (seedCritters.length != 0){
            console.log('spawning critter from community seeds')
            ecosystem.spawnCritterFromSeeds(seedCritters);
        }
    }

    lastState = actState; //to only call event once per round
    if (actState == "voting") {
        //figure out what the state is, send to clients, then reset timer
        actState = condorcetTabulation(); //check ranked preferences of gods
        
        if (actState == "voting") { //no winner, reset voting round
            lastState = "repeatVoting"; //just so will trigger again
            hasAskedForVotes = false;
        } else {
            hasAskedForVotes = false; //this is so dumb
            actOfGod(actState);
        }
    } else {
        //reset after round is over
        actState = "voting";
        hasAskedForVotes = false;
    }
    timerStart = Date.now();
    io.emit("currentAct", {actState: actState});
}

function actOfGod(act){ //things that happen... when? at the very beginning of a round? this is redundant i think
    console.log(`act of god: ${act}`);

    switch(act) {
        case "feast":
            //reset the feast icons so no ghost displays
            userIcons.feastIcons = [];
            break;
        case "famine":
            ecosystem.isFamine = true;
            break;
        case "creation":
            break;
        case "meltdown":
            break;
        case "fire":
            break;
        case "flood":
            break;
        case "lightning":
            break;
        default:
            console.log('error at actOfGod: ' + act);
    }
}

function condorcetTabulation(){
    //first, get all participating clients' rankings -- damn i need to keep a user array.
    // io.emit("collectVotes")
    //only check the rankings of those who clicked the participating button
    let votes = [];
    for (let user of users) {
        if (user.isParticipating) {
            votes.push(user.rankings);
        }
    }
    //go through each first choice, if majority, then emit winner, else, go through again with r+1 votes
    let round = 0;
    let voteTotals = {
        feast: 0,
        famine: 0,
        creation: 0,
        meltdown: 0,
        fire: 0,
        flood: 0,
        lightning: 0
    }
    if (votes.length != 0){
        let [winner, totals] = countVotes(votes, round, voteTotals);
        console.log(`winner: ${winner}, totals: ${JSON.stringify(totals)}`)
        // console.log("winner: " + winner);
        return winner;
    } else {
        //no votes, new voting round
        let winner = "voting";
        return winner;
    }
}

function countVotes(votes, round, voteTotals){ //recursive function that runs until majority or default winner
    // console.log(`round: ${round}, totalsSoFar: ${JSON.stringify(voteTotals)}`);
    let isLastRound = true; //to make sure will end even if no majority
    for (let vote of votes) { //each array of rankings
        // if (vote[round] != undefined) { //to account for diff num of rankings
        if (vote[round] != "none") { //nvm will always have 7, need to check against "none"
            voteTotals[vote[round]] += 1;
            isLastRound = false;
        }
    }

    let sortedVotes = Object.entries(voteTotals).sort( (a, b) => { //array of array of key value pairs
        return b[1] - a[1]; //because value of pair is second element in array
    });
    // console.log(JSON.stringify(sortedVotes));
    if (sortedVotes[0][1] > votes.length / 2 || isLastRound) {//majority or no more votes
        // if no more votes to count, just send one with most votes (yes, if tie, it's arbitrary)
        return [sortedVotes[0][0], voteTotals];
        // console.log("ending tabulation");
        // console.log(sortedVotes[0][0]);
        // return sortedVotes[0][0];
    } else {
        round++;
        return countVotes(votes, round, voteTotals); //okay i didn't understand recursion, this needs a return too
        // return [null, null]; //????
    }
    //  else if (!isLastRound) {
    //     round++;
    //     countVotes(votes, round, voteTotals);
    // } else { //no more votes to count, just send one with most votes (yes, if tie, it's arbitrary)
    //     return sortedVotes[0][0];
    // }
}

//save to db
// setInterval( () => {
//     // global.backupDB();
//     backupEcosystem();
// }, 300000); //how fast?  also prob need to save on exit? or does it matter? deterministic?


//for exiting
// process.on("exit", function(code){
//     backupDB();
//     return console.log(`backed up, and exiting with code ${code}`);
// })


