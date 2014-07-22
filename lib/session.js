"use strict";

function Session(req, res, incommingMessage, webchat) {
    this.req = req;
    this.res = res;
    this.incommingMessage = incommingMessage;
    this.wechat = webchat;
}

/**
 * 发送消息
 * @param {Object} outgoingMessage
 */
Session.prototype.replyMessage = function (outgoingMessage) {
    outgoingMessage.FromUserName = this.incommingMessage.ToUserName;
    outgoingMessage.ToUserName = this.incommingMessage.FromUserName;
    outgoingMessage.CreateTime = Date.now();
    this.wechat.replyMessage(this, outgoingMessage);
};

/**
 * 发送文本信息
 * @param {String} content
 */
Session.prototype.replyTextMessage = function (content) {
    this.replyMessage({
        MsgType: 'text',
        Content: content
    });
};

/**
 * 发送图文消息
 * @param {Object} articles
 *
 * [{
 *      Title:'测试标题',
 *      Description:'描述',
 *      PicUrl:'http://t.cn/test.jpg',
 *      Url:'http://t.cn'
 * }]
 */
Session.prototype.replyNewMessage = function (articles) {
    this.replyMessage({
        MsgType: 'news',
        ArticleCount: articles.length,
        Article: articles
    });
};


/**
 * 回复图片消息
 * @param {Number} mediaId
 */
Session.prototype.replyImageMessage = function (mediaId) {
    this.replyMessage({
        MsgType: 'image',
        MediaId: mediaId
    });
};

/**
 * 回复语音消息
 * @param {Number} mediaId
 */
Session.prototype.replyVocieMessage = function (mediaId) {
    this.replyMessage({
        MsgType: 'voice',
        MediaId: mediaId
    });
};

/**
 * 回复视频消息
 * @param {Object} video
 *
 * Sample: {
 *      MediaId:'',
 *      Title:'',
 *      Description:''
 * }
 */
Session.prototype.replyVideoMessage = function (video) {
    this.replyMessage({
        MsgType: 'video',
        MediaId: video.MediaId,
        Title: video.Title,
        Description: video.Description,
        ThumbMediaId: video.ThumbMediaId
    });
};

/**
 *  回复音乐消息
 *  @param {Object} music
 *  {
 *      Title:'',
 *      Description:'',
 *      MusicUrl:'',
 *      HQMusicUrl:'',
 *      ThumbMediaId:''
 *  }
 */
Session.prototype.replyMusicMessage = function (music) {
    this.replyMessage({
        MsgType: 'music',
        Title: music.Title || '',
        Description: music.Description || '',
        MusicUrl: music.MusicUrl || '',
        HQMusicUrl: music.HQMusicUrl || '',
        ThumbMediaId: music.ThumbMediaId
    });
};

module.exports = Session;
