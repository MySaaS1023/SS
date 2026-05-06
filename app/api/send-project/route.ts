import { NextResponse } from "next/server";

import {
  businessEmail,
  formatProjectRequestEmail,
  getResendClient,
  isValidSimpleEmail,
  senderEmail,
  type ProjectRequestPayload,
} from "@/lib/email";
import { saveProjectRequest } from "@/lib/supabase";

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

    let savedRequest;
    let savedTable;

    try {
      const saveResult = await saveProjectRequest(payload);
      savedRequest = saveResult.record;
      savedTable = saveResult.table;
      console.log(`[send-project] Saved project request to Supabase table: ${savedTable}`);
    } catch (error) {
      console.error("SUPABASE_SAVE_ERROR", error);
      console.error("SUBMISSION_PAYLOAD", payload);
      return NextResponse.json(
        {
          success: false,
          error:
            "We could not save your project details right now. Please try again in a moment.",
        },
        { status: 500 },
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn("[send-project] RESEND_API_KEY is not configured. Skipping email delivery.");
      return buildSuccessResponse();
    }

    try {
      const resend = getResendClient();
      const result = (await resend.emails.send({
        from: senderEmail,
        to: [businessEmail],
        replyTo: payload.email,
        subject: "New Steady Start Hire Us Submission",
        text: formatProjectRequestEmail(
          payload,
          savedRequest?.created_at ?? new Date().toISOString(),
        ),
      })) as { error?: unknown };

      if (result.error) {
        throw new Error(
          typeof result.error === "string" ? result.error : JSON.stringify(result.error),
        );
      }

      console.log("[send-project] Resend success:", result);

      return buildSuccessResponse();
    } catch (error) {
      console.error("EMAIL_SEND_ERROR", error);

      return buildSuccessResponse();
    }
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
