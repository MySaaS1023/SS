import { NextResponse } from "next/server";

import { getCurrentOrganizationId } from "@/lib/builder/server";
import { deleteWebsite, getWebsite, updateWebsite } from "@/lib/builder/website-store";

type RouteContext = {
  params: Promise<{
    websiteId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { websiteId } = await context.params;
    const organizationId = await getCurrentOrganizationId();
    const website = await getWebsite(organizationId, websiteId);

    if (!website) {
      return NextResponse.json({ success: false, error: "Website not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, website });
  } catch (error) {
    console.error("WEBSITE_GET_ERROR", error);
    return NextResponse.json(
      { success: false, error: "Unable to load website." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { websiteId } = await context.params;
    const body = await request.json();
    const organizationId = await getCurrentOrganizationId();
    const website = await updateWebsite(organizationId, websiteId, {
      name: body.name,
      site_content: body.siteContent,
      theme: body.theme,
      status: body.status,
    });

    return NextResponse.json({ success: true, website });
  } catch (error) {
    console.error("WEBSITE_UPDATE_ERROR", error);
    return NextResponse.json(
      { success: false, error: "Unable to save website." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { websiteId } = await context.params;
    const organizationId = await getCurrentOrganizationId();
    await deleteWebsite(organizationId, websiteId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("WEBSITE_DELETE_ERROR", error);
    return NextResponse.json(
      { success: false, error: "Unable to delete website." },
      { status: 500 },
    );
  }
}
