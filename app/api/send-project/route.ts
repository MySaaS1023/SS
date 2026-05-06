import { NextResponse } from "next/server";

import {
  isValidSimpleEmail,
  type ProjectRequestPayload,
} from "@/lib/email";
import { hireUsSubmissionsTable, saveProjectRequest } from "@/lib/supabase";

function buildSuccessResponse() {
  return NextResponse.json({
    success: true,
    delivered: true,
    message:
      "Your project details were sent successfully. Please continue to secure your package.",
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ProjectRequestPayload>;

    const payload: ProjectRequestPayload = {
      fullName: body.fullName?.trim() ?? "",
      email: body.email?.trim() ?? "",
      phone: body.phone?.trim() ?? "",
      businessName: body.businessName?.trim() ?? "",
      selectedPackage: body.selectedPackage?.trim() ?? "",
      businessType: body.businessType?.trim() ?? "",
      serviceModel: body.serviceModel?.trim() ?? "",
      integrations: body.integrations?.trim() ?? "",
      projectGoals: body.projectGoals?.trim() ?? "",
      extraNotes: body.extraNotes?.trim() ?? "",
    };

    if (!payload.fullName || !payload.email || !payload.selectedPackage) {
      console.error("[send-project] Missing required project fields", payload);
      return NextResponse.json(
        { success: false, error: "Please complete your name, email, and package selection." },
        { status: 400 },
      );
    }

    if (!isValidSimpleEmail(payload.email)) {
      console.error("[send-project] Invalid email address", payload.email);
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    try {
      const saveResult = await saveProjectRequest(payload);
      console.log(
        `[send-project] Saved project request to Supabase table: ${saveResult.table}`,
      );
    } catch (error) {
      console.error("SUPABASE_SAVE_ERROR", error);
      console.error("SUPABASE_SAVE_PAYLOAD", payload);

      return NextResponse.json(
        {
          success: false,
          error:
            "We could not save your project details right now. Please try again in a moment.",
          ...(process.env.NODE_ENV !== "production"
            ? {
                details: error instanceof Error ? error.message : String(error),
                table: hireUsSubmissionsTable,
              }
            : {}),
        },
        { status: 500 },
      );
    }

    return buildSuccessResponse();
  } catch (error) {
    console.error("[send-project] Unable to process project request:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          "We could not process your project details just now. Please review your form and try again.",
      },
      { status: 500 },
    );
  }
}
