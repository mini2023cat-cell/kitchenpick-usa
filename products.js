/* KitchenPick USA storefront — loads products edited in Pages CMS. */
(() => {
 const grid = document.getElementById('product-grid');
 if (!grid) return;
 const icons = {'Air Fryers':'🍟','Coffee Makers':'☕','Blenders':'🥤','Toaster Ovens':'🔥'};
 const el = (tag, cls, txt) => {const n=document.createElement(tag); if(cls)n.className=cls; if(txt)n.textContent=txt; return n;};
 fetch('data/products.json', {cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Product data unavailable');return r.json();}).then(items=>{
  grid.replaceChildren();
  if(!Array.isArray(items))throw Error('Invalid product data');
  const live=items.filter(p=>p && p.published!==false && p.title && p.affiliate_url && /^https:\/\/(?:[a-z0-9-]+\.)*(?:amazon\.[a-z.]+|amzn\.to)\//i.test(p.affiliate_url));
  if(!live.length){grid.append(el('p','lead','New product recommendations coming soon.'));return;}
  for(const p of live){
   const card=el('article','card');
   if(p.image && (p.image.startsWith('/media/') || p.image.startsWith('media/'))){const img=el('img','product-photo');img.src=p.image;img.alt=p.title;img.loading='lazy';card.append(img);}
   else card.append(el('div','emoji',icons[p.category]||'🛍️'));
   card.append(el('h3','',p.title));
   card.append(el('span','pill',p.category||'Kitchen Appliances'));
   card.append(el('p','',p.description||''));
   const link=el('a','button','Check Price on Amazon ↗'); link.href=p.affiliate_url;link.target='_blank';link.rel='sponsored nofollow noopener noreferrer';card.append(link);
   card.append(el('p','faint','Affiliate link · Verify product details and price on Amazon'));
   grid.append(card);
  }
 }).catch(()=>{grid.replaceChildren(el('p','lead','Products are temporarily unavailable. Please try again later.'));});
})();
