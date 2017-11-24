var express = require('express'),
    app = express(),
    bodyParser = require('body-parser');
var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var multer = require('multer');
var path = require('path');
var fs = require('fs');
var xlsxj = require("xlsx-to-json");
var upload = multer({ storage: storage }).single('userPhoto');
process.env["SLACK_BOT_TOKEN"] = 'xoxb-277028834658-7L9UE36MaolP8SPWaJRIGf9b';
var bot_token = process.env.SLACK_BOT_TOKEN || '';
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var rtm = new RtmClient(bot_token);
var data;
let channel;
let response = '';
// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
    // for (const c of rtmStartData.channels) {
    //     // console.log(c.name);
    //     if (c.name === 'general') { channel = c.id }
    // }
    channel = 'C851FA6TU';
    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
    rtm.sendMessage("Hi", channel);
});
rtm.on(RTM_EVENTS.MESSAGE, function (message) {
    if (message.channel === channel) {
        if (response) {
            response.send(message);
            console.log(response);
        }
        else {
            console.log(message);
        }
    }
});
rtm.start();
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});
app.post('/api', function (req, res) {
    response = res;
    // you need to wait for the client to fully connect before you can send messages
    setTimeout(() => {
        rtm.sendMessage(req.body.utterance, channel);
    }, 3000)

});
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
app.post('/api/photo', function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            console.log(err);
            return res.end("Error uploading file.");
        }
        var model = null;
        xlsxj({
            input: __dirname + "/uploads/" + req.file.filename,
            output: __dirname + "/uploads/" + "output.json"
        }, function (err, result) {
            if (err) {
                console.error(err);
            } else {
                fs.unlink(path.join(__dirname + "/uploads/" + req.file.filename), function () {
                    fs.unlink(path.join(__dirname + "/uploads/output.json"), function () {
                        console.log(result);

                        // setTimeout(() => {
                        //   res.redirect("/formupload");
                        // }, 2000)
                    })
                })
            }
        });

    });
});
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}
app.listen(process.env.PORT || 7000);