const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// API to register provider
app.post('/register', (req, res) => {
  const newProvider = req.body;

  fs.readFile('providers.json', 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error reading file.');

    let providers = JSON.parse(data);
    providers.push(newProvider);

    fs.writeFile('providers.json', JSON.stringify(providers, null, 2), (err) => {
      if (err) return res.status(500).send('Error saving file.');
      res.send({ success: true });
    });
  });
});

// API to fetch all providers
app.get('/providers', (req, res) => {
  fs.readFile('providers.json', 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error reading file.');
    res.send(JSON.parse(data));
  });
});

// Server start
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
