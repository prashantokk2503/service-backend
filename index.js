const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();

app.use(cors());
app.use(express.json());

let providers = [];

app.get('/', (req, res) => {
  res.send("Service Backend Running");
});

// Get all providers
app.get('/providers', (req, res) => {
  res.json(providers);
});

// Signup a new provider
app.post('/signup', async (req, res) => {
  const { name, category, description, phone, lat, lng, password, photo } = req.body;

  const exists = providers.find(p => p.phone === phone);
  if (exists) return res.status(400).json({ message: 'Already registered' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newProvider = { name, category, description, phone, lat, lng, photo, password: hashedPassword };
  providers.push(newProvider);
  res.json({ message: 'Signup successful' });
});

// Login
app.post('/login', async (req, res) => {
  const { phone, password } = req.body;
  const provider = providers.find(p => p.phone === phone);
  if (!provider) return res.status(404).json({ message: 'Provider not found' });

  const match = await bcrypt.compare(password, provider.password);
  if (!match) return res.status(401).json({ message: 'Invalid password' });

  res.json({ message: 'Login successful', provider });
});

// Update profile
app.post('/update', async (req, res) => {
  const { phone, password, name, category, description, photo } = req.body;

  const provider = providers.find(p => p.phone === phone);
  if (!provider) return res.status(404).json({ message: 'Provider not found' });

  const match = await bcrypt.compare(password, provider.password);
  if (!match) return res.status(401).json({ message: 'Invalid password' });

  if (name) provider.name = name;
  if (category) provider.category = category;
  if (description) provider.description = description;
  if (photo) provider.photo = photo;

  res.json({ message: 'Update successful', provider });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
