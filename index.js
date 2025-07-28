const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

let providers = []; // In-memory provider data
let ratings = {};   // { mobile: [4, 5, 3] }

app.post("/signup", (req, res) => {
    const { name, mobile, password, category, photo, description } = req.body;
    if (providers.find(p => p.mobile === mobile)) {
        return res.status(400).json({ message: "Mobile number already registered" });
    }
    providers.push({ name, mobile, password, category, photo, description });
    res.json({ message: "Signup successful" });
});

app.post("/login", (req, res) => {
    const { mobile, password } = req.body;
    const provider = providers.find(p => p.mobile === mobile && p.password === password);
    if (provider) {
        res.json({ message: "Login successful", provider });
    } else {
        res.status(401).json({ message: "Invalid mobile or password" });
    }
});

app.put("/update", (req, res) => {
    const { mobile, name, password, category, photo, description } = req.body;
    const index = providers.findIndex(p => p.mobile === mobile);
    if (index === -1) return res.status(404).json({ message: "Provider not found" });

    providers[index] = { mobile, name, password, category, photo, description };
    res.json({ message: "Update successful" });
});

app.get("/providers", (req, res) => {
    const withRating = providers.map(p => {
        const avgRating = ratings[p.mobile]?.length
            ? ratings[p.mobile].reduce((a, b) => a + b, 0) / ratings[p.mobile].length
            : 0;
        return { ...p, rating: avgRating.toFixed(1) };
    });
    res.json(withRating);
});

app.post("/rate", (req, res) => {
    const { mobile, rating } = req.body;
    if (!ratings[mobile]) ratings[mobile] = [];
    ratings[mobile].push(rating);
    res.json({ message: "Rating saved" });
});

app.get("/ratings", (req, res) => {
    res.json(ratings);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
