// End image size should be 950x300 for best results in a 1920x1080 full screen

var popImageUrl = "./pics/emptyPopImage.png";

const express = require('express');
const app = express();
const PORT = 3232;

app.use(express.urlencoded());

app.get('/', (req, res) => {
    res.header("Content-Type", "image/png");
    res.statusCode = 200;
    createImage(function (image) {
        res.write(image);
        res.end();
        if (global.gc) { global.gc(); } // Force garbage collection
    });
});

app.post('/', (req, res) => {
    if (req.body.updateImage) {
        if (req.connection.localAddress !== req.connection.remoteAddress) {
            res.end();
            return;
        }
        if (req.body.updateImage == "default") {
            popImageUrl = "./pics/emptyPopImage.png"; //Default popimage url;
            res.end();
            return;
        }

        popImageUrl = req.body.updateImage;
        res.end();
    } else {
        res.end(500); // probably not the right code I just typed a random server error.
    }
});

app.listen(PORT, () => console.log(`TS3 Banner Generator listening on port ${PORT}!`));


function createImage(cb) {
    var Jimp = require('jimp');

    // open the base file
    Jimp.read('./pics/base.png', (err, img) => {
        if (err) throw err;
        var digitalClock = createDigital(); // with style 0000 first 2 chars are hours and the last 2 are minutes
        var promises = [];
        for (let i = 0; i < 4; i++) {
            promises.push(Jimp.read("./pics/" + digitalClock[i] + ".gif"))
        }

        promises.push(Jimp.read(popImageUrl));

        Promise.all(promises).then(function (images) {
            var x = 0;
            for (let i = 0; i < 4; i++) {
                img.composite(images[i], x, 0);
                x += 75;
            }

            let ratio = images[4].getWidth() / images[4].getHeight(); // Calculate Aspect Ratio
            images[4].resize(ratio * 300, 300); // max height would be 300 pixels for optimal results.

            img.composite(images[4], x, 0)

            img.getBuffer(Jimp.MIME_PNG, (err, resultImage) => {
                if (err) console.err(err);
                cb(resultImage);
            });
        }).catch(function (reason) {
            console.log("Error while gathering images:");
            console.error(reason);
            process.exit(1); //Exit with a fail code.
        });

    });
}

function createDigital() {
    var now = new Date();
    var minutes = zeroPad(now.getUTCMinutes());
    var hours = zeroPad((now.getUTCHours() + 3) % 24); // +3 because of turkey GMT+3
    return hours + minutes;
}

function zeroPad(value) {
    if (value < 10) {
        return '0' + value;
    }
    return value.toString();
}