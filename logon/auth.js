var AUTH_LOGON_CHALLENGE = 0x00;
var AUTH_LOGON_PROOF = 0x01;

var acceptedBuilds = [
    6141, // 1.12.3
    6005, // 1.12.2
    5875  // 1.12.1
];


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


var dissolve = require('dissolve');
var Put = require('put');

var parseLogonChallenge = function(data, cb) {
    var logonChallenge = dissolve()
                            .uint8('Command')
                            .uint8('Error')
                            .uint16be('Size')
                            .tap(function () {
                                this.string("GameName", 4)
                                .uint8('Version0')
                                .uint8('Version1')
                                .uint8('Version2')
                                .uint16le('Build')
                                .tap(function () {
                                    this.string("Platform", 4)
                                    .tap(function () {
                                        this.string("OS", 4)
                                        .tap(function () {
                                            this.string("Country", 4)
                                            .uint32be('WorldRegion_bias')
                                            .uint32be('IP')
                                            .uint8('AccountName_Length')
                                            .tap(function () {
                                                this.string("AccountName", this.vars.AccountName_Length)
                                                .tap(function () {
                                                    console.log("Account",this.vars.AccountName, "is connecting.");
                                                    cb();
                                                })
                                            });
                                        });
                                    });
                                });
                            });

    logonChallenge.write(data);
};

parseLogonChallenge.prototype.parseString = function (name, length) {
  var len = [name, "len"].join("_");

  return this.uint16be(len).tap(function() {
    this.buffer(name, this.vars[len] * length).tap(function() {
      delete this.vars[len];

      for (var i=0;i<this.vars[name].length/length;++i) {
        var t = this.vars[name][i*length];
        this.vars[name][i*length] = this.vars[name][i*length+1];
        this.vars[name][i*length+1] = t;
      }

      this.vars[name] = this.vars[name].toString("ucs2");
    });
  });
};

var createLogonChallengeResponse = function () {
    return Put()
            .word8(0x00)
            .word8(0x00)
            .word8(0x05)//
            .word8(0x03)
            .buffer();
}

module.exports = function (client) {
    client.on('data', function(data) {
        var request = dissolve()
            .uint8('Command')
            .tap(function () {
                var cmd = this.vars.Command;
                if(cmd == AUTH_LOGON_CHALLENGE) {
                    parseLogonChallenge(data, function () {
                        var response = createLogonChallengeResponse();
                        response = new Buffer([0x00, 0x00, 0x05, 0x03]);
                        client.write(response);
                        client.pipe(client);

                        console.dir(response);
                    });
                }
                else if(cmd == AUTH_LOGON_PROOF) {
                    console.log("Auth login proof");
                    console.dir(data);
                }
            });

        request.write(data);
    });
};