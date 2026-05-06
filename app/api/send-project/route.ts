import { NextResponse } from "next/server";

import {
  businessEmail,
  formatProjectRequestEmail,
  getResendClient,
  isValidSimpleEmail,
  senderEmail,
  type ProjectRequestPayload,
} from "@/lib/email";

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
    const body = (await request.json()) as Record<string, unknown>;

    if (
      typeof body.fullName !== "string" ||
      typeof body.email !== "string" ||
      typeof body.selectedPackage !== "string"
    ) {
      return NextResponse.json(
        { success: false, error: "Please complete your name, email, and package selection." },
        { status: 400 },
      );
    }

    const fullName = body.fullName.trim();
    const email = body.email.trim();
    const selectedPackage = body.selectedPackage.trim();

    if (!fullName || !email || !selectedPackage) {
      return NextResponse.json(
        { success: false, error: "Please complete your name, email, and package selection." },
        { status: 400 },
      );
    }

    if (!isValidSimpleEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const insertData = {
      full_name: body.fullName ?? "",
      email: body.email ?? "",
      phone: body.phone ?? "",
      selected_package: body.selectedPackage ?? "",
      website_goals: body.projectGoals ?? "",
    };
    const emailPayload: ProjectRequestPayload = {
      fullName: typeof body.fullName === "string" ? body.fullName : "",
      email: typeof body.email === "string" ? body.email : "",
      phone: typeof body.phone === "string" ? body.phone : "",
      businessName: typeof body.businessName === "string" ? body.businessName : "",
      selectedPackage: typeof body.selectedPackage === "string" ? body.selectedPackage : "",
      businessType: typeof body.businessType === "string" ? body.businessType : "",
      serviceModel: typeof body.serviceModel === "string" ? body.serviceModel : "",
      integrations: typeof body.integrations === "string" ? body.integrations : "",
      projectGoals: typeof body.projectGoals === "string" ? body.projectGoals : "",
      extraNotes: typeof body.extraNotes === "string" ? body.extraNotes : "",
    };

    console.log("INSERT_DATA", insertData);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("MISSING_SUPABASE_ENV", {
        hasUrl: Boolean(supabaseUrl),
        hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      });
      return NextResponse.json(
        {
          success: false,
          error:
            "We could not save your project details right now. Please try again in a moment.",
        },
        { status: 500 },
      );
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/hire_us_submissions`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify([insertData]),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      const error = new Error(errorText || `Supabase insert failed with status ${response.status}`);
      console.error("SUPABASE_SAVE_ERROR", error);
      if (
        response.status === 401 ||
        response.status === 403 ||
        errorText.toLowerCase().includes("row-level security") ||
        errorText.toLowerCase().includes("permission")
      ) {
        console.error("RLS_OR_PERMISSION_ERROR", error);
      }
      return NextResponse.json(
        {
          success: false,
          error:
            "We could not save your project details right now. Please try again in a moment.",
        },
        { status: 500 },
      );
    }

    if (process.env.RESEND_API_KEY) {
      try {
        const resend = getResendClient();
        const result = (await resend.emails.send({
          from: senderEmail,
          to: [businessEmail],
          replyTo: emailPayload.email,
          subject: "New Steady Start Project Request",
          text: formatProjectRequestEmail(emailPayload, new Date().toISOString()),
        })) as { error?: unknown };

        if (result.error) {
          throw new Error(
            typeof result.error === "string" ? result.error : JSON.stringify(result.error),
          );
        }
      } catch (error) {
        console.error("EMAIL_SEND_ERROR", error);
      }
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
