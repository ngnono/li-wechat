require('should');

var request = require('supertest');
var express = require('express');
var querystring = require('querystring');

var Wechat = require('../../lib/wechat.js');
var Template = require('../../lib/template.js');

var app = express();

// 初始化签名
var wechat = new Wechat({
    token: '001'
});

wechat.on('text', function (session) {
    session.replyTextMessage("Hello World!");
});

app.get('/api', function (req, res) {
    if (!wechat.checkSignature(req)) {
        res.send(400, 'signature')
    } else {
        res.send(req.query.echoStr);
    }
});

app.post('/api', function (req, res) {
    wechat.loop(req, res);
});

describe('wechat.js', function () {

    var query = {
        'signature': '25c919119519e85e9493590a0e39bba8b7ef7d6a',
        'timestamp': '23400000023',
        'nonce': '1',
        'echoStr': 'hello'
    };

    describe('Verify GET', function () {
        it('should be 200', function (done) {
            request(app)
                .get('/api?' + querystring.stringify(query))
                .expect(200, done);
        });

        it('should be 400', function (done) {
            request(app)
                .get('/api')
                .expect(400, done);
        });

        it('should response hello', function (done) {
            request(app)
                .get('/api?' + querystring.stringify(query))
                .expect('hello', done);
        });
    });

    describe('POST', function () {
        var template = new Template();

        it('should be return Text Message', function (done) {
            var message = template.merge('text', {
                FromUserName: '1000001',
                ToUserName: 'yali',
                CreateTime: Date.now(),
                Content: 'Hello'
            });

            request(app)
                .post('/api')
                .send(message)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                        return;
                    }

                    var body = res.text.toString();
                    body.should.be.containEql('<ToUserName><![CDATA[1000001]]></ToUserName>');
                    body.should.be.containEql('<FromUserName><![CDATA[yali]]></FromUserName>');
                    body.should.be.containEql('<Content><![CDATA[Hello World!]]></Content>');
                    done();
                });
        });

        it('should be 400', function (done) {
            request(app)
                .post('/api')
                .send({name:'ok'})
                .expect(400)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                        return;
                    }

                    var body =res.text.toString();
                    body.should.be.containEql("req.body can't covert to json object");
                    done();
                })
        });
    });
});