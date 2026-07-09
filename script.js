/* ============================================================
   script.js
   App logic. Depends on config.js (globals) and firebase.js
   (the DB object) being loaded first.
   ============================================================ */

/* ================================================================
   0. Small utilities
   ================================================================ */

function $(sel) { return document.querySelector(sel); }
function $all(sel) { return Array.from(document.querySelectorAll(sel)); }

function getOrCreateVisitorId() {
  let id = localStorage.getItem("visitorId");
  if (!id) {
    id = "v_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem("visitorId", id);
  }
  return id;
}

function detectDeviceMeta() {
  const ua = navigator.userAgent || "";

  let browser = "Unknown";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\//.test(ua)) browser = "Opera";
  else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua) && /Version\//.test(ua)) browser = "Safari";
  else browser = "Other";

  let platform = "Unknown";
  if (/Windows/.test(ua)) platform = "Windows";
  else if (/Mac OS X/.test(ua) && !/iPhone|iPad/.test(ua)) platform = "macOS";
  else if (/Android/.test(ua)) platform = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) platform = "iOS";
  else if (/Linux/.test(ua)) platform = "Linux";

  let device = "Desktop";
  if (/iPad|Tablet/.test(ua)) device = "Tablet";
  else if (/Mobi|Android.*Mobile|iPhone/.test(ua)) device = "Mobile";

  return {
    browser,
    platform,
    device,
    userAgent: ua,
    language: navigator.language || "unknown",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown"
  };
}

function showToast(message, duration = 2600) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("visible"), duration);
}

function formatTimestamp(ts) {
  if (!ts) return "just now";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

/* ================================================================
   1. Ambient visuals — aurora canvas + drifting particles
   ================================================================ */

function initAurora() {
  const canvas = $("#aurora-canvas");
  const ctx = canvas.getContext("2d");
  let w, h, t = 0;
  let mouseX = 0.5, mouseY = 0.5;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  });

  const blobs = [
    { color: "61,218,215", rx: 0.5, ry: 0.3, freq: 0.15, phase: 0 },
    { color: "139,107,242", rx: 0.7, ry: 0.6, freq: 0.11, phase: 2 },
    { color: "255,111,145", rx: 0.3, ry: 0.7, freq: 0.13, phase: 4 }
  ];

  function draw() {
    t += 0.0035;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";

    blobs.forEach((b) => {
      const cx = (b.rx + 0.15 * Math.sin(t * b.freq + b.phase) + (mouseX - 0.5) * 0.06) * w;
      const cy = (b.ry + 0.15 * Math.cos(t * b.freq * 1.3 + b.phase) + (mouseY - 0.5) * 0.06) * h;
      const radius = Math.max(w, h) * 0.42;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, `rgba(${b.color}, 0.16)`);
      grad.addColorStop(1, `rgba(${b.color}, 0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    });

    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(draw);
  }
  draw();
}

function initParticles() {
  const canvas = $("#particle-canvas");
  const ctx = canvas.getContext("2d");
  let w, h;
  const COUNT = 60;
  let particles = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  function makeParticle() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      vy: -(Math.random() * 0.18 + 0.04),
      vx: (Math.random() - 0.5) * 0.08,
      alpha: Math.random() * 0.5 + 0.15
    };
  }
  for (let i = 0; i < COUNT; i++) particles.push(makeParticle());

  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
      if (p.x < -5) p.x = w + 5;
      if (p.x > w + 5) p.x = -5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(238, 241, 246, ${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ================================================================
   2. Screen switching
   ================================================================ */

function showScreen(id) {
  $all(".screen").forEach((s) => s.classList.add("screen--hidden"));
  const target = $(id);
  target.classList.remove("screen--hidden");
  if (typeof gsap !== "undefined") {
    gsap.fromTo(target, { opacity: 0 }, { opacity: 1, duration: 0.55, ease: "power2.out" });
  }
}

/* ================================================================
   3. Login
   ================================================================ */

function initLogin() {
  const form = $("#login-form");
  const input = $("#password-input");
  const card = $("#login-card");
  const errorPopup = $("#error-popup");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value.trim();

    if (value === USER_PASSWORD) {
      errorPopup.classList.remove("visible");
      enterUserPage();
    } else if (value === ADMIN_PASSWORD) {
      errorPopup.classList.remove("visible");
      enterAdminDashboard();
    } else {
      card.classList.remove("shake");
      void card.offsetWidth; // restart animation
      card.classList.add("shake", "glow-red");
      errorPopup.classList.add("visible");
      setTimeout(() => card.classList.remove("glow-red"), 700);
      input.value = "";
      input.focus();
    }
  });
}

/* ================================================================
   4. User page
   ================================================================ */

const state = {
  answers: {},       // { q1: "yes"/"no", ... }
  visitorId: null,
  meta: null
};

function typewriter(text, el, cursorEl, speed = 28) {
  return new Promise((resolve) => {
    let i = 0;
    el.textContent = "";
    function tick() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(tick, speed);
      } else {
        if (cursorEl) cursorEl.style.display = "none";
        resolve();
      }
    }
    tick();
  });
}

function renderQuestions() {
  const block = $("#questions-block");
  block.innerHTML = "";
  QUESTIONS.forEach((q) => {
    const card = document.createElement("div");
    card.className = "glass-card question-card";
    card.innerHTML = `
      <p class="question-text">${escapeHtml(q.text)}</p>
      <div class="answer-buttons" data-qid="${q.id}">
        <button type="button" class="answer-btn" data-value="yes">Yes</button>
        <button type="button" class="answer-btn" data-value="no">No</button>
      </div>
    `;
    block.appendChild(card);
  });

  $all(".answer-buttons").forEach((group) => {
    const qid = group.dataset.qid;
    group.querySelectorAll(".answer-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.answers[qid] = btn.dataset.value;
        group.querySelectorAll(".answer-btn").forEach((b) => {
          b.classList.remove("selected-yes", "selected-no");
        });
        btn.classList.add(btn.dataset.value === "yes" ? "selected-yes" : "selected-no");
        updateSubmitAvailability();
      });
    });
  });
}

function updateSubmitAvailability() {
  const allAnswered = QUESTIONS.every((q) => state.answers[q.id]);
  const submitBtn = $("#submit-btn");
  const label = $("#submit-btn-label");
  submitBtn.disabled = !allAnswered;
  label.textContent = allAnswered ? "Send my response" : "Answer all questions to continue";
}

function initFeedbackCounter() {
  const textarea = $("#feedback-textarea");
  const count = $("#char-count");
  textarea.addEventListener("input", () => {
    count.textContent = textarea.value.length;
  });
}

async function handleSubmit() {
  const submitBtn = $("#submit-btn");
  const status = $("#submit-status");
  const feedback = $("#feedback-textarea").value.trim();

  if (!QUESTIONS.every((q) => state.answers[q.id])) return;

  submitBtn.disabled = true;
  $("#submit-btn-label").textContent = "Sending...";
  status.textContent = "";
  status.className = "submit-status";

  try {
    if (!DB.isFirebaseReady()) throw new Error("Firebase isn't connected. Check config.js.");

    await DB.addResponse({
      answers: { ...state.answers },
      feedback,
      browser: state.meta.browser,
      device: state.meta.device,
      platform: state.meta.platform,
      language: state.meta.language,
      timezone: state.meta.timezone,
      visitorId: state.visitorId
    });

    status.textContent = "Response Saved Successfully";
    status.classList.add("success");
    $("#submit-btn-label").textContent = "Sent";
    if (typeof gsap !== "undefined") {
      gsap.fromTo(status, { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 });
    }
  } catch (err) {
    console.error("[script.js] submit failed:", err);
    status.textContent = "Something went wrong saving your response. Please try again.";
    status.classList.add("error");
    submitBtn.disabled = false;
    $("#submit-btn-label").textContent = "Send my response";
  }
}

async function enterUserPage() {
  showScreen("#user-screen");
  renderQuestions();
  initFeedbackCounter();
  updateSubmitAvailability();
  $("#submit-btn").addEventListener("click", handleSubmit);

  if (typeof gsap !== "undefined") {
    gsap.fromTo(".message-card", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" });
    gsap.fromTo(".question-card", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.08, delay: 0.15, ease: "power2.out" });
    gsap.fromTo(".feedback-card, .submit-btn", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, delay: 0.45, ease: "power2.out" });
  }

  logVisitOnce();

  await typewriter(PRIVATE_MESSAGE, $("#typewriter-message"), $("#typewriter-cursor"));
}

function logVisitOnce() {
  if (sessionStorage.getItem("visitLogged")) return;
  sessionStorage.setItem("visitLogged", "1");
  if (!DB.isFirebaseReady()) return;
  DB.logVisit(state.visitorId, {
    browser: state.meta.browser,
    device: state.meta.device,
    platform: state.meta.platform,
    language: state.meta.language,
    timezone: state.meta.timezone
  }).catch((err) => console.error("[script.js] visit log failed:", err));
}

/* ================================================================
   5. Admin dashboard
   ================================================================ */

const admin = {
  responses: [],
  visits: [],
  unsubResponses: null,
  unsubVisits: null,
  chartYesNo: null,
  chartTimeline: null,
  searchTerm: "",
  filter: "all"
};

function enterAdminDashboard() {
  showScreen("#admin-screen");
  $("#demo-badge").classList.toggle("visible", DB.isDemoMode());
  showToast(DB.isDemoMode() ? "Local demo mode — showing data saved on this device." : "Welcome to your dashboard.");

  if (!DB.isFirebaseReady()) {
    showToast("Storage isn't connected — check config.js.", 5000);
    return;
  }

  admin.unsubResponses = DB.listenResponses(
    (rows) => { admin.responses = rows; renderAdminAll(); },
    (err) => { console.error(err); showToast("Failed to load responses."); }
  );
  admin.unsubVisits = DB.listenVisits(
    (rows) => { admin.visits = rows; renderStats(); },
    (err) => { console.error(err); showToast("Failed to load visitors."); }
  );

  $("#search-input").addEventListener("input", (e) => {
    admin.searchTerm = e.target.value.toLowerCase();
    renderResponsesList();
  });
  $("#filter-select").addEventListener("change", (e) => {
    admin.filter = e.target.value;
    renderResponsesList();
  });
  $("#export-csv-btn").addEventListener("click", exportCSV);
  $("#export-json-btn").addEventListener("click", exportJSON);
  $("#delete-all-btn").addEventListener("click", () => {
    if (!admin.responses.length) { showToast("Nothing to delete."); return; }
    confirmModal(
      "Delete all responses?",
      `This will permanently delete all ${admin.responses.length} responses.`,
      async () => {
        try {
          await DB.deleteAllResponses(admin.responses.map((r) => r.id));
          showToast("All responses deleted.");
        } catch (err) {
          console.error(err);
          showToast("Delete failed.");
        }
      }
    );
  });
  $("#admin-logout-btn").addEventListener("click", () => {
    if (admin.unsubResponses) admin.unsubResponses();
    if (admin.unsubVisits) admin.unsubVisits();
    location.reload();
  });
}

function renderAdminAll() {
  renderStats();
  renderCharts();
  renderResponsesList();
}

function renderStats() {
  const uniqueVisitors = new Set(admin.visits.map((v) => v.visitorId)).size;
  const totalResponses = admin.responses.length;
  const primaryId = QUESTIONS[0] ? QUESTIONS[0].id : "q1";
  const yesCount = admin.responses.filter((r) => r.answers && r.answers[primaryId] === "yes").length;
  const noCount = admin.responses.filter((r) => r.answers && r.answers[primaryId] === "no").length;

  $("#stat-visitors").textContent = uniqueVisitors;
  $("#stat-responses").textContent = totalResponses;
  $("#stat-yes").textContent = yesCount;
  $("#stat-no").textContent = noCount;
}

function renderCharts() {
  if (typeof Chart === "undefined") return;

  const primaryId = QUESTIONS[0] ? QUESTIONS[0].id : "q1";
  const yesCount = admin.responses.filter((r) => r.answers && r.answers[primaryId] === "yes").length;
  const noCount = admin.responses.filter((r) => r.answers && r.answers[primaryId] === "no").length;

  const yesNoCtx = $("#chart-yesno").getContext("2d");
  if (admin.chartYesNo) admin.chartYesNo.destroy();
  admin.chartYesNo = new Chart(yesNoCtx, {
    type: "doughnut",
    data: {
      labels: ["Yes", "No"],
      datasets: [{ data: [yesCount, noCount], backgroundColor: ["#4fe3a6", "#ff5c72"], borderWidth: 0 }]
    },
    options: {
      plugins: { legend: { labels: { color: "#b6bcd1" } } },
      maintainAspectRatio: false
    }
  });

  const byDay = {};
  admin.responses.forEach((r) => {
    const d = r.timestamp && r.timestamp.toDate ? r.timestamp.toDate() : new Date();
    const key = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    byDay[key] = (byDay[key] || 0) + 1;
  });
  const labels = Object.keys(byDay).reverse();
  const data = labels.map((l) => byDay[l]);

  const timelineCtx = $("#chart-timeline").getContext("2d");
  if (admin.chartTimeline) admin.chartTimeline.destroy();
  admin.chartTimeline = new Chart(timelineCtx, {
    type: "bar",
    data: {
      labels: labels.length ? labels : ["No data"],
      datasets: [{ label: "Responses", data: data.length ? data : [0], backgroundColor: "#8b6bf2" }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#7c8299" }, grid: { display: false } },
        y: { ticks: { color: "#7c8299", precision: 0 }, grid: { color: "rgba(255,255,255,0.06)" } }
      },
      maintainAspectRatio: false
    }
  });
}

function renderResponsesList() {
  const list = $("#responses-list");
  const emptyState = $("#empty-state");
  const primaryId = QUESTIONS[0] ? QUESTIONS[0].id : "q1";

  let rows = admin.responses;

  if (admin.filter === "yes") rows = rows.filter((r) => r.answers && r.answers[primaryId] === "yes");
  if (admin.filter === "no") rows = rows.filter((r) => r.answers && r.answers[primaryId] === "no");

  if (admin.searchTerm) {
    const term = admin.searchTerm;
    rows = rows.filter((r) => {
      const haystack = [
        r.feedback, r.browser, r.device, r.platform,
        ...Object.values(r.answers || {})
      ].join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }

  list.innerHTML = "";
  emptyState.classList.toggle("visible", rows.length === 0);

  rows.forEach((r) => {
    const card = document.createElement("div");
    card.className = "glass-card response-card";
    const chips = QUESTIONS.map((q) => {
      const val = r.answers ? r.answers[q.id] : null;
      if (!val) return "";
      return `<span class="answer-chip ${val === "yes" ? "chip-yes" : "chip-no"}">${escapeHtml(q.text)}: ${val.toUpperCase()}</span>`;
    }).join("");

    card.innerHTML = `
      <div>
        <p class="response-meta">
          <span>${formatTimestamp(r.timestamp)}</span>
          <span>${escapeHtml(r.browser || "?")}</span>
          <span>${escapeHtml(r.device || "?")}</span>
          <span>${escapeHtml(r.platform || "?")}</span>
        </p>
        <div class="response-answers">${chips}</div>
        <p class="response-feedback">${escapeHtml(r.feedback) || "<em>No written feedback.</em>"}</p>
      </div>
      <div class="response-actions">
        <button class="icon-btn" data-id="${r.id}">Delete</button>
      </div>
    `;
    card.querySelector(".icon-btn").addEventListener("click", () => {
      confirmModal("Delete this response?", "This action can't be undone.", async () => {
        try {
          await DB.deleteResponse(r.id);
          showToast("Response deleted.");
        } catch (err) {
          console.error(err);
          showToast("Delete failed.");
        }
      });
    });
    list.appendChild(card);
  });
}

/* ---------------------------------------------------------------- */
/* Export                                                            */
/* ---------------------------------------------------------------- */

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportCSV() {
  if (!admin.responses.length) { showToast("Nothing to export."); return; }
  const qIds = QUESTIONS.map((q) => q.id);
  const headers = ["timestamp", ...qIds, "feedback", "browser", "device", "platform", "language", "timezone", "visitorId"];
  const lines = [headers.join(",")];

  admin.responses.forEach((r) => {
    const row = [
      formatTimestamp(r.timestamp),
      ...qIds.map((id) => (r.answers && r.answers[id]) || ""),
      r.feedback || "",
      r.browser || "",
      r.device || "",
      r.platform || "",
      r.language || "",
      r.timezone || "",
      r.visitorId || ""
    ].map((val) => `"${String(val).replace(/"/g, '""')}"`);
    lines.push(row.join(","));
  });

  downloadFile("responses.csv", lines.join("\n"), "text/csv");
  showToast("CSV exported.");
}

function exportJSON() {
  if (!admin.responses.length) { showToast("Nothing to export."); return; }
  const data = admin.responses.map((r) => ({
    ...r,
    timestamp: formatTimestamp(r.timestamp)
  }));
  downloadFile("responses.json", JSON.stringify(data, null, 2), "application/json");
  showToast("JSON exported.");
}

/* ---------------------------------------------------------------- */
/* Confirm modal                                                     */
/* ---------------------------------------------------------------- */

function confirmModal(title, body, onConfirm) {
  const backdrop = $("#modal-backdrop");
  $("#modal-title").textContent = title;
  $("#modal-body").textContent = body;
  backdrop.classList.add("visible");

  const cancelBtn = $("#modal-cancel-btn");
  const confirmBtn = $("#modal-confirm-btn");

  function cleanup() {
    backdrop.classList.remove("visible");
    cancelBtn.removeEventListener("click", onCancel);
    confirmBtn.removeEventListener("click", onConfirmClick);
  }
  function onCancel() { cleanup(); }
  function onConfirmClick() { cleanup(); onConfirm(); }

  cancelBtn.addEventListener("click", onCancel);
  confirmBtn.addEventListener("click", onConfirmClick);
}

/* ================================================================
   6. Boot
   ================================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initAurora();
  initParticles();
  initLogin();

  state.visitorId = getOrCreateVisitorId();
  state.meta = detectDeviceMeta();

  DB.initFirebase();
});
