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
test('same-browser login rejects foreign hosts, misleading credentials, recovery and non-verification links',()=>{
 for(const value of [link.replace(auth,'https://evil.example'),link.replace(auth,'https://test-project.supabase.co.evil.example'),link.replace(auth,'https://user@test-project.supabase.co'),link.replace('magiclink','recovery'),link.replace('/verify','/logout'),link+'#access_token=synthetic',link.replace('synthetic_test_token_123456789','short')])assert.throws(()=>currentBrowserLoginUrl(value,auth,origin));
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
 assert.equal((await changeAdminPassword({...config,password:'short',confirm:'short'},fetcher)).code,'weak_password');assert.equal(calls,0);
 const result=await changeAdminPassword(config,fetcher);assert.equal(calls,1);assert.deepEqual(result,{ok:true});
});
