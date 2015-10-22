// CONF

var bindIp = "0.0.0.0";

var logonServerPort = 3724;
var worldServerPort = 8085;

var acceptedBuilds = [
    6141, // 1.12.3
    6005, // 1.12.2
    5875  // 1.12.1
];

var logonServer = require('./logon');
var worldServer = require('./world');

logonServer(logonServerPort);