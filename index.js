const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

const BIN_ID = "68873c847b4b8670d8a87b72";
const API_KEY = "$2a$10$BmHlO2lZfKiJi1TDS4T2yOIV8QZqGkHDjzOAvTHbLvwx62enbybsy";
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Middleware
app.use(cors());
app.use(express.json());

// Helper: Get providers from JSONBin
async function getProviders() {
  try {
    const res = await axios.get(BASE_URL, {
      headers: { "X-Master-Key": API_KEY }
    });
    return res.data.record || [];
  } catch (err) {
    return [];
  }
}

// Helper: Save providers to JSONBin
async function saveProviders(data) {
  await axios.put(BASE_URL, data, {
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY,
      "X-Bin-Private": false
    }
  });
}

// ✅ Route: Get all providers
app.get("/providers", async (req, res) => {
  const providers = await getProviders();
  res.json(providers);
});

// ✅ Route: Save new provider
app.post("/providers", async (req, res) => {
  const { name, category, phone, whatsapp, lat, lon, rating, image } = req.body;

  if (!name || !category || !phone || !lat || !lon) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const providers = await getProviders();

  // Duplicate check
  const exists = providers.find(p => p.phone === phone);
  if (exists) {
    return res.status(409).json({ message: "Phone already exists" });
  }

  const newProvider = {
    name,
    category,
    phone,
    whatsapp: whatsapp || "",
    lat,
    lon,
    rating: rating || 0,
    ratingCount: 0,
    image: image || "https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
  };

  providers.push(newProvider);
  await saveProviders(providers);
  res.json({ message: "Provider saved successfully" });
});

// ✅ Route: Update provider rating
app.post("/rate", async (req, res) => {
  const { phone, newRating } = req.body;

  if (!phone || typeof newRating !== "number") {
    return res.status(400).json({ message: "Invalid rating data" });
  }

  const providers = await getProviders();
  const provider = providers.find(p => p.phone === phone);

  if (!provider) {
    return res.status(404).json({ message: "Provider not found" });
  }

  const total = provider.rating * provider.ratingCount;
  provider.ratingCount += 1;
  provider.rating = parseFloat(((total + newRating) / provider.ratingCount).toFixed(1));

  await saveProviders(providers);
  res.json({ message: "Rating updated successfully" });
});

// ✅ Route: Backup
app.get("/backup", async (req, res) => {
  const data = await getProviders();
  res.json(data);
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
