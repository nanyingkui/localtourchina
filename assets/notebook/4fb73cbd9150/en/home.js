window.ProductCatalog.mount();
window.addEventListener('pageshow',()=>window.ProductCatalog.mount());
document.querySelectorAll('.mobile-menu nav a').forEach(a=>a.addEventListener('click',()=>document.querySelector('.mobile-menu').open=false));
document.querySelectorAll('a[href="consultation.html"]').forEach(a=>a.addEventListener('click',()=>{const s=window.Journey.read();window.Journey.save({...s,route:''});}));
