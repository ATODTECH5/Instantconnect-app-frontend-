import type { FC } from "react";
import type { SvgProps } from "react-native-svg";

import BusinessIcon from "@/assets/home/cat-business.svg";
import FriendshipIcon from "@/assets/home/cat-friendship.svg";
import GeneralIcon from "@/assets/home/cat-general.svg";
import SocialIcon from "@/assets/home/cat-social.svg";
import TalentsIcon from "@/assets/home/cat-talents.svg";
import type { CategoryToneName } from "@/constants/theme";

export type Category = {
	id: string;
	label: string;
	Icon: FC<SvgProps>;
	tone: CategoryToneName;
};

/**
 * The ids are the server's seeded `categories` rows, so what onboarding posts
 * and what the home strip filters on are the same values. They were two lists
 * that had drifted apart ('talent' against 'talents'), which silently broke
 * filtering; keep this the only copy.
 */
export const CATEGORIES: Category[] = [
	{ id: "talents", label: "Talents", Icon: TalentsIcon, tone: "peach" },
	{ id: "business", label: "Business", Icon: BusinessIcon, tone: "sky" },
	{ id: "friendship", label: "Friendship", Icon: FriendshipIcon, tone: "mint" },
	{ id: "social", label: "Social", Icon: SocialIcon, tone: "blush" },
	{ id: "general", label: "General", Icon: GeneralIcon, tone: "lilac" },
];

export const CATEGORY_OPTIONS = CATEGORIES.map(({ id, label }) => ({ id, label }));

export function findCategory(id: string | null | undefined): Category | null {
	if (!id) return null;

	return CATEGORIES.find((category) => category.id === id) ?? null;
}
