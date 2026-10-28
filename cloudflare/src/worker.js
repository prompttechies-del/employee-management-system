// Employee Management System — Cloudflare Worker + D1 port.
// Secrets (wrangler secret put): ADMIN_PASSWORD, SESSION_SECRET. Optional var: ADMIN_USER.

const enc = new TextEncoder();
const SESSION_TTL = 8 * 60 * 60; // seconds
const MAX_FAILS = 5;
const LOCK_WINDOW = 15 * 60; // seconds
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- crypto helpers ----------
const b64u = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64uDecode = (s) => {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(escape(atob(s)));
};
const b64uEncode = (str) => b64u(enc.encode(str));

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64u(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}
function safeEq(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
const randomToken = () => b64u(crypto.getRandomValues(new Uint8Array(24)));

// ---------- session ----------
function parseCookies(req) {
  const out = {};
  for (const part of (req.headers.get('Cookie') || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}
async function readSession(req, env) {
  const raw = parseCookies(req).ems_session;
  if (!raw) return null;
  const [payload, sig] = raw.split('.');
  if (!payload || !sig) return null;
  if (!safeEq(sig, await hmac(env.SESSION_SECRET, payload))) return null;
  try {
    const s = JSON.parse(b64uDecode(payload));
    return s.exp > Date.now() / 1000 ? s : null;
  } catch {
    return null;
  }
}
async function sessionCookie(env, user) {
  const payload = b64uEncode(JSON.stringify({ u: user, csrf: randomToken(), exp: Math.floor(Date.now() / 1000) + SESSION_TTL }));
  const sig = await hmac(env.SESSION_SECRET, payload);
  return `ems_session=${payload}.${sig}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL}`;
}
const clearCookie = 'ems_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0';

// Login-form CSRF: signed, time-limited token (no session exists yet).
async function loginToken(env) {
  const ts = Math.floor(Date.now() / 1000);
  return `${ts}.${await hmac(env.SESSION_SECRET, 'login:' + ts)}`;
}
async function validLoginToken(env, tok) {
  const [ts, sig] = String(tok || '').split('.');
  if (!ts || !sig || Date.now() / 1000 - Number(ts) > 3600) return false;
  return safeEq(sig, await hmac(env.SESSION_SECRET, 'login:' + ts));
}

// ---------- response helpers ----------
const SEC_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy':
    "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
  'Cache-Control': 'no-store',
};
function html(body, status = 200, extra = {}) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=UTF-8', ...SEC_HEADERS, ...extra } });
}
const redirect = (to, extra = {}) => new Response(null, { status: 303, headers: { Location: to, ...SEC_HEADERS, ...extra } });

// ---------- views ----------
function topbar(session) {
  return `<header class="topbar"><div class="topbar-inner">
    <a class="brand" href="/employees"><span class="brand-mark">E</span> Employee Manager</a>
    ${session ? `<form method="post" action="/logout"><input type="hidden" name="_csrf" value="${esc(session.csrf)}"><button class="btn btn-sm" type="submit">Sign out</button></form>` : ''}
  </div></header>`;
}
function page(title, body, { session = null, bodyClass = '', script = '' } = {}) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(title)} · EMS</title><link rel="stylesheet" href="/static/css/app.css"></head>
<body class="${bodyClass}">${bodyClass === 'center' ? '' : topbar(session)}${body}${script ? `<script src="${script}"></script>` : ''}</body></html>`;
}
const initial = (name) => esc(([...String(name || '?')][0] || '?').toUpperCase());

function loginView(token, { error = false, loggedOut = false, locked = false } = {}) {
  return page(
    'Sign in',
    `<main class="login-wrap">
  <div class="brand" style="justify-content:center;margin-bottom:20px"><span class="brand-mark">E</span> Employee Manager</div>
  <form class="card form-card" method="post" action="/login">
    <h1 style="font-size:22px">Sign in</h1><p class="subtitle">Administrator access only.</p>
    ${error ? '<div class="alert" role="alert">Invalid username or password.</div>' : ''}
    ${locked ? '<div class="alert" role="alert">Too many attempts. Try again in 15 minutes.</div>' : ''}
    ${loggedOut ? '<div class="notice">You have been signed out.</div>' : ''}
    <input type="hidden" name="_csrf" value="${esc(token)}">
    <div class="field"><label for="username">Username</label><input id="username" name="username" type="text" autocomplete="username" required autofocus></div>
    <div class="field"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required></div>
    <button class="btn btn-primary" style="width:100%;justify-content:center" type="submit">Sign in</button>
  </form></main>`,
    { bodyClass: 'center' }
  );
}

function listView(employees, session) {
  const total = employees.length;
  const depts = new Set(employees.map((e) => e.department)).size;
  const payroll = employees.reduce((s, e) => s + Number(e.salary), 0);
  const rows = employees
    .map(
      (e) => `<tr data-search="${esc((e.name + ' ' + e.department + ' ' + e.email).toLowerCase())}">
<td><a class="person" href="/employees/${e.id}"><span class="avatar">${initial(e.name)}</span><span><div class="person-name">${esc(e.name)}</div><div class="person-email">${esc(e.email)}</div></span></a></td>
<td><span class="chip">${esc(e.department)}</span></td>
<td class="num">₹${inr.format(e.salary)}</td>
<td><div class="actions"><a class="btn btn-sm" href="/employees/${e.id}/edit">Edit</a>
<button type="button" class="btn btn-sm btn-danger" data-id="${e.id}" data-name="${esc(e.name)}">Delete</button></div></td></tr>`
    )
    .join('');
  const body = `<main class="container">
  <div class="header-row"><div><h1>Employees</h1><p class="subtitle">Manage your team's records in one place.</p></div>
  <a class="btn btn-primary" href="/employees/new">+ Add employee</a></div>
  <section class="stats">
    <div class="stat"><div class="stat-label">Total employees</div><div class="stat-value">${total}</div></div>
    <div class="stat"><div class="stat-label">Departments</div><div class="stat-value">${depts}</div></div>
    <div class="stat"><div class="stat-label">Monthly payroll</div><div class="stat-value">₹${inr.format(payroll)}</div></div>
  </section>
  <section class="card">
    <div class="toolbar"><input id="search" class="search" type="search" placeholder="Search by name, department or email…" aria-label="Search employees"><span class="count" id="count"></span></div>
    ${
      total
        ? `<table><thead><tr><th>Employee</th><th>Department</th><th class="num">Salary</th><th></th></tr></thead><tbody id="rows">${rows}</tbody></table>
    <div class="empty" id="noMatch" hidden><h3>No matches</h3><p>Try a different search.</p></div>`
        : `<div class="empty"><div class="empty-icon">👥</div><h3>No employees yet</h3><p>Add your first employee to get started.</p><a class="btn btn-primary" href="/employees/new">+ Add employee</a></div>`
    }
  </section></main>
<dialog id="confirm"><h3>Delete employee?</h3><p id="confirmText"></p>
  <form method="post" id="deleteForm"><input type="hidden" name="_csrf" value="${esc(session.csrf)}">
  <div class="dialog-actions"><button type="button" class="btn" id="cancel">Cancel</button><button type="submit" class="btn btn-solid-danger">Delete</button></div></form></dialog>`;
  return page('Employees', body, { session, script: '/static/js/list.js' });
}

function formView(emp, session, errors = []) {
  const isNew = !emp.id;
  const action = isNew ? '/employees' : `/employees/${emp.id}`;
  const body = `<main class="container"><a class="back" href="/employees">← Back to employees</a>
  <h1>${isNew ? 'Add employee' : 'Edit employee'}</h1>
  <p class="subtitle">${isNew ? 'Enter the details of the new team member.' : 'Update this employee’s details.'}</p>
  <form class="card form-card" method="post" action="${action}">
    <input type="hidden" name="_csrf" value="${esc(session.csrf)}">
    ${errors.length ? `<div class="alert" role="alert">${errors.map((e) => `<div>${esc(e)}</div>`).join('')}</div>` : ''}
    <div class="field"><label for="name">Full name</label><input id="name" name="name" type="text" maxlength="100" required autofocus placeholder="e.g. Rahul Sharma" value="${esc(emp.name)}"></div>
    <div class="field"><label for="department">Department</label><input id="department" name="department" type="text" maxlength="100" required placeholder="e.g. IT" value="${esc(emp.department)}"></div>
    <div class="field"><label for="salary">Salary (₹ per month)</label><input id="salary" name="salary" type="number" step="0.01" min="0" required placeholder="30000" value="${esc(emp.salary)}"></div>
    <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" maxlength="150" required placeholder="name@company.com" value="${esc(emp.email)}"><div class="hint">Must be unique across employees.</div></div>
    <div class="form-actions"><button class="btn btn-primary" type="submit">${isNew ? 'Add employee' : 'Save changes'}</button><a class="btn" href="/employees">Cancel</a></div>
  </form></main>`;
  return page(isNew ? 'Add employee' : 'Edit employee', body, { session });
}

function detailView(e, session) {
  const body = `<main class="container"><a class="back" href="/employees">← Back to employees</a>
  <section class="card" style="max-width:720px">
    <div class="detail-head"><span class="avatar">${initial(e.name)}</span><div><h1>${esc(e.name)}</h1><span class="chip">${esc(e.department)}</span></div></div>
    <div class="detail-grid">
      <div class="detail-item"><div class="detail-label">Employee ID</div><div class="detail-value">#${e.id}</div></div>
      <div class="detail-item"><div class="detail-label">Department</div><div class="detail-value">${esc(e.department)}</div></div>
      <div class="detail-item"><div class="detail-label">Salary</div><div class="detail-value">₹${inr2.format(e.salary)}</div></div>
      <div class="detail-item"><div class="detail-label">Email</div><div class="detail-value">${esc(e.email)}</div></div>
    </div>
    <div class="detail-foot"><a class="btn btn-primary" href="/employees/${e.id}/edit">Edit</a>
      <form method="post" action="/employees/${e.id}/delete"><input type="hidden" name="_csrf" value="${esc(session.csrf)}">
      <button class="btn btn-danger" type="submit" data-confirm="Delete this employee permanently?">Delete</button></form></div>
  </section></main>`;
  return page('Employee details', body, { session, script: '/static/js/detail.js' });
}

const messageView = (icon, title, text, session) =>
  page(title, `<main class="container"><section class="card"><div class="empty"><div class="empty-icon">${icon}</div><h3>${esc(title)}</h3><p>${esc(text)}</p><a class="btn btn-primary" href="/employees">Back to employees</a></div></section></main>`, { session });

// ---------- data + validation ----------
function readEmployee(form) {
  const salaryRaw = String(form.get('salary') ?? '').trim();
  return {
    name: String(form.get('name') ?? '').trim(),
    department: String(form.get('department') ?? '').trim(),
    salary: salaryRaw === '' ? NaN : Number(salaryRaw),
    email: String(form.get('email') ?? '').trim(),
  };
}
function validate(e) {
  const errors = [];
  if (!e.name || e.name.length > 100) errors.push('Name is required (max 100 characters).');
  if (!e.department || e.department.length > 100) errors.push('Department is required (max 100 characters).');
  if (!Number.isFinite(e.salary) || e.salary < 0 || e.salary > 9999999999) errors.push('Salary must be a number between 0 and 9,999,999,999.');
  if (!e.email || e.email.length > 150 || !EMAIL_RE.test(e.email)) errors.push('A valid email is required.');
  return errors;
}
const isDuplicate = (err) => /UNIQUE/i.test(String(err && err.message));
const findOne = (env, id) => env.DB.prepare('SELECT * FROM employee WHERE id = ?').bind(id).first();

// ---------- routes ----------
async function handleLogin(req, env) {
  const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
  const now = Math.floor(Date.now() / 1000);
  const form = await req.formData();
  if (!(await validLoginToken(env, form.get('_csrf')))) return html('Invalid or expired form. Reload and try again.', 403);

  const fails = await env.DB.prepare('SELECT COUNT(*) AS n FROM login_attempts WHERE ip = ? AND ts > ?').bind(ip, now - LOCK_WINDOW).first();
  if (fails.n >= MAX_FAILS) return html(loginView(await loginToken(env), { locked: true }), 429);

  const user = String(form.get('username') ?? '');
  const pass = String(form.get('password') ?? '');
  const expectedUser = env.ADMIN_USER || 'admin';
  // Compare HMAC digests so length/timing do not leak.
  const okUser = safeEq(await hmac(env.SESSION_SECRET, 'u:' + user), await hmac(env.SESSION_SECRET, 'u:' + expectedUser));
  const okPass = safeEq(await hmac(env.SESSION_SECRET, 'p:' + pass), await hmac(env.SESSION_SECRET, 'p:' + env.ADMIN_PASSWORD));
  if (!(okUser && okPass)) {
    await env.DB.prepare('INSERT INTO login_attempts (ip, ts) VALUES (?, ?)').bind(ip, now).run();
    return html(loginView(await loginToken(env), { error: true }), 401);
  }
  await env.DB.prepare('DELETE FROM login_attempts WHERE ip = ?').bind(ip).run();
  return redirect('/employees', { 'Set-Cookie': await sessionCookie(env, expectedUser) });
}

export default {
  async fetch(req, env) {
    try {
      if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) return html('Server is not configured (missing secrets).', 500);
      const url = new URL(req.url);
      const path = url.pathname.replace(/\/+$/, '') || '/';
      const method = req.method;

      if (path === '/login') {
        if (method === 'POST') return handleLogin(req, env);
        return html(loginView(await loginToken(env), { error: url.searchParams.has('error'), loggedOut: url.searchParams.has('logout') }));
      }

      const session = await readSession(req, env);
      if (!session) return redirect('/login');
      if (path === '/') return redirect('/employees');

      // CSRF check for every state-changing request
      let form = null;
      if (method === 'POST') {
        form = await req.formData();
        if (!safeEq(String(form.get('_csrf') || ''), session.csrf)) return html(messageView('🚫', 'Request blocked', 'Invalid security token. Reload the page and try again.', session), 403);
      }

      if (path === '/logout' && method === 'POST') return redirect('/login?logout', { 'Set-Cookie': clearCookie });

      if (path === '/employees') {
        if (method === 'GET') {
          const { results } = await env.DB.prepare('SELECT * FROM employee ORDER BY id').all();
          return html(listView(results, session));
        }
        if (method === 'POST') {
          const emp = readEmployee(form);
          const errors = validate(emp);
          if (!errors.length) {
            try {
              await env.DB.prepare('INSERT INTO employee (name, department, salary, email) VALUES (?, ?, ?, ?)').bind(emp.name, emp.department, emp.salary, emp.email).run();
              return redirect('/employees');
            } catch (e) {
              if (!isDuplicate(e)) throw e;
              errors.push('An employee with this email already exists.');
            }
          }
          return html(formView({ ...emp, salary: Number.isFinite(emp.salary) ? emp.salary : '' }, session, errors), 400);
        }
      }
      if (path === '/employees/new' && method === 'GET') return html(formView({}, session));

      const m = path.match(/^\/employees\/(\d+)(\/edit|\/delete)?$/);
      if (m) {
        const id = Number(m[1]);
        const sub = m[2];
        if (!sub && method === 'GET') {
          const e = await findOne(env, id);
          return e ? html(detailView(e, session)) : html(messageView('🔍', 'Employee not found', 'This record may have been deleted.', session), 404);
        }
        if (sub === '/edit' && method === 'GET') {
          const e = await findOne(env, id);
          return e ? html(formView(e, session)) : redirect('/employees');
        }
        if (!sub && method === 'POST') {
          const emp = readEmployee(form);
          const errors = validate(emp);
          if (!errors.length) {
            try {
              await env.DB.prepare('UPDATE employee SET name = ?, department = ?, salary = ?, email = ? WHERE id = ?').bind(emp.name, emp.department, emp.salary, emp.email, id).run();
              return redirect(`/employees/${id}`);
            } catch (e) {
              if (!isDuplicate(e)) throw e;
              errors.push('An employee with this email already exists.');
            }
          }
          return html(formView({ ...emp, id, salary: Number.isFinite(emp.salary) ? emp.salary : '' }, session, errors), 400);
        }
        if (sub === '/delete' && method === 'POST') {
          await env.DB.prepare('DELETE FROM employee WHERE id = ?').bind(id).run();
          return redirect('/employees');
        }
      }
      return html(messageView('🧭', 'Page not found', 'That page does not exist.', session), 404);
    } catch (err) {
      console.error('Unhandled error', err && err.stack ? err.stack : err);
      return html(page('Something went wrong', '<main class="login-wrap"><section class="card"><div class="empty"><div class="empty-icon">⚠️</div><h3>Something went wrong</h3><p>The request couldn’t be completed. Please try again.</p><a class="btn btn-primary" href="/employees">Back to employees</a></div></section></main>', { bodyClass: 'center' }), 500);
    }
  },
};
