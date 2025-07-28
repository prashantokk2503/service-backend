const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();

app.use(cors());
app.use(express.json());

const BIN_ID = "68873c847b4b8670d8a87b72";
const MASTER_KEY = "$2a$10$BmHlO2lZfKiJi1TDS4T2yOIV8QZqGkHDjzOAvTHbLvwx62enbybsy";
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Get all providers
app.get("/providers", async (req, res) => {
  try {
    const response = await axios.get(JSONBIN_URL + "/latest", {
      headers: {
        "X-Master-Key": MASTER_KEY,
      },
    });
    const data = response.data.record || [];
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Add a new provider (no duplicate mobile)
app.post("/providers", async (req, res) => {
  const newProvider = req.body;

  if (!newProvider.name || !newProvider.mobile || !newProvider.lat || !newProvider.lon || !newProvider.category) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const response = await axios.get(JSONBIN_URL + "/latest", {
      headers: {
        "X-Master-Key": MASTER_KEY,
      },
    });

    const data = response.data.record || [];

    const exists = data.find(p => p.mobile === newProvider.mobile);
    if (exists) {
      return res.status(409).json({ error: "Mobile number already exists" });
    }

    newProvider.rating = 0;
    data.push(newProvider);

    await axios.put(JSONBIN_URL, data, {
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": MASTER_KEY,
        "X-Bin-Versioning": "false"
      },
    });

    res.json({ message: "Provider saved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save provider" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
