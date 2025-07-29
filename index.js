const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// JSONBin credentials
const BIN_ID = "68884eda7b4b8670d8a901a5";
const MASTER_KEY = "$2a$10$BmHlO2lZfKiJi1TDS4T2yOIV8QZqGkHDjzOAvTHbLvwx62enbybsy";
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Save new provider (only one entry per mobile number allowed)
app.post("/save", async (req, res) => {
  try {
    const newProvider = req.body;

    // Get current data
    const response = await axios.get(BIN_URL, {
      headers: { "X-Master-Key": MASTER_KEY }
    });

    let providers = response.data.record || [];

    // Check for duplicate mobile number
    const exists = providers.some(p => p.mobile === newProvider.mobile);
    if (exists) {
      return res.status(400).json({ message: "Mobile number already exists" });
    }

    // Save provider with default ratings
    providers.push({
      name: newProvider.name,
      mobile: newProvider.mobile,
      category: newProvider.category,
      description: newProvider.description,
      ratings: [],
      avgRating: 0
    });

    await axios.put(BIN_URL, providers, {
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": MASTER_KEY
      }
    });

    res.json({ message: "Provider saved successfully" });

  } catch (err) {
    console.error("Save Error:", err.message);
    res.status(500).json({ message: "Failed to save provider" });
  }
});

// Get all providers
app.get("/get", async (req, res) => {
  try {
    const response = await axios.get(BIN_URL, {
      headers: { "X-Master-Key": MASTER_KEY }
    });
    res.json(response.data.record || []);
  } catch (err) {
    console.error("Get Error:", err.message);
    res.status(500).json({ message: "Failed to fetch providers" });
  }
});

// Rate a provider
app.post("/rate", async (req, res) => {
  try {
    const { mobile, rating } = req.body;

    const response = await axios.get(BIN_URL, {
      headers: { "X-Master-Key": MASTER_KEY }
    });

    let providers = response.data.record || [];
    const provider = providers.find(p => p.mobile === mobile);

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    provider.ratings.push(rating);
    provider.avgRating = (
      provider.ratings.reduce((sum, r) => sum + r, 0) / provider.ratings.length
    ).toFixed(1);

    await axios.put(BIN_URL, providers, {
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": MASTER_KEY
      }
    });

    res.json({ message: "Rating submitted" });

  } catch (err) {
    console.error("Rate Error:", err.message);
    res.status(500).json({ message: "Failed to rate provider" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
