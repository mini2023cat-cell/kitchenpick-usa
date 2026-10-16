/* KitchenPick USA: product cards with links to each auto-generated detail page. */
(() => {
 const grid = document.getElementById('product-grid');
 if (!grid) return;
 const icons = {'Air Fryers':'🍟','Coffee Makers':'☕','Blenders':'🥤','Toaster Ovens':'🔥','Cookware':'🍳'};
 const el = (tag, cls, txt) => {const n=document.createElement(tag); if(cls)n.className=cls; if(txt)n.textContent=txt; return n;};
 const slug = str => String(str).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,75).replace(/-$/,'') || 'product';
 const live = p => p && p.published!==false && p.title && /^https:\/\/(?:[a-z0-9-]+\.)*(?:amazon\.(?:com|ca|co\.uk|de|fr|it|es|co\.jp|com\.au)|amzn\.to)\//i.test(p.affiliate_url||'');
 fetch('/data/products.json',{cache:'no-store'}).then(r=>{if(!r.ok) throw Error('Product data unavailable');return r.json();}).then(items=>{
  grid.replaceChildren();
  if(!Array.isArray(items))throw Error('Invalid product data');
  const seen=new Set();
  const valid=items.filter(live);
  if(!valid.length){grid.append(el('p','lead','New product recommendations coming soon.'));return;}
  for(const p of valid){
   let name=slug(p.title);
   // Product titles should be unique. Pages with duplicate title use a suffix set during build; avoid duplicate names in CMS.
   if(seen.has(name)) continue;
   seen.add(name);
   const url='/products/'+encodeURIComponent(name)+'/';
   const card=el('article','card');
   if(p.image && /^\/?media\/[a-zA-Z0-9_./-]+$/.test(p.image) && !p.image.includes('..')){const img=el('img','product-photo');img.src='/'+p.image.replace(/^\//,'');img.alt=p.title;img.loading='lazy';card.append(img);}
   else card.append(el('div','emoji',icons[p.category]||'🛍️'));
   const header=el('h3');const detail=el('a','',p.title);detail.href=url;header.append(detail);card.append(header);
   card.append(el('span','pill',p.category||'Kitchen Appliances'));
   card.append(el('p','',p.description||''));
   const btn=el('a','button','View Product Details →');btn.href=url;card.append(btn);
   const shop=el('a','', 'Check Price on Amazon ↗');shop.href=p.affiliate_url;shop.target='_blank';shop.rel='sponsored nofollow noopener noreferrer';shop.style.display='block';shop.style.marginTop='12px';card.append(shop);
   card.append(el('p','faint','As an Amazon Associate I earn from qualifying purchases.'));
   grid.append(card);
  }
 }).catch(()=>grid.replaceChildren(el('p','lead','Products are temporarily unavailable. Please try again later.')));
})();
