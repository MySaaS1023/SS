import { NextResponse } from "next/server";

import {
  businessEmail,
  formatCustomerConfirmationEmail,
  formatProjectRequestEmail,
  getResendClient,
  isValidSimpleEmail,
  senderEmail,
  type ProjectRequestPayload,
} from "@/lib/email";
import { hireUsSubmissionsTable } from "@/lib/supabase";

function buildSuccessResponse() {
  return NextResponse.json({
    success: true,
    delivered: true,
    message:
      "Your project details were sent successfully. Please continue to secure your package.",
  });
}

function buildGenericErrorResponse() {
  return NextResponse.json(
    {
      success: false,
      error: "Something went wrong while submitting your request. Please try again in a moment.",
    },
    { status: 500 },
  );
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const fullName = normalizeString(body.fullName);
    const email = normalizeString(body.email);
    const selectedPackage = normalizeString(body.selectedPackage);

    if (!fullName || !email || !selectedPackage) {
      console.error("INTAKE_VALIDATION_ERROR", {
        fullName,
        email,
        selectedPackage,
        body,
      });
      return NextResponse.json(
        { success: false, error: "Please complete your name, email, and package selection." },
        { status: 400 },
      );
    }

    if (!isValidSimpleEmail(email)) {
      console.error("INTAKE_EMAIL_VALIDATION_ERROR", { email });
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const insertData = {
      full_name: fullName,
      email,
      phone: normalizeString(body.phone),
      selected_package: selectedPackage,
      website_goals: normalizeString(body.projectGoals),
    };
    const emailPayload: ProjectRequestPayload = {
      fullName,
      email,
      phone: normalizeString(body.phone),
      businessName: normalizeString(body.businessName),
      selectedPackage,
      businessType: normalizeString(body.businessType),
      serviceModel: normalizeString(body.serviceModel),
      integrations: normalizeString(body.integrations),
      projectGoals: normalizeString(body.projectGoals),
      extraNotes: normalizeString(body.extraNotes),
    };

    console.log("INTAKE_INSERT_DATA", insertData);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("MISSING_SUPABASE_ENV", {
        hasUrl: Boolean(supabaseUrl),
        hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        payload: insertData,
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

    const response = await fetch(`${supabaseUrl}/rest/v1/${hireUsSubmissionsTable}`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify([insertData]),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      const error = new Error(errorText || `Supabase insert failed with status ${response.status}`);
      console.error("SUPABASE_SAVE_ERROR", error, {
        status: response.status,
        table: hireUsSubmissionsTable,
        payload: insertData,
      });
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
        const submissionDate = new Date().toISOString();
        const emailResults = await Promise.allSettled([
          resend.emails.send({
            from: senderEmail,
            to: [businessEmail],
            replyTo: emailPayload.email,
            subject: "New Steady Start Project Request",
            text: formatProjectRequestEmail(emailPayload, submissionDate),
          }),
          resend.emails.send({
            from: senderEmail,
            to: [emailPayload.email],
            subject: "We received your Steady Start request",
            text: formatCustomerConfirmationEmail(emailPayload),
          }),
        ]);

        emailResults.forEach((result, index) => {
          const target = index === 0 ? "ADMIN_EMAIL_SEND_ERROR" : "CUSTOMER_EMAIL_SEND_ERROR";

          if (result.status === "rejected") {
            console.error(target, result.reason);
            return;
          }

          if (result.value?.error) {
            console.error(target, result.value.error);
          }
        });
      } catch (error) {
        console.error("EMAIL_SEND_ERROR", error);
      }
    } else {
      console.error("MISSING_RESEND_API_KEY", {
        fullName,
        email,
        selectedPackage,
      });
    }

    return buildSuccessResponse();
  } catch (error) {
    console.error("[send-project] Unable to process project request:", error);

    return buildGenericErrorResponse();
  }
}
