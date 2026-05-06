import { NextResponse } from "next/server";

import {
  businessEmail,
  formatProjectRequestEmail,
  getResendClient,
  isValidSimpleEmail,
  senderEmail,
  type ProjectRequestPayload,
} from "@/lib/email";

function buildFallbackResponse(message: string) {
  return NextResponse.json({
    success: true,
    delivered: false,
    message,
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

    if (!process.env.RESEND_API_KEY) {
      console.warn("[send-project] RESEND_API_KEY is not configured. Logging payload only.");
      console.info("[send-project] Project request payload:", payload);
      return buildFallbackResponse(
        "Your project details were received. Email delivery is not configured yet, so please continue to secure your package.",
      );
    }

    try {
      const resend = getResendClient();
      const result = (await resend.emails.send({
        from: senderEmail,
        to: [businessEmail],
        replyTo: payload.email,
        subject: "New Steady Start Project Request",
        text: formatProjectRequestEmail(payload),
      })) as { error?: unknown };

      if (result.error) {
        throw new Error(
          typeof result.error === "string" ? result.error : JSON.stringify(result.error),
        );
      }

      console.log("[send-project] Resend success:", result);

      return NextResponse.json({
        success: true,
        delivered: true,
        message:
          "Your project details were sent successfully. Please continue to secure your package.",
      });
    } catch (error) {
      console.error("[send-project] Email delivery failed. Logging payload instead:", error);
      console.info("[send-project] Project request payload:", payload);

      return buildFallbackResponse(
        "Your project details were received, but email delivery could not be completed automatically. Please continue to secure your package.",
      );
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
