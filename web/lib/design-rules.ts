/**
 * Shared DesignRules Zod schema — must stay in sync with
 * api/app/schemas/design_rules.py (Pydantic).
 */
import { z } from "zod";

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;
const hexColor = z.string().regex(HEX_RE, "Must be a 6-digit hex color (#RRGGBB)");

export const ALLOWED_HEADING_FONTS = [
  "Inter", "Plus Jakarta Sans", "DM Sans", "Outfit",
  "Playfair Display", "Lora", "Cormorant Garamond",
  "Nunito", "Poppins", "Raleway",
  "Space Grotesk", "IBM Plex Mono",
  "Merriweather", "Source Serif 4",
] as const;

export const ALLOWED_BODY_FONTS = [
  "Inter", "Plus Jakarta Sans", "DM Sans",
  "Source Sans 3", "Lato", "Open Sans",
  "Nunito", "Poppins",
  "Space Grotesk",
  "Merriweather", "Source Serif 4",
] as const;

export const ALLOWED_KHMER_FONTS = [
  "Kantumruy Pro", "Noto Sans Khmer", "Battambang", "Koulen",
] as const;

export const ProjectInfoSchema = z.object({
  brand_name: z.string().min(1).max(255),
  project_type: z.enum(["website", "mobile_app", "brand_identity", "social_media"]),
});

export const ColorsSchema = z.object({
  primary: hexColor,
  secondary: hexColor,
  neutral: hexColor,
  background: hexColor,
  gray_tone: z.enum(["cool", "warm", "pure"]).default("pure"),
  scheme: z.enum(["light", "dark"]).default("light"),
});

export const FontsSchema = z.object({
  heading: z.enum(ALLOWED_HEADING_FONTS),
  body: z.enum(ALLOWED_BODY_FONTS),
  khmer_heading: z.enum(ALLOWED_KHMER_FONTS).nullable().optional(),
  khmer_body: z.enum(ALLOWED_KHMER_FONTS).nullable().optional(),
  languages: z.array(z.enum(["en", "km"])).default(["en"]),
  scale_ratio: z.union([z.literal(1.2), z.literal(1.25), z.literal(1.333)]).default(1.25),
});

export const ShapeSchema = z.object({
  radius: z.enum(["sharp", "soft", "rounded", "pill"]).default("soft"),
  density: z.enum(["compact", "comfortable", "airy"]).default("comfortable"),
  base_unit: z.union([z.literal(4), z.literal(8)]).default(4),
  shadow: z.enum(["none", "subtle", "medium", "strong"]).default("subtle"),
  button_style: z.enum(["filled", "outline", "soft"]).default("filled"),
});

export const VoiceSchema = z.object({
  tone: z.enum(["formal", "friendly", "playful"]).default("friendly"),
});

export const DesignRulesSchema = z.object({
  project_info: ProjectInfoSchema.optional(),
  style_direction: z.string().optional(),
  colors: ColorsSchema.optional(),
  fonts: FontsSchema.optional(),
  shape: ShapeSchema.optional(),
  voice: VoiceSchema.optional(),
  notes: z.string().max(2000).optional(),
});

export type DesignRules = z.infer<typeof DesignRulesSchema>;
export type Colors = z.infer<typeof ColorsSchema>;
export type Fonts = z.infer<typeof FontsSchema>;
export type Shape = z.infer<typeof ShapeSchema>;
export type Voice = z.infer<typeof VoiceSchema>;
export type ProjectInfo = z.infer<typeof ProjectInfoSchema>;
