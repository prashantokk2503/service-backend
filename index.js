const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const BIN_ID = '68873c847b4b8670d8a87b72';
const MASTER_KEY = '$2a$10$BmHlO2lZfKiJi1TDS4T2yOIV8QZqGkHDjzOAvTHbLvwx62enbybsy';
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// ✅ GET all providers
app.get('/providers', async (req, res) => {
  try {
    const response = await axios.get(BASE_URL + '/latest', {
      headers: { 'X-Master-Key': MASTER_KEY }
    });
    res.json(response.data.record || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// ✅ POST new provider
app.post('/providers', async (req, res) => {
  try {
    const newProvider = req.body;

    // Get current data
    const current = await axios.get(BASE_URL + '/latest', {
      headers: { 'X-Master-Key': MASTER_KEY }
    });

    const updatedData = [...(current.data.record || []), newProvider];

    // Update Bin
    await axios.put(BASE_URL, updatedData, {
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': MASTER_KEY
      }
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to save provider' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
