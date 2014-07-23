# 微信公众平台基础接口 [![Build Status](https://travis-ci.org/liangyali/li-wechat.svg?branch=master)](https://travis-ci.org/liangyali/li-wechat) [![Coverage Status](https://img.shields.io/coveralls/liangyali/li-wechat.svg)](https://coveralls.io/r/liangyali/li-wechat)

> 微信公众平台基础接口
> 高级API coming soon!


## Getting Started

Install the module with: `npm install li-wechat`

```js
var wechat = require('li-wechat')('TOKEN');
```

## Documentation

###接收的消息类型
> *  __text__       文本消息
> *  __image__      图片消息
> *  __voice__      语音消息
> *  __video__      视频消息
> *  __location__   地理位置消息
> *  __link__       链接消息

> ```js
   wechat.on('text',function(session){
        //TODO
   });
```

###接收事件类型
> *  __event.subscribe__        关注关注事件
> *  __event.unsubscribe__      取消关注事件
> *  __event.SCAN__             扫描带参数二维码事件,用户已关注时的事件推送
> *  __event.LOCATION__         上报地理位置事件
> *  __event.CLICK__            点击菜单拉取消息时的事件推送
> *  __event.VIEW__             点击菜单跳转链接时的事件推送

> ```js
   wechat.on('event.subscribe',function(session){
        //TODO
   });
```


## Examples

```js
   /**
    * demo fror li-wechat
    */

   var express = require('express');
   var wechat = require('li-wechat')('25c919119519e85e9493590a0e39bba8b7ef7d6a');;

   var app = express();

   wechat.on('text', function (session) {
       session.replyTextMessage("Received:" + session.incommingMessage.Content);
   });

   app.get('/api', function (req, res) {
       if (!wechat.checkSignature(req)) {
           res.send(400, 'signature')
       } else {
           res.send(req.query.echostr);
       }
   });

   app.post('/api', function (req, res) {
       wechat.loop(req, res);
   });

   app.listen(8080);
```


## Contributing



## License

Copyright (c) 2014 liangyali  
Licensed under the MIT license.
