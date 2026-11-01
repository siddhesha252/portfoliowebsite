// Tiny static server for previewing the portfolio pages.
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const types = { '.html': 'text/html', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.css': 'text/css', '.js': 'text/javascript', '.pdf': 'application/pdf', '.webp': 'image/webp' };

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/source.html';
  const file = path.join(root, p);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    const headers = { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' };
    // always serve the latest page, styles and scripts while previewing
    if (/\.(html|css|js)$/.test(file)) headers['Cache-Control'] = 'no-store';
    // PDFs (the resume) download instead of opening in the browser tab
    if (path.extname(file) === '.pdf') headers['Content-Disposition'] = 'attachment; filename="' + path.basename(file) + '"';
    res.writeHead(200, headers);
    res.end(data);
  });
}).listen(4321, () => console.log('Preview on http://localhost:4321'));
