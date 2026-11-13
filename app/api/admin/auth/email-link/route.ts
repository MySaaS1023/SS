import { portalEmailLinkRequest } from "@/lib/portal-auth/http";
export const runtime = "nodejs";
export async function POST(request: Request) { return portalEmailLinkRequest(request, "admin"); }
