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
// const Datastore = require('nedb');
// let db = new Datastore({filename: "databases/test.db", autoload: true});
const {AsyncNedb} = require('nedb-async');
let db = new AsyncNedb({filename: "databases/test.db", autoload: true});
let backupDB = new AsyncNedb({filename: "databases/backups.db", autoload: true});

//ecosystem
const Ecosystem = require("./modules/ecosystem");
let ecosystem;
ecosystemSetup();

async function ecosystemSetup(){
    console.log('setting up');
    let docs = await db.asyncFind({type: "ecosystemUpdate"});
    if (docs.length != 0) {
        ecosystem = new Ecosystem({ecoLog: docs[0].ecoLog, conduit: docs[0].conduit});
    } else {
        // ecosystem = new Ecosystem(300);
        ecosystem = new Ecosystem(0);
        let ecoLog = ecosystem.save();
        db.update({type: "ecosystemUpdate"}, {type: "ecosystemUpdate", time: Date.now(), ecoLog: ecoLog, conduit: ecosystem.conduit}, {upsert: true}, function(err) {
            if(err){
                console.log("db err: " + err);
            }
        });
    }
}

global.backupDB = function(){
    let ecoLog = ecosystem.save();
    db.asyncUpdate({type: "ecosystemUpdate"}, {type: "ecosystemUpdate", time: Date.now(), ecoLog: ecoLog, conduit: ecosystem.conduit}, {upsert: true})
        .then(function(){console.log('db updated');})
        .catch(function(err){console.log("Update err: " + err);});
}
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
// let ecosystem = new Ecosystem(8);

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
        world.emit('fundsUpdate', ecosystem.conduit);
        world.emit("statsUpdate", {critterCount: ecosystem.critterCount, worldLife: ecosystem.worldLife}); //toFixed...
    }
    
    //new event listeners
    //new critter
    socket.on("newCritter", (data) => {
        if(data == undefined){
            ecosystem.spawnRandomCritter();
        } else {
            ecosystem.spawnCritterFromUser(data);
            console.log(`New Critter ${data.name} from ${data.ancestry.parents[0].name}`);
        }
    });
    //food sprinkle
    socket.on("newFood", (data) => {
        // console.log("food sprinkle at: " + JSON.stringify(data.position));
        ecosystem.worldLife += 100;
        ecosystem.makeFood(100, data.position);
    });

    //critter info query
    socket.on("clickInfo", (data) => {
        ecosystem.clickInfo(data.position, socket.id);
    });

    //listen for this client to disconnect
    socket.on('disconnect', function(){
        console.log('input client disconnected: ' + socket.id);
    });
});

//main run
//wait for setup
// while(ecosystem == undefined){
    // console.log('setting up');
// }
setInterval( () => {
    if (ecosystem != undefined){ //taxing?
        let updates = ecosystem.run();
        world.emit("update", updates);
    }
}, 10); //TODO is there a better way of doing this?

//save to db
setInterval( () => {
    //fine to just have one doc for the whole ecosystem? or do i need to make one doc per critter/food? hmm
    //do I need to save backups? hmm... maybe every hour?
    global.backupDB();
    // db.update({type: "ecosystemUpdate"}, {type: "ecosystemUpdate", time: Date.now(), ecoLog: ecoLog, conduit: ecosystem.conduit}, {upsert: true}, function(err) {
    //     if(err){
    //         console.log("db err: " + err);
    //     }
    //     console.log('db updated');
    // });
}, 300000); //how fast? 5 mins, also prob need to save on exit? or does it matter? deterministic?

setInterval( () => {
    //fine to just have one doc for the whole ecosystem? or do i need to make one doc per critter/food? hmm
    //do I need to save backups? hmm... maybe every hour?
    let ecoLog = ecosystem.save();
    backupDB.asyncUpdate({type: "ecosystemBackup"}, {type: "ecosystemBackup", time: Date.now(), ecoLog: ecoLog, conduit: ecosystem.conduit}, {upsert: true})
        .then(function(){console.log('db backed up');})
        .catch(function(err){console.log("backup err: " + err);});

    // db.update({type: "ecosystemBackup"}, {type: "ecosystemBackup", time: Date.now(), ecoLog: ecoLog, conduit: ecosystem.conduit}, {upsert: true}, function(err) {
    //     if(err){
    //         console.log("db err: " + err);
    //     }
    //     console.log('db updated');
    // });
}, 3601000); //just to offset from main save


//for exiting
// process.on("exit", function(code){
//     backupDB();
//     return console.log(`backed up, and exiting with code ${code}`);
// })


