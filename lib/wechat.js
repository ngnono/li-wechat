'use strict';

var util = require('util');
var events = require('events');
var sha1 = require('sha1');
var xml2js = require('xml2js');
var debug = require('debug')('wechat');
var Session = require('./session.js');
var Template = require('./template.js');

var template = new Template();

function Wechat(options) {

    if (!(this instanceof Wechat)) {
        return new Wechat(options);
    }

    options = options || {};
    this.token = options.token || '';

    events.EventEmitter.call(this);
}

util.inherits(Wechat, events.EventEmitter);


/**
 * 验证消息真实性
 * @{@link http://mp.weixin.qq.com/wiki/index.php?title=验证消息真实性}
 * @param {Request} req
 * @return {Boolean}
 */
Wechat.prototype.checkSignature = function (req) {

    debug('[check Signature params] %s', JSON.stringify(req.query, null, ' '));

    req.query = req.query || {};
    var signature = req.query.signature || '';
    var timestamp = req.query.timestamp || '';
    var once = req.query.nonce || '';

    var arr = [this.token, timestamp, once];
    arr.sort();

    var str = sha1(arr.join(''));

    debug('[check Signature] %s -> %s ', signature, str);

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
Wechat.prototype.loop = function (req, res) {

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

        var rawMessage = buffer.toString();
        xml2js.parseString(rawMessage, function (err, result) {

            if (err) {
                debug('[message parse] message parser error:%s', rawMessage);
                res.send(400, "req.body can't covert to json object");
                self.emit('messageError', {data: buffer, err: err});
                return;
            }

            // parse message
            var message = {};

            Object.keys(result.xml).forEach(function (key) {
                message[key] = result.xml[key][0];
            });

            var session = new Session(req, res, message, self);

            //event process
            var eventName = session.incomingMessage.MsgType;
            if (eventName === 'event') {
                eventName += '.' + session.incomingMessage.Event;
            }

            debug('[eventName] %s', eventName);
            debug('[incomingMessage] %s', JSON.stringify(session.incomingMessage, null, ' '));
            self.emit(eventName, session);

            // not has event listener end response
            if (self.listeners(eventName).length === 0) {
                debug('[EventListener] do not has listener,res.end,eventName:%s', eventName);
                res.end();
            }
        });
    });
};

/**
 * 应答消息
 * @{@link http://mp.weixin.qq.com/wiki/index.php?title=发送被动响应消息}
 * @param {Session} session
 * @param {Message} outgoingMessage
 */
Wechat.prototype.replyMessage = function (session, outgoingMessage) {
    session.res.setHeader('Content-Type', 'application/xml');
    debug('[outgoingMessage]' + JSON.stringify(outgoingMessage, null, ' '));
    session.res.send(template.merge(outgoingMessage.MsgType, outgoingMessage));
};

module.exports = Wechat;

