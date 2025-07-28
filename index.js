// index.js (Render Backend - with Rating Save Support)

const express = require("express"); const fs = require("fs"); const cors = require("cors"); const app = express(); const PORT = process.env.PORT || 3000;

const FILE_PATH = "providers.json";

app.use(cors()); app.use(express.json());

// Helper function to read data from file function readProviders() { try { const data = fs.readFileSync(FILE_PATH); return JSON.parse(data); } catch (err) { return []; } }

// Helper function to write data to file function writeProviders(data) { fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2)); }

// Route to get all providers app.get("/providers", (req, res) => { const providers = readProviders(); res.json(providers); });

// Route to save new provider (append) app.post("/providers", (req, res) => { const { name, category, phone, whatsapp, lat, lon, rating } = req.body;

if (!name || !category || !phone || !lat || !lon) { return res.status(400).json({ message: "Missing required fields" }); }

const providers = readProviders();

// Check duplicate phone const exists = providers.find((p) => p.phone === phone); if (exists) { return res.status(409).json({ message: "Provider with this phone already exists" }); }

const newProvider = { name, category, phone, whatsapp: whatsapp || "", lat, lon, rating: rating || 0, ratingCount: 0 };

providers.push(newProvider); writeProviders(providers); res.json({ message: "Provider saved successfully" }); });

// Route to update rating app.post("/rate", (req, res) => { const { phone, newRating } = req.body; if (!phone || typeof newRating !== "number") { return res.status(400).json({ message: "Invalid rating data" }); }

const providers = readProviders(); const provider = providers.find((p) => p.phone === phone);

if (!provider) { return res.status(404).json({ message: "Provider not found" }); }

// Update average rating const total = provider.rating * provider.ratingCount; provider.ratingCount += 1; provider.rating = ((total + newRating) / provider.ratingCount).toFixed(1);

writeProviders(providers); res.json({ message: "Rating updated successfully" }); });

// Optional: Get backup of providers.json app.get("/backup", (req, res) => { const providers = readProviders(); res.json(providers); });

// Start server app.listen(PORT, () => { console.log(Server running on port ${PORT}); });

