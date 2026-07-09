/* ============================================================
   firebase.js
   Thin wrapper that exposes a single global `DB` object with the
   read/write functions the rest of the app needs, so script.js
   never touches the storage layer directly.

   Two backends, same interface:
   - Firebase Firestore  → used once you paste real project keys
     into config.js (see README).
   - Local demo backend  → used automatically until then, so the
     site is fully testable with zero setup. It stores data in
     this browser's localStorage and is clearly flagged as demo
     mode (see DB.isDemoMode()). It is NOT shared between your
     friend's device and yours — only Firestore is.
   ============================================================ */

let _app = null;
let _db = null;
let _firebaseReady = false;
let _firebaseError = null;
let _demoMode = false;

function _looksLikePlaceholderConfig(cfg) {
  return !cfg || !cfg.apiKey || cfg.apiKey === "YOUR_API_KEY" || cfg.projectId === "YOUR_PROJECT_ID";
}

function initFirebase() {
  if (_looksLikePlaceholderConfig(firebaseConfig)) {
    _demoMode = true;
    _firebaseReady = true; // "ready" to write, just via the local backend
    console.info("[firebase.js] No real Firebase config found — running in local demo mode. See README.md to connect a real project.");
    return true;
  }

  try {
    if (typeof firebase === "undefined") {
      throw new Error("Firebase SDK not loaded (check your internet connection / script tags).");
    }
    _app = firebase.initializeApp(firebaseConfig);
    _db = firebase.firestore();
    _firebaseReady = true;
    _demoMode = false;
    console.info("[firebase.js] Firebase initialized.");
  } catch (err) {
    _firebaseError = err;
    _firebaseReady = false;
    console.error("[firebase.js] Firebase init failed:", err);
  }
  return _firebaseReady;
}

function isFirebaseReady() { return _firebaseReady; }
function isDemoMode() { return _demoMode; }
function getFirebaseError() { return _firebaseError; }

/* ================================================================
   Local demo backend (localStorage-based, same interface as below)
   ================================================================ */

const LOCAL_KEYS = { responses: "demo_responses", visits: "demo_visits" };
const _localListeners = { responses: [], visits: [] };

function _readLocal(key) {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); }
  catch { return []; }
}
function _writeLocal(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr));
}
function _notifyLocal(kind) {
  const rows = _readLocal(LOCAL_KEYS[kind]).slice().sort((a, b) => (b._ts || 0) - (a._ts || 0));
  _localListeners[kind].forEach((cb) => cb(rows));
}
function _makeLocalId() {
  return "local_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

/* ================================================================
   Public DB interface — dispatches to Firestore or the local backend
   ================================================================ */

async function logVisit(visitorId, meta) {
  if (_demoMode) {
    const rows = _readLocal(LOCAL_KEYS.visits);
    rows.push({ id: _makeLocalId(), visitorId, ...meta, _ts: Date.now(), timestamp: new Date().toISOString() });
    _writeLocal(LOCAL_KEYS.visits, rows);
    _notifyLocal("visits");
    return;
  }
  if (!_firebaseReady) throw new Error("Storage not initialized");
  return _db.collection("visits").add({
    visitorId,
    ...meta,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function addResponse(payload) {
  if (_demoMode) {
    const rows = _readLocal(LOCAL_KEYS.responses);
    rows.push({ id: _makeLocalId(), ...payload, _ts: Date.now(), timestamp: new Date().toISOString() });
    _writeLocal(LOCAL_KEYS.responses, rows);
    _notifyLocal("responses");
    return;
  }
  if (!_firebaseReady) throw new Error("Storage not initialized");
  return _db.collection("responses").add({
    ...payload,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });
}

function listenResponses(onData, onError) {
  if (_demoMode) {
    _localListeners.responses.push(onData);
    _notifyLocal("responses");
    window.addEventListener("storage", (e) => { if (e.key === LOCAL_KEYS.responses) _notifyLocal("responses"); });
    return () => { _localListeners.responses = _localListeners.responses.filter((cb) => cb !== onData); };
  }
  if (!_firebaseReady) { onError && onError(new Error("Storage not initialized")); return () => {}; }
  return _db.collection("responses")
    .orderBy("timestamp", "desc")
    .onSnapshot(
      (snap) => {
        const rows = [];
        snap.forEach((doc) => rows.push({ id: doc.id, ...doc.data() }));
        onData(rows);
      },
      (err) => onError && onError(err)
    );
}

function listenVisits(onData, onError) {
  if (_demoMode) {
    _localListeners.visits.push(onData);
    _notifyLocal("visits");
    window.addEventListener("storage", (e) => { if (e.key === LOCAL_KEYS.visits) _notifyLocal("visits"); });
    return () => { _localListeners.visits = _localListeners.visits.filter((cb) => cb !== onData); };
  }
  if (!_firebaseReady) { onError && onError(new Error("Storage not initialized")); return () => {}; }
  return _db.collection("visits").onSnapshot(
    (snap) => {
      const rows = [];
      snap.forEach((doc) => rows.push({ id: doc.id, ...doc.data() }));
      onData(rows);
    },
    (err) => onError && onError(err)
  );
}

async function deleteResponse(id) {
  if (_demoMode) {
    _writeLocal(LOCAL_KEYS.responses, _readLocal(LOCAL_KEYS.responses).filter((r) => r.id !== id));
    _notifyLocal("responses");
    return;
  }
  if (!_firebaseReady) throw new Error("Storage not initialized");
  return _db.collection("responses").doc(id).delete();
}

async function deleteAllResponses(ids) {
  if (_demoMode) {
    _writeLocal(LOCAL_KEYS.responses, []);
    _notifyLocal("responses");
    return;
  }
  if (!_firebaseReady) throw new Error("Storage not initialized");
  const batchSize = 400; // stay under Firestore's 500 write limit
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = _db.batch();
    ids.slice(i, i + batchSize).forEach((id) => {
      batch.delete(_db.collection("responses").doc(id));
    });
    await batch.commit();
  }
}

const DB = {
  initFirebase,
  isFirebaseReady,
  isDemoMode,
  getFirebaseError,
  logVisit,
  addResponse,
  listenResponses,
  listenVisits,
  deleteResponse,
  deleteAllResponses
};
