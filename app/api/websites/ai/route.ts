import { NextResponse } from "next/server";

import { generateWebsiteContent } from "@/lib/builder/generator";
import { getCurrentOrganizationId } from "@/lib/builder/server";
import { createWebsite } from "@/lib/builder/website-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const websiteName = String(body.websiteName ?? "").trim();
    const businessName = String(body.businessName ?? "").trim();

    if (!websiteName) {
      return NextResponse.json(
        { success: false, error: "Website name is required." },
        { status: 400 },
      );
    }

    if (!businessName) {
      return NextResponse.json(
        { success: false, error: "Business name is required." },
        { status: 400 },
      );
    }

    const generated = generateWebsiteContent(body);
    const organizationId = await getCurrentOrganizationId();
    const website = await createWebsite(organizationId, {
      name: websiteName,
      creationMethod: "ai",
      siteContent: generated.content,
      theme: generated.theme,
    });

    return NextResponse.json({ success: true, website });
  } catch (error) {
    console.error("AI_WEBSITE_CREATE_ERROR", error);
    return NextResponse.json(
      { success: false, error: "Unable to generate website." },
      { status: 500 },
    );
  }
}
