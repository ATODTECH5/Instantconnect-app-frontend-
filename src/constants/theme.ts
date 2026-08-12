import "@/global.css";

import { Platform, type ViewStyle } from "react-native";

export const Brand = {
	orange: "#FB923C",
	coral: "#F67B58",
	rose: "#F05E7E",
	pink: "#EC4899",
	magenta: "#CE41B5",
	violet: "#A136DD",
	purple: "#9333EA",
	purpleLight: "#A855F7",
	purpleSurface: "#F3E8FF",
	purpleSurfaceSubtle: "#FAF5FF",
	onBrand: "#FFFFFF",
} as const;

/** Neutrals measured off the onboarding frames. */
export const Ink = {
	title: "#141417",
	body: "#2B2A31",
	muted: "#4F4E59",
	land: "#E0E0E0",
	surface: "#FFFFFF",
	/** Body copy sitting on the brand gradient. */
	onBrandMuted: "#E6E5EA",
} as const;

export type BrandColor = keyof typeof Brand;

/**
 * The design gradient axis runs bottom right to top left. Its stop offsets are
 * defined on an axis longer than the 393x852 frame, so the offsets below are
 * those design offsets re-projected onto the frame's own corner-to-corner axis.
 * `orange` falls entirely off-canvas and `purple` lands just past the top left
 * corner, which is why the visible run starts at `coral` and ends at `purple`.
 */
const BRAND_GRADIENT_CSS =
	`linear-gradient(290.4deg, ` +
	`${Brand.coral} 0%, ` +
	`${Brand.rose} 17.87%, ` +
	`${Brand.pink} 31.57%, ` +
	`${Brand.magenta} 56.42%, ` +
	`${Brand.violet} 96.49%, ` +
	`${Brand.purple} 100%)`;

/** react-native-web reads the CSS property, native reads the RN style prop. */
export const BrandGradient = Platform.select({
	web: { backgroundImage: BRAND_GRADIENT_CSS } as ViewStyle,
	default: { experimental_backgroundImage: BRAND_GRADIENT_CSS } satisfies ViewStyle,
});

export const Colors = {
	light: {
		text: "#000000",
		background: "#ffffff",
		backgroundElement: "#F0F0F3",
		backgroundSelected: "#E0E1E6",
		textSecondary: "#60646C",
	},
	dark: {
		text: "#ffffff",
		background: "#000000",
		backgroundElement: "#212225",
		backgroundSelected: "#2E3135",
		textSecondary: "#B0B4BA",
	},
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
	ios: {
		/** iOS `UIFontDescriptorSystemDesignDefault` */
		sans: "system-ui",
		/** iOS `UIFontDescriptorSystemDesignSerif` */
		serif: "ui-serif",
		/** iOS `UIFontDescriptorSystemDesignRounded` */
		rounded: "ui-rounded",
		/** iOS `UIFontDescriptorSystemDesignMonospaced` */
		mono: "ui-monospace",
	},
	default: {
		sans: "normal",
		serif: "serif",
		rounded: "normal",
		mono: "monospace",
	},
	web: {
		sans: "var(--font-display)",
		serif: "var(--font-serif)",
		rounded: "var(--font-rounded)",
		mono: "var(--font-mono)",
	},
});

/** Loaded by the root layout via `useFonts`, falls back to the platform serif. */
export const BrandFont = "AbyssinicaSIL_400Regular";

export const UiFont = {
	regular: "Inter_400Regular",
	medium: "Inter_500Medium",
	semibold: "Inter_600SemiBold",
	bold: "Inter_700Bold",
} as const;

/**
 * Sizes derived from the outlined text in the onboarding SVG exports: cap
 * heights and baseline gaps measured in a real SVG engine, then divided by
 * Inter's cap ratio. Line heights are the measured baseline-to-baseline gaps.
 */
export const Type = {
	slideTitle: { fontFamily: UiFont.bold, fontSize: 30, lineHeight: 40 },
	slideBody: { fontFamily: UiFont.regular, fontSize: 14, lineHeight: 22 },
	action: { fontFamily: UiFont.medium, fontSize: 16, lineHeight: 22 },
	heroTitle: { fontFamily: UiFont.bold, fontSize: 18, lineHeight: 24, letterSpacing: -0.15 },
	featureTitle: {
		fontFamily: UiFont.semibold,
		fontSize: 16,
		lineHeight: 22,
		letterSpacing: -0.2,
	},
	featureBody: { fontFamily: UiFont.regular, fontSize: 14, lineHeight: 18 },
	cta: { fontFamily: UiFont.semibold, fontSize: 16, lineHeight: 22, letterSpacing: -0.1 },
} as const;

export const Spacing = {
	half: 2,
	one: 4,
	two: 8,
	three: 16,
	four: 24,
	five: 32,
	six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/** Every onboarding frame was exported against this artboard. */
export const DesignFrame = { width: 393, height: 852 } as const;

/** Phone sized reading column, centred once the screen grows past it. */
export const MaxColumnWidth = 420;
