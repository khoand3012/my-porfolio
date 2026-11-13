export type ContactPayload = {
  name: string;
  email: string;
  telephone: string;
  message: string;
};

export type ContactResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "network" | "rejected" | "unconfigured" };

/** One "@" with some text on both sides. Deliberately simple. */
export function isEmail(value: string): boolean {
  const parts = value.trim().split("@");
  return parts.length === 2 && parts[0]!.length > 0 && parts[1]!.length > 0;
}

/** Required fields that are empty or malformed, in form order. */
export function invalidFields(
  payload: ContactPayload,
): ("name" | "email" | "message")[] {
  const bad: ("name" | "email" | "message")[] = [];
  if (!payload.name.trim()) bad.push("name");
  if (!isEmail(payload.email)) bad.push("email");
  if (!payload.message.trim()) bad.push("message");
  return bad;
}

export async function submitContact(
  endpoint: string | undefined,
  payload: ContactPayload,
  fetchImpl: typeof fetch = fetch,
): Promise<ContactResult> {
  if (!endpoint) return { ok: false, reason: "unconfigured" };
  if (invalidFields(payload).length > 0) {
    return { ok: false, reason: "invalid" };
  }

  let response: Response;
  try {
    response = await fetchImpl(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.name.trim(),
        email: payload.email.trim(),
        telephone: payload.telephone.trim(),
        message: payload.message.trim(),
      }),
    });
  } catch {
    return { ok: false, reason: "network" };
  }

  if (!response.ok) return { ok: false, reason: "rejected" };
  try {
    const data: unknown = await response.json();
    const success = (data as { success?: unknown } | null)?.success === true;
    return success ? { ok: true } : { ok: false, reason: "rejected" };
  } catch {
    return { ok: false, reason: "rejected" };
  }
}
