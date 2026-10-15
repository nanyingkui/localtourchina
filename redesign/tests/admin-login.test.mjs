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
