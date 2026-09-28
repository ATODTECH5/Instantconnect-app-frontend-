import { type FC, memo, type ReactNode, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Linking,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import type { SvgProps } from "react-native-svg";

import TargetIcon from "@/assets/events/target.svg";
import PinIcon from "@/assets/home/pin.svg";
import ClockIcon from "@/assets/search/clock.svg";
import { SearchField } from "@/components/ui/search-field";
import { TallSheet } from "@/components/ui/tall-sheet";
import { Brand, Gap, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";
import { useRecentVenues } from "@/features/events/use-events";
import {
	currentVenue,
	requestLocationPermission,
	searchVenues,
	type VenueCandidate,
} from "@/features/location/geocoding";

const ICON = 18;
const BADGE = 40;
/** Long enough that a search does not fire on every keystroke. */
const SEARCH_DEBOUNCE_MS = 450;

export type LocationSheetProps = {
	visible: boolean;
	onPick: (venue: VenueCandidate) => void;
	onDismiss: () => void;
};

type CurrentState = "idle" | "locating" | "denied" | "blocked" | "failed";

const CURRENT_HINT: Record<CurrentState, string> = {
	idle: "Uses your GPS for a precise location",
	locating: "Finding where you are…",
	denied: "Location access is needed to use this",
	blocked: "Turn on location access in Settings to use this",
	failed: "Could not find your location. Try again",
};

export function LocationSheet({ visible, onPick, onDismiss }: LocationSheetProps) {
	const recent = useRecentVenues(visible);
	const [query, setQuery] = useState("");
	const [found, setFound] = useState<{ query: string; venues: VenueCandidate[] }>({
		query: "",
		venues: [],
	});
	const [current, setCurrent] = useState<CurrentState>("idle");

	const trimmed = query.trim();
	// Results belong to the query they answered, so a stale answer never shows
	// under newer typing and "searching" is simply "no answer for this yet".
	const isSearching = trimmed !== "" && found.query !== trimmed;

	useEffect(() => {
		if (!trimmed) return;

		let isStale = false;

		const timer = setTimeout(() => {
			void searchVenues(trimmed).then((venues) => {
				if (!isStale) setFound({ query: trimmed, venues });
			});
		}, SEARCH_DEBOUNCE_MS);

		return () => {
			isStale = true;
			clearTimeout(timer);
		};
	}, [trimmed]);

	const pick = (venue: VenueCandidate) => {
		setQuery("");
		onPick(venue);
	};

	const locateMe = async () => {
		// Once the OS stops offering the prompt only Settings can undo it.
		if (current === "blocked") {
			void Linking.openSettings();
			return;
		}

		setCurrent("locating");

		const permission = await requestLocationPermission();

		if (permission !== "granted") {
			setCurrent(permission);
			return;
		}

		const venue = await currentVenue();

		if (!venue) {
			setCurrent("failed");
			return;
		}

		setCurrent("idle");
		pick(venue);
	};

	return (
		<TallSheet onDismiss={onDismiss} title="Choose a location" visible={visible}>
			<ScrollView
				contentContainerStyle={styles.content}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				<SearchField
					accessibilityLabel="Search for a place"
					onChangeText={setQuery}
					onSubmit={() => undefined}
					placeholder="Search for a place..."
					value={query}
				/>

				{trimmed ? (
					<Section title="Results">
						{isSearching ? (
							<ActivityIndicator color={Brand.purple} style={styles.spinner} />
						) : found.venues.length === 0 ? (
							<Text style={styles.note}>
								No places match that. Try adding the area or city.
							</Text>
						) : (
							found.venues.map((venue) => (
								<VenueRow
									Icon={PinIcon}
									key={`${venue.latitude},${venue.longitude}`}
									onPress={pick}
									venue={venue}
								/>
							))
						)}
					</Section>
				) : (
					<>
						<Pressable
							accessibilityHint={CURRENT_HINT[current]}
							accessibilityLabel="Use current location"
							accessibilityRole="button"
							accessibilityState={{ busy: current === "locating" }}
							disabled={current === "locating"}
							onPress={() => void locateMe()}
							style={({ pressed }) => [styles.current, pressed && styles.pressed]}
						>
							<View style={styles.badge}>
								{current === "locating" ? (
									<ActivityIndicator color={Brand.purple} />
								) : (
									<TargetIcon color={Brand.purple} height={ICON} width={ICON} />
								)}
							</View>

							<View style={styles.rowCopy}>
								<Text style={styles.currentTitle}>Use Current Location</Text>

								<Text
									style={[
										styles.rowMeta,
										current !== "idle" && current !== "locating"
											? styles.warning
											: null,
									]}
								>
									{CURRENT_HINT[current]}
								</Text>
							</View>
						</Pressable>

						{recent.data && recent.data.length > 0 ? (
							<Section title="Recent Locations">
								{recent.data.map((venue) => (
									<VenueRow
										Icon={ClockIcon}
										key={`${venue.name}|${venue.address ?? ""}`}
										onPress={pick}
										venue={venue}
									/>
								))}
							</Section>
						) : null}
					</>
				)}
			</ScrollView>
		</TallSheet>
	);
}

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<View style={styles.section}>
			<Text accessibilityRole="header" style={styles.sectionTitle}>
				{title.toUpperCase()}
			</Text>

			{children}
		</View>
	);
}

type VenueRowProps = {
	venue: VenueCandidate;
	Icon: FC<SvgProps>;
	onPress: (venue: VenueCandidate) => void;
};

const VenueRow = memo(function VenueRow({ venue, Icon, onPress }: VenueRowProps) {
	return (
		<Pressable
			accessibilityLabel={`${venue.name}${venue.address ? `, ${venue.address}` : ""}`}
			accessibilityRole="button"
			onPress={() => onPress(venue)}
			style={({ pressed }) => [styles.row, pressed && styles.pressed]}
		>
			<Icon color={Ink.meta} height={ICON} width={ICON} />

			<View style={styles.rowCopy}>
				<Text numberOfLines={1} style={styles.rowTitle}>
					{venue.name}
				</Text>

				{venue.address ? (
					<Text numberOfLines={1} style={styles.rowMeta}>
						{venue.address}
					</Text>
				) : null}
			</View>
		</Pressable>
	);
});

const styles = StyleSheet.create({
	content: {
		gap: Gap.section,
		paddingBottom: Spacing.five,
	},
	current: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		minHeight: MinTapTarget,
	},
	badge: {
		width: BADGE,
		height: BADGE,
		borderRadius: BADGE / 2,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Brand.purpleSurface,
	},
	currentTitle: {
		...Type.placeLabel,
		color: Brand.purple,
	},
	section: {
		gap: Spacing.one,
	},
	sectionTitle: {
		...Type.overline,
		color: Ink.meta,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.card,
		minHeight: MinTapTarget + Spacing.two,
		paddingVertical: Spacing.two,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: Ink.border,
		borderRadius: Radius.checkbox,
	},
	rowCopy: {
		flex: 1,
		gap: Spacing.half,
	},
	rowTitle: {
		...Type.placeLabel,
		color: Ink.title,
	},
	rowMeta: {
		...Type.resultMeta,
		color: Ink.meta,
	},
	warning: {
		color: Ink.danger,
	},
	note: {
		...Type.resultMeta,
		color: Ink.meta,
		paddingVertical: Spacing.two,
	},
	spinner: {
		paddingVertical: Spacing.three,
	},
	pressed: {
		opacity: 0.7,
	},
});
