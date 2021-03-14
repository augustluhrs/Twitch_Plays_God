/**
 *  TWITCH PLAYS GOD
 * 
 *  Fall 2020 -- August Luhrs
 * 
 * 
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
let db = new Datastore({filename: "databases/test.db", autoload: true});
let backupDB = new Datastore({filename: "databases/backups.db", autoload: true});
let godsDB = new Datastore({filename: "databases/gods.db", autoload: true});
let crittersDB = new Datastore({filename: "databases/critters.db", autoload: true});
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

//ecosystem
const Ecosystem = require("./modules/ecosystem");
let ecosystem;
// ecosystemSetup();

//donations
let donations;

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
    //have to separate for new dbs, should try out nedb-promises, but callback hell fine for now
    //ugh so can't keep donation log if ecosystem db erased because won't look for it if eco not there...
    ecosystemDB.find({type: "ecosystemUpdate"}, (ecoErr, ecoDocs) => {
        if (ecoErr) {console.log("eco setup err: " + ecoErr)};
        if (ecoDocs.length != 0) { //entering callback hell because need conduit db and critter db
            ecosystem = new Ecosystem({ecosystem: ecoDocs[0].ecosystem, donations: donations});
            ecosystem.backupAll();
            // donationsDB.find({type: "donationsUpdate"}, (donErr, donDocs) => {
            //     if (donErr) {console.log("donations setup err: " + donErr)};
            //     if (donDocs.length != 0) {
            //         // crittersDB.find({type: "crittersUpdate"}, (critErr, critDocs) => {
            //         crittersDB.find({type: "allCritters"}, (critErr, critDocs) => {
            //             if (critErr) {console.log("critters setup err: " + critErr)};
            //             if (critDocs.length != 0) {
            //                 ecosystem = new Ecosystem({ecosystem: ecoDocs[0].ecosystem, donations: donDocs[0].donations, critters: critDocs[0].critters});
            //                 ecosystem.backupAll();
            //             } else {
            //                 console.log ('weird critter setup err');
            //             }
            //         });
            //     } else {
            //         console.log ('weird donations setup err');
            //     }
            // });
            // ecosystem = new Ecosystem({ecoLog: ecoDocs[0].ecoLog});
        } else { //new eco, which means no critters anyway
            ecosystem = new Ecosystem(0); 
            ecosystem.backupAll();
        }
    });



    // // let docs = await db.asyncFind({type: "ecosystemUpdate"});
    // ecosystemDB.find({type: "ecosystemUpdate"}, (err, docs) => {
    //     if (err) {console.log("eco setup err: " + err)};
    //     if (docs.length != 0) {
    //         ecosystem = new Ecosystem({ecoLog: docs[0].ecoLog, conduit: docs[0].conduit});
    //     } else {
    //         ecosystem = new Ecosystem(0);
    //         let ecoLog = ecosystem.save();
    //         ecosystemDB.update({type: "ecosystemUpdate"}, {type: "ecosystemUpdate", time: Date.now(), ecoLog: ecoLog, conduit: ecosystem.conduit}, {upsert: true}, (err) => {
    //             if(err){
    //                 console.log("db err: " + err);
    //             }
    //         });
    //     }
    // });

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
//database stuff -- the ping pong is bad design, should reformat eventually to just sending the update as an argument
global.backupEcosystem = function(){ //ecosystem
    let ecoLog = ecosystem.backupEcosystem();
    ecosystemDB.update({type: "ecosystemUpdate"}, {type: "ecosystemUpdate", time: Date.now(), ecosystem: ecoLog}, {upsert: true}, (err) => {
        if (err) {
            console.log("ecosystem update err: " + err);
        }
        console.log('ecosystem db updated');
    });
}
global.backupCritters = function(){ //critters
    let currentCritters = ecosystem.backupCritters(); //right now not keeping track of any dead critters
    crittersDB.update({type: "crittersUpdate"}, {type: "crittersUpdate", time: Date.now(), critters: currentCritters}, {upsert: true}, (err) => {
        if (err) {
            console.log("critter update err: " + err);
        }
        console.log('critters db updated');
    });
}
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

global.addCritterToDB = function(critter){ //critters
    crittersDB.update({id: critter.id, critter: critter}, {id: critter.id, critter: critter}, {upsert: true}, (err) => {
        if (err) {
            console.log("critter solo add err: " + err);
        }
    });
    crittersDB.update({type: "allCritters"}, {$push: {critters: critter}}, {upsert: true}, (err) => {
        if (err) {
            console.log("critter to allCritters add err: " + err);
        }
    });
    console.log('critter added to db');
}

// global.backupDB = function(){
//     let ecoLog = ecosystem.save();
//     ecosystemDB.update({type: "ecosystemUpdate"}, {type: "ecosystemUpdate", time: Date.now(), ecoLog: ecoLog, conduit: ecosystem.conduit}, {upsert: true}, (err) => {
//         if (err) {
//             console.log("Update err: " + err);
//         }
//         console.log('db updated');
//     });
//     // db.asyncUpdate({type: "ecosystemUpdate"}, {type: "ecosystemUpdate", time: Date.now(), ecoLog: ecoLog, conduit: ecosystem.conduit}, {upsert: true})
//     //     .then(function(){console.log('db updated');})
//     //     .catch(function(err){console.log("Update err: " + err);});
// }
/*
    db.find({type: "ecosystemUpdate"}, function(err, docs) {
        if (err) {console.log("set up err: " + err);}
        console.log(JSON.stringify(docs));
        if (docs.length != 0) {
            // ecosystem.load(docs[0].ecoLog);
            ecosystem = new Ecosystem({ecoLog: docs[0].ecoLog, conduit: docs[0].conduit});
        } else {
            ecosystem = new Ecosystem(8);
            let ecoLog = ecosystem.save();
            db.update({type: "ecosystemUpdate"}, {type: "ecosystemUpdate", time: Date.now(), ecoLog: ecoLog, conduit: ecosystem.conduit}, {upsert: true}, function(err) {
                if(err){
                    console.log("db err: " + err);
                }
                // console.log('ecosystem saved');
            });
        }
    });
*/

//create socket connection
let io = require('socket.io').listen(server)

//clients
// var world = io.of('/')
global.world = io.of('/') //lol global...

//listen for anyone connecting to default namespace
world.on('connection', function(socket){
    console.log('world: ' + socket.id);
    //removing these so only updates when server is ready... wait no, can't b/c then sketch doesn't have certain variables...
    if(ecosystem != undefined){
        console.log("world has ecosystem")
        world.emit('fundsUpdate', ecosystem.conduit);
        world.emit("statsUpdate", {critterCount: ecosystem.critterCount, worldLife: ecosystem.worldLife, communityFunds: ecosystem.communityFunds}); //toFixed...
        // world.emit("refresh"); //just so reloads if server resets -- nvm it loops, only really need this on my end so w/e
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

            //create critter
            ecosystem.spawnCritterFromUser(data);
            console.log(`New Critter ${data.name} from ${data.ancestry.parents[0].name}`);
        }
        callback({
            funds: gods.checkFunds(updates.username)
        })
    });

    //food sprinkle
    socket.on("newFood", (data) => {
        // console.log("food sprinkle at: " + JSON.stringify(data.position));
        ecosystem.worldLife += 100;
        ecosystem.makeFood(100, data.position);
    });

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
    });
});

//main run
setInterval( () => {
    if (ecosystem != undefined){ //taxing?
        let updates = ecosystem.run();
        world.emit("update", updates);
    }
}, 10); //TODO is there a better way of doing this?

//less frequent eco update and compaction
setInterval( () => {
    backupEcosystem();
    ecosystemDB.persistence.compactDatafile();
}, 60000)

//save to db
setInterval( () => {
    //fine to just have one doc for the whole ecosystem? or do i need to make one doc per critter/food? hmm
    //do I need to save backups? hmm... maybe every hour?
    // global.backupDB();
    backupEcosystem();
    // db.update({type: "ecosystemUpdate"}, {type: "ecosystemUpdate", time: Date.now(), ecoLog: ecoLog, conduit: ecosystem.conduit}, {upsert: true}, function(err) {
    //     if(err){
    //         console.log("db err: " + err);
    //     }
    //     console.log('db updated');
    // });
}, 300000); //how fast?  also prob need to save on exit? or does it matter? deterministic?

// setInterval( () => {
//     //fine to just have one doc for the whole ecosystem? or do i need to make one doc per critter/food? hmm
//     //do I need to save backups? hmm... maybe every hour?
//     let ecoLog = ecosystem.save();
//     backupDB.update({type: "ecosystemBackup"}, {type: "ecosystemBackup", time: Date.now(), ecoLog: ecoLog, conduit: ecosystem.conduit}, {upsert: true}, (err) => {
//         if (err) {
//             console.log("backup err: " + err);
//         }
//         console.log('backup db updated');
//     });

//     // backupDB.asyncUpdate({type: "ecosystemBackup"}, {type: "ecosystemBackup", time: Date.now(), ecoLog: ecoLog, conduit: ecosystem.conduit}, {upsert: true})
//     //     .then(function(){console.log('db backed up');})
//     //     .catch(function(err){console.log("backup err: " + err);});

//     // db.update({type: "ecosystemBackup"}, {type: "ecosystemBackup", time: Date.now(), ecoLog: ecoLog, conduit: ecosystem.conduit}, {upsert: true}, function(err) {
//     //     if(err){
//     //         console.log("db err: " + err);
//     //     }
//     //     console.log('db updated');
//     // });
// }, 3601000); //just to offset from main save


//for exiting
// process.on("exit", function(code){
//     backupDB();
//     return console.log(`backed up, and exiting with code ${code}`);
// })


