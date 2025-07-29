const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const BIN_ID = "68884eda7b4b8670d8a901a5";
const MASTER_KEY = "$2a$10$BmHlO2lZfKiJi1TDS4T2yOIV8QZqGkHDjzOAvTHbLvwx62enbybsy";
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

const headers = {
  "Content-Type": "application/json",
  "X-Master-Key": MASTER_KEY
};

// GET all providers
app.get("/providers", async (req, res) => {
  try {
    const response = await axios.get(`${JSONBIN_URL}/latest`, { headers });
    const providers = response.data.record.providers || [];
    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch providers" });
  }
});

// POST: Save new provider
app.post("/save", async (req, res) => {
  try {
    const newProvider = req.body;
    const response = await axios.get(`${JSONBIN_URL}/latest`, { headers });
    const current = response.data.record.providers || [];

    const duplicate = current.find(p => p.mobile === newProvider.mobile);
    if (duplicate) {
      return res.status(400).json({ error: "Mobile number already exists" });
    }

    current.push({ ...newProvider, ratings: [], averageRating: 0 });

    await axios.put(JSONBIN_URL, { providers: current }, { headers });
    res.json({ message: "Provider saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save provider" });
  }
});

// PUT: Rate a provider
app.put("/rate", async (req, res) => {
  try {
    const { mobile, rating } = req.body;

    const response = await axios.get(`${JSONBIN_URL}/latest`, { headers });
    const current = response.data.record.providers || [];

    const provider = current.find(p => p.mobile === mobile);
    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    provider.ratings = provider.ratings || [];
    provider.ratings.push(rating);

    const total = provider.ratings.reduce((a, b) => a + b, 0);
    provider.averageRating = (total / provider.ratings.length).toFixed(1);

    await axios.put(JSONBIN_URL, { providers: current }, { headers });
    res.json({ message: "Rating updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update rating" });
  }
});

app.get("/", (req, res) => {
  res.send("Service Backend is running...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
