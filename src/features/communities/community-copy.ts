import type { ApiCommunitySummary } from "@/lib/api/community-schema";
import { formatCompactCount, formatTimeAgo } from "@/utils/format";

export function memberCountLabel(count: number): string {
	return `${formatCompactCount(count)} member${count === 1 ? "" : "s"}`;
}

/** "14.2K members • Active 2 minutes ago". */
export function communityMeta(community: ApiCommunitySummary): string {
	const active = formatTimeAgo(community.lastActivityAt);

	return `${memberCountLabel(community.memberCount)} • Active ${active}`;
}

/** Two letters for a community with no cover, "Design System Explorers" to "DS". */
export function communityInitials(name: string): string {
	const letters = name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((word) => word[0]?.toUpperCase() ?? "")
		.join("");

	return letters || "?";
}
