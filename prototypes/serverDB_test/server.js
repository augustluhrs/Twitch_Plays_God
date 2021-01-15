/**
 * 
 * 
 * 
 * 
 * 
 */

//now trying module.exports for the first time...
const Ecosystem = require("./modules/ecosystem");
// let ecosystem = new Ecosystem(10);
let ecosystem = new Ecosystem(8);


//create server
let port = process.env.PORT || 8080;
let express = require('express');
let app = express();
let server = require('http').createServer(app).listen(port, function(){
  console.log('Server is listening at port: ', port);
});

//where we look for files
app.use(express.static('public'));

//create socket connection
let io = require('socket.io').listen(server)

//clients
// var world = io.of('/')
global.world = io.of('/') //lol global...


//listen for anyone connecting to default namespace
world.on('connection', function(socket){
    console.log('world: ' + socket.id);
    world.emit('fundsUpdate', ecosystem.conduit);
    world.emit("statsUpdate", {critterCount: ecosystem.critterCount, worldLife: ecosystem.worldLife.toFixed(2)});
    
    //new event listeners
    //new critter
    socket.on("newCritter", (data) => {
        if(data == undefined){
            ecosystem.spawnRandomCritter();
            // console.log("spawn rando");
        } else {
            console.log("newCritter error");
        }
    });
    //food sprinkle
    socket.on("newFood", (data) => {
        // console.log("food sprinkle at: " + JSON.stringify(data.position));
        ecosystem.worldLife += 2;
        ecosystem.makeFood(2, data.position);
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
setInterval( () => {
    let updates = ecosystem.run();
    world.emit("update", updates);
}, 10); //TODO is there a better way of doing this?

//update funds
// setInterval( () => {
//     let fundsUpdate = ecosystem.conduit.fundsRaised;
//     world.emit('fundsUpdate', fundsUpdate);
// }, 30000);


