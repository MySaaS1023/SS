import { getHandoffOrigin } from "@/lib/handoff/core";
import { handleContactRequest } from "@/lib/contact/http";
import { submitContact } from "@/lib/contact/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleContactRequest(request, {
    origin: getHandoffOrigin(process.env.NEXT_PUBLIC_SITE_URL),
    submit: submitContact,
  });
}
