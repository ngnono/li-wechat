/**
 * template test spec
 */
var should = require('should');
var fs = require('fs');
var ejs = require('ejs');
var Template = require('../../lib/template.js');

describe('template.js', function () {

    var template = new Template();

    describe('new',function(){
        it('should has image music news text video voice', function () {
            template.templates.should.be.have.keys(['image', 'music', 'news', 'text', 'video', 'voice']);
        });
    });

    describe('get',function(){
         it('templete should be Function',function(){
             ['image', 'music', 'news', 'text', 'video', 'voice'].forEach(function (name) {
                 var path = __dirname + '/../../lib/templates/' + name + '.ejs';
                 var str = fs.readFileSync(path, 'utf-8');

                 template.get(name).should.be.a.Function;
             });
         });
    });

    describe('merge', function () {

        it('{} should be throw', function () {
            (function () {
                template.merge('text', {});
            }).should.be.throw();
        });

        it('should be not throw', function () {
            (function () {
                template.merge('text', {
                    ToUserName: 'toUser',
                    FromUserName: 'fromUser',
                    CreateTime: '13400123',
                    Content: 'content'
                });
            }).should.be.not.throw();
        });


        it('should be throw',function(){
            (function () {
                template.merge('text001', {
                    ToUserName: 'toUser',
                    FromUserName: 'fromUser',
                    CreateTime: '13400123',
                    Content: 'content'
                });
            }).should.be.throw();
        });

        it('should containEql',function(){
            template.merge('text', {
                ToUserName: 'toUserName',
                FromUserName: 'fromUserName',
                CreateTime: '10000',
                Content: 'content'
            }).should.containEql('10000');
        })

    });
});
