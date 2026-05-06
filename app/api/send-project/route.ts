import { NextResponse } from "next/server";

import { isValidSimpleEmail } from "@/lib/email";

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
      website_goals: body.websiteGoals ?? "",
    };

    console.log("INSERT_DATA", insertData);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
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
      return NextResponse.json(
        {
          success: false,
          error:
            "We could not save your project details right now. Please try again in a moment.",
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
