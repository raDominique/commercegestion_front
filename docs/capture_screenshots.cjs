'use strict';

/**
 * Capture automatique des screenshots pour docs/Guide utilisateur.md
 *
 * Usage :
 *   node docs/capture_screenshots.cjs pages            # capture chaque interface
 *   node docs/capture_screenshots.cjs modals           # capture les modaux (ajout/détails/modif/suppression)
 *   node docs/capture_screenshots.cjs modals --phase-c # captures complémentaires (onglets, déclencheurs spécifiques)
 *   node docs/capture_screenshots.cjs texts            # dump du texte visible de chaque page
 *   node docs/capture_screenshots.cjs all              # les deux premières
 *   node docs/capture_screenshots.cjs modals --only=actifs,panier
 *
 * Sortie : docs/screenshots/*.png + docs/screenshots/_manifest.json
 *
 * Notes :
 *  - nécessite Chrome installé et le serveur dev lancé (npm run dev)
 *  - puppeteer-core est chargé depuis les node_modules globaux si absent du projet
 *  - en phase "modals", toutes les requêtes de mutation (POST/PUT/PATCH/DELETE,
 *    sauf /auth/*) sont bloquées : aucun risque de modifier les données réelles
 */

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

function loadPuppeteer() {
  try {
    return require('puppeteer-core');
  } catch (e) {
    const root = cp.execSync('npm root -g', { encoding: 'utf8' }).trim();
    return require(path.join(root, 'puppeteer-core'));
  }
}
const puppeteer = loadPuppeteer();

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'screenshots');
const BASE = process.env.APP_URL || 'http://localhost:3000';
const EMAIL = process.env.APP_EMAIL || 'patrickramahefarson08022002@gmail.com';
const PASSWORD = process.env.APP_PASSWORD || 'alain12345';

const CHROME = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].find((p) => p && fs.existsSync(p));

if (!CHROME) {
  console.error('[FATAL] Chrome introuvable. Définissez CHROME_PATH.');
  process.exit(1);
}

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const PUBLIC_PAGES = [
  { num: '01', slug: 'connexion', path: '/login', label: 'Connexion' },
  { num: '02', slug: 'inscription', path: '/register', label: 'Inscription' },
  { num: '03', slug: 'mot-de-passe-oublie', path: '/forgot-password', label: 'Mot de passe oublié' },
  { num: '04', slug: 'reinitialisation-mdp', path: '/reset-password', label: 'Réinitialisation du mot de passe' },
];

const PRIVATE_PAGES = [
  { num: '05', slug: 'tableau-de-bord', path: '/dashboard', label: 'Tableau de bord', scrolls: [850, 1750] },
  { num: '06', slug: 'actifs', path: '/actifs', label: 'Actifs' },
  { num: '07', slug: 'passifs', path: '/passifs', label: 'Passifs' },
  { num: '08', slug: 'boutique', path: '/boutique', label: 'Boutique' },
  { num: '09', slug: 'depot', path: '/depot', label: 'Dépôt' },
  { num: '10', slug: 'retrait', path: '/retrait', label: 'Retrait' },
  { num: '11', slug: 'virement-droit', path: '/virement-droit', label: 'Virement de droit' },
  { num: '12', slug: 'echange-actifs', path: '/echange-actifs', label: 'Échange d’actifs' },
  { num: '13', slug: 'achat-vente', path: '/achat-vente', label: 'Achat/Vente' },
  { num: '14', slug: 'appel-offre', path: '/appel-offre', label: 'Appel d’offres' },
  { num: '15', slug: 'panier', path: '/panier', label: 'Panier' },
  { num: '16', slug: 'mon-compte', path: '/mon-compte', label: 'Mon compte' },
  { num: '17', slug: 'audit', path: '/mon-compte/audit', label: 'Journal d’audit' },
  { num: '18', slug: 'mes-produits', path: '/mes-produits', label: 'Mes produits' },
  { num: '19', slug: 'mes-transactions', path: '/mes-transactions', label: 'Mes transactions' },
  { num: '20', slug: 'notifications', path: '/notifications', label: 'Notifications' },
  { num: '21', slug: 'operations-a-valider', path: '/operations-a-valider', label: 'Opérations à valider' },
  { num: '22', slug: 'mes-sites', path: '/mes-sites', label: 'Mes sites' },
  { num: '23', slug: 'parrainages', path: '/parrainages', label: 'Parrainages' },
  { num: '24', slug: 'admin-produits', path: '/admin/produits', label: 'Administration – Produits' },
  { num: '25', slug: 'admin-cpc', path: '/admin/cpc', label: 'Administration – CPC' },
  { num: '26', slug: 'admin-utilisateurs', path: '/admin/utilisateurs', label: 'Administration – Utilisateurs' },
  { num: '27', slug: 'centre-export', path: '/admin/export-hub', label: 'Centre d’export' },
];

const ALL_PAGES = [...PUBLIC_PAGES, ...PRIVATE_PAGES];

// Mots-clés des boutons susceptibles d'ouvrir un modale
const MODAL_RE_SOURCE = [
  'ajouter', 'ajout', 'nouveau', 'nouvelle', 'nouvel', 'créer', 'creer', 'initialiser',
  'détail', 'detail', 'voir', 'modifier', 'éditer', 'editer',
  'supprim', 'valider', 'approuv', 'rejet',
  'acheter', 'vendre', 'vente', 'stock', 'virer', 'virement',
  'soumissionn', 'dépouiller', 'depouiller', 'annuler', 'commander', 'checkout', 'passer commande',
  'déposer', 'deposer', 'retirer', 'confirmer', 'enregistrer', 'envoyer', 'soumettre',
  'informations', 'info', 'basculer', 'activer', 'désactiver', 'export', 'télécharger',
  'vide', 'vider', 'décrire', 'delivrer', 'délivrer', 'badge', 'scan',
].join('|');
const MODAL_RE = new RegExp(MODAL_RE_SOURCE, 'i');

// Sélecteurs manuels ajoutés après inspection (phase modals)
const MANUAL_TRIGGERS = {
  // ex: actifs: [{ sel: '...', label: 'detail' }]
};

// Flag : `modals --phase-c` ne traite que les pages ci-dessous
const PHASE_C = process.argv.includes('--phase-c');

// Captures complémentaires : onglets secondaires, boutons ouvrant un modale
// hors des passes standard, et textes à attendre avant de typer les cibles.
const EXTRA = {
  audit: { wait: 'Détails', defaultPasses: true },
  actifs: {
    preDialogs: ['Opération hors plateforme'],
    views: [{ tab: 'Mes Produits en vente', slug: 'onglet-annonces', wait: 'Vos produits mis en vente', passes: true }],
  },
  'appel-offre': {
    views: [{ tab: "Mes appels d'offre", slug: 'onglet-mes-appels', wait: "Nouvel appel d'offre", passes: true }],
  },
  'echange-actifs': {
    views: [{ tab: 'Produits à vendre', slug: 'onglet-offres', wait: 'Acheter', passes: true }],
  },
  boutique: { views: [{ tab: 'Achat rapide', slug: 'onglet-achat-rapide', passes: true }] },
  depot: { views: [{ tab: 'Formulaire de dépôt', slug: 'onglet-formulaire', passes: true }] },
  retrait: { views: [{ tab: 'Formulaire de retrait', slug: 'onglet-formulaire', passes: true }] },
  'achat-vente': { views: [{ tab: 'Échange produit', slug: 'onglet-echange-produit', passes: true }] },
  'mes-transactions': {
    views: [
      { tab: 'Mouvements des Actifs', slug: 'onglet-mouvements-actifs', passes: true },
      { tab: 'Mouvements des Passifs', slug: 'onglet-mouvements-passifs', passes: true },
    ],
  },
  'mon-compte': { views: [{ tab: 'Sécurité', slug: 'onglet-securite', passes: true }] },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function slugify(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function loadManifest() {
  const f = path.join(OUT, '_manifest.json');
  try {
    return JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch (e) {
    return [];
  }
}

function saveManifest(entries) {
  const f = path.join(OUT, '_manifest.json');
  fs.writeFileSync(f, JSON.stringify(entries, null, 2), 'utf8');
}

const MANIFEST = loadManifest();
const ARGS = process.argv.slice(2);

function alreadyCaptured(p) {
  const e = MANIFEST.find((x) => x.slug === p.slug && x.kind === 'page' && x.path === p.path);
  return !!(e && fs.existsSync(path.join(OUT, e.file)));
}

function record(entry) {
  // remplace une entrée existante pour le même fichier
  const i = MANIFEST.findIndex((e) => e.file === entry.file);
  if (i >= 0) MANIFEST[i] = entry;
  else MANIFEST.push(entry);
  saveManifest(MANIFEST);
  console.log(`  [shot] ${entry.file}${entry.title ? `  (${entry.title})` : ''}`);
}

/* ------------------------------------------------------------------ */
/* Page helpers                                                        */
/* ------------------------------------------------------------------ */

function attachIdle(page) {
  let inflight = 0;
  let last = Date.now();
  page.on('request', () => {
    inflight++;
  });
  const done = () => {
    inflight = Math.max(0, inflight - 1);
    last = Date.now();
  };
  page.on('requestfinished', done);
  page.on('requestfailed', done);
  page.__idle = async (quiet = 600, max = 9000) => {
    const t0 = Date.now();
    for (;;) {
      if (inflight === 0 && Date.now() - last > quiet) return;
      if (Date.now() - t0 > max) return;
      await sleep(150);
    }
  };
}

async function hideToasts(page) {
  await page.addStyleTag({
    content: '[data-sonner-toaster]{display:none!important}',
  }).catch(() => {});
}

async function doLogin(page) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.__idle();
  await page.waitForSelector('#email', { timeout: 15000 });
  await page.type('#email', EMAIL, { delay: 8 });
  await page.type('#password', PASSWORD, { delay: 8 });
  await page.click('button[type="submit"]');
  try {
    await page.waitForFunction(() => location.pathname === '/dashboard', { timeout: 20000 });
  } catch (e) {
    const toasts = await page
      .evaluate(() => [...document.querySelectorAll('[data-sonner-toast]')].map((t) => t.innerText).join(' | '))
      .catch(() => '');
    throw new Error(`Échec de la connexion (url=${page.url()}) ${toasts ? '| toasts: ' + toasts : ''}`);
  }
  await page.__idle();
  await sleep(800);
  console.log('  [auth] connexion réussie');
}

async function gotoPage(page, p, opts = {}) {
  const maxTries = opts.relogin === false ? 1 : 2;
  for (let attempt = 0; attempt < maxTries; attempt++) {
    await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.__idle(700, 9000);
    await sleep(1100);
    await hideToasts(page);
    const current = new URL(page.url()).pathname;
    if (current === p.path) return current;
    if (current === '/login') {
      console.log(`  [auth] session perdue, reconnexion...`);
      await doLogin(page);
      continue;
    }
    return current; // redirection (rôle / validation)
  }
  return new URL(page.url()).pathname;
}

async function shoot(page, file, scroll = 0) {
  if (scroll) {
    await page.evaluate((y) => window.scrollTo(0, y), scroll);
    await sleep(600);
  }
  await page.screenshot({ path: path.join(OUT, file) });
}

/* ------------------------------------------------------------------ */
/* Phase A : interfaces                                                */
/* ------------------------------------------------------------------ */

async function capturePages(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });
  attachIdle(page);
  page.on('dialog', (d) => d.dismiss().catch(() => {}));
  page.on('filechooser', (fc) => fc.abort().catch(() => {}));
  page.on('request', (req) => {
    const m = req.method();
    if (m !== 'GET' && m !== 'HEAD' && m !== 'OPTIONS') {
      console.log(`  [net] ${m} ${req.url()}`);
    }
  });

  const resume = ARGS.includes('--resume');

  console.log('== Pages publiques ==');
  for (const p of PUBLIC_PAGES) {
    if (resume && alreadyCaptured(p)) {
      console.log(`  [skip] ${p.slug} déjà capturée`);
      continue;
    }
    const current = await gotoPage(page, p, { relogin: false });
    const file = `${p.num}-${p.slug}.png`;
    await shoot(page, file);
    record({
      file,
      num: p.num,
      slug: p.slug,
      path: p.path,
      label: p.label,
      kind: 'page',
      actualPath: current,
      note: current !== p.path ? `redirigé vers ${current}` : undefined,
    });
  }

  console.log('== Connexion ==');
  await doLogin(page);

  console.log('== Pages privées ==');
  for (const p of PRIVATE_PAGES) {
    if (resume && alreadyCaptured(p)) {
      console.log(`  [skip] ${p.slug} déjà capturée`);
      continue;
    }
    const current = await gotoPage(page, p);
    const file = `${p.num}-${p.slug}.png`;
    await shoot(page, file);
    record({
      file,
      num: p.num,
      slug: p.slug,
      path: p.path,
      label: p.label,
      kind: 'page',
      actualPath: current,
      note: current !== p.path ? `redirigé vers ${current}` : undefined,
    });
    for (let i = 0; i < (p.scrolls || []).length; i++) {
      const sfile = `${p.num}-${p.slug}-vue-${i + 2}.png`;
      await shoot(page, sfile, p.scrolls[i]);
      record({
        file: sfile,
        num: p.num,
        slug: p.slug,
        path: p.path,
        label: `${p.label} (vue ${i + 2})`,
        kind: 'page',
        actualPath: current,
      });
    }
    await page.evaluate(() => window.scrollTo(0, 0));
  }

  await page.close();
}

/* ------------------------------------------------------------------ */
/* Phase texts : texte visible de chaque page (pour la rédaction)      */
/* ------------------------------------------------------------------ */

async function captureTexts(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });
  attachIdle(page);
  page.on('dialog', (d) => d.dismiss().catch(() => {}));

  for (const p of PUBLIC_PAGES) {
    const current = await gotoPage(page, p, { relogin: false });
    await recordText(p, page, current);
  }

  await doLogin(page);

  for (const p of PRIVATE_PAGES) {
    const current = await gotoPage(page, p);
    await recordText(p, page, current);
  }

  await page.close();
}

async function recordText(p, page, current) {
  const text = await page
    .evaluate(() => (document.body ? document.body.innerText : '')
      .replace(/\n{3,}/g, '\n\n')
      .slice(0, 5000))
    .catch(() => '');
  const e = MANIFEST.find((x) => x.kind === 'page' && x.path === p.path);
  if (e) {
    e.content = text;
    e.actualPath = current;
    saveManifest(MANIFEST);
  }
  console.log(`  [text] ${p.slug} (${text.length} car.)${current !== p.path ? ` -> ${current}` : ''}`);
}

/* ------------------------------------------------------------------ */
/* Phase B : modaux                                                    */
/* ------------------------------------------------------------------ */

async function tagCandidates(page, { pass }) {
  return page.evaluate(
    ({ pass, reSource }) => {
      const RE = new RegExp(reSource, 'i');
      document.querySelectorAll('[data-shot-idx]').forEach((e) => e.removeAttribute('data-shot-idx'));
      const out = [];
      let k = 0;
      const excluded = 'nav, aside, header, [role="navigation"], [role="dialog"]';
      const all = [...document.querySelectorAll('button, [role="button"], [role="switch"]')];
      for (const el of all) {
        if (el.disabled || el.getAttribute('aria-disabled') === 'true') continue;
        if (el.closest(excluded)) continue;
        const txt = (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 80);
        const title = el.getAttribute('title') || '';
        const aria = el.getAttribute('aria-label') || '';
        const hay = `${txt} ${title} ${aria}`;
        const hasSvg = !!el.querySelector('svg');
        let keep = false;
        if (pass === 'text') {
          keep = RE.test(hay);
        } else {
          // pass icon : boutons sans texte (icônes seules), hors pagination
          keep = txt === '' && hasSvg && !/précédent|suivant|page/i.test(`${title} ${aria}`);
        }
        if (!keep) continue;
        el.setAttribute('data-shot-idx', String(k));
        out.push({
          idx: k,
          text: txt || title || aria || '(icône)',
          dirty: el.tagName === 'BUTTON' && (el.getAttribute('type') === 'submit' || !!el.form),
        });
        k++;
      }
      return out;
    },
    { pass, reSource: MODAL_RE_SOURCE }
  );
}

async function clickIdx(page, idx) {
  return page.evaluate((i) => {
    const el = document.querySelector(`[data-shot-idx="${i}"]`);
    if (!el) return false;
    el.scrollIntoView({ block: 'center' });
    el.click();
    return true;
  }, idx);
}

async function getDialogInfo(page) {
  for (let t = 0; t < 12; t++) {
    const info = await page.evaluate(() => {
      const ds = [...document.querySelectorAll('[data-slot="dialog-content"], [role="dialog"]')];
      const d = ds.find((el) => el.getClientRects().length > 0);
      if (!d) return null;
      const tEl = d.querySelector('[data-slot="dialog-title"], h1, h2, h3, h4, [id*="title" i]');
      const dEl = d.querySelector('[data-slot="dialog-description"], p');
      return {
        title: tEl ? tEl.innerText.trim().replace(/\s+/g, ' ') : '',
        desc: dEl ? dEl.innerText.trim().replace(/\s+/g, ' ').slice(0, 140) : '',
        rect: { w: d.getBoundingClientRect().width, h: d.getBoundingClientRect().height },
      };
    });
    if (info) return info;
    await sleep(150);
  }
  return null;
}

async function closeDialog(page) {
  await page.keyboard.press('Escape');
  await sleep(450);
  let open = await getDialogInfo(page);
  if (open) {
    await page.evaluate(() => {
      const ds = [...document.querySelectorAll('[data-slot="dialog-content"], [role="dialog"]')];
      const d = ds.find((el) => el.getClientRects().length > 0);
      if (!d) return;
      const btns = [...d.querySelectorAll('button')];
      const x = btns.find((b) => /top-3\s+right-3/.test(b.className || '')) || btns.find((b) => /absolute/.test(b.className || ''));
      if (x) x.click();
    });
    await sleep(450);
    open = await getDialogInfo(page);
  }
  return !!open; // true = toujours ouvert
}

async function waitForText(page, text, timeout = 10000) {
  try {
    await page.waitForFunction(
      (t) => document.body && document.body.innerText.includes(t),
      { timeout },
      text
    );
    return true;
  } catch (e) {
    return false;
  }
}

async function clickByText(page, text) {
  // Dispatch complet (pointerdown/mousedown/click/focus) : requis par les
  // onglets Radix (activation au mousedown/focus) — un simple el.click()
  // ou un clic aux coordonnées n'est pas fiable dans ce contexte.
  const ok = await page.evaluate((t) => {
    const els = [...document.querySelectorAll('button, [role="tab"], [role="button"], a')];
    const match = (e) => {
      const s = (e.innerText || '').trim().replace(/\s+/g, ' ');
      return s === t || (s.startsWith(t) && s.length < t.length + 40);
    };
    const el = els.find(match);
    if (!el) return false;
    el.scrollIntoView({ block: 'center' });
    const opts = { bubbles: true, cancelable: true, button: 0 };
    try {
      el.dispatchEvent(new PointerEvent('pointerdown', opts));
      el.dispatchEvent(new MouseEvent('mousedown', opts));
    } catch (e) { /* noop */ }
    el.click();
    try {
      el.dispatchEvent(new PointerEvent('pointerup', opts));
      el.dispatchEvent(new MouseEvent('mouseup', opts));
    } catch (e) { /* noop */ }
    el.focus();
    return true;
  }, text);
  if (!ok) return false;
  await sleep(300);

  // Vérification pour les onglets : si la cible est un onglet, il doit être actif
  const isTab = await page.evaluate((t) => {
    return [...document.querySelectorAll('[role="tab"]')].some((e) =>
      (e.innerText || '').trim().replace(/\s+/g, ' ').startsWith(t)
    );
  }, text);
  if (isTab) {
    const active = await page.evaluate((t) => {
      const a = document.querySelector('[role="tab"][data-state="active"]');
      return !!(a && (a.innerText || '').trim().replace(/\s+/g, ' ').startsWith(t));
    }, text);
    if (!active) {
      console.log(`  [tab] activation de "${text}" échouée`);
      return false;
    }
  }
  return true;
}

async function shotModal(page, p, info, trigger) {
  const mCount = MANIFEST.filter((e) => e.kind === 'modal' && e.slug === p.slug).length + 1;
  const titleSlug = slugify(info.title) || slugify(trigger) || 'modale';
  const file = `${p.num}-${p.slug}__${String(mCount).padStart(2, '0')}-${titleSlug}.png`;
  await page.evaluate(() => {
    const n = document.querySelector('[data-sonner-toaster]');
    if (n) n.style.display = 'none';
  }).catch(() => {});
  await sleep(350);
  await page.screenshot({ path: path.join(OUT, file) });
  record({
    file,
    num: p.num,
    slug: p.slug,
    path: p.path,
    label: p.label,
    kind: 'modal',
    title: info.title,
    desc: info.desc,
    trigger,
  });
  return file;
}

async function runPasses(page, p) {
  const passes = ['text', 'icon'];
  for (const pass of passes) {
    let cands = await tagCandidates(page, { pass });
    if (pass === 'icon') cands = cands.slice(0, 14);
    console.log(`  [${pass}] ${cands.length} candidat(s)`);

    for (let i = 0; i < cands.length; i++) {
      const cand = cands[i];

      // état propre avant chaque clic
      let current = new URL(page.url()).pathname;
      if (current !== p.path) {
        current = await gotoPage(page, p);
        if (current !== p.path) break;
      }
      const stillOpen = await getDialogInfo(page);
      if (stillOpen) {
        if (await closeDialog(page)) {
          current = await gotoPage(page, p);
          if (current !== p.path) break;
        }
      }

      const ok = await clickIdx(page, cand.idx);
      if (!ok) continue;
      const info = await getDialogInfo(page);

      if (info) {
        await shotModal(page, p, info, cand.text);
        const reopen = await closeDialog(page);
        if (reopen) cand.dirty = true;
      }

      if (cand.dirty) {
        current = await gotoPage(page, p);
        if (current !== p.path) break;
      }
    }
  }

  // déclencheurs manuels éventuels (sélecteurs CSS)
  const manual = MANUAL_TRIGGERS[p.slug] || [];
  for (const m of manual) {
    const current = await gotoPage(page, p);
    if (current !== p.path) break;
    const clicked = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      el.scrollIntoView({ block: 'center' });
      el.click();
      return true;
    }, m.sel);
    if (!clicked) continue;
    const info = await getDialogInfo(page);
    if (info) {
      await shotModal(page, p, info, m.label);
      await closeDialog(page);
    }
  }
}

async function captureModals(browser, only) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });
  attachIdle(page);
  page.on('dialog', (d) => d.dismiss().catch(() => {}));
  page.on('filechooser', (fc) => fc.abort().catch(() => {}));
  page.on('request', (req) => {
    const m = req.method();
    const url = req.url();
    if (m === 'GET' || m === 'HEAD' || m === 'OPTIONS') return req.continue().catch(() => {});
    if (url.includes('/auth/refresh') || url.includes('/auth/login')) return req.continue().catch(() => {});
    console.log(`  [block] ${m} ${url}`);
    return req.abort().catch(() => {});
  });
  await page.setRequestInterception(true);

  await doLogin(page);

  for (const p of PRIVATE_PAGES) {
    if (only && !only.includes(p.slug)) continue;
    const cfg = EXTRA[p.slug] || {};
    if (PHASE_C && !cfg.preDialogs && !cfg.views && !cfg.defaultPasses) continue;
    console.log(`== Modaux : ${p.label} ==`);

    let current = await gotoPage(page, p);
    if (current !== p.path) {
      console.log(`  [skip] inaccessible (redirigé vers ${current})`);
      continue;
    }

    if (cfg.wait) {
      const okWait = await waitForText(page, cfg.wait);
      if (!okWait) console.log(`  [wait] texte "${cfg.wait}" introuvable`);
    }

    // pré-dialogues : boutons ouvrant directement un modale
    for (const label of cfg.preDialogs || []) {
      const clicked = await clickByText(page, label);
      await sleep(900);
      const info = clicked ? await getDialogInfo(page) : null;
      if (info) {
        await shotModal(page, p, info, label);
        await closeDialog(page);
      } else {
        console.log(`  [pre] "${label}" → aucun modale`);
        await closeDialog(page).catch(() => {});
      }
    }

    // vues d'onglets : capture de la vue puis passes ciblées
    for (const view of cfg.views || []) {
      const okTab = await clickByText(page, view.tab);
      await sleep(900);
      if (!okTab) {
        console.log(`  [vue] onglet "${view.tab}" introuvable`);
        continue;
      }
      if (view.wait) await waitForText(page, view.wait);
      const vfile = `${p.num}-${p.slug}__${view.slug}.png`;
      await page.screenshot({ path: path.join(OUT, vfile) });
      record({
        file: vfile,
        num: p.num,
        slug: p.slug,
        path: p.path,
        label: `${p.label} — ${view.tab}`,
        kind: 'page',
        actualPath: p.path,
      });
      if (view.passes) await runPasses(page, p);
      await gotoPage(page, p); // retour à la vue par défaut
    }

    const runDefault = PHASE_C ? !!cfg.defaultPasses : true;
    if (runDefault) await runPasses(page, p);
  }

  await page.close();
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

(async () => {
  const args = ARGS;
  const phase = args.find((a) => !a.startsWith('--')) || 'all';
  const onlyArg = args.find((a) => a.startsWith('--only='));
  const only = onlyArg ? onlyArg.slice('--only='.length).split(',') : null;

  console.log(`Chrome : ${CHROME}`);
  console.log(`App    : ${BASE}`);
  console.log(`Phase  : ${phase}${only ? ' (only: ' + only.join(',') + ')' : ''}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars', '--window-size=1440,1100'],
  });

  try {
    if (phase === 'pages' || phase === 'all') {
      console.log('--- Capture des interfaces ---');
      await capturePages(browser);
    }
    if (phase === 'texts' || phase === 'all') {
      console.log('--- Texte des interfaces ---');
      await captureTexts(browser);
    }
    if (phase === 'modals' || phase === 'all') {
      console.log('--- Capture des modaux ---');
      await captureModals(browser, only);
    }
    console.log(`Terminé. ${MANIFEST.length} captures dans ${OUT}`);
  } catch (e) {
    console.error('[ERROR]', e && e.message);
    process.exitCode = 1;
  } finally {
    await browser.close().catch(() => {});
  }
})();
