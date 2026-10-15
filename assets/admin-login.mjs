// Only forward email verification links to the configured first-party Auth endpoint.
export function currentBrowserLoginUrl(raw,authBase,pageOrigin){
 const auth=new URL(authBase),page=new URL(pageOrigin),link=new URL(String(raw).trim());
 if(auth.protocol!=='https:'||page.protocol!=='https:'||link.origin!==auth.origin||link.username||link.password||link.pathname!=='/auth/v1/verify'||link.hash)throw Error('invalid-login-link');
 const type=link.searchParams.get('type'),token=link.searchParams.get('token');
 if(!['magiclink','email','signup'].includes(type)||!token||!/^[A-Za-z0-9_-]{16,512}$/.test(token))throw Error('invalid-login-link');
 const target=new URL('/auth/v1/verify',auth.origin);
 target.searchParams.set('token',token);target.searchParams.set('type',type);
 target.searchParams.set('redirect_to',page.origin+'/admin.html');
 return target.href;
}
