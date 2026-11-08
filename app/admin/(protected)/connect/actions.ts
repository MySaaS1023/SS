"use server";
import { revalidatePath, revalidateTag } from "next/cache";
import { saveSocialSettings } from "@/lib/social-settings";
import { SocialSettingsError } from "@/lib/social-settings-core";

export type SocialSettingsActionState = { ok: boolean; message: string };
export async function saveSocialSettingsAction(
  _previous: SocialSettingsActionState,
  data: FormData,
): Promise<SocialSettingsActionState> {
  try {
    const input = Object.fromEntries(
      [
        "facebook",
        "youtube",
        "instagram",
        "tiktok",
        "googleBusinessProfileUrl",
        "googleReviewUrl",
      ].map((name) => [name, String(data.get(name) ?? "")]),
    );
    await saveSocialSettings(
      {
        ...input,
        googleBusinessProfileVerified:
          data.get("googleBusinessProfileVerified") === "yes",
        googleBusinessProfileVerifiedEligible:
          data.get("googleBusinessProfileVerifiedEligible") === "yes",
        businessAccountsConfirmed:
          data.get("businessAccountsConfirmed") === "yes",
      },
      Number(data.get("version")),
    );
    revalidateTag("steady-start-social-settings");
    revalidatePath("/", "layout");
    revalidatePath("/connect");
    revalidatePath("/handoff/[token]", "page");
    revalidatePath("/admin/connect");
    revalidatePath("/admin/handoffs");
    revalidatePath("/admin/handoffs/[id]/preview", "page");
    return {
      ok: true,
      message:
        "Social links saved for the homepage, footer, connect page and client handoffs.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof SocialSettingsError
          ? error.message
          : "Social settings could not be saved. Check the configuration and try again.",
    };
  }
}
