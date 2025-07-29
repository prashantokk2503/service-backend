const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ✅ JSONBin credentials
const BIN_ID = "68884eda7b4b8670d8a901a5";
const MASTER_KEY = "$2a$10$BmHlO2lZfKiJi1TDS4T2yOIV8QZqGkHDjzOAvTHbLvwx62enbybsy";

// ✅ Save provider (append to JSONBin)
app.post("/save", async (req, res) => {
  try {
    const newProvider = req.body;

    // get existing data
    const response = await axios.get(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: {
        "X-Master-Key": MASTER_KEY
      }
    });

    let data = response.data.record || [];

    // ✅ prevent duplicate phone numbers
    const exists = data.find(p => p.phone === newProvider.phone);
    if (exists) {
      return res.status(400).json({ message: "Provider already exists with this phone number." });
    }

    data.push(newProvider);

    // update bin
    await axios.put(`https://api.jsonbin.io/v3/b/${BIN_ID}`, data, {
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": MASTER_KEY
      }
    });

    res.json({ message: "Provider saved successfully." });
  } catch (err) {
    console.error("Error saving provider:", err.message);
    res.status(500).json({ message: "Failed to save provider." });
  }
});

// ✅ Get all providers
app.get("/get", async (req, res) => {
  try {
    const response = await axios.get(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: {
        "X-Master-Key": MASTER_KEY
      }
    });

    const data = response.data.record || [];
    res.json(data);
  } catch (err) {
    console.error("Error fetching data:", err.message);
    res.status(500).json({ message: "Failed to fetch data." });
  }
});

// ✅ Save rating
app.post("/rate", async (req, res) => {
  const { phone, newRating } = req.body;

  try {
    const response = await axios.get(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: {
        "X-Master-Key": MASTER_KEY
      }
    });

    let data = response.data.record;

    let provider = data.find(p => p.phone === phone);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found." });
    }

    // rating logic
    if (!provider.ratingCount) {
      provider.ratingCount = 1;
      provider.rating = newRating;
    } else {
      provider.rating = ((provider.rating * provider.ratingCount) + newRating) / (provider.ratingCount + 1);
      provider.ratingCount += 1;
    }

    await axios.put(`https://api.jsonbin.io/v3/b/${BIN_ID}`, data, {
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": MASTER_KEY
      }
    });

    res.json({ message: "Rating updated successfully." });
  } catch (err) {
    console.error("Error rating provider:", err.message);
    res.status(500).json({ message: "Failed to update rating." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
