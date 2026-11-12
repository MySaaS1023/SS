export function normalizeReferralSearch(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, 200) : "";
}

export function matchesReferralSearch(
  query: string,
  fields: unknown[],
): boolean {
  const needle = normalizeReferralSearch(query).toLocaleLowerCase();
  return (
    !needle ||
    fields.some(
      (field) =>
        typeof field === "string" && field.toLocaleLowerCase().includes(needle),
    )
  );
}
