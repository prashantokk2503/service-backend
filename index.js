// index.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const BIN_ID = "68884eda7b4b8670d8a901a5";
const MASTER_KEY = "$2a$10$BmHlO2lZfKiJi1TDS4T2yOIV8QZqGkHDjzOAvTHbLvwx62enbybsy";
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

const headers = {
  "X-Master-Key": MASTER_KEY,
  "Content-Type": "application/json"
};

// ✅ GET all providers
app.get("/providers", async (req, res) => {
  try {
    const response = await axios.get(`${JSONBIN_URL}/latest`, { headers });
    res.json(response.data.record);
  } catch (err) {
    console.error("GET Error:", err.message);
    res.status(500).json({ message: "Failed to fetch providers" });
  }
});

// ✅ POST new provider
app.post("/providers", async (req, res) => {
  try {
    const { phone } = req.body;
    const response = await axios.get(`${JSONBIN_URL}/latest`, { headers });
    const providers = response.data.record;

    // Check duplicate
    const existing = providers.find(p => p.phone === phone);
    if (existing) {
      return res.status(400).json({ message: "Provider with this phone already exists" });
    }

    providers.push(req.body);

    await axios.put(JSONBIN_URL, providers, { headers });
    res.json({ message: "Provider added successfully" });
  } catch (err) {
    console.error("POST Error:", err.message);
    res.status(500).json({ message: "Failed to add provider" });
  }
});

// ✅ PUT update provider (based on phone)
app.put("/providers", async (req, res) => {
  try {
    const { phone } = req.body;
    const response = await axios.get(`${JSONBIN_URL}/latest`, { headers });
    let providers = response.data.record;

    const index = providers.findIndex(p => p.phone === phone);
    if (index === -1) {
      return res.status(404).json({ message: "Provider not found" });
    }

    providers[index] = req.body;

    await axios.put(JSONBIN_URL, providers, { headers });
    res.json({ message: "Provider updated successfully" });
  } catch (err) {
    console.error("PUT Error:", err.message);
    res.status(500).json({ message: "Failed to update provider" });
  }
});

// ✅ POST rating
app.post("/rate", async (req, res) => {
  try {
    const { phone, rating } = req.body;
    const response = await axios.get(`${JSONBIN_URL}/latest`, { headers });
    let providers = response.data.record;

    const index = providers.findIndex(p => p.phone === phone);
    if (index === -1) {
      return res.status(404).json({ message: "Provider not found" });
    }

    providers[index].rating = parseFloat(rating);

    await axios.put(JSONBIN_URL, providers, { headers });
    res.json({ message: "Rating updated successfully" });
  } catch (err) {
    console.error("Rate Error:", err.message);
    res.status(500).json({ message: "Failed to update rating" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
