import { permanentRedirect } from "next/navigation";

// Explore is the public replacement. Preserve the archived portfolio source
// and original project assets without maintaining a duplicate gallery URL.
export default function PortfolioPage() {
  permanentRedirect("/explore");
}
