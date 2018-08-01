const Stream = require('./node-rtsp-stream');
const streamUrl = process.env.FOSCAM_STREAM_URL;
const devUrl = 'rtsp://184.72.239.149/vod/mp4:BigBuckBunny_115k.mov';

stream = new Stream({
  name: 'foscam_stream',
  streamUrl: devUrl,
  wsPort: 9797,
  width: 1280 / 2,
  height: 720 / 2,
  fps: '24',
  kbs: '256k'
});



// var WebSocketServer = require('ws').Server
//     , wss = new WebSocketServer({port: 9999});
//     wss.on('connection', function(ws) {
//         ws.on('message', function(message) {
//         console.log('Received from client: %s', message);
//         ws.send('Server received from client: ' + message);
//     });
//  });


var url = require("url");
var http = require("http");
var fs = require('fs');

var server = http.createServer(function (request, response) {
  // var path = url.parse(request.url).pathname;

  fs.readFile(__dirname + '/test_client.html', function (error, data) {
    if (error) {
      response.writeHead(404);
      response.write(error);
      response.end();
    } else {
      response.writeHead(200, {
        'Content-Type': 'text/html'
      });
      response.write(data);
      response.end();
    }
  });

});
server.listen(8082);
