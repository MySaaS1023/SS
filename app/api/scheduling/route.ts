import { getHandoffOrigin } from "@/lib/handoff/core";
import { validDate } from "@/lib/scheduling/core";
import { bookingRequest, scheduleResponse } from "@/lib/scheduling/http";
import { availableSlots, submitBooking } from "@/lib/scheduling/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date");
  if (!validDate(date)) return scheduleResponse(400, "Choose a valid date.");
  try {
    return Response.json(
      { slots: await availableSlots(date) },
      {
        headers: {
          "Cache-Control": "private, no-store",
          "X-Robots-Tag": "noindex, nofollow",
        },
      },
    );
  } catch {
    return scheduleResponse(
      503,
      "Available times are temporarily unavailable.",
    );
  }
}
export async function POST(request: Request) {
  try {
    return await bookingRequest(request, {
      origin: getHandoffOrigin(process.env.NEXT_PUBLIC_SITE_URL),
      submit: submitBooking,
    });
  } catch {
    return scheduleResponse(
      503,
      "Consultation requests are temporarily unavailable.",
    );
  }
}
