// CONF

var bindIp = "0.0.0.0";

var logonServerPort = 3724;
var worldServerPort = 8085;

var logonServer = require('./logon');
var worldServer = require('./world');

logonServer(logonServerPort);