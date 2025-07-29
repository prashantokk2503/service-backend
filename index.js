const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const BIN_ID = "68884eda7b4b8670d8a901a5";
const MASTER_KEY = "$2a$10$BmHlO2lZfKiJi1TDS4T2yOIV8QZqGkHDjzOAvTHbLvwx62enbybsy";
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// ✅ GET all providers
app.get("/get", async (req, res) => {
  try {
    const response = await axios.get(BASE_URL + "/latest", {
      headers: {
        "X-Master-Key": MASTER_KEY,
      },
    });
    res.json(response.data.record);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// ✅ POST new provider (append)
app.post("/save", async (req, res) => {
  try {
    const newData = req.body;

    const response = await axios.get(BASE_URL + "/latest", {
      headers: { "X-Master-Key": MASTER_KEY },
    });

    const currentData = response.data.record;

    const exists = currentData.some(p => p.phone === newData.phone);
    if (exists) return res.status(400).json({ message: "Mobile already exists" });

    currentData.push(newData);

    await axios.put(BASE_URL, currentData, {
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": MASTER_KEY,
      },
    });

    res.json({ message: "Saved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save data" });
  }
});

// ✅ POST rating update
app.post("/rate", async (req, res) => {
  try {
    const { phone, rating } = req.body;

    const response = await axios.get(BASE_URL + "/latest", {
      headers: { "X-Master-Key": MASTER_KEY },
    });

    const data = response.data.record;

    const index = data.findIndex(p => p.phone === phone);
    if (index === -1) return res.status(404).json({ message: "Provider not found" });

    data[index].rating = rating;

    await axios.put(BASE_URL, data, {
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": MASTER_KEY,
      },
    });

    res.json({ message: "Rating updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update rating" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
