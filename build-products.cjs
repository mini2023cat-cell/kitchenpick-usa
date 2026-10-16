/* KitchenPick USA: generate static product pages from Pages CMS data. Node.js built-ins only. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = __dirname;
const dataPath = path.join(root, 'data', 'products.json');
const output = path.join(root, 'products');
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slugify = s => String(s).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0,75).replace(/-$/,'') || 'product';
const affiliate = u => /^https:\/\/(?:[a-z0-9-]+\.)*(?:amazon\.(?:com|ca|co\.uk|de|fr|it|es|co\.jp|com\.au)|amzn\.to)\//i.test(String(u ?? ''));
const isLive = p => p && p.published !== false && p.title && affiliate(p.affiliate_url);
const imageUrl = input => { const s = String(input || ''); return /^\/?media\/[a-zA-Z0-9_./-]+$/.test(s) && !s.includes('..') ? '/' + s.replace(/^\//,'') : ''; };
if (!fs.existsSync(dataPath)) throw Error('Missing data/products.json');
const products = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
if (!Array.isArray(products)) throw Error('products.json must contain an array');
fs.mkdirSync(output, {recursive:true});
const seen = new Set();
let generated = 0;
for (const p of products.filter(isLive)) {
  let slug = slugify(p.title);
  if(seen.has(slug)) slug += '-' + crypto.createHash('sha1').update(p.title+p.affiliate_url).digest('hex').slice(0,7);
  seen.add(slug);
  const dir = path.join(output, slug);
  fs.mkdirSync(dir, {recursive:true});
  const name = esc(p.title), description=esc(p.description || ''), category=esc(p.category || 'Kitchen Appliances');
  const img = imageUrl(p.image);
  const picture = img ? `<img src="${esc(img)}" alt="${name}" class="product-photo" style="max-width:500px;width:100%;height:auto;object-fit:contain">` : `<div class="emoji" aria-hidden="true">🍳</div>`;
  const url = esc(p.affiliate_url);
  const doc = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${description.slice(0,155)}"><title>${name} | KitchenPick USA</title><link rel="stylesheet" href="/styles.css"><style>.product-page{max-width:860px;margin:4rem auto;padding:0 1rem}.product-page h1{line-height:1.2}.product-page .photo{background:white;border-radius:16px;padding:1.5rem;margin:1.5rem 0;text-align:center}.product-page .button{display:inline-block;margin:1rem 0}.product-page .faint{font-size:.9rem}.product-page .back{display:inline-block;margin-bottom:1rem}</style></head><body><div class="notice">Independent kitchen appliance guides · Some links may earn us a commission.</div><header class="top"><div class="wrap"><a class="brand" href="/index.html">KitchenPick <span>USA</span></a><nav aria-label="Main navigation"><a href="/index.html">Home</a><a href="/about.html">About Us</a><a href="/contact.html">Contact</a><a href="/privacy.html">Privacy Policy</a><a href="/affiliate-disclosure.html">Affiliate Disclosure</a></nav></div></header><main class="product-page"><a class="back" href="/index.html#featured">← Back to all products</a><h1>${name}</h1><p class="pill">${category}</p><div class="photo">${picture}</div><h2>Product overview</h2><p>${description}</p><p><a class="button" href="${url}" target="_blank" rel="sponsored nofollow noopener noreferrer">Check Price on Amazon ↗</a></p><p class="faint">As an Amazon Associate I earn from qualifying purchases. Check current specifications, availability, and price on Amazon.</p></main><footer><div class="wrap"><p>© KitchenPick USA · <a href="/affiliate-disclosure.html">Affiliate Disclosure</a> · <a href="/privacy.html">Privacy Policy</a></p></div></footer></body></html>`;
  fs.writeFileSync(path.join(dir, 'index.html'), doc);
  generated++;
}
console.log(`KitchenPick USA: generated ${generated} product pages`);
