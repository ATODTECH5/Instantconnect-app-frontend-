import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import CheckIcon from "@/assets/auth/check.svg";
import UploadIcon from "@/assets/kyc/upload.svg";
import { Brand, Ink, MinTapTarget, Radius, Spacing, Type } from "@/constants/theme";

const DISC_SIZE = 44;
const ICON_SIZE = 20;

export type DocumentTileProps = {
	label: string;
	hint: string;
	fileName: string | null;
	uploading: boolean;
	onPress: () => void;
	error?: string;
};

/**
 * The dashed upload slot from the ID and Proof of Address frames. Once a
 * file is with the provider the tile turns solid green and offers Replace,
 * since a wrong scan is the common mistake and Back should not be the fix.
 */
export function DocumentTile({
	label,
	hint,
	fileName,
	uploading,
	onPress,
	error,
}: DocumentTileProps) {
	const done = fileName !== null;

	return (
		<View style={styles.wrapper}>
			<Text style={styles.label}>
				{label}
				<Text style={styles.required}> *</Text>
			</Text>

			<Pressable
				accessibilityHint={done ? "Chooses a different image" : "Opens your photos"}
				accessibilityLabel={done ? `${label}, uploaded ${fileName}` : `Upload ${label}`}
				accessibilityRole="button"
				accessibilityState={{ busy: uploading, disabled: uploading }}
				disabled={uploading}
				onPress={onPress}
				style={({ pressed }) => [
					styles.tile,
					done && styles.tileDone,
					error && styles.tileError,
					pressed && styles.pressed,
				]}
			>
				<View style={[styles.disc, done && styles.discDone]}>
					{uploading ? (
						<ActivityIndicator color={Brand.purple} />
					) : done ? (
						<CheckIcon color={Ink.success} height={ICON_SIZE} width={ICON_SIZE} />
					) : (
						<UploadIcon color={Brand.purple} height={ICON_SIZE} width={ICON_SIZE} />
					)}
				</View>

				<Text numberOfLines={1} style={styles.title}>
					{uploading ? "Uploading…" : done ? fileName : "Tap to upload document"}
				</Text>

				{done && !uploading ? (
					<Text style={styles.replace}>Replace document</Text>
				) : (
					<Text style={styles.hint}>{hint}</Text>
				)}
			</Pressable>

			{error ? (
				<Text role="alert" style={styles.error}>
					{error}
				</Text>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		gap: Spacing.two,
	},
	label: {
		...Type.docSection,
		color: Ink.title,
	},
	required: {
		color: Ink.danger,
	},
	tile: {
		alignItems: "center",
		gap: Spacing.two,
		minHeight: MinTapTarget * 2,
		paddingVertical: Spacing.four,
		paddingHorizontal: Spacing.three,
		borderWidth: 1.5,
		borderStyle: "dashed",
		borderColor: Brand.purpleSoft,
		borderRadius: Radius.dialog,
		backgroundColor: Ink.surface,
	},
	tileDone: {
		borderStyle: "solid",
		borderColor: Ink.success,
		backgroundColor: Ink.surface,
	},
	tileError: {
		borderColor: Ink.danger,
	},
	pressed: {
		opacity: 0.8,
	},
	disc: {
		width: DISC_SIZE,
		height: DISC_SIZE,
		borderRadius: DISC_SIZE / 2,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Brand.purpleSurface,
	},
	discDone: {
		backgroundColor: Ink.successSurface,
	},
	title: {
		...Type.noticeTitle,
		maxWidth: "100%",
		color: Ink.title,
	},
	hint: {
		...Type.footnote,
		textAlign: "center",
		color: Ink.meta,
	},
	replace: {
		...Type.footnoteLink,
		textDecorationLine: "underline",
		color: Brand.purple,
	},
	error: {
		...Type.fieldError,
		color: Ink.danger,
	},
});
