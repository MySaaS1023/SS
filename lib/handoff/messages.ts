import type { AdminHandoff } from "@/lib/handoff/core";

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );
}

export function handoffContactFirstName(contactName: string) {
  return contactName.trim().split(/\s+/)[0] || "there";
}

export function handoffEmailMessage(
  handoff: Pick<
    AdminHandoff,
    "businessName" | "contactName" | "url" | "websiteUrl"
  >,
) {
  if (!handoff.url) throw new Error("The handoff link is unavailable.");
  const firstName = handoffContactFirstName(handoff.contactName);
  const subject = "Your Website Is Ready — Steady Start";
  const text = [
    `Hi ${firstName},`,
    "",
    `Your website for ${handoff.businessName} is ready!`,
    "",
    "Thank you for choosing Steady Start. We're excited to share your completed website with you.",
    "",
    "Use your private completion page to view your live website and find Steady Start contact and social links:",
    handoff.url,
    "",
    "Thank you for trusting Steady Start with your business!",
    "",
    "Steady Start LLC",
    "https://www.steadystartco.com",
  ].join("\n");
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#172033;max-width:640px;margin:auto"><p style="font-size:12px;letter-spacing:.16em;color:#2563eb;font-weight:700">STEADY START</p><h1 style="font-size:28px;margin:8px 0 24px">Your Website Is Ready</h1><p>Hi ${escapeHtml(firstName)},</p><p>Your website for <strong>${escapeHtml(handoff.businessName)}</strong> is ready!</p><p>Thank you for choosing Steady Start. We’re excited to share your completed website with you.</p><p>Use your private completion page to view your live website and find Steady Start contact and social links.</p><p style="margin:28px 0"><a href="${escapeHtml(handoff.url)}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:700">View Your Completed Website</a></p><p>Thank you for trusting Steady Start with your business!</p><p>Steady Start LLC<br><a href="https://www.steadystartco.com">www.steadystartco.com</a></p></div>`;
  return { subject, text, html };
}

export function handoffSmsMessage(
  handoff: Pick<AdminHandoff, "businessName" | "contactName" | "url">,
) {
  if (!handoff.url) throw new Error("The handoff link is unavailable.");
  return `Hi ${handoffContactFirstName(handoff.contactName)}, your ${handoff.businessName} website is ready! View your completed project with Steady Start here: ${handoff.url}`;
}
