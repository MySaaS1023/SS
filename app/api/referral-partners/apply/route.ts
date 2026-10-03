import { NextResponse } from "next/server";

import {
  adminEmail,
  businessEmail,
  getResendClient,
  senderEmail,
} from "@/lib/email";
import { sendReferralEmail } from "@/lib/referrals/email";
import { REFERRAL_TERMS_VERSION } from "@/lib/referrals/config";
import {
  normalizeText,
  rateLimit,
  validEmail,
  writeAudit,
} from "@/lib/referrals/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

type ErrorDetails = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

function errorDetails(error: unknown): ErrorDetails {
  if (error instanceof Error)
    return { message: error.message, details: error.name };
  if (!error || typeof error !== "object")
    return { message: "Unknown error" };

  const candidate = error as Record<string, unknown>;
  return Object.fromEntries(
    ["code", "message", "details", "hint"]
      .filter((key) => typeof candidate[key] === "string")
      .map((key) => [key, candidate[key] as string]),
  );
}

function logApplicationEvent(
  event:
    | "validation_error"
    | "database_error"
    | "duplicate_application"
    | "rate_limit"
    | "email_error"
    | "configuration_error"
    | "unexpected_error",
  requestId: string,
  details: Record<string, unknown> = {},
) {
  console.error(
    "REFERRAL_APPLICATION_EVENT",
    JSON.stringify({ event, request_id: requestId, ...details }),
  );
}

function resendError(result: PromiseSettledResult<unknown>) {
  if (result.status === "rejected") return errorDetails(result.reason);
  if (!result.value || typeof result.value !== "object") return null;
  const providerError = (result.value as { error?: unknown }).error;
  return providerError ? errorDetails(providerError) : null;
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`application:${ip}`, 5, 10 * 60_000)) {
    logApplicationEvent("rate_limit", requestId);
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      logApplicationEvent("validation_error", requestId, {
        reason: "invalid_json",
      });
      return NextResponse.json(
        { error: "Please submit valid application information." },
        { status: 400 },
      );
    }
    const application = {
      first_name: normalizeText(body.firstName, 120),
      last_name: normalizeText(body.lastName, 120),
      email: normalizeText(body.email, 254).toLowerCase(),
      phone: normalizeText(body.phone, 60),
      city: normalizeText(body.city, 120),
      state: normalizeText(body.state, 40),
      heard_about: normalizeText(body.heardAbout, 240),
      motivation: normalizeText(body.motivation),
      referral_plan: normalizeText(body.referralPlan),
      website: normalizeText(body.website, 500) || null,
      social_profile: normalizeText(body.socialProfile, 500) || null,
      status: "pending",
      terms_version: REFERRAL_TERMS_VERSION,
      terms_accepted_at: new Date().toISOString(),
      information_confirmed: body.accurate === "yes",
      acceptance_acknowledged: body.notGuaranteed === "yes",
    };

    if (
      !application.first_name ||
      !application.last_name ||
      !application.phone ||
      !application.city ||
      !application.state ||
      !application.heard_about ||
      !application.motivation ||
      !application.referral_plan ||
      !validEmail(application.email)
    ) {
      logApplicationEvent("validation_error", requestId, {
        reason: "missing_or_invalid_fields",
      });
      return NextResponse.json(
        {
          error: "Please complete all required fields with valid information.",
        },
        { status: 400 },
      );
    }
    if (
      !application.information_confirmed ||
      !application.acceptance_acknowledged ||
      body.terms !== "yes"
    ) {
      logApplicationEvent("validation_error", requestId, {
        reason: "required_confirmations_missing",
      });
      return NextResponse.json(
        { error: "All required confirmations must be accepted." },
        { status: 400 },
      );
    }

    const missingDatabaseConfiguration = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
    ].filter((name) => !process.env[name]);
    if (missingDatabaseConfiguration.length) {
      logApplicationEvent("configuration_error", requestId, {
        missing: missingDatabaseConfiguration,
      });
      return NextResponse.json(
        { error: "We could not submit your application. Please try again." },
        { status: 500 },
      );
    }

    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("referral_partner_applications")
      .insert(application)
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") {
        logApplicationEvent("duplicate_application", requestId);
        return NextResponse.json(
          {
            error: "An application for this email address is already pending.",
          },
          { status: 409 },
        );
      }
      logApplicationEvent("database_error", requestId, errorDetails(error));
      return NextResponse.json(
        { error: "We could not submit your application. Please try again." },
        { status: 500 },
      );
    }

    await writeAudit({
      action: "application_submitted",
      entityType: "application",
      entityId: data.id,
      after: { email: application.email },
    });

    const messages: Promise<unknown>[] = [
      sendReferralEmail(application.email, {
        kind: "application_received",
        firstName: application.first_name,
      }),
    ];
    if (process.env.RESEND_API_KEY) {
      messages.push(
        getResendClient().emails.send({
          from: senderEmail,
          to: Array.from(new Set([adminEmail, businessEmail])),
          replyTo: application.email,
          subject: "New Referral Partner application",
          text: `New Referral Partner application\n\n${application.first_name} ${application.last_name}\n${application.email}\n${application.phone}\n${application.city}, ${application.state}\n\nReview it in the Referral Program admin area.`,
        }),
      );
    } else {
      logApplicationEvent("configuration_error", requestId, {
        missing: ["RESEND_API_KEY"],
        operation: "email",
      });
    }
    const results = await Promise.allSettled(messages);
    results.forEach((result, index) => {
      const providerError = resendError(result);
      if (providerError)
        logApplicationEvent("email_error", requestId, {
          target: index === 0 ? "applicant" : "admin",
          ...providerError,
        });
    });

    return NextResponse.json(
      { success: true },
      { status: 201, headers: { "x-request-id": requestId } },
    );
  } catch (error) {
    logApplicationEvent("unexpected_error", requestId, errorDetails(error));
    return NextResponse.json(
      { error: "We could not submit your application. Please try again." },
      { status: 500 },
    );
  }
}
