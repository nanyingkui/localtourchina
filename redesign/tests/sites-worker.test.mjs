import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import worker from "../worker/index.js";

test("serves existing static assets without a fallback", async () => {
  const calls = [];
  const response = await worker.fetch(new Request("https://example.test/assets/app.js"), {
    ASSETS: {
      fetch: async (request) => {
        calls.push(new URL(request.url).pathname);
        return new Response("asset", { status: 200 });
      },
    },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/assets/app.js"]);
});

test("falls back to index.html for an unknown app route", async () => {
  const calls = [];
  const response = await worker.fetch(
    new Request("https://example.test/flow/step-two?source=share", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async (request) => {
          const url = new URL(request.url);
          calls.push(url.pathname + url.search);
          return new Response(url.pathname === "/index.html" ? "app" : "missing", {
            status: url.pathname === "/index.html" ? 200 : 404,
          });
        },
      },
    },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/flow/step-two?source=share", "/index.html"]);
});

test("does not turn missing API or write requests into the app shell", async () => {
  for (const request of [
    new Request("https://example.test/api/missing", { headers: { accept: "application/json" } }),
    new Request("https://example.test/flow", { method: "POST", headers: { accept: "text/html" } }),
  ]) {
    let calls = 0;
    const response = await worker.fetch(request, {
      ASSETS: {
        fetch: async () => {
          calls += 1;
          return new Response("missing", { status: 404 });
        },
      },
    });

    const api=new URL(request.url).pathname.startsWith('/api/');
    assert.equal(response.status, api ? 503 : 404);
    assert.equal(calls, api ? 0 : 1);
  }
});

test("emits the files required by Sites packaging", async () => {
  await access(new URL("../dist/client/index.html", import.meta.url));
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(new URL("../dist/.openai/hosting.json", import.meta.url));
});

test('configured runtime receives the exact quote or admin request, without static fallback', async t => {
  const calls=[];
  t.mock.method(globalThis,'fetch',async (request,options)=>{
    calls.push({url:request.url,method:request.method,body:await request.text(),auth:request.headers.get('authorization'),origin:request.headers.get('origin'),redirect:options.redirect});
    return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
  });
  const response=await worker.fetch(new Request('https://shop.test/api/admin/pricing?mode=save',{method:'POST',headers:{authorization:'Bearer isolated-test-token',origin:'https://shop.test','Content-Type':'application/json'},body:'{"date":"2027-05-01"}'}),{LTC_ORIGIN:'https://origin.test',ASSETS:{fetch:()=>{throw Error('must not use static fallback')}}});
  assert.equal(response.status,200);
  assert.deepEqual(calls,[{url:'https://origin.test/api/admin/pricing?mode=save',method:'POST',body:'{"date":"2027-05-01"}',auth:'Bearer isolated-test-token',origin:'https://shop.test',redirect:'manual'}]);
  assert.equal(response.headers.get('cache-control'),'no-store');
});

test('invalid or unavailable runtime fails closed', async t => {
  for(const LTC_ORIGIN of ['not a URL','http://origin.test','https://user:pass@origin.test','https://origin.test/path']){
    assert.equal((await worker.fetch(new Request('https://shop.test/api/package34/quote'),{LTC_ORIGIN})).status,503);
  }
  t.mock.method(globalThis,'fetch',async()=>{throw Error('offline')});
  assert.equal((await worker.fetch(new Request('https://shop.test/'),{LTC_ORIGIN:'https://origin.test'})).status,503);
});
