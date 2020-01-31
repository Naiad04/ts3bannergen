// End image size should be 950x300 for best results in a 1920x1080 full screen

var http = require('http');
const SteamAPI = require('steamapi');
//const steam = new SteamAPI('B1F2E9BA530F88ACC7B8E19C384C932E');
//const steamIds = ["76561198101990975", "76561198213975395", "76561198073809055", "76561198128938401", "76561198122620661"];
var cache = {
    updatedAt: 0,
    image: null
}

http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'image/png' });
    if (cache.updatedAt < Date.now() - 30000) { // cache for 30 sec
        updateCache(() => {
            res.write(cache.image);
            res.end();
        });
    } else {
        res.write(cache.image);
        res.end();
    }
}).listen(3232);

function updateCache(cb) {
    var Jimp = require('jimp');

    // open the base file
    Jimp.read('./pics/base.png', (err, img) => {
        if (err) throw err;
        var digitalClock = createDigital(); // with style 0000 first 2 chars are hours and the last 2 are minutes
        var promises = [];
        for (let i = 0; i < 4; i++) {
            promises.push(Jimp.read("./pics/" + digitalClock[i] + ".gif"))
        }

        Promise.all(promises).then(function (images) {
            var x = 0;
            for (let i = 0; i < 4; i++) {
                img.composite(images[i], x, 0);
                x += 75;
            }

            img.getBuffer(Jimp.MIME_PNG, (err, resultImage) => {
                if (err) console.err(err);
                cache.image = resultImage;
                cache.updatedAt = Date.now();
                cb();
            });
        });
        
    });
}

function initPlugin(plugin) {
    const { TeamSpeak } = require("ts3-nodejs-library");
    TeamSpeak.connect({
        host: config.Query.host,
        queryport: config.Query.port, //optional
        //serverport: 9987,
        username: config.Query.username,
        password: config.Query.password,
        nickname: "test"
    }).then(async teamspeak => {
        teamspeak.useBySid(plugin.activeServerId).then(async () => {
            plugin.main(teamspeak);
        });

    }).catch(e => {
        console.log("An error occured while trying to connect to TS3 Query!")
        console.error(e)
    });
}


function createDigital() {
    var now = new Date();
    var minutes = zeroPad(now.getUTCMinutes());
    var hours = zeroPad(now.getUTCHours() +3); // +3 because of turkey GMT+3
    return hours + minutes;
}

function zeroPad(value) {
    if (value < 10) {
        return '0' + value;
    }
    return value.toString();
}