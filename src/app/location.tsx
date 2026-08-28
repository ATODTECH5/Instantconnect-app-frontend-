import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Linking, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import PinIcon from "@/assets/map/pin.svg";
import { LocationCard } from "@/components/map/location-card";
import { MapSearchBar } from "@/components/map/map-search-bar";
import { MapSurface } from "@/components/map/map-surface";
import { FormErrorBanner } from "@/components/ui/form-error-banner";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { AbsoluteFill, Brand, Ink, MaxColumnWidth, Radius, Spacing, Type } from "@/constants/theme";
import {
	FALLBACK_COORDINATES,
	getCurrentCoordinates,
	requestLocationPermission,
	resolveAddress,
	searchPlace,
	type Coordinates,
	type ResolvedAddress,
} from "@/features/location/geocoding";
import { useUpdateProfile } from "@/features/profile/use-profile";
import { describeError } from "@/lib/api/api-error";

const PIN_WIDTH = 28;
const PIN_HEIGHT = 36;

type Phase = "requesting" | "ready" | "denied" | "blocked";

export default function LocationScreen() {
	const insets = useSafeAreaInsets();
	const updateProfile = useUpdateProfile();

	const [phase, setPhase] = useState<Phase>("requesting");
	const [center, setCenter] = useState<Coordinates>(FALLBACK_COORDINATES);
	const [pin, setPin] = useState<Coordinates>(FALLBACK_COORDINATES);
	const [address, setAddress] = useState<ResolvedAddress | null>(null);
	const [isResolving, setIsResolving] = useState(false);
	const [addressError, setAddressError] = useState<string | null>(null);
	const [isSearching, setIsSearching] = useState(false);
	const [searchError, setSearchError] = useState<string | null>(null);
	const [saveError, setSaveError] = useState<string | null>(null);

	// Guards against a slow geocode for an old pin overwriting a newer one.
	const requestIdRef = useRef(0);
	const isMountedRef = useRef(true);

	/** Bumped by the retry button to re-run the permission prompt. */
	const [attempt, setAttempt] = useState(0);

	useEffect(() => {
		isMountedRef.current = true;

		return () => {
			isMountedRef.current = false;
		};
	}, []);

	useEffect(() => {
		let cancelled = false;

		requestLocationPermission()
			.then((result) => {
				if (cancelled) return null;

				if (result !== "granted") {
					setPhase(result);
					return null;
				}

				// Wrapped so a granted permission with no fix stays distinguishable
				// from a refused one, which is what null means here.
				return getCurrentCoordinates().then((coordinates) => ({ coordinates }));
			})
			.then((fix) => {
				if (cancelled || !fix) return;

				// A granted permission that still cannot produce a fix (no signal,
				// sensor off) opens the map on the fallback rather than blocking
				// the screen behind the spinner.
				if (fix.coordinates) {
					setCenter(fix.coordinates);
					setPin(fix.coordinates);
				}

				setPhase("ready");
			})
			.catch(() => {
				if (!cancelled) setPhase("ready");
			});

		return () => {
			cancelled = true;
		};
	}, [attempt]);

	const retryPermission = useCallback(() => {
		setPhase("requesting");
		setAttempt((previous) => previous + 1);
	}, []);

	/**
	 * Granting the permission in Settings does not return any signal to the app,
	 * so coming back to the foreground is the only cue that the answer may have
	 * changed. Without this the user grants access and still faces the notice.
	 */
	useEffect(() => {
		if (phase !== "denied" && phase !== "blocked") return;

		const subscription = AppState.addEventListener("change", (state) => {
			if (state === "active") retryPermission();
		});

		return () => subscription.remove();
	}, [phase, retryPermission]);

	const handleCenterMoving = useCallback(() => {
		setIsResolving(true);
		setAddressError(null);
	}, []);

	const handleCenterSettled = useCallback(async (coordinates: Coordinates) => {
		const requestId = ++requestIdRef.current;

		setPin(coordinates);
		setIsResolving(true);
		setAddressError(null);

		const resolved = await resolveAddress(coordinates);

		if (!isMountedRef.current || requestId !== requestIdRef.current) return;

		setAddress(resolved);
		setAddressError(resolved ? null : "We could not name this spot. You can still select it.");
		setIsResolving(false);
	}, []);

	const handleSearch = useCallback(async (query: string) => {
		if (!query.trim()) return;

		setIsSearching(true);
		setSearchError(null);

		const match = await searchPlace(query);

		if (!isMountedRef.current) return;

		if (match) setCenter(match);
		else setSearchError("We could not find that place. Try a different search.");

		setIsSearching(false);
	}, []);

	const handleOpenSettings = useCallback(() => {
		Linking.openSettings().catch(() => {});
	}, []);

	/**
	 * Only the point is written. `locationLabel` stays whatever the user typed in
	 * Edit Profile, since the resolved street line is a long one-off address
	 * rather than the short area label that field renders.
	 */
	const handleSelect = useCallback(async () => {
		setSaveError(null);

		try {
			await updateProfile.mutateAsync({
				latitude: pin.latitude,
				longitude: pin.longitude,
			});
		} catch (cause) {
			if (isMountedRef.current) setSaveError(describeError(cause));
			return;
		}

		router.replace("/(tabs)");
	}, [pin, updateProfile]);

	const handleSkip = useCallback(() => router.replace("/(tabs)"), []);

	if (phase === "denied" || phase === "blocked") {
		return (
			<PermissionNotice
				insets={insets}
				onPrimary={phase === "blocked" ? handleOpenSettings : retryPermission}
				onSkip={handleSkip}
				phase={phase}
			/>
		);
	}

	return (
		<View style={styles.screen}>
			<StatusBar style="dark" />

			<MapSurface
				center={center}
				onCenterMoving={handleCenterMoving}
				onCenterSettled={handleCenterSettled}
			/>

			{/* Fixed to the map's centre: the map moves under it, so the pin always
			    marks the coordinate the card describes. */}
			<View pointerEvents="none" style={styles.pinLayer}>
				<PinIcon
					color={Brand.purple}
					height={PIN_HEIGHT}
					style={styles.pin}
					width={PIN_WIDTH}
				/>
			</View>

			<View pointerEvents="box-none" style={[styles.overlay, { paddingTop: insets.top }]}>
				<View style={styles.column}>
					<MapSearchBar busy={isSearching} onSearch={handleSearch} />

					{searchError ? (
						<View style={styles.searchError}>
							<Text role="alert" style={styles.searchErrorText}>
								{searchError}
							</Text>
						</View>
					) : null}
				</View>

				<View style={styles.spacer} />

				<View
					style={[
						styles.column,
						styles.footer,
						{ paddingBottom: insets.bottom + Spacing.three },
					]}
				>
					{saveError ? <FormErrorBanner message={saveError} /> : null}

					<LocationCard address={address} error={addressError} loading={isResolving} />

					<PrimaryButton
						accessibilityHint="Uses the pinned spot to find events and people near you"
						disabled={isResolving}
						label="Select Location"
						loading={updateProfile.isPending}
						onPress={() => void handleSelect()}
					/>
				</View>
			</View>

			<LoadingOverlay label="Finding your location" visible={phase === "requesting"} />
		</View>
	);
}

type PermissionNoticeProps = {
	phase: "denied" | "blocked";
	insets: { top: number; bottom: number };
	onPrimary: () => void;
	onSkip: () => void;
};

function PermissionNotice({ phase, insets, onPrimary, onSkip }: PermissionNoticeProps) {
	const isBlocked = phase === "blocked";

	return (
		<View
			style={[
				styles.notice,
				{
					paddingTop: insets.top + Spacing.six,
					paddingBottom: insets.bottom + Spacing.four,
				},
			]}
		>
			<StatusBar style="dark" />

			<View style={styles.noticeBody}>
				<Text accessibilityRole="header" style={styles.noticeTitle}>
					Location is off
				</Text>

				<Text style={styles.noticeMessage}>
					{isBlocked
						? "InstantConnect uses your location to discover events and people near you. Turn it on in Settings to pick your spot."
						: "InstantConnect uses your location to discover events and people near you. You can allow it now, or set your spot later."}
				</Text>
			</View>

			<View style={styles.noticeActions}>
				<PrimaryButton
					label={isBlocked ? "Open Settings" : "Allow Location"}
					onPress={onPrimary}
				/>

				<SecondaryButton label="Not now" onPress={onSkip} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Ink.land,
	},
	pinLayer: {
		...AbsoluteFill,
		alignItems: "center",
		justifyContent: "center",
	},
	// Lifts the pin so its tip, not its centre, sits on the map centre.
	pin: {
		marginBottom: PIN_HEIGHT,
	},
	overlay: {
		...AbsoluteFill,
		alignItems: "center",
	},
	column: {
		width: "100%",
		maxWidth: MaxColumnWidth,
		paddingHorizontal: Spacing.three,
		paddingTop: Spacing.two,
	},
	spacer: {
		flex: 1,
	},
	footer: {
		gap: Spacing.three,
	},
	searchError: {
		marginTop: Spacing.two,
		paddingVertical: Spacing.two,
		paddingHorizontal: Spacing.three,
		borderRadius: Radius.control,
		backgroundColor: Ink.surface,
	},
	searchErrorText: {
		...Type.footnote,
		color: Ink.danger,
		textAlign: "center",
	},
	notice: {
		flex: 1,
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: Spacing.four,
		backgroundColor: Ink.surface,
	},
	noticeBody: {
		width: "100%",
		maxWidth: MaxColumnWidth,
		gap: Spacing.three,
	},
	noticeTitle: {
		...Type.successTitle,
		color: Ink.title,
		textAlign: "center",
	},
	noticeMessage: {
		...Type.successBody,
		color: Ink.body,
		textAlign: "center",
	},
	noticeActions: {
		width: "100%",
		maxWidth: MaxColumnWidth,
		gap: Spacing.three,
	},
});
