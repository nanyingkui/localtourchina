import test from 'node:test';
import assert from 'node:assert/strict';
import {currentBrowserLoginUrl} from '../public/assets/admin-login.mjs';
const auth='https://test-project.supabase.co',origin='https://localtourchina.com';
const link=auth+'/auth/v1/verify?token=synthetic_test_token_123456789&type=magiclink&redirect_to=https://untrusted.example';
test('same-browser login keeps the auth token only at the configured provider and returns to this admin origin',()=>{
 const result=new URL(currentBrowserLoginUrl(link,auth,origin));
 assert.equal(result.origin,auth);assert.equal(result.searchParams.get('redirect_to'),origin+'/admin.html');assert.equal(result.searchParams.get('type'),'magiclink');
 assert.equal(result.searchParams.get('token'),'synthetic_test_token_123456789');
});
test('same-browser login rejects foreign hosts, misleading credentials and non-verification links',()=>{
 for(const value of [link.replace(auth,'https://evil.example'),link.replace(auth,'https://test-project.supabase.co.evil.example'),link.replace(auth,'https://user@test-project.supabase.co'),link.replace('/verify','/logout'),link+'#access_token=synthetic',link.replace('synthetic_test_token_123456789','short')])assert.throws(()=>currentBrowserLoginUrl(value,auth,origin));
});

import {requestAdminEmail,loginEmailFailure} from '../public/assets/admin-login.mjs';
test('email rate limits are distinguished from account and provider failures without reflecting private response data',()=>{
 const rate=loginEmailFailure(429,{code:'over_email_send_rate_limit'},'120');
 assert.match(rate.message,/服务限额/);assert.equal(rate.cooldownSeconds,120);assert.equal(rate.code,'over_email_send_rate_limit');
 assert.match(loginEmailFailure(400,{code:'email_address_not_authorized'}).message,/发信服务/);
 assert.match(loginEmailFailure(500,{code:'unexpected_failure',msg:'private@example.com secret-token'}).message,/服务异常/);
 assert.ok(!loginEmailFailure(500,{msg:'private@example.com secret-token'}).message.includes('private@'));
});
test('one email request preserves create_user=false and returns the actual failure category without retrying',async()=>{
 let calls=0;
 const result=await requestAdminEmail({url:auth,key:'public-test-key',email:'synthetic@example.invalid',redirect:origin+'/admin.html'},async(_url,options)=>{calls++;assert.equal(JSON.parse(options.body).create_user,false);return {ok:false,status:429,json:async()=>({code:'over_email_send_rate_limit'}),headers:{get:()=>null}};});
 assert.equal(calls,1);assert.equal(result.code,'over_email_send_rate_limit');assert.equal(result.ok,false);
 const network=await requestAdminEmail({url:auth,email:'synthetic@example.invalid'},async()=>{throw Error('private-token');});assert.equal(network.code,'network');assert.ok(!network.message.includes('private-token'));
});

import {requestAdminPassword,changeAdminPassword} from '../public/assets/admin-login.mjs';
test('password login uses the Auth password grant without sending email or creating an account',async()=>{
 let calls=0;const config={url:auth,key:'public-test-key',email:'synthetic@example.invalid',password:'synthetic-password-only'};
 const result=await requestAdminPassword(config,async(url,options)=>{calls++;assert.equal(url,auth+'/auth/v1/token?grant_type=password');const body=JSON.parse(options.body);assert.equal(body.password,config.password);assert.ok(!('create_user' in body));return {ok:true,json:async()=>({access_token:'synthetic-access',refresh_token:'synthetic-refresh',user:{id:'synthetic-user'}})};});
 assert.equal(calls,1);assert.equal(result.ok,true);
 const failed=await requestAdminPassword(config,async()=>({ok:false,status:400,json:async()=>({code:'invalid_credentials',msg:'private-secret'})}));assert.equal(failed.code,'invalid_credentials');assert.ok(!failed.message.includes('private-secret'));
});
test('password setup validates locally and changes only the authenticated user without storing a password',async()=>{
 let calls=0;const config={url:auth,key:'public-test-key',accessToken:'synthetic-access',password:'synthetic-password-only',confirm:'synthetic-password-only'};
 const fetcher=async(url,options)=>{calls++;assert.equal(url,auth+'/auth/v1/user');assert.equal(options.method,'PUT');assert.equal(options.headers.Authorization,'Bearer synthetic-access');assert.deepEqual(JSON.parse(options.body),{password:config.password});return {ok:true};};
 assert.equal((await changeAdminPassword({...config,confirm:'different'},fetcher)).code,'mismatch');assert.equal(calls,0);
 assert.equal((await changeAdminPassword({...config,password:'1234567',confirm:'1234567'},fetcher)).code,'weak_password');assert.equal(calls,0);
 const result=await changeAdminPassword({...config,password:'test1234',confirm:'test1234'},async(url,options)=>{calls++;assert.equal(url,auth+'/auth/v1/user');assert.equal(JSON.parse(options.body).password,'test1234');return {ok:true};});assert.equal(calls,1);assert.deepEqual(result,{ok:true});
});

import {createAdminRequester,requestAdminRecovery,inquiryMatchesSearch} from '../public/assets/admin-login.mjs';
test('recovery accepts only first-party verification URLs and fixed admin redirect',()=>{
 const parsed=new URL(currentBrowserLoginUrl(link.replace('magiclink','recovery'),auth,origin));
 assert.equal(parsed.searchParams.get('type'),'recovery');assert.equal(parsed.searchParams.get('redirect_to'),origin+'/admin.html');
});
test('recovery sends once without account creation and recognizes actual error_code',async()=>{
 let calls=0;const result=await requestAdminRecovery({url:auth,key:'public-key',email:'synthetic@example.invalid',redirect:origin+'/admin.html'},async(url,opts)=>{calls++;assert.equal(new URL(url).pathname,'/auth/v1/recover');assert.deepEqual(JSON.parse(opts.body),{email:'synthetic@example.invalid'});return {ok:false,status:429,json:async()=>({error_code:'over_email_send_rate_limit'}),headers:{get:()=>null}};});
 assert.equal(calls,1);assert.equal(result.code,'over_email_send_rate_limit');assert.equal(result.cooldownSeconds,60);
});
test('concurrent expired requests refresh once and use renewed token',async()=>{
 let session={access_token:'expired',refresh_token:'old-refresh',expires_at:1},refreshes=0,expired=0;
 const api=createAdminRequester({url:auth,key:'public-key',getSession:()=>session,setSession:s=>session=s,onExpired:()=>{expired++;session=null}},async(url,opts)=>{
  if(url.includes('grant_type=refresh_token')){refreshes++;await new Promise(r=>setTimeout(r,10));assert.equal(JSON.parse(opts.body).refresh_token,'old-refresh');return {ok:true,json:async()=>({access_token:'new-access',refresh_token:'new-refresh',expires_in:3600,user:{id:'admin'}})};}
  assert.equal(opts.headers.Authorization,'Bearer new-access');return {ok:true,status:200,json:async()=>true};
 });
 assert.deepEqual(await Promise.all([api('/rest/v1/rpc/is_admin'),api('/rest/v1/inquiries')]),[true,true]);assert.equal(refreshes,1);assert.equal(expired,0);assert.equal(session.refresh_token,'new-refresh');
});
test('network refresh failure preserves session, revoked refresh signs out',async()=>{
 for(const mode of ['network','revoked']){
  let session={access_token:'old',refresh_token:'refresh',expires_at:1},expired=0;
  const api=createAdminRequester({url:auth,key:'public-key',getSession:()=>session,setSession:s=>session=s,onExpired:()=>{expired++;session=null}},async()=>{if(mode==='network')throw Error('network');return {ok:false,status:400};});
  await assert.rejects(api('/rest/v1/inquiries'));assert.equal(expired,mode==='revoked'?1:0);assert.equal(Boolean(session),mode==='network');
 }
});
test('401 refreshes then retries once; 403 does not retry mutations',async()=>{
 let session={access_token:'old',refresh_token:'refresh'},calls=0;
 const api=createAdminRequester({url:auth,key:'key',getSession:()=>session,setSession:s=>session=s,onExpired:()=>session=null},async url=>{
  if(url.includes('grant_type'))return {ok:true,json:async()=>({access_token:'new',refresh_token:'next',user:{id:'admin'}})};
  calls++;return calls===1?{ok:false,status:401}:{ok:true,status:200,json:async()=>['protected']};
 });
 assert.deepEqual(await api('/rest/v1/inquiries'),['protected']);assert.equal(calls,2);
 let forbidden=0;const denied=createAdminRequester({url:auth,key:'key',getSession:()=>session,setSession:()=>{},onExpired:()=>{}},async()=>{forbidden++;return {ok:false,status:403};});
 await assert.rejects(denied('/rest/v1/inquiries',{method:'PATCH'}));assert.equal(forbidden,1);
});
test('late refresh never revives an explicitly signed-out session',async()=>{
 let session={access_token:'old',refresh_token:'refresh',expires_at:1};
 const api=createAdminRequester({url:auth,key:'key',getSession:()=>session,setSession:s=>session=s,onExpired:()=>session=null},async url=>{
  if(url.includes('grant_type')){session=null;return {ok:true,json:async()=>({access_token:'new',refresh_token:'next',user:{id:'admin'}})};}
  throw Error('must not request after logout');
 });
 await assert.rejects(api('/rest/v1/inquiries'));assert.equal(session,null);
});
test('unnamed inquiries can be found by embedded contact, date and spaced Korean name',()=>{
 const row={customer_name:'이름 미입력',inquiry_text:'2026-11-02 / 3명 / synthetic@example.invalid / 이 철 민'};
 for(const term of ['2026-11-02','synthetic@example.invalid','이철민'])assert.equal(inquiryMatchesSearch(row,term),true);
 assert.equal(inquiryMatchesSearch(row,'unrelated'),false);
});

import {compareAdminInquiries,findInquiryByReference} from '../public/assets/admin-login.mjs';
test('new unhandled applications precede old ones while due follow-ups remain prioritized',()=>{
 const now=Date.parse('2026-10-16T04:00:00Z');
 const rows=[{reference:'old',created_at:'2026-09-01'},{reference:'recent',created_at:'2026-10-15'},{reference:'due',created_at:'2026-09-15',follow_up_at:'2026-10-15'}];
 assert.deepEqual(rows.sort((a,b)=>compareAdminInquiries(a,b,now)).map(r=>r.reference),['due','recent','old']);
});
test('reference links select only an exact record already returned to the authorized admin',()=>{
 const rows=[{reference:'LTC-20261016-ABC123',inquiry_text:'full original content'}];
 assert.equal(findInquiryByReference(rows,'ltc-20261016-abc123'),rows[0]);
 assert.equal(findInquiryByReference(rows,'LTC-20261016-ABC124'),null);
 assert.equal(findInquiryByReference(rows,'ABC123'),null);
 assert.equal(findInquiryByReference(rows,'<script>'),null);
});
