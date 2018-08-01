const Stream = require('./node-rtsp-stream');
const streamUrl = process.env.FOSCAM_STREAM_URL;
const devUrl = 'rtsp://184.72.239.149/vod/mp4:BigBuckBunny_115k.mov';

stream = new Stream({
  name: 'foscam_stream',
  streamUrl: devUrl,
  wsPort: 9999,
  width: 1280/2,
  height: 720/2,
  fps: '24',
  kbs: '256k'
});
