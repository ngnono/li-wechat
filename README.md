# 微信公众平台消息接口 [![Build Status](https://travis-ci.org/liangyali/li-wechat.svg?branch=master)](https://travis-ci.org/liangyali/li-wechat) [![Coverage Status](https://img.shields.io/coveralls/liangyali/li-wechat.svg)](https://coveralls.io/r/liangyali/li-wechat)

> 微信公众平台消息接口


## Getting Started

Install the module with: `npm install li-wechat`

```js
var wechat = require('li-wechat');
```

## Documentation

_(Coming soon)_


## Examples

```js
   /**
    * demo fror li-wechat
    */

   var express = require('express');
   var Wechat = require('li-wechat');

   var app = express();

   var wechat = new Wechat({
       token: '25c919119519e85e9493590a0e39bba8b7ef7d6a'
   });

   wechat.on('text', function (session) {
       session.replyTextMessage("Received:" + session.incommingMessage.Content);
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

   app.listen(8080);
```


## Contributing



## License

Copyright (c) 2014 liangyali  
Licensed under the MIT license.
