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

    if (session.incommingMessage.Content === 'text') {
        session.replyTextMessage("Hello World!");
    }

    if (session.incommingMessage.Content === 'music') {
        session.replyMusicMessage({
            Title: '音乐标题',
            Description: '音乐描述',
            MusicUrl: 'music.com',
            HQMusicUrl: 'music.com',
            ThumbMediaId: '媒体id'
        });
    }

    if (session.incommingMessage.Content === 'image') {
        session.replyImageMessage('001');
    }

    if (session.incommingMessage.Content === 'video') {
        session.replyVideoMessage({
            MediaId: '001',
            Title: 'b001',
            Description: 'd001',
            ThumbMediaId:'mid'
        });
    }
});

wechat.on('music', function (session) {

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

    describe('POST Message', function () {

        var template = new Template();

        it('should be return Text Message', function (done) {
            var message = template.merge('text', {
                FromUserName: '1000001',
                ToUserName: 'yali',
                CreateTime: Date.now(),
                Content: 'text'
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
                    body.should.match(/<CreateTime>\d{13}<\/CreateTime>/);
                    body.should.be.containEql('<Content><![CDATA[Hello World!]]></Content>');
                    done();
                });
        });

        it('should be return music message', function (done) {

            var message = template.merge('text', {
                FromUserName: '1000001',
                ToUserName: 'yali',
                CreateTime: Date.now(),
                Content: 'music'
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
                    body.should.match(/<CreateTime>\d{13}<\/CreateTime>/);
                    body.should.be.containEql('<MsgType><![CDATA[music]]></MsgType>');
                    body.should.be.containEql('<Music>');
                    body.should.be.containEql('</Music>');
                    body.should.be.containEql('<Title><![CDATA[音乐标题]]></Title>');
                    body.should.be.containEql('<Description><![CDATA[音乐描述]]></Description>');
                    body.should.be.containEql('<MusicUrl><![CDATA[music.com]]></MusicUrl>');
                    body.should.be.containEql('<HQMusicUrl><![CDATA[music.com]]></HQMusicUrl>');
                    body.should.be.containEql('<ThumbMediaId><![CDATA[媒体id]]></ThumbMediaId>');
                    done();
                });
        });

        it('should be return image message', function (done) {

            var message = template.merge('text', {
                FromUserName: '1000001',
                ToUserName: 'yali',
                CreateTime: Date.now(),
                Content: 'image'
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
                    body.should.match(/<CreateTime>\d{13}<\/CreateTime>/);
                    body.should.be.containEql('<MsgType><![CDATA[image]]></MsgType>');
                    body.should.be.containEql('<Image>');
                    body.should.be.containEql('</Image>');
                    body.should.be.containEql('<MediaId><![CDATA[001]]></MediaId>');
                    done();
                });
        });

        it('should be return image video', function (done) {

            var message = template.merge('text', {
                FromUserName: '1000001',
                ToUserName: 'yali',
                CreateTime: Date.now(),
                Content: 'video'
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
                    body.should.match(/<CreateTime>\d{13}<\/CreateTime>/);
                    body.should.be.containEql('<MsgType><![CDATA[video]]></MsgType>');
                    body.should.be.containEql('<Video>');
                    body.should.be.containEql('</Video>');
                    body.should.be.containEql('<MediaId><![CDATA[001]]></MediaId>');
                    body.should.be.containEql('<Title><![CDATA[b001]]></Title>');
                    body.should.be.containEql('<Description><![CDATA[d001]]></Description>');
                    body.should.be.containEql('<ThumbMediaId><![CDATA[mid]]></ThumbMediaId>');
                    done();
                });
        });

        it('if on listener should be resonse empty', function (done) {
            var message = '<xml><MsgType><![CDATA[none]]></MsgType></xml>';
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
                    body.should.be.empty;
                    done();
                });
        });

        it('should be 400', function (done) {
            request(app)
                .post('/api')
                .send({name: 'ok'})
                .expect(400)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                        return;
                    }

                    var body = res.text.toString();
                    body.should.be.containEql("req.body can't covert to json object");
                    done();
                })
        });
    });
});