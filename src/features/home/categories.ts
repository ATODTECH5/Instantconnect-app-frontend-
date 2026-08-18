import type { FC } from "react";
import type { SvgProps } from "react-native-svg";

import BusinessIcon from "@/assets/home/cat-business.svg";
import FriendshipIcon from "@/assets/home/cat-friendship.svg";
import GeneralIcon from "@/assets/home/cat-general.svg";
import SocialIcon from "@/assets/home/cat-social.svg";
import TalentsIcon from "@/assets/home/cat-talents.svg";
import type { CategoryToneName } from "@/constants/theme";

export type HomeCategory = {
	id: string;
	label: string;
	Icon: FC<SvgProps>;
	tone: CategoryToneName;
};

export const HOME_CATEGORIES: HomeCategory[] = [
	{ id: "talents", label: "Talents", Icon: TalentsIcon, tone: "peach" },
	{ id: "business", label: "Business", Icon: BusinessIcon, tone: "sky" },
	{ id: "friendship", label: "Friendship", Icon: FriendshipIcon, tone: "mint" },
	{ id: "social", label: "Social", Icon: SocialIcon, tone: "blush" },
	{ id: "general", label: "General", Icon: GeneralIcon, tone: "lilac" },
];
