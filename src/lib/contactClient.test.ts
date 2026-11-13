import { test } from "node:test";
import assert from "node:assert/strict";
import { submitContact } from "./contactClient.ts";
import type { ContactPayload } from "./contactClient.ts";

const endpoint = "https://example.test/api/discord";
const valid: ContactPayload = {
  name: "Ada",
  email: "ada@example.com",
  telephone: "",
  message: "Hello there",
};

type Call = { url: string; init?: RequestInit };

function stub(res: { ok: boolean; status?: number; body?: unknown }) {
  const calls: Call[] = [];
  const fetchImpl = (async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    return {
      ok: res.ok,
      status: res.status ?? (res.ok ? 200 : 500),
      json: async () => res.body,
    };
  }) as unknown as typeof fetch;
  return { calls, fetchImpl };
}

test("unconfigured endpoint", async () => {
  const { calls, fetchImpl } = stub({ ok: true, body: { success: true } });
  assert.deepEqual(await submitContact(undefined, valid, fetchImpl), {
    ok: false,
    reason: "unconfigured",
  });
  assert.equal(calls.length, 0);
});

for (const [label, patch] of [
  ["empty name", { name: "  " }],
  ["email without @", { email: "ada.example.com" }],
  ["email with nothing after @", { email: "ada@" }],
  ["email with nothing before @", { email: "@example.com" }],
  ["email with two @", { email: "a@b@c.com" }],
  ["empty message", { message: "" }],
] as const) {
  test(`invalid: ${label} does not call fetch`, async () => {
    const { calls, fetchImpl } = stub({ ok: true, body: { success: true } });
    const result = await submitContact(
      endpoint,
      { ...valid, ...patch },
      fetchImpl,
    );
    assert.deepEqual(result, { ok: false, reason: "invalid" });
    assert.equal(calls.length, 0);
  });
}

test("success posts JSON with exactly the four keys", async () => {
  const { calls, fetchImpl } = stub({ ok: true, body: { success: true } });
  const result = await submitContact(endpoint, valid, fetchImpl);
  assert.deepEqual(result, { ok: true });
  assert.equal(calls.length, 1);
  assert.equal(calls[0]!.url, endpoint);
  assert.equal(calls[0]!.init?.method, "POST");
  const body = JSON.parse(String(calls[0]!.init?.body));
  assert.deepEqual(Object.keys(body).sort(), [
    "email",
    "message",
    "name",
    "telephone",
  ]);
  assert.deepEqual(body, valid);
});

test("sends trimmed values", async () => {
  const { calls, fetchImpl } = stub({ ok: true, body: { success: true } });
  await submitContact(
    endpoint,
    {
      name: " Ada ",
      email: " ada@example.com ",
      telephone: " 123 ",
      message: "\nHello\n",
    },
    fetchImpl,
  );
  const body = JSON.parse(String(calls[0]!.init?.body));
  assert.deepEqual(body, {
    name: "Ada",
    email: "ada@example.com",
    telephone: "123",
    message: "Hello",
  });
});

test("2xx without success:true is rejected", async () => {
  const { fetchImpl } = stub({ ok: true, body: {} });
  assert.deepEqual(await submitContact(endpoint, valid, fetchImpl), {
    ok: false,
    reason: "rejected",
  });
});

test("2xx with non-JSON body is rejected", async () => {
  const fetchImpl = (async () => ({
    ok: true,
    status: 200,
    json: async () => {
      throw new SyntaxError("bad json");
    },
  })) as unknown as typeof fetch;
  assert.deepEqual(await submitContact(endpoint, valid, fetchImpl), {
    ok: false,
    reason: "rejected",
  });
});

test("non-2xx is rejected", async () => {
  const { fetchImpl } = stub({ ok: false, status: 500, body: {} });
  assert.deepEqual(await submitContact(endpoint, valid, fetchImpl), {
    ok: false,
    reason: "rejected",
  });
});

test("fetch throwing is a network failure", async () => {
  const fetchImpl = (async () => {
    throw new TypeError("Failed to fetch");
  }) as unknown as typeof fetch;
  assert.deepEqual(await submitContact(endpoint, valid, fetchImpl), {
    ok: false,
    reason: "network",
  });
});
