const view=new URLSearchParams(location.search).get('view');
if(['products','pricing','transport-pricing'].includes(view)){document.body.innerHTML='<section id="admin-access" style="max-width:580px;padding:32px;margin:80px auto"><h1>产品管理</h1><p role="status" id="admin-access-status">正在验证管理员权限…</p><a href="/admin.html">使用原管理员账号登录 →</a></section><div id="private-workspace" hidden></div>';const script=document.createElement('script');script.type='module';script.src='/assets/product-admin-access.mjs';script.dataset.view=view;document.body.append(script);}

else{const script=document.createElement('script');script.src='/assets/admin.js?v=traveler-20261025';document.body.append(script);}
