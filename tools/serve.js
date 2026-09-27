// Static file server for the landing page.
//
// Why this exists instead of `python3 -m http.server`: when the server is
// launched from another project's Claude Code preview, the spawned process
// inherits a working directory it is not permitted to read, and Python dies in
// os.getcwd() before serving anything. Node never touches cwd here — ROOT is
// resolved from this file's own location.
//
//   node tools/serve.js [port]
//
// Port precedence: argv[2] > $PORT > 5173.

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.argv[2]) || Number(process.env.PORT) || 5173;
const HOST = '127.0.0.1';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    let target = path.normalize(path.join(ROOT, urlPath));

    // Never serve outside ROOT.
    if (target !== ROOT && !target.startsWith(ROOT + path.sep)) {
      res.statusCode = 403;
      res.end('403 Forbidden');
      return;
    }
    if (urlPath.endsWith('/')) target = path.join(target, 'index.html');

    fs.readFile(target, (err, data) => {
      console.log(`${err ? 404 : 200} ${req.method} ${urlPath}`);
      if (err) {
        res.statusCode = 404;
        res.end('404 Not Found');
        return;
      }
      res.setHeader('Content-Type', TYPES[path.extname(target)] || 'application/octet-stream');
      res.setHeader('Cache-Control', 'no-store');
      res.end(data);
    });
  })
  .on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`port ${PORT} is already in use. Stop that server, or pass a free port.`);
      process.exit(1);
    }
    throw err;
  })
  .listen(PORT, HOST, () => {
    console.log(`serving ${ROOT} at http://${HOST}:${PORT}`);
  });
