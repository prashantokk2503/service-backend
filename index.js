const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const BIN_ID = "68884eda7b4b8670d8a901a5";
const MASTER_KEY = "$2a$10$BmHlO2lZfKiJi1TDS4T2yOIV8QZqGkHDjzOAvTHbLvwx62enbybsy";
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

app.post("/save", async (req, res) => {
  try {
    const newProvider = req.body;

    const response = await axios.get(JSONBIN_URL, {
      headers: { "X-Master-Key": MASTER_KEY }
    });

    let data = response.data.record || [];
    const existing = data.find(p => p.mobile === newProvider.mobile);
    if (existing) return res.status(409).json({ message: "Mobile already exists" });

    data.push({ ...newProvider, ratings: [], avgRating: 0 });

    await axios.put(JSONBIN_URL, data, {
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": MASTER_KEY
      }
    });

    res.json({ message: "Saved successfully" });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to save" });
  }
});

app.get("/get", async (req, res) => {
  try {
    const response = await axios.get(JSONBIN_URL, {
      headers: { "X-Master-Key": MASTER_KEY }
    });
    res.json(response.data.record || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch" });
  }
});

app.post("/rate", async (req, res) => {
  try {
    const { mobile, rating } = req.body;
    const response = await axios.get(JSONBIN_URL, {
      headers: { "X-Master-Key": MASTER_KEY }
    });

    let data = response.data.record || [];
    const provider = data.find(p => p.mobile === mobile);
    if (!provider) return res.status(404).json({ error: "Provider not found" });

    provider.ratings.push(rating);
    provider.avgRating = (provider.ratings.reduce((a, b) => a + b, 0) / provider.ratings.length).toFixed(1);

    await axios.put(JSONBIN_URL, data, {
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": MASTER_KEY
      }
    });

    res.json({ message: "Rated successfully" });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Rating failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
