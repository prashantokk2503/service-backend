import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import fs from 'fs-extra';

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = 'providers.json';

app.use(cors());
app.use(express.json());

// Helper function to load and save data
async function loadProviders() {
  return await fs.readJson(DATA_FILE).catch(() => []);
}

async function saveProviders(data) {
  await fs.writeJson(DATA_FILE, data);
}

// Get all providers
app.get('/api/providers', async (req, res) => {
  const providers = await loadProviders();
  res.json(providers);
});

// Signup new provider
app.post('/api/signup', async (req, res) => {
  const { name, phone, password, description, category, lat, lng } = req.body;
  if (!name || !phone || !password || !lat || !lng) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const providers = await loadProviders();
  const exists = providers.find(p => p.phone === phone);
  if (exists) {
    return res.status(400).json({ message: 'Phone already registered' });
  }

  const hashed = await bcrypt.hash(password, 10);

  const newProvider = {
    id: Date.now().toString(),
    name,
    phone,
    password: hashed,
    description,
    category,
    lat,
    lng,
    rating: null
  };

  providers.push(newProvider);
  await saveProviders(providers);
  res.json({ message: 'Signup successful' });
});

// Login provider
app.post('/api/login', async (req, res) => {
  const { phone, password } = req.body;
  const providers = await loadProviders();

  const provider = providers.find(p => p.phone === phone);
  if (!provider) return res.status(400).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, provider.password);
  if (!valid) return res.status(400).json({ message: 'Wrong password' });

  res.json({ message: 'Login successful', id: provider.id });
});

// Update provider
app.put('/api/update/:id', async (req, res) => {
  const { name, description, category } = req.body;
  const { id } = req.params;

  const providers = await loadProviders();
  const index = providers.findIndex(p => p.id === id);

  if (index === -1) return res.status(404).json({ message: 'Provider not found' });

  if (name) providers[index].name = name;
  if (description) providers[index].description = description;
  if (category) providers[index].category = category;

  await saveProviders(providers);
  res.json({ message: 'Updated successfully' });
});

// Health check
app.get('/', (req, res) => {
  res.send('Service Provider API Running');
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
