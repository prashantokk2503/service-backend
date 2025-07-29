const BIN_ID = "68884eda7b4b8670d8a901a5";
const MASTER_KEY = "$2a$10$BmHlO2lZfKiJi1TDS4T2yOIV8QZqGkHDjzOAvTHbLvwx62enbybsy";
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;
const UPDATE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

document.getElementById("searchBtn").addEventListener("click", async () => {
  const category = document.getElementById("categoryFilter").value.trim().toLowerCase();
  const userPosition = await getUserLocation();
  const providers = await fetchProviders();

  const nearby = providers
    .filter(p => p.category.toLowerCase().includes(category))
    .map(p => {
      const dist = getDistance(userPosition.lat, userPosition.lon, p.lat, p.lon);
      return { ...p, distance: dist };
    })
    .filter(p => p.distance <= 2) // 2km range
    .sort((a, b) => b.rating - a.rating);

  showProviders(nearby);
});

async function getUserLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      err => reject("GPS not allowed")
    );
  });
}

async function fetchProviders() {
  try {
    const res = await fetch(BIN_URL, {
      headers: { "X-Master-Key": MASTER_KEY }
    });
    const data = await res.json();
    return data.record || [];
  } catch (err) {
    console.error("Fetch failed", err);
    return [];
  }
}

function getDistance(lat1, lon1, lat2, lon2) {
  const toRad = deg => deg * (Math.PI / 180);
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
}

function showProviders(list) {
  const div = document.getElementById("providerList");
  div.innerHTML = "";
  if (list.length === 0) {
    div.innerHTML = "<p>No providers found.</p>";
    return;
  }
  list.forEach(p => {
    const avgRating = p.totalRated ? (p.rating / p.totalRated).toFixed(1) : "0";
    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML = `
      <h3>${p.name} (${p.category})</h3>
      <p>Distance: ${p.distance} km</p>
      <p>Rating: ⭐ ${avgRating} (${p.totalRated || 0})</p>
      <button onclick="call('${p.phone}')">Call</button>
      <button onclick="whatsapp('${p.phone}')">WhatsApp</button>
      <select onchange="rateProvider('${p.phone}', this.value)">
        <option value="">Rate</option>
        <option value="1">⭐1</option>
        <option value="2">⭐2</option>
        <option value="3">⭐3</option>
        <option value="4">⭐4</option>
        <option value="5">⭐5</option>
      </select>
    `;
    div.appendChild(el);
  });
}

function call(phone) {
  window.location.href = `tel:${phone}`;
}

function whatsapp(phone) {
  window.location.href = `https://wa.me/91${phone}`;
}

async function rateProvider(phone, value) {
  if (!value) return;
  const providers = await fetchProviders();
  const index = providers.findIndex(p => p.phone === phone);
  if (index === -1) return alert("Provider not found");

  providers[index].rating = (providers[index].rating || 0) + Number(value);
  providers[index].totalRated = (providers[index].totalRated || 0) + 1;

  await fetch(UPDATE_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": MASTER_KEY
    },
    body: JSON.stringify(providers)
  });

  alert("Thanks for rating!");
  document.getElementById("searchBtn").click(); // Refresh list
}
