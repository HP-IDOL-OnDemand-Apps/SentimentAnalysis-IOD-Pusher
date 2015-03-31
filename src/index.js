var express = require('express');
var app = express();
var https = require('https');

var IdolApiKey = "47e03390-be45-4a12-956b-d392dec45dc0";
var CloudElementsToken = "User ZsAJaxbqyt4TUIGxY4YB0q/Kt51tiqdzxUfbV9NYHAc=, Organization 170b9725c471c48d0e647cf68818cdee, Element t7HcvwIhtYhEiZJy6jJEem5FngIFoO/xOdkqi8NQqkk=";

//initialize pusher 
var Pusher = require('pusher');

var pusher = new Pusher({
  appId: '107358',
  key: '9cc5b9ff7aef4004fca0',
  secret: '1a47cc76db1b0bdf1892'
});

//setting static content to be served via node
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.send('Hello World!');
});

//recieve user messages and pass it to pusher server
app.get('/message', function (req, res) {

  var user_msg = req.query.user_msg;
  var sentiment = req.query.sentiment;

  pusher.trigger('test_channel', 'my_event', {
    "message": user_msg,
    "sentiment": sentiment
  });
});

//provide hp idol api key to the angular front-end
app.get('/getIdolApiKey', function(req, res) {
  res.send({apikey : IdolApiKey});
});

//provide cloud-elements api key to the angular front-end
app.get('/getCloudElementsToken', function(req, res) {
  res.send({Authorization : CloudElementsToken});
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
