// backend/server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Temporary in-memory "database"
let users = [];

// Signup API
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ message: "Email already exists!" });
  }
  users.push({ name, email, password });
  return res.status(201).json({ message: "Signup successful!" });
});

// Login API
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => (u.email === username || u.name === username) && u.password === password
  );
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  return res.json({ message: "Login successful!", user });
});

// Topics API - used by the frontend home page
app.get("/topics", (req, res) => {
  // Each topic has title, short description, character lines (for voice), and a simple tag
  const topics = [
    {
      id: "solar-flare",
      title: "Solar Flares",
      short: "Bursts of energy from the Sun that can zap radio signals.",
      lines: [
        "Hi! I'm Flare — a lively solar flare!",
        "I am a sudden bright flash of light from the Sun.",
        "Sometimes I can make radio signals noisy and confuse GPS.",
        "But I also help create beautiful auroras near the poles!"
      ]
    },
    {
      id: "cme",
      title: "Coronal Mass Ejections (CMEs)",
      short: "Clouds of solar plasma that can push at Earth's magnetosphere.",
      lines: [
        "Hello — I'm Cee, the CME cloud!",
        "I am a giant bubble of magnetized gas that the Sun can blow out.",
        "When I arrive, I can shake Earth's magnetic field and cause power grid problems.",
        "People on Earth may see colorful auroras from my visit."
      ]
    },
    {
      id: "solar-wind",
      title: "Solar Wind",
      short: "A steady flow of particles from the Sun that fills space.",
      lines: [
        "Breezy greetings — I'm Windy the Solar Wind!",
        "I am a gentle flow of tiny particles streaming from the Sun all the time.",
        "I shape the space around planets and carry little magnetic bits with me.",
        "Sometimes I push and stretch Earth's magnetic bubble and change radio signals a little."
      ]
    },
    {
      id: "solar-particles",
      title: "Solar Particle Events",
      short: "Fast particles that can be dangerous for astronauts and satellites.",
      lines: [
        "Zoom — I'm Sparky, a solar particle event!",
        "When the Sun spits high-speed particles, I race through space.",
        "If astronauts are outside the spacecraft, I can be harmful.",
        "Satellites can get extra noise in their electronics when I pass by."
      ]
    }
  ];

  res.json({ topics });
});

app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});
