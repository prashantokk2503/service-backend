const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const BIN_ID = "68873c847b4b8670d8a87b72";
const MASTER_KEY = "$2a$10$BmHlO2lZfKiJi1TDS4T2yOIV8QZqGkHDjzOAvTHbLvwx62enbybsy";
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

async function getProviders() {
  try {
    const res = await axios.get(BIN_URL + "/latest", {
      headers: {
        "X-Master-Key": MASTER_KEY,
      },
    });
    return res.data.record || [];
  } catch (err) {
    console.error("Get Error", err.message);
    return [];
  }
}

async function saveProviders(data) {
  try {
    await axios.put(BIN_URL, data, {
      headers: {
        "X-Master-Key": MASTER_KEY,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Save Error", err.message);
  }
}

app.post("/signup", async (req, res) => {
  const providers = await getProviders();
  const { name, category, phone, password, description } = req.body;

  const exists = providers.find(p => p.phone === phone);
  if (exists) return res.status(400).json({ message: "Already exists" });

  const hashed = await bcrypt.hash(password, 10);
  providers.push({ name, category, phone, description, password: hashed });

  await saveProviders(providers);
  res.json({ message: "Successfully saved" });
});

app.post("/login", async (req, res) => {
  const { phone, password } = req.body;
  const providers = await getProviders();

  const user = providers.find(p => p.phone === phone);
  if (!user) return res.status(401).json({ message: "Login failed" });

  const valid = await bcrypt.compare(password, user.password);
  if (valid) {
    res.json({ message: "Login success", data: user });
  } else {
    res.status(401).json({ message: "Login failed" });
  }
});

app.get("/providers", async (req, res) => {
  const providers = await getProviders();
  res.json(providers);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
