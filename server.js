// CONF

var bindIp = "0.0.0.0";

var logonServerPort = 3724;
var worldServerPort = 8085;

var acceptedBuilds = [
    6141, // 1.12.3
    6005, // 1.12.2
    5875  // 1.12.1
];



// Code

var net = require('net');

var logonServer = net.createServer(function(client) {
    console.log('client connected');

    client.on('end', function() {
        console.log('Client disconnected');
    });

    //logonserver stuff here
    client.write('hello\r\n');
    client.pipe(client);
});

logonServer.listen(logonServerPort, function() { //'listening' listener
  console.log('server bound');
});