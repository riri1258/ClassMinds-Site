// ============================================
// ClassMinds Admin — Shared Module
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, collection, collectionGroup, getDocs, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, orderBy, limit, where, Timestamp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getStorage, ref as storageRef, getDownloadURL, listAll } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged, signOut, getIdTokenResult, multiFactor } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-check.js';

const app = initializeApp({
  apiKey: "AIzaSyD7BVxbfGskF10IcifVxyvWwAaAYPb-frw",
  authDomain: "classmind-9a22a.firebaseapp.com",
  projectId: "classmind-9a22a",
  storageBucket: "classmind-9a22a.firebasestorage.app",
  messagingSenderId: "893980768351",
  appId: "1:893980768351:web:972e20a662054f29c483ea"
});

// C-1 (SA_2026-04-22) / H-1 (SA_2026-04-24): App Check on the admin web via
// reCAPTCHA Enterprise. Site key is loaded from admin/config.js (a non-secret
// file loaded BEFORE this module via <script src="config.js"></script>).
const RECAPTCHA_PLACEHOLDERS = new Set([
  '__SET_RECAPTCHA_ENTERPRISE_SITE_KEY__',
  '__PASTE_REAL_SITE_KEY_HERE__',
]);
try {
  const RECAPTCHA_ENTERPRISE_SITE_KEY = window.RECAPTCHA_ENTERPRISE_SITE_KEY
    || '__SET_RECAPTCHA_ENTERPRISE_SITE_KEY__';
  if (RECAPTCHA_ENTERPRISE_SITE_KEY && !RECAPTCHA_PLACEHOLDERS.has(RECAPTCHA_ENTERPRISE_SITE_KEY)) {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_ENTERPRISE_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    });
  } else {
    console.warn('[AppCheck] reCAPTCHA Enterprise site key not set — App Check disabled for admin web. Paste the real key into admin/config.js before flipping enforceAppCheck server-side.');
  }
} catch (e) {
  console.warn('[AppCheck] init failed:', e?.message || e);
}

const db = getFirestore(app);
const auth = getAuth(app);
const fns = getFunctions(app);
const storage = getStorage(app);

// Cloud Functions
const sendBetaInviteFn = httpsCallable(fns, 'sendBetaInvite');
const sendSupportEmailFn = httpsCallable(fns, 'sendSupportEmail');
const getEmailsFn = httpsCallable(fns, 'getEmails');
const deleteEmailFn = httpsCallable(fns, 'deleteEmail');
const sendNotificationFn = httpsCallable(fns, 'sendNotification');
const aiSummaryFn = httpsCallable(fns, 'aiSummary');
const refreshBillingSnapshotFn = httpsCallable(fns, 'refreshBillingSnapshot');
const writeClientLogFn = httpsCallable(fns, 'writeClientLog');
const adminGrantRoleFn = httpsCallable(fns, 'adminGrantRole');
const adminDeleteUserFn = httpsCallable(fns, 'adminDeleteUser');
const adminDeleteEmailFn = httpsCallable(fns, 'adminDeleteEmail');
const requestAccountDeletionFn = httpsCallable(fns, 'requestAccountDeletion');
// schedule-gate (2026-04-25):
const adminApproveSchoolRequestFn  = httpsCallable(fns, 'adminApproveSchoolRequest');
const adminRejectSchoolRequestFn   = httpsCallable(fns, 'adminRejectSchoolRequest');
const adminJoinClassFn             = httpsCallable(fns, 'adminJoinClass');
const adminInvalidateUserScheduleFn = httpsCallable(fns, 'adminInvalidateUserSchedule');
// claim self-heal (2026-04-25): used by requireAdmin() when the user is admin
// per /users doc but the ID-token doesn't have the admin claim — calling
// this server-side runs requireAdminCaller which sets the claim, after which
// the next ID-token refresh sees admin=true and Firestore list rules work.
const adminSelfHealClaimFn = httpsCallable(fns, 'adminSelfHealClaim');

// ---- ERROR LOGGING ----
const ADMIN_VERSION = 'admin-web-1.0.0';
let _adminUid = '', _adminName = '';

// Sampling (2026-04-27): info/success log at 1%, error/warn at 100%.
// Cuts /appLogs write volume ~95% per page load. Same change in app-shared.js + ErrorLogger.swift.
const APPLOG_SAMPLE_RATE = 0.01;
function _shouldLog(level) {
  if (level === 'error' || level === 'warn') return true;
  return Math.random() < APPLOG_SAMPLE_RATE;
}
async function appLog(level, message, context) {
  if (!_shouldLog(level)) return;
  try {
    const page = window.location.pathname.split('/').pop() || 'unknown';
    await writeClientLogFn({
      level,
      message: String(message).substring(0, 1000),
      context: context || page,
      userName: _adminName || 'unknown',
      platform: 'admin-web',
      appVersion: ADMIN_VERSION,
      url: window.location.href,
      userAgent: navigator.userAgent.substring(0, 200),
    });
  } catch (e) { console.error('Failed to write log:', e); }
}

function logError(message, context) { console.error('[Admin Error]', context, message); appLog('error', message, context); }
function logSuccess(message, context) { console.log('[Admin Success]', context, message); appLog('success', message, context); }
function logInfo(message, context) { console.log('[Admin Info]', context, message); appLog('info', message, context); }

// Global error handlers
window.onerror = function(msg, src, line, col) {
  const file = (src || '').split('/').pop();
  logError(`${msg} (${file}:${line}:${col})`, 'window.onerror');
};
window.onunhandledrejection = function(e) {
  const msg = e.reason?.message || e.reason?.code || String(e.reason);
  logError(msg, 'unhandledrejection');
};

// ---- UTILITIES ----
function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show ' + type;
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.className = 'toast'; }, 3000);
}

function fmtDate(d) {
  if (!d) return '—';
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text || '';
  return d.innerHTML;
}

// HIGH-3: only render images whose host is the project's Storage bucket.
const ALLOWED_IMAGE_HOSTS = new Set([
  'firebasestorage.googleapis.com',
]);
function isAllowedImageUrl(url) {
  try {
    const u = new URL(url);
    return (u.protocol === 'https:' || u.protocol === 'http:') &&
           ALLOWED_IMAGE_HOSTS.has(u.host);
  } catch (_) {
    return false;
  }
}

function safeImageEl(url, opts = {}) {
  if (!isAllowedImageUrl(url)) return null;
  const img = document.createElement('img');
  img.src = url;
  if (opts.maxWidth) img.style.maxWidth = opts.maxWidth;
  if (opts.maxHeight) img.style.maxHeight = opts.maxHeight;
  if (opts.borderRadius) img.style.borderRadius = opts.borderRadius;
  if (opts.cursor) img.style.cursor = opts.cursor;
  if (opts.marginBottom) img.style.marginBottom = opts.marginBottom;
  if (opts.openInNewTab) {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => window.open(img.src, '_blank', 'noopener'));
  }
  return img;
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

function initModals() {
  document.querySelectorAll('.modal-overlay').forEach(o => {
    o.addEventListener('click', function (e) {
      if (e.target === this) this.classList.remove('open');
    });
  });
}

// ---- SIDEBAR NAV ----
function initSidebar() {
  const page = window.location.pathname.split('/').pop() || 'admin.html';
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    if (item.dataset.page === page) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  const userEl = document.getElementById('sidebarUser');
  if (userEl && auth.currentUser) {
    userEl.textContent = auth.currentUser.email;
  }
}

function doLogout() {
  signOut(auth).then(() => {
    window.location.href = 'admin-login.html';
  });
}

// ---- AUTH GUARD ----
// M-6 (SA_2026-04-24): admin gate now reads the `admin` custom claim from the
// ID token (tamper-proof) instead of users/{uid}.isAdmin. adminGrantRole
// mirrors the claim server-side so the doc + claim stay in sync.
// M-2 (SA_2026-04-24): admins without MFA enrolled are routed to the
// MFA-enrollment screen before the admin UI is shown.
function requireAdmin() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = 'admin-login.html';
        return;
      }
      let isAdmin = false;
      let claimSource = 'none';
      try {
        const tokenResult = await getIdTokenResult(user, true);
        if (tokenResult?.claims?.admin === true) {
          isAdmin = true;
          claimSource = 'claim';
        }
      } catch (e) {
        console.warn('[requireAdmin] getIdTokenResult failed:', e?.message || e);
      }
      // Legacy fallback: users/{uid}.isAdmin. The server self-heals the
      // claim on the next admin callable, so this path only fires once.
      let docData = null;
      if (!isAdmin) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          docData = snap.exists() ? snap.data() : null;
          if (docData?.isAdmin === true) {
            isAdmin = true;
            claimSource = 'doc-legacy';
          }
        } catch (e) {
          console.warn('[requireAdmin] users doc fetch failed:', e?.message || e);
        }
      }
      if (!isAdmin) {
        window.location.href = '../home.html';
        return;
      }

      // claim self-heal (2026-04-25): if we got here via the legacy doc
      // check, the token is missing the `admin` claim — which means
      // Firestore list rules that gate on `request.auth.token.admin`
      // (schoolRequests, etc.) will return PERMISSION_DENIED. Call the
      // server, which runs requireAdminCaller → setCustomUserClaims, then
      // force-refresh the token and reload so the rest of the page
      // re-runs with the claim in place. One-shot per session.
      if (claimSource === 'doc-legacy') {
        try {
          await adminSelfHealClaimFn({});
          await getIdTokenResult(user, true); // force refresh so subsequent reads see the claim
          // Verify the refresh actually picked up the claim before reloading
          // (avoids an infinite reload loop if the heal failed silently).
          const verify = await getIdTokenResult(user, true);
          if (verify?.claims?.admin === true) {
            console.info('[requireAdmin] claim self-healed — reloading');
            window.location.reload();
            return;
          }
          console.warn('[requireAdmin] self-heal returned but claim still missing');
        } catch (e) {
          console.warn('[requireAdmin] adminSelfHealClaim failed:', e?.message || e);
          // Fall through — user can still see the page in degraded mode,
          // but Firestore list rules that require the claim will deny.
        }
      }

      // M-2 (SA_2026-04-24): MFA required. If the admin has no second
      // factor enrolled at all, route to the enrollment screen. If enrolled
      // but the current session wasn't signed in with MFA, force a fresh
      // sign-in that challenges the factor.
      let enrolledFactors = [];
      try {
        enrolledFactors = multiFactor(user)?.enrolledFactors || [];
      } catch (_) { /* older SDKs — fall through */ }
      let signedInWithFactor = false;
      try {
        const tokenResult = await getIdTokenResult(user, false);
        signedInWithFactor = !!tokenResult?.claims?.firebase?.sign_in_second_factor;
      } catch (_) {}
      if (enrolledFactors.length === 0) {
        window.location.href = 'admin-mfa-enroll.html';
        return;
      }
      if (!signedInWithFactor) {
        try { await signOut(auth); } catch (_) {}
        window.location.href = 'admin-login.html?mfa=1';
        return;
      }

      const wrap = document.getElementById('adminWrap');
      if (wrap) wrap.style.display = 'block';
      const userEl = document.getElementById('sidebarUser');
      if (userEl) userEl.textContent = user.email;
      _adminUid = user.uid;
      if (!docData) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          docData = snap.exists() ? snap.data() : {};
        } catch (_) { docData = {}; }
      }
      _adminName = (docData.firstName || '') + ' ' + (docData.lastName || '');
      initSidebar();
      initModals();
      logInfo(`Admin page loaded (claim=${claimSource})`, window.location.pathname.split('/').pop());
      resolve({ user, userData: docData });
    });
  });
}

// Chart.js shared config
function chartCfg() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: 'rgba(180,200,255,0.6)', font: { size: 12 } } }
    },
    scales: {
      x: { ticks: { color: 'rgba(180,200,255,0.5)', font: { size: 11 } }, grid: { color: 'rgba(26,107,255,0.08)' } },
      y: { ticks: { color: 'rgba(180,200,255,0.5)', font: { size: 11 } }, grid: { color: 'rgba(26,107,255,0.08)' } }
    }
  };
}

// ---- EXPORTS ----
export {
  app, db, auth, fns, storage,
  storageRef, getDownloadURL, listAll, collectionGroup,
  sendBetaInviteFn, sendSupportEmailFn, getEmailsFn, deleteEmailFn, sendNotificationFn, aiSummaryFn, refreshBillingSnapshotFn, writeClientLogFn,
  adminGrantRoleFn, adminDeleteUserFn, adminDeleteEmailFn, requestAccountDeletionFn,
  adminApproveSchoolRequestFn, adminRejectSchoolRequestFn, adminJoinClassFn, adminInvalidateUserScheduleFn,
  toast, fmtDate, escapeHtml, isAllowedImageUrl, safeImageEl, openModal, closeModal, initModals,
  initSidebar, doLogout, requireAdmin, chartCfg,
  logError, logSuccess, logInfo,
  collection, getDocs, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, orderBy, limit, where, Timestamp,
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut,
  getIdTokenResult, multiFactor
};
