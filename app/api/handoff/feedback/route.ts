import { getHandoffOrigin } from "@/lib/handoff/core";
import {
  handleFeedbackRequest,
  feedbackResponse,
} from "@/lib/handoff/feedback-http";
import { submitPublicHandoffFeedback } from "@/lib/handoff/feedback-server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    return await handleFeedbackRequest(request, {
      origin: getHandoffOrigin(process.env.NEXT_PUBLIC_SITE_URL),
      submit: submitPublicHandoffFeedback,
    });
  } catch {
    return feedbackResponse(
      503,
      "Feedback is temporarily unavailable. Please try again later.",
    );
  }
}
