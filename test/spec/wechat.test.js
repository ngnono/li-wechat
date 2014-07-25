require('should');

var request = require('supertest');
var express = require('express');
var querystring = require('querystring');

var wechat = require('../../lib/wechat.js')('yali');
var Template = require('../../lib/template.js');

var app = express();

wechat.on('text', function (session) {

    if (session.incomingMessage.Content === 'text') {
        session.replyTextMessage("Hello World!");
    }

    if (session.incomingMessage.Content === 'music') {
        session.replyMusicMessage({
            Title: '音乐标题',
            Description: '音乐描述',
            MusicUrl: 'music.com',
            HQMusicUrl: 'music.com',
            ThumbMediaId: '媒体id'
        });
    }

    if (session.incomingMessage.Content === 'image') {
        session.replyImageMessage('001');
    }

    if (session.incomingMessage.Content === 'video') {
        session.replyVideoMessage({
            MediaId: '001',
            Title: 'b001',
            Description: 'd001',
            ThumbMediaId: 'mid'
        });
    }

    if (session.incomingMessage.Content === 'voice') {
        session.replyVocieMessage("001");
    }

    if (session.incomingMessage.Content === 'news') {
        session.replyNewMessage([
            {
                Title: 'item1',
                Description: '描述1',
                PicUrl: 'http://pic.co/1.jpg',
                Url: 'http://url.co/1'
            },
            {
                Title: 'item2',
                Description: '描述2',
                PicUrl: 'http://pic.co/2.jpg',
                Url: 'http://url.co/2'
            }
        ]);
    }
});

wechat.on('event.subscribe', function (session) {
    session.replyTextMessage(session.incomingMessage.Event);
});


app.use('/api', function (req, res) {
    return wechat.process(req, res);
});

describe('Wechat.js', function () {

    var query = {
        'signature': '9044c687938af6c07d9a7656489e339c48ea63c2',
        'timestamp': '1406089150',
        'nonce': '1487568454',
        'echostr': '2386340194658760639'
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

        it('should response 2386340194658760639', function (done) {
            request(app)
                .get('/api?' + querystring.stringify(query))
                .expect(200)
                .expect('2386340194658760639', done);
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
                .post('/api?' + querystring.stringify(query))
                .send(message)
                .expect(200)
                .end(function (err, res) {
                    console.log(err);
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
                .post('/api?' + querystring.stringify(query))
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
                .post('/api?' + querystring.stringify(query))
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

        it('should be return news message', function (done) {

            var message = template.merge('text', {
                FromUserName: '1000001',
                ToUserName: 'yali',
                CreateTime: Date.now(),
                Content: 'news'
            });

            request(app)
                .post('/api?' + querystring.stringify(query))
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
                    body.should.be.containEql('<MsgType><![CDATA[news]]></MsgType>');
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
                .post('/api?' + querystring.stringify(query))
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

        it('should be return image video', function (done) {

            var message = template.merge('text', {
                FromUserName: '1000001',
                ToUserName: 'yali',
                CreateTime: Date.now(),
                Content: 'voice'
            });

            request(app)
                .post('/api?' + querystring.stringify(query))
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
                    body.should.be.containEql('<MsgType><![CDATA[voice]]></MsgType>');
                    body.should.be.containEql('<Voice>');
                    body.should.be.containEql('</Voice>');
                    body.should.be.containEql('<MediaId><![CDATA[001]]></MediaId>');
                    done();
                });
        });

        it('if on listener should be resonse empty', function (done) {
            var message = '<xml><MsgType><![CDATA[none]]></MsgType></xml>';
            request(app)
                .post('/api?' + querystring.stringify(query))
                .send(message)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                        return;
                    }
                    var body = res.text.toString();
                    body.should.be.equal('unsupport none');
                    done();
                });
        });

        it('should be return news message', function (done) {
            var message = template.merge('text', {
                FromUserName: 'FromUser',
                ToUserName: 'toUser',
                CreateTime: Date.now(),
                Content: 'news'
            });

            request(app)
                .post('/api?' + querystring.stringify(query))
                .send(message)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                        return;
                    }

                    var body = res.text.toString();
                    body.should.be.containEql('<ToUserName><![CDATA[FromUser]]></ToUserName>');
                    body.should.be.containEql('<FromUserName><![CDATA[toUser]]></FromUserName>');
                    body.should.match(/<CreateTime>\d{13}<\/CreateTime>/);
                    body.should.be.containEql('<Articles>');
                    body.should.be.containEql('</Articles>');
                    body.should.be.containEql('<Title><![CDATA[item1]]></Title>');
                    body.should.be.containEql('<Description><![CDATA[描述1]]></Description>');
                    body.should.be.containEql('<PicUrl><![CDATA[http://pic.co/1.jpg]]></PicUrl>');
                    body.should.be.containEql('<Url><![CDATA[http://url.co/1]]></Url>');
                    body.should.be.containEql('<Title><![CDATA[item2]]></Title>');
                    body.should.be.containEql('<Description><![CDATA[描述2]]></Description>');
                    body.should.be.containEql('<PicUrl><![CDATA[http://pic.co/2.jpg]]></PicUrl>');
                    body.should.be.containEql('<Url><![CDATA[http://url.co/2]]></Url>');
                    done();
                });
        });

        it('send event should be return text message', function (done) {
            var message = '<xml>' +
                '<ToUserName><![CDATA[toUser]]></ToUserName> ' +
                '<FromUserName><![CDATA[FromUser]]></FromUserName> ' +
                '<CreateTime>123456789</CreateTime>' +
                '<MsgType><![CDATA[event]]></MsgType> ' +
                '<Event><![CDATA[subscribe]]></Event> ' +
                '</xml>';

            request(app)
                .post('/api?' + querystring.stringify(query))
                .send(message)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                        return;
                    }

                    var body = res.text.toString();
                    body.should.be.containEql('<ToUserName><![CDATA[FromUser]]></ToUserName>');
                    body.should.be.containEql('<FromUserName><![CDATA[toUser]]></FromUserName>');
                    body.should.match(/<CreateTime>\d{13}<\/CreateTime>/);
                    body.should.be.containEql('<Content><![CDATA[subscribe]]></Content>');
                    done();
                });
        });

        it('should be 400', function (done) {
            request(app)
                .post('/api?' + querystring.stringify(query))
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

        it('should be return 403', function (done) {
            request(app)
                .put('/api?' + querystring.stringify(query))
                .send({name: 'ok'})
                .expect(403)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                        return;
                    }
                    done();
                })
        });
    });
});