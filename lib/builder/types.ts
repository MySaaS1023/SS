export type WebsiteCreationMethod = "ai" | "template" | "scratch";

export type WebsitePage = {
  id: string;
  title: string;
  slug: string;
  heading: string;
  body: string;
  buttonLabel: string;
  buttonLink: string;
};

export type WebsiteNavigationItem = {
  label: string;
  href: string;
};

export type WebsiteContent = {
  navigation: WebsiteNavigationItem[];
  pages: WebsitePage[];
};

export type WebsiteTheme = {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
};

export type WebsiteRecord = {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  creation_method: WebsiteCreationMethod;
  template_id: string | null;
  status: "draft" | "published";
  site_content: WebsiteContent;
  theme: WebsiteTheme;
  created_at: string;
  updated_at: string;
};

export type WebsiteSummary = Pick<
  WebsiteRecord,
  | "id"
  | "name"
  | "slug"
  | "creation_method"
  | "template_id"
  | "status"
  | "updated_at"
>;

export type CreateWebsiteInput = {
  name: string;
  creationMethod: WebsiteCreationMethod;
  templateId?: string | null;
  siteContent?: WebsiteContent;
  theme?: WebsiteTheme;
};

export type AiWebsiteInput = {
  websiteName: string;
  businessName: string;
  businessType: string;
  industry: string;
  businessDescription: string;
  targetAudience: string;
  productsOrServices: string;
  preferredStyle: string;
  primaryColor: string;
  secondaryColor: string;
  pagesNeeded: string;
  contactEmail: string;
  phone: string;
  mainCallToAction: string;
};
