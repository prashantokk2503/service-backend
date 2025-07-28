const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

let providers = []; // memory me data temporarily rakhenge

app.use(cors());
app.use(express.json());

// Signup endpoint
app.post("/signup", (req, res) => {
  const { name, photo, phone, password, description, lat, lng, category } = req.body;
  const newProvider = { name, photo, phone, password, description, lat, lng, category, rating: 0 };
  providers.push(newProvider);
  res.json({ success: true, message: "Provider saved." });
});

// Get nearby providers with category filter
app.get("/nearby", (req, res) => {
  const { lat, lng, category } = req.query;
  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);

  function getDistance(lat1, lng1, lat2, lng2) {
    const toRad = x => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const nearby = providers.filter(p => {
    const d = getDistance(userLat, userLng, p.lat, p.lng);
    return d <= 2 && (category === "" || p.category === category);
  });

  res.json(nearby);
});

// Add rating to provider
app.post("/rate", (req, res) => {
  const { phone, rating } = req.body;
  const p = providers.find(p => p.phone === phone);
  if (p) {
    p.rating = rating;
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Provider not found" });
  }
});

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
