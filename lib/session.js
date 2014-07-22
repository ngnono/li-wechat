function Session(req, res, incommingMessage, webchat) {
    this.req = req;
    this.res = res;
    this.incommingMessage = incommingMessage;
    this.wechat = webchat;
}

/**
 * 发送消息
 * @param outgoingMessage 消息体
 */
Session.prototype.replyMessage = function (outgoingMessage) {
    outgoingMessage.FromUserName = this.incommingMessage.ToUserName;
    outgoingMessage.ToUserName = this.incommingMessage.FromUserName;
    outgoingMessage.CreateTime = Date.now();
    this.wechat.replyMessage(this, outgoingMessage);
};

/**
 * 发送文本信息
 * @param content 消息内容
 */
Session.prototype.replyTextMessage = function (content) {
    this.replyMessage({
        MsgType: 'text',
        Content: content
    });
};

/**
 * 发送图文消息
 * @param articles 图文列表
 */
Session.prototype.replyNewMessage = function (articles) {
    this.replyMessage({
        MsgType: 'news',
        ArticleCount: articles.length,
        Article: articles
    });
};

module.exports = Session;
