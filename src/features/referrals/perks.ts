import type { FC } from "react";
import type { SvgProps } from "react-native-svg";

import CalendarPlusIcon from "@/assets/referrals/perk-calendar-plus.svg";
import SparkleIcon from "@/assets/referrals/perk-sparkle.svg";
import StarIcon from "@/assets/referrals/perk-star.svg";
import UserIcon from "@/assets/referrals/perk-user.svg";
import VerifiedIcon from "@/assets/referrals/perk-verified.svg";

export type Perk = { id: string; Icon: FC<SvgProps>; label: string };

/**
 * Copy from the Refer a Friend frames. Nothing enforces these yet: the
 * entitlement work in §3.13 of PRODUCT-STATUS.md is where they become real.
 */
export const REFERRAL_PERKS: Perk[] = [
	{ id: "visibility", Icon: StarIcon, label: "Priority visibility in Discover for 7 days" },
	{ id: "badge", Icon: VerifiedIcon, label: "Exclusive 'Connector' profile badge" },
	{ id: "events", Icon: CalendarPlusIcon, label: "Early access to featured events" },
	{ id: "requests", Icon: UserIcon, label: "Unlock 10 bonus connection requests" },
	{ id: "boost", Icon: SparkleIcon, label: "Profile boost in your local area" },
];

export type Privilege = { id: string; title: string; detail: string };

/** The "friend joined" frame lists three of the five, each with a second line. */
export const ACTIVE_PRIVILEGES: Privilege[] = [
	{
		id: "badge",
		title: "Connector profile badge unlocked",
		detail: "Showcases your active builder status",
	},
	{
		id: "boost",
		title: "7-day local Discovery boost active",
		detail: "Get seen first in the community feed",
	},
	{
		id: "requests",
		title: "+10 bonus connection requests",
		detail: "Meet more like-minded people locally",
	},
];
