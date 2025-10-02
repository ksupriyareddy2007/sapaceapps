// home.js - improved animations and GPS glitch for Farmer
const API_ROOT = "http://localhost:5000";

const topicsGrid = document.getElementById("topicsGrid");
const roleModal = document.getElementById("roleModal");
const rolesRow = document.getElementById("rolesRow");
const roleCancel = document.getElementById("roleCancel");
const sceneModal = document.getElementById("sceneModal");
const closeScene = document.getElementById("closeScene");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");
const statusText = document.getElementById("statusText");
const roleAvatar = document.getElementById("roleAvatar");
const roleLabel = document.getElementById("roleLabel");
const flareGroup = document.getElementById("flareGroup");
const pulseLine = document.getElementById("pulseLine");
const gpsIcon = document.getElementById("gpsIcon");
const tractor = document.getElementById("tractor");

let selectedTopic = null;
let selectedRole = null;

const ROLES = [
  { id: "farmer", name: "Farmer" },
  { id: "pilot", name: "Pilot" },
  { id: "astronaut", name: "Astronaut" },
  { id: "photographer", name: "Photographer" }
];

// The dialogues (keeps farmer focused on GPS issues)
const DIALOGUES = {
  "solar-flare": {
    "farmer": [
      { speaker: "flare", text: "Hi little farmer! I'm Flare. I shine bright and sometimes make radio signals noisy." },
      { speaker: "role", text: "Oh hi Flare! When you make signals noisy, my GPS tractor gets confused and my planting lines are off." },
      { speaker: "flare", text: "I didn't mean to make trouble. When I send strong bursts, I can cause short GPS errors." },
      { speaker: "role", text: "Please be gentle on my tools. I depend on GPS for accurate seeding and irrigation." },
      { speaker: "flare", text: "Engineers and farmers work together — there are ways to protect equipment and watch my activity." }
    ],
    "pilot": [
      { speaker: "flare", text: "Hey pilot! I'm Flare — I make sudden bursts of energy." },
      { speaker: "role", text: "Hi Flare. Those bursts can block some radio communications; we switch to backup instruments." },
      { speaker: "flare", text: "I can be quick and bright. Pilots take precautions so everyone stays safe." }
    ],
    "astronaut": [
      { speaker: "flare", text: "Hello astronaut — I'm Flare. Sometimes I send strong radiation." },
      { speaker: "role", text: "Hello Flare. On a spacewalk, we'd need shelter because your particles can be harmful." },
      { speaker: "flare", text: "That's why mission teams watch me closely. Safety first!" }
    ],
    "photographer": [
      { speaker: "flare", text: "Hi photographer — I'm Flare. I can paint the sky with colors." },
      { speaker: "role", text: "That sounds amazing! I'd love to capture auroras when you visit." },
      { speaker: "flare", text: "Come chase the lights — but remember, sometimes I also shake signals. Be prepared!" }
    ]
  },

  "cme": {
    "farmer": [
      { speaker: "flare", text: "I'm Cee, a big cloud called a CME. I can push at Earth's magnetic bubble." },
      { speaker: "role", text: "When you push the magnetosphere, power and electronics can flicker — that affects irrigation and pumps." },
      { speaker: "flare", text: "Engineers protect power systems, and farmers prepare backup plans for important moments." }
    ],
    "pilot": [
      { speaker: "flare", text: "Hello pilot — I am Cee, a huge bubble of gas. I can disturb navigation signals." },
      { speaker: "role", text: "That means extra checks before flights. Thanks for the heads up, Cee." }
    ],
    "astronaut": [
      { speaker: "flare", text: "Astronaut friend, I am Cee. My magnetic push can change space weather for a while." },
      { speaker: "role", text: "Mission control monitors you closely. We may move systems to safe mode." }
    ],
    "photographer": [
      { speaker: "flare", text: "Photographer — when I arrive, auroras can reach farther and glow bright." },
      { speaker: "role", text: "Perfect for pictures! I'll be ready with my tripod and camera." }
    ]
  },

  "solar-wind": {
    "farmer": [
      { speaker: "flare", text: "I'm Windy — a steady solar wind that blows tiny particles past Earth." },
      { speaker: "role", text: "Windy, you gently change space; my sensors can notice small variations in signals." },
      { speaker: "flare", text: "You notice me best when I push a little — I am usually gentle." }
    ],
    "pilot": [
      { speaker: "flare", text: "Pilot, I'm Windy. I carry magnetic bits that can nudge signals a touch." },
      { speaker: "role", text: "We keep track but it's often just a small change." }
    ],
    "astronaut": [
      { speaker: "flare", text: "Astronaut, I'm Windy. I'm part of the background space weather." },
      { speaker: "role", text: "We plan for your environment; thanks for the steady breeze." }
    ],
    "photographer": [
      { speaker: "flare", text: "Photographer, I'm Windy. I'm quieter than flares and CMEs, but I help shape auroras too." },
      { speaker: "role", text: "Cool — small changes can still make lovely skies." }
    ]
  },

  "solar-particles": {
    "farmer": [
      { speaker: "flare", text: "I'm Sparky — fast particles from the Sun. I can be energetic and quick." },
      { speaker: "role", text: "Sparky, you're mostly a worry for satellites and astronauts, not my fields." },
      { speaker: "flare", text: "Right — we watch each other in space weather to keep people safe." }
    ],
    "pilot": [
      { speaker: "flare", text: "Pilot, Sparky here. I'm a stream of fast particles sometimes sent by flares and CMEs." },
      { speaker: "role", text: "We may adjust airline routes at high latitudes if you become strong." }
    ],
    "astronaut": [
      { speaker: "flare", text: "Astronaut — I can be dangerous outside spacecraft; I travel very fast." },
      { speaker: "role", text: "We'd shelter inside the vehicle; safety rules are strict for events like you." }
    ],
    "photographer": [
      { speaker: "flare", text: "Photographer, Sparky says hello. I don't make pictures, but I make space lively." },
      { speaker: "role", text: "I'll watch the skies carefully — thanks, Sparky!" }
    ]
  }
};

// UI: create role buttons
function renderRoles() {
  rolesRow.innerHTML = "";
  ROLES.forEach(r => {
    const b = document.createElement("button");
    b.className = "role-btn";
    b.textContent = r.name;
    b.onclick = () => {
      selectedRole = r.id;
      openSceneFor(selectedTopic, selectedRole);
      hideRoleModal();
    };
    rolesRow.appendChild(b);
  });
}

// fetch topics from backend
async function loadTopics(){
  try{
    const res = await fetch(`${API_ROOT}/topics`);
    const data = await res.json();
    const topics = data.topics || [];
    renderTopics(topics);
  } catch(err){
    topicsGrid.innerHTML = `<p style="color:#fff">Could not load topics — make sure backend is running.</p>`;
    console.error(err);
  }
}

function renderTopics(topics){
  topicsGrid.innerHTML = "";
  topics.forEach(t => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div>
        <h3>${t.title}</h3>
        <p>${t.short}</p>
      </div>
    `;
    card.addEventListener("click", () => {
      selectedTopic = t.id;
      showRoleModal();
    });
    topicsGrid.appendChild(card);
  });
}

// Show/hide role chooser
function showRoleModal() {
  roleModal.classList.remove("hidden");
  roleModal.setAttribute("aria-hidden","false");
}
function hideRoleModal(){
  roleModal.classList.add("hidden");
  roleModal.setAttribute("aria-hidden","true");
}

// Scene logic
let sequence = [];
let idx = 0;
let currentUtterance = null;

function openSceneFor(topicId, roleId) {
  setRoleAvatar(roleId);
  roleLabel.textContent = ROLES.find(r=>r.id===roleId).name;
  sequence = (DIALOGUES[topicId] && DIALOGUES[topicId][roleId]) || [];
  idx = 0;
  sceneModal.classList.remove("hidden");
  sceneModal.setAttribute("aria-hidden","false");
  statusText.textContent = "Ready";
  playBtn.disabled = false;
  pauseBtn.disabled = true;
  stopBtn.disabled = true;

  // auto-start the conversation
  setTimeout(() => startSequence(), 250);
}

function setRoleAvatar(roleId){
  if(roleId === "farmer"){
    roleAvatar.innerHTML = `
      <div class="farm-scene">
        <svg id="tractor" viewBox="0 0 220 120" class="tractor-svg" aria-hidden="true">
          <g id="tractorGroup">
            <rect x="18" y="46" width="120" height="40" rx="8" fill="#6b8e23" />
            <rect x="80" y="26" width="56" height="30" rx="6" fill="#2e5a2e" />
            <circle cx="46" cy="92" r="14" fill="#222" />
            <circle cx="172" cy="92" r="20" fill="#111" />
          </g>
        </svg>
        <svg id="gpsIcon" viewBox="0 0 64 64" class="gps-svg" aria-hidden="true">
          <circle cx="32" cy="32" r="10" fill="#ffffff" stroke="#0b3552" stroke-width="2"/>
          <path class="gps-wave" d="M40 32c0 4.4-3.6 8-8 8" fill="none" stroke="#ff8f00" stroke-width="2"/>
          <path class="gps-wave" d="M44 32c0 7.7-6.3 14-14 14" fill="none" stroke="#ffb74d" stroke-width="2"/>
          <rect x="6" y="44" width="52" height="6" rx="3" fill="#cfe8ff" />
          <text x="6" y="60" font-size="8" fill="#05233a">GPS</text>
        </svg>
      </div>
    `;
    // re-query elements
    attachSceneElements();
  } else if(roleId === "pilot"){
    roleAvatar.innerHTML = `<svg viewBox="0 0 120 120" class="avatar-svg" aria-hidden="true">
      <g id="pilotG">
        <rect x="10" y="44" width="100" height="48" rx="12" fill="#d0e7ff" />
        <circle cx="60" cy="30" r="16" fill="#fff" />
        <path id="pilotMouth" d="M50 36 Q60 42 70 36" stroke="#1b3b5a" stroke-width="2" fill="none" stroke-linecap="round"/>
        <rect x="30" y="10" width="60" height="14" rx="6" fill="#345b9a"/>
        <circle cx="42" cy="28" r="3" fill="#222"/>
        <circle cx="78" cy="28" r="3" fill="#222"/>
      </g>
    </svg>`;
    attachSceneElements();
  } else if(roleId === "astronaut"){
    roleAvatar.innerHTML = `<svg viewBox="0 0 120 120" class="avatar-svg" aria-hidden="true">
      <g id="astroG">
        <rect x="10" y="44" width="100" height="48" rx="12" fill="#e6f7ff" />
        <circle cx="60" cy="30" r="16" fill="#eef6ff" />
        <path id="astroMouth" d="M52 38 Q60 44 68 38" stroke="#234" stroke-width="2" fill="none" stroke-linecap="round"/>
        <rect x="25" y="10" width="70" height="18" rx="8" fill="#c3d9ff"/>
      </g>
    </svg>`;
    attachSceneElements();
  } else if(roleId === "photographer"){
    roleAvatar.innerHTML = `<svg viewBox="0 0 120 120" class="avatar-svg" aria-hidden="true">
      <g id="photoG">
        <rect x="10" y="44" width="100" height="48" rx="12" fill="#fff3e0" />
        <circle cx="60" cy="30" r="16" fill="#fff8f0" />
        <path id="photoMouth" d="M50 36 Q60 44 70 36" stroke="#6b2f00" stroke-width="2" fill="none" stroke-linecap="round"/>
        <rect x="20" y="12" width="80" height="12" rx="6" fill="#6b4b37"/>
      </g>
    </svg>`;
    attachSceneElements();
  }
}

function attachSceneElements(){
  // re-select elements that may have been replaced
  window.setTimeout(()=> {
    pulseLine = document.getElementById("pulseLine");
    gpsIcon = document.getElementById("gpsIcon");
    tractor = document.getElementById("tractor");
  }, 40);
}

// speech helpers
function pickVoice(langStarts = "en") {
  const all = speechSynthesis.getVoices();
  let v = all.find(x => x.lang && x.lang.startsWith(langStarts));
  if(!v && all.length) v = all[0];
  return v;
}

function animateSpeaker(speaker, start, text = "") {
  const flareMouth = document.getElementById("flareMouth");
  const roleMouth = document.querySelector("#roleAvatar path[id$='Mouth']");
  if(speaker === "flare") {
    if(start) {
      // flare mouth talk + pulse beam animation
      if(flareMouth) flareMouth.classList.add("talking");
      if(pulseLine) {
        pulseLine.classList.remove("pulse-animate");
        setTimeout(()=> pulseLine.classList.add("pulse-animate"), 20);
      }
      // if text mentions GPS/radio/signal then glitch GPS & wobble tractor
      if(/gps|radio|signal|signals|gps tractor|gps error/i.test(text)) {
        const gps = document.getElementById("gpsIcon");
        const tr = document.getElementById("tractor");
        if(gps) { gps.classList.remove("gps-glitch"); void gps.offsetWidth; gps.classList.add("gps-glitch"); }
        if(tr) { tr.classList.remove("tractor-wobble"); void tr.offsetWidth; tr.classList.add("tractor-wobble"); }
      }
    } else {
      if(flareMouth) flareMouth.classList.remove("talking");
      if(pulseLine) pulseLine.classList.remove("pulse-animate");
    }
  } else {
    // role speaks -> animate role mouth if present
    if(start) {
      if(roleMouth) roleMouth.classList.add("talking");
      const avatarG = document.querySelector("#roleAvatar svg g");
      if(avatarG) avatarG.classList.add("talking");
    } else {
      if(roleMouth) roleMouth.classList.remove("talking");
      const avatarG = document.querySelector("#roleAvatar svg g");
      if(avatarG) avatarG.classList.remove("talking");
    }
  }
}

// speak the sequence lines one-by-one
function speakSequence() {
  if(idx >= sequence.length) {
    statusText.textContent = "Done";
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    return;
  }
  const item = sequence[idx];
  if(!item) return;
  if(currentUtterance) speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(item.text);
  const voice = pickVoice("en");
  if(voice) u.voice = voice;

  // adjust voice timbre
  if(item.speaker === "flare") { u.pitch = 1.25; u.rate = 0.95; }
  else { u.pitch = 0.95; u.rate = 1.02; }

  u.onstart = () => {
    animateSpeaker(item.speaker, true, item.text);
    statusText.textContent = `${item.speaker === "flare" ? "Flare" : roleLabel.textContent} speaking...`;
    playBtn.disabled = true;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;
  };
  u.onend = () => {
    animateSpeaker(item.speaker, false, item.text);
    idx++;
    setTimeout(() => {
      if(!speechSynthesis.paused) speakSequence();
    }, 450);
  };

  currentUtterance = u;
  speechSynthesis.speak(u);
}

// controls
function startSequence(){
  if(idx >= sequence.length) idx = 0;
  speakSequence();
}

playBtn.addEventListener("click", () => {
  if(speechSynthesis.paused) {
    speechSynthesis.resume();
    statusText.textContent = "Resumed";
    playBtn.disabled = true;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;
    return;
  }
  if(idx >= sequence.length) idx = 0;
  speakSequence();
});

pauseBtn.addEventListener("click", () => {
  if(!speechSynthesis.speaking) return;
  speechSynthesis.pause();
  statusText.textContent = "Paused";
  playBtn.disabled = false;
  pauseBtn.disabled = true;
});

stopBtn.addEventListener("click", () => {
  speechSynthesis.cancel();
  currentUtterance = null;
  idx = 0;
  statusText.textContent = "Stopped";
  playBtn.disabled = false;
  pauseBtn.disabled = true;
  stopBtn.disabled = true;
  // clear animations
  animateSpeaker("flare", false);
  animateSpeaker("role", false);
});

// close scene
closeScene.addEventListener("click", () => {
  speechSynthesis.cancel();
  sceneModal.classList.add("hidden");
  sceneModal.setAttribute("aria-hidden","true");
  statusText.textContent = "Ready";
  playBtn.disabled = false;
  pauseBtn.disabled = true;
  stopBtn.disabled = true;
});

// role modal cancel
roleCancel.addEventListener("click", hideRoleModal);

renderRoles();
loadTopics();

// ensure voices are loaded (Chrome loads asynchronously)
if (typeof speechSynthesis !== "undefined") {
  speechSynthesis.onvoiceschanged = () => {};
}
