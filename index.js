var express = require('express'),
    app = express(),
    bodyParser = require('body-parser');
var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
process.env["SLACK_BOT_TOKEN"] = 'xoxb-225337150064-wK3vZodYLgpHE7G8l9I4Gzox';
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
    for (const c of rtmStartData.channels) {
        // console.log(c.name);
        if (c.name === 'general') { channel = c.id }
    }
    channel = 'D6M9X4EM6';
    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
    rtm.sendMessage("need room", channel);
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
    setTimeout(()=>{
    rtm.sendMessage(req.body.utterance, channel);
    },3000)
   
});

app.listen(process.env.PORT || 7000);