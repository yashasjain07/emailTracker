const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.get('/track/:id.png', (req, res) => {
  // Here you'll log email open info, for example:
  console.log(`Tracking pixel loaded for ID: ${req.params.id} at ${new Date()}`);

  // Send a 1x1 transparent pixel image
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
