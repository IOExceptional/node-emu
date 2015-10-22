/* 
    AuthLogonChallenge - ClientData
    -------------------------------
    Command: 0,              uint8
    Error: 0,                uint8
    Size: 0,                 uint16
    GameName: 'WoW',         char[4]
    Version: [1,12,1],       uint8[3]
    Build: 5875,             uint16
    Platform: 'x86',        char[4]
    OS: 'Win',               char[4]
    Country: 'enUS',         char[4]
    WorldRegion_bias: 0,     uint32
    IP: 0,                   uint32
    AccountName_Length: 0,   uint8
    AccountName: 0,          char[]
*/

var binary = require('binary');
var Put = require('put');

var parseLogonChallenge = function(data, cb) {
    var logonChallenge = binary()
                            .word8u('Command')
                            .word8u('Error')
                            .word16lu('Size')
                            .word64lu('GameName')
                            .word8u('Version1')
                            .word8u('Version2')
                            .word8u('Version3')
                            .word16lu('Build')
                            .word64lu('Platform')
                            .word64lu('OS')
                            .word64lu('Country')
                            .word32lu('WorldRegion_bias')
                            .word32lu('IP')
                            .word8u('AccountName_Length')
                            .tap(function (vars) {
                                console.log(this);

                                console.log("Accountname length:", vars.AccountName_Length);

                                cb(vars);
                            });
}

var createLogonChallengeResponse = function () {
    return Put()
            .word8(0)
            .word8(0)
            .word8(0)
            .word64le(0)
            .buffer();
}

module.exports = function (client) {
    client.on('data', function(data) {
        parseLogonChallenge(data, function (logonChallenge) {

            var response = createLogonChallengeResponse();

            client.write(response);
            client.pipe(client);
        });
    });
};