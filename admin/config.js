// ClassMinds admin — non-secret client config.
//
// reCAPTCHA Enterprise site key for Firebase App Check. Public identifier;
// safe to ship in the browser (it's the site key, not the secret). Get the
// real value from Firebase Console → App Check → Apps → Web → reCAPTCHA
// Enterprise, then replace the placeholder below.
//
// Loaded BEFORE admin-shared.js via <script src="config.js"></script> so
// window.RECAPTCHA_ENTERPRISE_SITE_KEY is populated before the module
// script reads it.
window.RECAPTCHA_ENTERPRISE_SITE_KEY = '__PASTE_REAL_SITE_KEY_HERE__';
