const express = require('express');
const app = express();
const fs = require('fs');
const logFile = 'logs.json';

app.use(express.urlencoded({ extended: true }));
const cors = require('cors');
app.use(cors({ origin: '*' }));
app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.get('/dashboard', (req, res) => {
  let logs = [];
  if (fs.existsSync(logFile)) logs = JSON.parse(fs.readFileSync(logFile));

  // Create summary as before
  const summary = {};
  logs.forEach(log => {
    if (!summary[log.id]) summary[log.id] = { count: 0, events: [] };
    summary[log.id].count += 1;
    summary[log.id].events.push(log);
  });

  // Form to create new tracking link
  let html = `<h1>Email Tracker Dashboard</h1>`;
  html += `<form method="POST" action="/dashboard/create">`;
  html += `<input name="trackid" placeholder="Enter tag/email for tracking" required>`;
  html += `<button type="submit">Create Tracking Link</button>`;
  html += `</form>`;

  // Display the generated <img> tag for pasting
  if (req.query.imgtag) {
    html += `<p><b>Tracking Image Tag (copy this):</b></p>`;
    html += `<textarea rows="3" cols="80" readonly>${req.query.imgtag}</textarea>`;
  }

  // Existing stats table
  html += `<table border="1"><tr><th>Email ID</th><th>Opens</th><th>Details</th></tr>`;
  Object.entries(summary).forEach(([id, {count, events}]) => {
    html += `<tr><td>${id}</td><td>${count}</td><td><ul>`;
    events.forEach(ev => { html += `<li>${ev.time} (IP: ${ev.ip})</li>`; });
    html += `</ul></td></tr>`;
  });
  html += `</table>`;
  res.send(html);
});

app.post('/dashboard/create', (req, res) => {
  const base = req.headers['x-forwarded-proto'] + '://' + req.headers.host;
  const trackid = req.body.trackid.trim().replace(/\s+/g, '-');
  const imgTag = `<img src="${base}/track/${encodeURIComponent(trackid)}.png" width="1" height="1" alt="">`;
  res.redirect(`/dashboard?imgtag=${encodeURIComponent(imgTag)}`);
});

app.get('/track/:id.png', (req, res) => {
  // Here you'll log email open info, for example:
    const entry = {
    id: req.params.id,
    time: new Date().toISOString(),
    ip: req.ip || req.headers['x-forwarded-for'],
    ua: req.headers['user-agent']
  };
  let logs = [];
  // Read existing logs
  if (fs.existsSync(logFile)) logs = JSON.parse(fs.readFileSync(logFile));
  logs.push(entry);
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
  // Send 1x1 pixel as before
  console.log(`Tracking pixel loaded for ID: ${req.params.id} at ${new Date()}`);

  const img = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P4z8DwHwAFBAK+dmZYWQAAAABJRU5ErkJggg==",
    'base64'
  );
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': img.length,
  });
  res.end(img);
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
