var express = require('express'),
    app = express(),
    bodyParser=require('body-parser');
app.use(express.static(__dirname+"/public"));
app.use(bodyParser.json());
app.get('/', function (req, res) {
    res.send("Server running");
});
app.post('/', function (req, res) {
    res.send("Server running");
});
app.listen(process.env.PORT||7000);