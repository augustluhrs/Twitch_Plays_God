//worried about hacking, but fine because eventually will be checked against server info

//functions for sending/receiving socket data

function checkFundsRaised(){
    socket.emit('checkFunds');
}

//need to update this TODO