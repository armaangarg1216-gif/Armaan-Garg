const EVENT_KEY = "your-friend-events-v2";
const SCHEDULE_KEY = "your-friend-schedule-v2";
const WATER_KEY = "your-friend-water-v2";
const LATEST_REMINDER_KEY = "your-friend-latest-reminder-v1";
const DB_NAME = "your-friend-files-v1";
const DB_STORE = "files";
const defaultSchedules = [
  { time: "07:30", label: "Good morning, wakey wakey", kind: "message" },
  { time: "10:30", label: "Mere babu ne pani piya?", kind: "water" },
  { time: "14:30", label: "You are doing great!!!", kind: "message" },
  { time: "21:45", label: "Slowly getting time for bed", kind: "message" },
  { time: "22:30", label: "Goodnight, my love", kind: "message" },
];
const loveMessages = [
  "All the best my jungleeee!!", "You are the most beautyfullest!", "I love you moreee!!",
  "MWAAAAAAAHHHHHHHHH", "You are doing great!!!", "DONT GIVE UP!!",
  "Mai hu na, mai sambhal lunga", "I am grateful to have you in my life. You mean everything to me.",
  "Khana khaya? meri junglee??", "YOU SOOO PRETTYY GURLLL.", "GURLLL SLAYYY.",
  "GURLLL YOU SO HOTTT.", "Whoss myy babbyyy???? Jyeshthaaa!!!", "Hi shorty. Blend??",
  "Cant take my eyess off of youu.", "Be my, be my babyyy.", "I love you for infinity.",
  "You make my ordinary days feel like a movie.", "If home had a smile, it would look like yours.",
  "You are my favorite plot twist and my forever favorite person.", "Proud of you, even for the little things.",
];
const waterMessages = ["Mere babu ne pani piya?", "Pani piyo mera baccha", "Drink water babyy", "H20 is important for health", "A little sip for my favorite human 💧", "Hydration check, meri junglee!", "One sip closer to feeling lovely." ];
const completeMessages = ["You diddd itt my Jungleee, mwaahhhh, I love you soooo muchh. I am proud of you!!", "Eight glasses! My hydrated superstar, mwaah!", "You kept your promise to yourself today. So proud of you, babyy!", "Water goal complete! Sending you the biggest hug 💧💖"];
const fixedEvents = [
  { month: 0, day: 16, title: "Armaan Garg's Birthday", type: "Birthday", note: "Your day, saved right here." },
  { month: 8, day: 28, title: "First Jungle Date", type: "Memory", note: "A quiet wild little chapter." },
  { month: 10, day: 13, title: "First Date", type: "Memory", note: "The first official date." },
  { month: 2, day: 17, title: "First Boards Exam Together", type: "Milestone", note: "Stressful, memorable, together." },
  { month: 8, day: 23, title: "Anniversary Day", type: "Anniversary", note: "The day you got together." },
  { month: 10, day: 12, title: "Jyeshtha's Birthday", type: "Birthday", note: "Her special day." },
];
let visibleMonth = new Date().getMonth();
let visibleYear = new Date().getFullYear();
let activePanel = "home";
let dbPromise;
const panelEl = document.querySelector("#panel");
const waterMetric = document.querySelector("#waterMetric");
const dailyMessage = document.querySelector("#dailyMessage");
const dailyGreeting = document.querySelector("#dailyGreeting");

function safe(value) { return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }
function readJSON(key, fallback) { try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; } }
function openDB() {
  if (!("indexedDB" in window)) return Promise.reject(new Error("This browser does not support local file storage."));
  if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(DB_STORE)) request.result.createObjectStore(DB_STORE, { keyPath: "id", autoIncrement: true }); };
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
  });
  return dbPromise;
}
async function fileRequest(mode, action) { const db = await openDB(); return new Promise((resolve, reject) => { const tx = db.transaction(DB_STORE, mode); const request = action(tx.objectStore(DB_STORE)); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); }
const getFiles = () => fileRequest("readonly", (store) => store.getAll());
const addFile = (file) => fileRequest("readwrite", (store) => store.add(file));
const deleteFile = (id) => fileRequest("readwrite", (store) => store.delete(Number(id)));
function waterState() { const all = readJSON(WATER_KEY, {}); const day = new Date().toLocaleDateString("en-CA"); return { all, day, count: Number(all[day] || 0) }; }
function saveWater(count) { const { all, day } = waterState(); all[day] = count; localStorage.setItem(WATER_KEY, JSON.stringify(all)); }
function updateWaterMetric() { const { count } = waterState(); waterMetric.textContent = `${count}/8`; document.querySelector("#waterSub")?.replaceChildren(document.createTextNode(count === 8 ? "Goal reached! So proud of you 💖" : `${8 - count} little sips to go`)); }
function icon(path) { return `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="${path}"/></svg>`; }
function renderPanel(name) {
  activePanel = name;
  const renderers = { home: renderHome, album: renderAlbum, vault: renderVault, reminders: renderReminders, calendar: renderCalendar, notes: renderNotes, profile: renderProfile };
  (renderers[name] || renderHome)();
  document.querySelectorAll("[data-panel]").forEach((b) => b.classList.toggle("active", b.dataset.panel === name));
  updateWaterMetric();
}
function renderHome() {
  const { count } = waterState();
  const latestReminder = readJSON(LATEST_REMINDER_KEY, null);
  panelEl.innerHTML = `<h2>A little care for today</h2><p>Your memories, important dates, and small reminders all live here.</p>
    ${latestReminder ? `<article class="home-reminder"><span>🔔</span><div><small>YOUR LITTLE REMINDER · ${safe(latestReminder.time)}</small><p>${safe(latestReminder.label)}</p></div><button class="remove-file" id="dismissReminder" aria-label="Dismiss reminder">×</button></article>` : ""}
    <div class="item-list"><article class="item"><span class="item-icon">💧</span><div><h3>Water check-in</h3><p>${count === 8 ? "You did it! So proud of you." : `${count} of 8 glasses today. You’ve got this!`}</p></div><button class="small-action" data-go="reminders">Track</button></article>
    <article class="item"><span class="item-icon">💌</span><div><h3>A little reminder</h3><p>${safe(loveMessages[new Date().getDate() % loveMessages.length])}</p></div><button class="small-action" data-go="notes">More</button></article>
    <article class="item"><span class="item-icon">📅</span><div><h3>Special days</h3><p>Keep your favorite dates close.</p></div><button class="small-action" data-go="calendar">Open</button></article></div>`;
  panelEl.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => renderPanel(b.dataset.go)));
  panelEl.querySelector("#dismissReminder")?.addEventListener("click", () => { localStorage.removeItem(LATEST_REMINDER_KEY); renderPanel("home"); });
}
async function renderAlbum() {
  panelEl.innerHTML = `<h2>Our little album</h2><p>Add photos from this device and give each one a little caption. They stay in this browser on this device.</p><form class="event-form" id="photoForm"><input name="photos" type="file" accept="image/*" multiple required /><input name="caption" maxlength="80" placeholder="A tiny caption (optional)" /><button type="submit">Add to album</button></form><div class="photo-gallery" id="photoGallery"><p>Loading your memories…</p></div>`;
  const gallery = panelEl.querySelector("#photoGallery");
  try {
    const photos = (await getFiles()).filter((f) => f.category === "photo");
    gallery.innerHTML = photos.length ? photos.map((f) => `<figure><img src="${URL.createObjectURL(f.blob)}" alt="${safe(f.name)}" /><figcaption>${safe(f.caption || f.name)}</figcaption><button class="remove-file" data-remove="${f.id}">Remove</button></figure>`).join("") : `<p class="empty-state">Your shared memories will show up here after the first photo.</p>`;
    gallery.querySelectorAll("[data-remove]").forEach((b) => b.addEventListener("click", async () => { await deleteFile(b.dataset.remove); renderPanel("album"); }));
  } catch (error) { gallery.innerHTML = `<p class="empty-state">${safe(error.message)}</p>`; }
  panelEl.querySelector("#photoForm").addEventListener("submit", async (event) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const files = form.getAll("photos").filter((f) => f.size);
    try { for (const file of files) await addFile({ category: "photo", name: file.name, caption: form.get("caption"), blob: file, created: Date.now() }); renderPanel("album"); } catch (error) { alert(`Could not save these photos: ${error.message}`); }
  });
}
async function renderVault() {
  panelEl.innerHTML = `<h2>Document vault</h2><p>Save scans or photos of important cards on this device. The files stay in this browser; this demo does not encrypt or sync them.</p><p class="helper-text">For privacy, add documents only on a device and browser you trust.</p><form class="event-form" id="docForm"><select name="kind" aria-label="Document type"><option>Aadhaar</option><option>PAN / ID</option><option>Medical</option><option>Certificate</option><option>Other</option></select><input name="file" type="file" accept="image/*,.pdf,application/pdf" required /><input name="label" maxlength="80" placeholder="Name or note (optional)" /><button type="submit">Save document</button></form><div class="document-list" id="documentList"><p>Loading documents…</p></div>`;
  const list = panelEl.querySelector("#documentList");
  try { const docs = (await getFiles()).filter((f) => f.category === "document"); list.innerHTML = docs.length ? docs.map((f) => `<article class="saved-file"><span>📄</span><div><strong>${safe(f.label || f.kind)}</strong><small>${safe(f.name)} · ${new Date(f.created).toLocaleDateString()}</small></div><button class="small-action" data-open="${f.id}">Open</button><button class="remove-file" data-remove="${f.id}">Delete</button></article>`).join("") : `<p class="empty-state">No documents saved yet. Add a scan or PDF above.</p>`;
    list.querySelectorAll("[data-remove]").forEach((b) => b.addEventListener("click", async () => { if (confirm("Delete this saved document?")) { await deleteFile(b.dataset.remove); renderPanel("vault"); } }));
    list.querySelectorAll("[data-open]").forEach((b) => b.addEventListener("click", async () => { const f = (await getFiles()).find((item) => item.id === Number(b.dataset.open)); if (f) window.open(URL.createObjectURL(f.blob), "_blank", "noopener"); }));
  } catch (error) { list.innerHTML = `<p class="empty-state">${safe(error.message)}</p>`; }
  panelEl.querySelector("#docForm").addEventListener("submit", async (event) => { event.preventDefault(); const fd = new FormData(event.currentTarget); const file = fd.get("file"); if (!file?.size) return; try { await addFile({ category: "document", kind: fd.get("kind"), name: file.name, label: fd.get("label"), blob: file, created: Date.now() }); renderPanel("vault"); } catch (error) { alert(`Could not save the document: ${error.message}`); } });
}
function renderWaterTracker() { const { count } = waterState(); return `<div class="water-card"><strong>Water today <span>${count}/8 glasses</span></strong><p id="waterSub">${count === 8 ? "Goal reached! So proud of you 💖" : `${8 - count} little sips to go`}</p><div class="water-row">${Array.from({ length: 8 }, (_, i) => `<button class="water-dot ${i < count ? "done" : ""}" data-water="${i + 1}" aria-label="Log ${i + 1} glasses" title="Log ${i + 1} glasses">💧</button>`).join("")}</div><button class="small-action" id="undoWater">Undo last glass</button></div>`; }
function renderReminders() {
  const schedules = readJSON(SCHEDULE_KEY, defaultSchedules); const { count } = waterState();
    panelEl.innerHTML = `<h2>Gentle reminders</h2><p>Water tracking saves by day. Allow notifications below for pop-up alerts. Reminder times are checked while the app is open; this browser-only app cannot wake itself when fully closed.</p>
    ${renderWaterTracker()}<div class="schedule-heading"><h3>My reminders</h3><button class="small-action" id="enableNotifications">Allow notifications</button></div><div class="schedule-list">${schedules.length ? schedules.map((s, i) => `<form class="schedule-edit" data-edit-schedule="${i}"><input aria-label="Reminder time" name="time" type="time" value="${safe(s.time)}" required /><input aria-label="Reminder message" name="label" maxlength="120" value="${safe(s.label)}" required /><button type="submit">Save</button><button type="button" data-delete-schedule="${i}" aria-label="Remove reminder">Remove</button></form>`).join("") : `<p class="empty-state">No reminders yet. Add one below.</p>`}</div>
    <form class="event-form" id="scheduleForm"><input name="time" type="time" required /><input name="label" maxlength="120" placeholder="A lovely reminder" required /><button type="submit">Add reminder</button></form><div class="note-card" id="waterEncouragement">${safe(count === 8 ? completeMessages[new Date().getDate() % completeMessages.length] : waterMessages[new Date().getDate() % waterMessages.length])}</div>`;
  panelEl.querySelectorAll("[data-water]").forEach((b) => b.addEventListener("click", () => { const next = Number(b.dataset.water); const wasDone = waterState().count >= 8; saveWater(next); renderPanel("reminders"); if (next === 8 && !wasDone) panelEl.querySelector("#waterEncouragement").textContent = completeMessages[Math.floor(Math.random() * completeMessages.length)]; }));
  panelEl.querySelector("#undoWater").addEventListener("click", () => { saveWater(Math.max(0, count - 1)); renderPanel("reminders"); });
  panelEl.querySelectorAll("[data-edit-schedule]").forEach((form) => form.addEventListener("submit", (event) => { event.preventDefault(); const fd = new FormData(form); schedules[Number(form.dataset.editSchedule)] = { ...schedules[Number(form.dataset.editSchedule)], time: fd.get("time"), label: fd.get("label") }; schedules.sort((a, b) => a.time.localeCompare(b.time)); localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedules)); renderPanel("reminders"); }));
  panelEl.querySelectorAll("[data-delete-schedule]").forEach((b) => b.addEventListener("click", () => { schedules.splice(Number(b.dataset.deleteSchedule), 1); localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedules)); renderPanel("reminders"); }));
  panelEl.querySelector("#scheduleForm").addEventListener("submit", (event) => { event.preventDefault(); const fd = new FormData(event.currentTarget); schedules.push({ time: fd.get("time"), label: fd.get("label"), kind: "message" }); schedules.sort((a, b) => a.time.localeCompare(b.time)); localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedules)); renderPanel("reminders"); });
  panelEl.querySelector("#enableNotifications").addEventListener("click", async () => { if (!("Notification" in window)) return alert("This browser does not support notifications."); const permission = await Notification.requestPermission(); alert(permission === "granted" ? "Notifications allowed. Reminders can appear while the app is open." : "Notifications are not enabled. You can still see reminders here."); });
}
function renderCalendar() {
  const events = [...fixedEvents, ...readJSON(EVENT_KEY, [])]; const monthEvents = events.filter((e) => e.month === visibleMonth && (!e.year || e.year === visibleYear));
  const firstDay = new Date(visibleYear, visibleMonth, 1).getDay(); const days = new Date(visibleYear, visibleMonth + 1, 0).getDate(); const monthName = new Date(visibleYear, visibleMonth).toLocaleDateString(undefined, { month: "long" }); const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(`<span class="calendar-cell muted"></span>`);
  for (let d = 1; d <= days; d++) { const marked = monthEvents.filter((e) => e.day === d); cells.push(`<button class="calendar-cell ${marked.length ? "marked" : ""}" data-day="${d}"><span>${d}</span>${marked.length ? `<small>${safe(marked[0].type)}</small>` : ""}</button>`); }
  panelEl.innerHTML = `<h2>Our important days</h2><p>Birthdays, milestones, and little anniversaries worth remembering.</p><div class="calendar-toolbar"><button id="prevMonth" aria-label="Previous month">‹</button><strong>${monthName} ${visibleYear}</strong><button id="nextMonth" aria-label="Next month">›</button></div><div class="calendar-grid">${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => `<b>${d}</b>`).join("")}${cells.join("")}</div>
    <div class="event-list">${monthEvents.length ? monthEvents.map((e) => `<article><span class="tag">${safe(e.type)}</span><strong>${e.day} ${safe(e.title)}</strong><p>${safe(e.note || "A special day to celebrate.")}</p>${e.custom ? `<button class="remove-file" data-event-remove="${e.id}">Remove</button>` : ""}</article>`).join("") : `<p class="empty-state">No dates this month yet. Add one below!</p>`}</div><form class="event-form" id="eventForm"><input name="title" placeholder="Birthday, anniversary, plan…" maxlength="80" required /><input name="date" type="date" required /><button type="submit">Save date</button></form>`;
  panelEl.querySelector("#prevMonth").addEventListener("click", () => changeMonth(-1)); panelEl.querySelector("#nextMonth").addEventListener("click", () => changeMonth(1));
  panelEl.querySelector("#eventForm").addEventListener("submit", (event) => { event.preventDefault(); const fd = new FormData(event.currentTarget); const date = new Date(`${fd.get("date")}T00:00:00`); const custom = readJSON(EVENT_KEY, []); custom.push({ id: crypto.randomUUID?.() || String(Date.now()), month: date.getMonth(), year: date.getFullYear(), day: date.getDate(), title: fd.get("title"), type: "Special day", note: "Saved with love.", custom: true }); localStorage.setItem(EVENT_KEY, JSON.stringify(custom)); visibleMonth = date.getMonth(); visibleYear = date.getFullYear(); renderPanel("calendar"); });
  panelEl.querySelectorAll("[data-event-remove]").forEach((b) => b.addEventListener("click", () => { localStorage.setItem(EVENT_KEY, JSON.stringify(readJSON(EVENT_KEY, []).filter((e) => e.id !== b.dataset.eventRemove))); renderPanel("calendar"); }));
  panelEl.querySelectorAll("[data-day]").forEach((b) => b.addEventListener("click", () => { const selected = monthEvents.filter((e) => e.day === Number(b.dataset.day)); if (selected.length) { panelEl.querySelectorAll(".event-list article").forEach((article) => article.classList.toggle("selected-date", selected.some((e) => article.textContent.includes(e.title)))); } }));
}
function changeMonth(d) { visibleMonth += d; if (visibleMonth < 0) { visibleMonth = 11; visibleYear--; } if (visibleMonth > 11) { visibleMonth = 0; visibleYear++; } renderPanel("calendar"); }
function renderNotes() { const daily = loveMessages[new Date().getDate() % loveMessages.length]; panelEl.innerHTML = `<h2>Little notes for you</h2><p>A pocket full of encouragement, compliments, and reminders that you are loved.</p><div class="note-card" id="dailyNote">${safe(daily)}</div><button class="primary-action note-next" id="nextNote">Another one, please 💌</button><div class="item-list">${["Good morning, my favorite person. Go make today yours.", "Goodnight, babyy. I hope your dreams are as lovely as you.", "You don't have to do everything today. I'm already proud of you.", "Khana khaya? meri junglee?? Come tell me everything.", "In every universe, I would still look for you.", "You are the prettiest thought in my head, all day long."].map((n) => `<article class="note-card">${safe(n)}</article>`).join("")}</div>`; panelEl.querySelector("#nextNote").addEventListener("click", () => { panelEl.querySelector("#dailyNote").textContent = loveMessages[Math.floor(Math.random() * loveMessages.length)]; }); }
function renderProfile() { panelEl.innerHTML = `<h2>Her little things</h2><p>A space for the details that make caring for her feel personal.</p><div class="item-list">${[["Favorites", "Food, songs, colors, comfort movies, flowers."], ["Emergency details", "Contacts, blood group, allergies, doctor details."], ["Wishlist", "Dream places, books, experiences, and gift ideas."]].map(([title, text]) => `<article class="item"><span class="item-icon">💖</span><div><h3>${title}</h3><p>${text}</p><textarea data-profile="${title}" placeholder="Add a note…" maxlength="500">${safe(readJSON("your-friend-profile-v1", {})[title] || "")}</textarea></div></article>`).join("")}</div><p class="helper-text">These notes stay in this browser. Avoid saving sensitive medical details on a shared device.</p>`; panelEl.querySelectorAll("[data-profile]").forEach((el) => el.addEventListener("change", () => { const data = readJSON("your-friend-profile-v1", {}); data[el.dataset.profile] = el.value; localStorage.setItem("your-friend-profile-v1", JSON.stringify(data)); })); }
function setDateAndGreeting() { const now = new Date(); const hour = now.getHours(); const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"; document.querySelector("#todayDate").textContent = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }); dailyGreeting.textContent = `${greeting}, Jyeshtha.`; dailyMessage.textContent = loveMessages[now.getDate() % loveMessages.length]; updateWaterMetric(); }
function checkScheduledReminders() {
  const now = new Date();
  const stamp = `${now.toLocaleDateString("en-CA")}-${now.getHours()}:${now.getMinutes()}`;
  if (sessionStorage.getItem("lastReminder") === stamp) return;
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const schedule = readJSON(SCHEDULE_KEY, defaultSchedules).find((s) => s.time === time);
  if (!schedule) return;
  sessionStorage.setItem("lastReminder", stamp);
  const reminder = { label: schedule.label, time, date: now.toLocaleDateString() };
  localStorage.setItem(LATEST_REMINDER_KEY, JSON.stringify(reminder));
  if (activePanel === "home") renderPanel("home");
  if ("Notification" in window && Notification.permission === "granted") {
    navigator.serviceWorker?.ready.then((registration) => registration.showNotification("A little note for you 💌", { body: schedule.label, tag: `reminder-${stamp}`, data: { url: "./index.html" } })).catch(() => {});
  }
  if (activePanel === "reminders") panelEl.querySelector("#waterEncouragement")?.replaceChildren(document.createTextNode(schedule.label));
}
document.querySelectorAll("[data-panel]").forEach((button) => button.addEventListener("click", () => renderPanel(button.dataset.panel)));
document.querySelector("#themeButton").addEventListener("click", () => { document.body.classList.toggle("night"); localStorage.setItem("your-friend-night-v1", document.body.classList.contains("night") ? "1" : "0"); });
document.querySelector("#surpriseButton").addEventListener("click", () => renderPanel("notes"));
if (localStorage.getItem("your-friend-night-v1") === "1") document.body.classList.add("night");
if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(() => {});
setDateAndGreeting(); setInterval(() => { setDateAndGreeting(); checkScheduledReminders(); }, 30000); renderPanel("home");
