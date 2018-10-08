// Generated by CoffeeScript 1.8.0
(function () {
  var Mpeg1Muxer, STREAM_MAGIC_BYTES, VideoStream, events, util, ws;

  ws = require('ws');

  const uuidv4 = require('uuid/v4');

  var socketClients = {};

  util = require('util');

  events = require('events');

  Mpeg1Muxer = require('./mpeg1muxer');

  STREAM_MAGIC_BYTES = "jsmp";

  var EventEmitter = require('events');

  var myEmitter = new EventEmitter();

  var serviceStarted = false;

  VideoStream = function (options) {
    this.name = options.name;
    this.streamUrl = options.streamUrl;
    this.options = options;
    this.width = options.width;
    this.height = options.height;
    this.wsPort = options.wsPort;
    this.inputStreamStarted = false;
    this.stream = void 0;
    // this.startMpeg1Stream();
    this.pipeStreamToSocketServer();
    return this;
  };

  util.inherits(VideoStream, events.EventEmitter);

  VideoStream.prototype.startMpeg1Stream = function () {
    var gettingInputData, gettingOutputData, inputData, outputData, self;
    this.mpeg1Muxer = new Mpeg1Muxer(this.options);
    self = this;
    if (this.inputStreamStarted) {
      return;
    }
    this.mpeg1Muxer.on('mpeg1data', function (data) {
      self.emit('camdata', data);
    });
    gettingInputData = false;
    inputData = [];
    gettingOutputData = false;
    outputData = [];
    this.mpeg1Muxer.on('ffmpegError', function (data) {
      var size;
      data = data.toString();
      if (data.indexOf('Input #') !== -1) {
        gettingInputData = true;
      }
      if (data.indexOf('Output #') !== -1) {
        gettingInputData = false;
        gettingOutputData = true;
      }
      if (data.indexOf('frame') === 0) {
        gettingOutputData = false;
      }
      if (gettingInputData) {
        inputData.push(data.toString());
        size = data.match(/\d+x\d+/);
        if (size != null) {
          size = size[0].split('x');
          if (self.width == null) {
            self.width = parseInt(size[0], 10);
          }
          if (self.height == null) {
            return self.height = parseInt(size[1], 10);
          }
        }
      }
    });

    myEmitter.on('kill', () => {
      console.log('KILL');
      this.mpeg1Muxer.stream.kill();
      serviceStarted = false;
    });

    this.mpeg1Muxer.on('ffmpegError', function (data) {
      return global.process.stderr.write(data);
    });
    return this;
  };

  VideoStream.prototype.pipeStreamToSocketServer = function () {
    var self;
    self = this;
    this.wsServer = new ws.Server({
      port: this.wsPort
    });

    this.wsServer.onmessage = function (event) {
      console.log(event.data);
    }

    this.wsServer.on("connection", (socket) => {
      // socket.send('test');
      console.log('Connection');
      console.log(Object.keys(socketClients).length);

      // if (Object.keys(socketClients).length == 0) {
      if (!serviceStarted) {
        console.log("START");

        var now = new Date();
        if (now.getUTCHours() >= 17 || now.getUTCHours() < 3) {
          console.log('Dont start stream');
        } else {
          serviceStarted = true;
          console.log('Start stream');
          this.startMpeg1Stream();
        }
        // this.pipeStreamToSocketServer();
      }

      // setInterval(_ => {
      //   console.log(Object.keys(socketClients).length);
      // }, 1000);

      var uid = uuidv4();
      socket.uid = uid;
      socketClients[uid] = socket;

      self.onSocketConnect(socket);
    });
    this.wsServer.broadcast = function (data, opts) {
      var i, _results;
      _results = [];

      for (i in socketClients) {
        if (socketClients[i].readyState === 1) {
          _results.push(socketClients[i].send(data, opts));
        } else {
          delete socketClients[i];

          if (Object.keys(socketClients).length == 0) {
            myEmitter.emit('kill');
          }

          console.log("Error: Client (" + i + ") not connected.");
        }
      }

      return _results;
    };
    this.on('camdata', (data) => {
      this.wsServer.broadcast(data);
    });
  };

  VideoStream.prototype.onSocketConnect = function (socket) {
    var self, streamHeader;
    self = this;
    streamHeader = new Buffer(8);
    streamHeader.write(STREAM_MAGIC_BYTES);
    streamHeader.writeUInt16BE(this.width, 4);
    streamHeader.writeUInt16BE(this.height, 6);
    socket.send(streamHeader, {
      binary: true
    });

    console.log(("" + this.name + ": New WebSocket Connection (") + self.wsServer.clients.length + " total)");

    socket.on("close", function (code, message) {
      console.log(("" + this.name + ": Disconnected WebSocket (") + self.wsServer.clients.length + " total)");
    });

  };

  module.exports = VideoStream;

}).call(this);
