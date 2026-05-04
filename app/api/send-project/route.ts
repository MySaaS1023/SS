import { NextResponse } from "next/server";

import {
  businessEmail,
  formatProjectRequestEmail,
  getResendClient,
  senderEmail,
  type ProjectRequestPayload,
} from "@/lib/email";

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
        { error: "Missing required project fields." },
        { status: 400 },
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("[send-project] RESEND_API_KEY is not configured.");
      return NextResponse.json(
        { error: "RESEND_API_KEY is not configured." },
        { status: 500 },
      );
    }

    const resend = getResendClient();
    const result = await resend.emails.send({
      from: senderEmail,
      to: [businessEmail],
      replyTo: payload.email,
      subject: "New Steady Start Project Request",
      text: formatProjectRequestEmail(payload),
    });

    console.log("[send-project] Resend success:", result);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[send-project] Unable to send project request:", error);

    return NextResponse.json(
      { error: "Unable to send project request email." },
      { status: 500 },
    );
  }
}
