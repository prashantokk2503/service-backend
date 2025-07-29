const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

const BIN_ID = "68884eda7b4b8670d8a901a5";
const MASTER_KEY = "$2a$10$BmHlO2lZfKiJi1TDS4T2yOIV8QZqGkHDjzOAvTHbLvwx62enbybsy";
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

app.post("/save", async (req, res) => {
  const { name, category, mobile, lat, lon } = req.body;
  if (!name || !category || !mobile || !lat || !lon) {
    return res.json({ message: "All fields including location are required" });
  }

  try {
    const getRes = await fetch(BIN_URL + "/latest", {
      headers: { "X-Master-Key": MASTER_KEY },
    });
    const json = await getRes.json();
    const providers = json.record || [];

    const exists = providers.find(p => p.mobile === mobile);
    if (exists) return res.json({ message: "Mobile number already registered" });

    providers.push({ name, category, mobile, lat, lon, rating: 0, ratedBy: 0 });

    const updateRes = await fetch(BIN_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": MASTER_KEY,
        "X-Bin-Private": "false"
      },
      body: JSON.stringify(providers),
    });

    if (!updateRes.ok) throw new Error("Failed to update");

    res.json({ message: "Provider saved successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
