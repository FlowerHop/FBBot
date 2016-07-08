'use strict';

var https = require('https');
var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var queryString = require('querystring');
var request = require('request');
var app = express();
var token = 'EAADv0ZBtzB10BAEOHkafHNT05HvNYnsPCqUZC1pTa2qMWEhKZCqqCQz4MHCQ1iHSeHKRSqFZCoeZCHDZCYcEjbdbu1rfvZBWKMcQE9XwT7jigNsfVULOsccewQlm7LRrLAHMsCtCsdTf47zuk4IO1K2NQdHo2qFNRyGqZCzDZAqNcqQZDZD';


var options = {
  ca: fs.readFileSync('cert/ca_bundle.crt', 'utf8'),
  key: fs.readFileSync('cert/private.key', 'utf8'),
  cert: fs.readFileSync('cert/certificate.crt', 'utf8')
}

app.set('port', process.env.PORT || 8000);
app.use(bodyParser.json());
// app.use('/', express.static('public'));
app.use('/.well-known', express.static('.well-known'));

// Additional middleware which will set headers that we need on each request.
app.use(function (req, res, next) {
  // Set permissive CORS header - this allows this server to be used only as
  // an API server in conjunction with something like webpack-dev-server.
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Disable caching so we'll always get the latest comments.
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

app.get('/', function (req, res) {
  res.status(200).json({"STATUS": "OK"});
});

app.get('/helloWorld', function (req, res) {
  res.send ("HelloWorld");
  res.end ();
});

app.get ('/webhook', function (req, res) {
  res.send ("webhook");
  if (req.query['hub.verify_token'] === token) {
  	res.send (req.query['hub.challenge']);
  }

  res.send ('Error, wrong validation token');
  res.end ();
});

app.post ('/webhook', function (req, res) {
  messaging_events = req.body.entry[0].messaging; //所有訊息

  for (i = 0; i < messaging_events.length; i++) { // 遍歷毎一則

    event = req.body.entry[0].messaging[i]; 
    sender = event.sender.id; // 誰發的訊息

    if (event.message && event.message.text) {
      text = event.message.text;
      // Handle a text message from this sender
      sendTextMessage(sender, "Text received, echo: "+ text.substring(0, 200));
    }
  }
  res.sendStatus(200);
});

function sendTextMessage(sender, text) {
  messageData = {
    text:text
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}

https.createServer(options, app).listen (8001, function (req, res) {
  console.log ('https on 8001 port');
});

app.listen(app.get('port'), function () {
  console.log('Ready on port: ' + app.get('port'));
});