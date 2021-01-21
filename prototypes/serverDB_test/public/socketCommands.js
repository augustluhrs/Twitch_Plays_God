//worried about hacking, but fine because eventually will be checked against server info
//open and connect the input socket
let socket = io('/');

//listen for the confirmation of connection 
socket.on('connect', function(){
    console.log('connected to server');
});

socket.on('update', (updates) => {
    ecosystem = updates; //issue if this is happening asynch to draw?
});

socket.on('fundsUpdate', (conduit) => {
    let fundsUpdate = conduit.fundsRaised;
    // console.log('funds: ');
    // console.log(conduit);
    let total = conduit.totalRaised;
    //make an array from funds and sort
    //TODO (toFixed "pattern")
    let sorted = Object.keys(fundsUpdate).map((key) => [key, fundsUpdate[key].toFixed(2)]); //two decimal places
    sorted.sort((a, b) => {return b[1] - a[1]});
    // console.log(sorted);

    funds.sorted = sorted;
    funds.total = total;
});

socket.on('statsUpdate', (update) => {
    stats.critterCount = update.critterCount;
    stats.worldLife = update.worldLife;
});

socket.on('clickInfo', (data) => {
    console.log(data.critter)
    if (data.client == socket.id && data.critter != undefined) {
        // console.log('info received');
        overlay.position = data.position;
        overlay.critter = data.critter;
        isDisplayingInfo = true;
    }
});