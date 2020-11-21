/**
 * 
 * 
 * 
 * 
 * 
 */

//now trying module.exports for the first time...
const Ecosystem = require("./modules/ecosystem");
let ecosystem = new Ecosystem(80);

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
var world = io.of('/')


//listen for anyone connecting to default namespace
world.on('connection', function(socket){
    console.log('world: ' + socket.id);
    world.emit('fundsUpdate', ecosystem.conduit.fundsRaised);
    //new event listeners
    
    //listen for this client to disconnect
    socket.on('disconnect', function(){
        console.log('input client disconnected: ' + socket.id);
    });
});

//main run
setInterval( () => {
    let updates = ecosystem.run();
    world.emit("update", updates);
}, 10);

//update funds
setInterval( () => {
    let fundsUpdate = ecosystem.conduit.fundsRaised;
    world.emit('fundsUpdate', fundsUpdate);
}, 30000);


