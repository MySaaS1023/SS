import "server-only";
import { createContactDispatcher } from "./core";
import { createContactProvider } from "./provider";

// Read only the existing general business configuration. Never fall back to the
// separate Referral Partner Program credentials or the Resend development sender.
export const submitContact = createContactDispatcher({
  send: (input) =>
    createContactProvider({
      apiKey: process.env.RESEND_API_KEY,
      sender: process.env.HANDOFF_FROM_EMAIL ?? process.env.RESEND_FROM_EMAIL,
    })(input),
});
