const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

let providers = [];

// ✅ Signup - Save Provider
app.post("/signup", async (req, res) => {
  const { name, mobile, password, category, description, image } = req.body;
  const exists = providers.find(p => p.mobile === mobile);
  if (exists) {
    return res.status(400).json({ message: "Mobile number already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newProvider = {
    name,
    mobile,
    password: hashedPassword,
    category,
    description,
    image,
    rating: [],
  };

  providers.push(newProvider);
  res.json({ message: "Provider saved successfully" });
});

// ✅ Login
app.post("/login", async (req, res) => {
  const { mobile, password } = req.body;
  const provider = providers.find(p => p.mobile === mobile);
  if (!provider) {
    return res.status(404).json({ message: "Provider not found" });
  }

  const match = await bcrypt.compare(password, provider.password);
  if (!match) {
    return res.status(401).json({ message: "Wrong password" });
  }

  res.json({ message: "Login successful", provider });
});

// ✅ Update Provider
app.post("/update", async (req, res) => {
  const { mobile, password, name, description, image, category } = req.body;
  const provider = providers.find(p => p.mobile === mobile);
  if (!provider) return res.status(404).json({ message: "Provider not found" });

  const match = await bcrypt.compare(password, provider.password);
  if (!match) return res.status(401).json({ message: "Wrong password" });

  provider.name = name || provider.name;
  provider.description = description || provider.description;
  provider.image = image || provider.image;
  provider.category = category || provider.category;

  res.json({ message: "Provider updated" });
});

// ✅ Submit Rating
app.post("/rate", (req, res) => {
  const { mobile, rating } = req.body;
  const provider = providers.find(p => p.mobile === mobile);
  if (!provider) return res.status(404).json({ message: "Provider not found" });

  provider.rating.push(rating);
  res.json({ message: "Rating submitted" });
});

// ✅ Get Providers by Category
app.get("/providers", (req, res) => {
  const { category } = req.query;
  let filtered = providers;

  if (category) {
    filtered = providers.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  const result = filtered.map(p => ({
    name: p.name,
    mobile: p.mobile,
    category: p.category,
    description: p.description,
    image: p.image,
    averageRating:
      p.rating.length > 0 ? (p.rating.reduce((a, b) => a + b, 0) / p.rating.length).toFixed(1) : "N/A"
  }));

  res.json(result);
});

// ✅ Default
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
