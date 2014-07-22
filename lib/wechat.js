'use strict';

var util = require('util');
var events = require('events');
var sha1 = require('sha1');
var xml2js = require('xml2js');
var debug = require('debug')('wechat');
var Session = require('./session.js');
var Template = require('./template.js');

function WeChat(options) {
    options = options || {};
    this.token = options.token || '';
    this.appid = options.appid || '';
    this.secret = options.secret || '';
    this.template = new Template();

    events.EventEmitter.call(this);
}

util.inherits(WeChat, events.EventEmitter);


/**
 * 验证消息真实性
 * @{@link http://mp.weixin.qq.com/wiki/index.php?title=验证消息真实性}
 * @param {Request} req
 * @return {Boolean}
 */
WeChat.prototype.checkSignature = function (req) {

    req.query = req.query || {};
    var signature = req.query.signature || '';
    var timestamp = req.query.timestamp || '';
    var once = req.query.nonce || '';

    var arr = [this.token, timestamp, once];
    arr.sort();

    var str = sha1(arr.join(''));

    return str === signature;
};

/**
 *  处理消息
 * @{@link http://mp.weixin.qq.com/wiki/index.php?title=接收普通消息}
 * @{@link http://mp.weixin.qq.com/wiki/index.php?title=接收事件推送}
 * @{@link http://mp.weixin.qq.com/wiki/index.php?title=接收语音识别结果}
 * @param {Request} req
 * @param {Response} res
 *        dependence on res.send
 */
WeChat.prototype.loop = function (req, res) {

    var chunks = [];
    var size = 0;

    req.setEncoding('utf8');

    req.on('data', function (chunk) {
        chunks.push(chunk);
        size += chunk.length;
    });

    var self = this;

    req.on('end', function () {
        var buffer = Buffer.concat(chunks, size);

        xml2js.parseString(buffer.toString(), function (err, result) {

            if (err) {
                res.send(400, "req.body can't covert to json object");
                self.emit('messageError', {data: buffer, err: err});
                return;
            }

            // parse message
            var message = {};

            Object.keys(result.xml).forEach(function (key) {
                message[key] = result.xml[key][0];
            });

            debug('create session');
            var session = new Session(req, res, message, self);

            //event process
            var eventName = session.incommingMessage.MsgType;
            if (eventName === 'event') {
                eventName += '.' + session.incommingMessage.Event;
            }

            debug('eventName:' + eventName);
            debug(session);
            self.emit(eventName, session);
        });
    });
};

/**
 * 应答消息
 * @{@link http://mp.weixin.qq.com/wiki/index.php?title=发送被动响应消息}
 * @param {Session} session
 * @param {Message} outgoingMessage
 */
WeChat.prototype.replyMessage = function (session, outgoingMessage) {
    session.res.setHeader('Content-Type', 'application/xml');
    session.res.send(this.template.merge(outgoingMessage.MsgType, outgoingMessage));
};

module.exports = WeChat;

