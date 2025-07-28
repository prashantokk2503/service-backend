const express = require("express");
const cors = require("cors");
const fs = require("fs");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

const PROVIDER_FILE = "providers.json";

// Utility: Load & Save
const loadProviders = () => {
    if (!fs.existsSync(PROVIDER_FILE)) return [];
    return JSON.parse(fs.readFileSync(PROVIDER_FILE, "utf8"));
};

const saveProviders = (data) => {
    fs.writeFileSync(PROVIDER_FILE, JSON.stringify(data, null, 2));
};

// Signup Provider
app.post("/signup", async (req, res) => {
    const { name, mobile, category, description, photo, password } = req.body;
    if (!name || !mobile || !category || !description || !photo || !password) {
        return res.status(400).json({ message: "All fields required" });
    }

    let providers = loadProviders();
    if (providers.find(p => p.mobile === mobile)) {
        return res.status(409).json({ message: "Mobile already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    providers.push({
        name, mobile, category, description, photo,
        password: hashed,
        ratings: []
    });

    saveProviders(providers);
    res.json({ message: "Provider signed up" });
});

// Login Provider
app.post("/login", async (req, res) => {
    const { mobile, password } = req.body;
    const providers = loadProviders();
    const user = providers.find(p => p.mobile === mobile);
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Incorrect password" });

    res.json({ message: "Login success", provider: user });
});

// Update Provider
app.put("/update/:mobile", async (req, res) => {
    const { mobile } = req.params;
    const updatedData = req.body;

    let providers = loadProviders();
    const index = providers.findIndex(p => p.mobile === mobile);
    if (index === -1) return res.status(404).json({ message: "Provider not found" });

    if (updatedData.password) {
        updatedData.password = await bcrypt.hash(updatedData.password, 10);
    }

    providers[index] = { ...providers[index], ...updatedData };
    saveProviders(providers);

    res.json({ message: "Provider updated", provider: providers[index] });
});

// Get Providers by Category + Distance Filter handled on frontend
app.get("/providers/:category", (req, res) => {
    const { category } = req.params;
    const providers = loadProviders().filter(p => p.category === category);
    res.json(providers);
});

// Add Rating
app.post("/rate/:mobile", (req, res) => {
    const { mobile } = req.params;
    const { rating } = req.body;

    let providers = loadProviders();
    const index = providers.findIndex(p => p.mobile === mobile);
    if (index === -1) return res.status(404).json({ message: "Provider not found" });

    providers[index].ratings.push(Number(rating));
    saveProviders(providers);

    res.json({ message: "Rating added" });
});

app.listen(3000, () => console.log("Server running on port 3000"));
