// index.js (Complete Script for User + Provider functionality)

const binId = "68873c847b4b8670d8a87b72"; const masterKey = "$2a$10$BmHlO2lZfKiJi1TDS4T2yOIV8QZqGkHDjzOAvTHbLvwx62enbybsy"; const apiUrl = https://api.jsonbin.io/v3/b/${binId};

// USER SIDE (LOAD PROVIDERS + RATING SYSTEM) async function loadProviders() { const res = await fetch(apiUrl + "/latest", { headers: { "X-Master-Key": masterKey } }); const data = await res.json(); const providers = data.record;

const container = document.getElementById("providerList"); container.innerHTML = "";

providers.forEach(p => { const card = document.createElement("div"); card.className = "provider-card"; card.innerHTML = <img src="${p.image || 'https://api.dicebear.com/7.x/icons/svg?seed=' + p.name}" height="50"> <h3>${p.name}</h3> <p><b>Category:</b> ${p.category}</p> <p>${p.description}</p> <p><b>Mobile:</b> <a href="tel:${p.mobile}">${p.mobile}</a> |  <a href="https://wa.me/91${p.mobile}" target="_blank">WhatsApp</a></p> <p><b>Rating:</b> ${p.rating || 0} ⭐</p> <select onchange="rateProvider('${p.mobile}', this.value)"> <option value="">Rate this provider</option> <option value="1">1 ⭐</option> <option value="2">2 ⭐</option> <option value="3">3 ⭐</option> <option value="4">4 ⭐</option> <option value="5">5 ⭐</option> </select>; container.appendChild(card); }); }

// SAVE RATING async function rateProvider(mobile, rating) { const res = await fetch(apiUrl + "/latest", { headers: { "X-Master-Key": masterKey } }); const data = await res.json(); let providers = data.record;

const index = providers.findIndex(p => p.mobile === mobile); if (index >= 0) { providers[index].rating = rating;

await fetch(apiUrl, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "X-Master-Key": masterKey
  },
  body: JSON.stringify(providers)
});
alert("Rating updated!");
loadProviders();

} }

// PROVIDER SIDE (SAVE ONLY - NO LOGIN) async function saveProvider() { const name = document.getElementById("name").value.trim(); const mobile = document.getElementById("mobile").value.trim(); const password = document.getElementById("password").value.trim(); const category = document.getElementById("category").value; const description = document.getElementById("description").value.trim(); const image = document.getElementById("image").value.trim();

if (!mobile.match(/^\d{10}$/)) { alert("Please enter a valid 10-digit mobile number."); document.getElementById("mobile").focus(); return; }

const res = await fetch(apiUrl + "/latest", { headers: { "X-Master-Key": masterKey } }); const data = await res.json(); let providers = data.record;

if (providers.some(p => p.mobile === mobile)) { alert("Mobile number already registered!"); return; }

providers.push({ name, mobile, password, category, description, image, rating: 0 });

await fetch(apiUrl, { method: "PUT", headers: { "Content-Type": "application/json", "X-Master-Key": masterKey }, body: JSON.stringify(providers) });

alert("Provider saved successfully!"); document.getElementById("name").value = ""; document.getElementById("mobile").value = ""; document.getElementById("password").value = ""; document.getElementById("category").value = ""; document.getElementById("description").value = ""; document.getElementById("image").value = ""; }

