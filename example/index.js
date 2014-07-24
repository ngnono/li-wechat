/**
 * demo fror li-wechat
 */

var express = require('express');
var wechat = require('../lib/wechat.js')('25c919119519e85e9493590a0e39bba8b7ef7d6a');

var app = express();

wechat.on('text', function (session) {
    session.replyTextMessage("Received:" + session.incomingMessage.Content);
});

app.get('/api', function (req, res) {
    if (!wechat.checkSignature(req)) {
        res.send(400, 'signature')
    } else {
        res.send(req.query.echostr);
    }
});

app.post('/api', function (req, res) {
    wechat.loop(req, res);
});

app.listen(8080);
