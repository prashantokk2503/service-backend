const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Path to the JSON file
const filePath = "providers.json";

// Helper to read providers
const readProviders = () => {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]");
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
};

// Helper to write providers
const writeProviders = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Signup provider
app.post("/providers", (req, res) => {
  const newProvider = req.body;
  const providers = readProviders();

  // Check duplicate by phone
  const exists = providers.find(p => p.phone === newProvider.phone);
  if (exists) return res.status(400).json({ message: "Already exists" });

  providers.push(newProvider);
  writeProviders(providers);
  res.json({ message: "Provider added successfully" });
});

// Get all providers
app.get("/providers", (req, res) => {
  const providers = readProviders();
  res.json(providers);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
