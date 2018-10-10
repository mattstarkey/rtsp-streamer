const Stream = require('./node-rtsp-stream');
const streamUrl = process.env.FOSCAM_STREAM_URL;
const devUrl = 'rtsp://184.72.239.149/vod/mp4:BigBuckBunny_115k.mov';
const WeatherService = require('./node-rtsp-stream/lib/weatherService');

stream = new Stream({
  name: 'foscam_stream',
  streamUrl: streamUrl,
  wsPort: 9797,
  width: 1280,
  height: 720,
  fps: '24',
  kbs: '2048k'
});

var weatherJson;

var Weather = new WeatherService();

Weather.getWeatherJson(946165).then(json => {
  console.log(json);
  weatherJson = json;
});

// stream.mpeg1Muxer.stream.kill();

// stream.startMpeg1Stream();

var url = require("url");
var http = require("http");
var fs = require('fs');
var path = require('path');

var server = http.createServer(function (req, res) {

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
    'Access-Control-Max-Age': 2592000,
    'Content-Type': 'application/json'
  };

  if (req.url === "/") {
    fs.readFile(__dirname + '/test_client.html', function (error, data) {
      if (error) {
        res.writeHead(404);
        res.write(error);
        res.end();
      } else {
        res.writeHead(200, {
          'Content-Type': 'text/html'
        });
        res.write(data);
        res.end();
      }
    });
  } else if (req.url.match("\.css$")) {
    var cssPath = path.join(__dirname, 'public', req.url);
    var fileStream = fs.createReadStream(cssPath, "UTF-8");
    res.writeHead(200, { "Content-Type": "text/css" });
    fileStream.pipe(res);
  } else if (req.url.match("\.jpg$")) {
    var imagePath = path.join(__dirname, req.url);
    var fileStream = fs.createReadStream(imagePath);
    res.writeHead(200, { "Content-Type": "image/jpg" });
    fileStream.pipe(res);
  } else if (req.url.match("\.png$")) {
    var imagePath = path.join(__dirname, req.url);
    var fileStream = fs.createReadStream(imagePath);
    res.writeHead(200, { "Content-Type": "image/png" });
    fileStream.pipe(res);
  } else if (req.url === "/weather") {
    res.writeHead(200, headers);
    res.write(weatherJson);
    res.end();
  } else {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("No Page Found");
  }




});
server.listen(8080);
// server.listen(80);
