import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,rmSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {serviceInquiryEntry} from '../src/inquiry-entry.mjs';
const require=createRequire(import.meta.url),root=fileURLToPath(new URL('../',import.meta.url)),viteRequire=createRequire(require.resolve('vite/package.json')),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),temp=mkdtempSync(path.join(root,'.request-test-'));
let Redirect,Receipt;
try{viteRequire('esbuild').buildSync({entryPoints:[path.join(root,'src/DetailedServiceRedirect.jsx'),path.join(root,'src/InquiryReceipt.jsx')],outdir:temp,outExtension:{'.js':'.cjs'},bundle:true,format:'cjs',platform:'node',external:['react'],loader:{'.css':'empty'}});Redirect=require(path.join(temp,'DetailedServiceRedirect.cjs')).default;Receipt=require(path.join(temp,'InquiryReceipt.cjs')).default;}finally{rmSync(temp,{recursive:true,force:true});}
for(const lang of ['ko','zh','en'])test(lang+': old short-form links lead to complete service forms',()=>{
 const prefix=lang==='ko'?'/':'/'+lang+'/';
 for(const [service,page]of Object.entries({private:'private-tour.html?mode=custom',ticket:'tickets.html',vehicle:'vehicles.html',guide:'local-guide.html',daytour:'day-tours.html',onlineguide:'online-guide.html'})){
  globalThis.location={search:'?view=request&service='+service};
  const html=renderToStaticMarkup(React.createElement(Redirect,{lang}));
  assert.equal(serviceInquiryEntry(lang,service),prefix+page);
  assert.ok(html.includes('href="'+prefix+page+'"'));
  assert.doesNotMatch(html,/<form|id="request-/);
 }
});
test('received inquiries retain progress and provide an explicit Kakao handoff in every language',()=>{
 for(const lang of ['ko','zh','en']){
  const html=renderToStaticMarkup(React.createElement(Receipt,{lang,record:{services:['ticket'],reference:'LTC-20261018-TEST',date:'2026-11-20',dateMode:'exact',people:'3',contact:'test@example.invalid',productionSubmitted:true,statusUrl:'/inquiry-status.html?token=test'},copyArea:{current:null}}));
  assert.match(html,/receipt-chat-handoff/);assert.match(html,/receipt-kakao/);
  assert.match(html,/LTC-20261018-TEST/);assert.match(html,/receipt-status-link/);
  assert.ok(html.includes('href="https://pf.kakao.com/_hvrmn/chat"'));
  assert.doesNotMatch(html,/다시 보낼 필요|无需再到|do not need to resend/);
 }
});
