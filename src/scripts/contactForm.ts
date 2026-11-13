import { invalidFields, submitContact } from "../lib/contactClient.ts";
import type { ContactPayload } from "../lib/contactClient.ts";

const form = document.querySelector<HTMLFormElement>("#contact-form");

if (form) {
  const endpoint: string | undefined =
    import.meta.env.PUBLIC_MESSAGING_API_ENDPOINT;
  const email = form.dataset.email ?? "";
  const button = form.querySelector<HTMLButtonElement>("button[type=submit]");
  const timers = new Map<string, number>();

  const labels = {
    name: "name",
    email: "a valid email",
    message: "message",
  } as const;

  function toast(kind: "success" | "error", build: (el: HTMLElement) => void) {
    const el = document.querySelector<HTMLElement>(`[data-toast=${kind}]`);
    if (!el) return;
    el.replaceChildren();
    build(el);
    window.clearTimeout(timers.get(kind));
    timers.set(
      kind,
      window.setTimeout(() => el.replaceChildren(), kind === "error" ? 9000 : 6000),
    );
  }

  function errorToast(reason: string, missing: string[]) {
    toast("error", (el) => {
      if (reason === "invalid") {
        el.textContent = `Please fill in: ${missing.join(", ")}.`;
        return;
      }
      el.append("Couldn't send. Please ");
      const a = document.createElement("a");
      a.href = `mailto:${email}`;
      a.textContent = "email me instead";
      a.className = "underline decoration-amber underline-offset-4";
      el.append(a, ".");
    });
  }

  let sending = false;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending) return;

    const data = new FormData(form);
    const text = (key: string) => String(data.get(key) ?? "");
    const payload: ContactPayload = {
      name: text("name"),
      email: text("email"),
      telephone: text("telephone"),
      message: text("message"),
    };

    const bad = invalidFields(payload);
    for (const input of form.querySelectorAll<HTMLElement>("[required]")) {
      const key = input.getAttribute("name") as "name" | "email" | "message";
      input.setAttribute("aria-invalid", String(bad.includes(key)));
    }
    if (bad.length > 0) {
      errorToast("invalid", bad.map((k) => labels[k]));
      form.querySelector<HTMLElement>(`[name=${bad[0]}]`)?.focus();
      return;
    }

    sending = true;
    if (button) {
      button.disabled = true;
      button.textContent = "Sending…";
    }
    const result = await submitContact(endpoint, payload);
    sending = false;
    if (button) {
      button.disabled = false;
      button.textContent = "Send message";
    }

    if (result.ok) {
      form.reset();
      for (const input of form.querySelectorAll("[aria-invalid]")) {
        input.removeAttribute("aria-invalid");
      }
      toast("error", () => {});
      toast("success", (el) => {
        el.textContent = "Message sent. Thank you, I will reply soon.";
      });
    } else {
      toast("success", () => {});
      errorToast(result.reason, []);
    }
  });
}
