/**
 * demo fror li-wechat
 */

var express = require('express');
var wechat = require('../lib/wechat.js')('yali');

var app = express();

wechat.on('text', function (session) {
    session.replyTextMessage("@" + session.incomingMessage.Content);
});

app.use('/api', function (req, res) {
    return wechat.process(req, res);
});

app.listen(8080);
