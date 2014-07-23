'use strice';

var fs = require('fs');
var ejs = require('ejs');

function Template() {

    if (!(this instanceof Template)) {
        return new Template();
    }

    var templates = {};
    ['image', 'music', 'news', 'text', 'video', 'voice'].forEach(function (name) {
        var path = __dirname + '/templates/' + name + '.ejs';
        var tpl = fs.readFileSync(path, 'utf-8');
        templates[name] = ejs.compile(tpl);
    });

    this.templates = templates;
}

Template.prototype.get = function (name) {
    return this.templates[name];
};

Template.prototype.merge = function (name, data) {
    var compiledTpl = this.get(name);

    if (!compiledTpl) {
        throw new Error('template is empty:[ ' + name + ' ]');
    }
    return compiledTpl(data);
};

module.exports = Template;
