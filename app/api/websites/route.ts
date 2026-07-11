import { NextResponse } from "next/server";

import { createBlankWebsiteContent, defaultWebsiteTheme } from "@/lib/builder/defaults";
import { generateWebsiteContent } from "@/lib/builder/generator";
import { getCurrentOrganizationId } from "@/lib/builder/server";
import { getWebsiteTemplate } from "@/lib/builder/templates";
import type { CreateWebsiteInput, WebsiteCreationMethod } from "@/lib/builder/types";
import { createWebsite, listWebsites } from "@/lib/builder/website-store";

const creationMethods: WebsiteCreationMethod[] = ["ai", "template", "scratch"];

export async function GET() {
  try {
    const organizationId = await getCurrentOrganizationId();
    const websites = await listWebsites(organizationId);
    return NextResponse.json({ success: true, websites });
  } catch (error) {
    console.error("WEBSITES_LIST_ERROR", error);
    return NextResponse.json(
      { success: false, error: "Unable to load websites." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const creationMethod = body.creationMethod as WebsiteCreationMethod;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Website name is required." },
        { status: 400 },
      );
    }

    if (!creationMethods.includes(creationMethod)) {
      return NextResponse.json(
        { success: false, error: "Choose a valid website creation method." },
        { status: 400 },
      );
    }

    let input: CreateWebsiteInput = {
      name,
      creationMethod,
      siteContent: createBlankWebsiteContent(name),
      theme: defaultWebsiteTheme,
    };

    if (creationMethod === "template") {
      const template = getWebsiteTemplate(String(body.templateId ?? ""));

      if (!template) {
        return NextResponse.json(
          { success: false, error: "Choose a valid template." },
          { status: 400 },
        );
      }

      input = {
        name,
        creationMethod,
        templateId: template.id,
        siteContent: template.content,
        theme: template.theme,
      };
    }

    if (creationMethod === "ai") {
      const generated = generateWebsiteContent(body);
      input = {
        name,
        creationMethod,
        siteContent: generated.content,
        theme: generated.theme,
      };
    }

    const organizationId = await getCurrentOrganizationId();
    const website = await createWebsite(organizationId, input);
    return NextResponse.json({ success: true, website });
  } catch (error) {
    console.error("WEBSITE_CREATE_ERROR", error);
    return NextResponse.json(
      { success: false, error: "Unable to create website." },
      { status: 500 },
    );
  }
}
