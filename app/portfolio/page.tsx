import { redirect } from "next/navigation";

// Temporary public removal. The original page is preserved verbatim in
// components/portfolio-page-content.tsx; see docs/portfolio-restoration.md.
export default function PortfolioPage() {
  redirect("/about");
}
