import { SectionList, StyleSheet, View, type SectionListRenderItem } from "react-native";

import { SectionHeader } from "@/components/home/section-header";
import { MeetupCard } from "@/components/search/meetup-card";
import { PersonRow } from "@/components/search/person-row";
import { PlaceRow } from "@/components/search/place-row";
import { Gap, MaxColumnWidth, Spacing } from "@/constants/theme";
import type { ConnectionState } from "@/features/home/use-connect-requests";
import type {
	SearchMeetup,
	SearchPerson,
	SearchPlace,
	SearchResults,
} from "@/features/search/search-catalog";
import type { JoinState } from "@/features/search/use-join-meetups";

export type ResultItem =
	| { type: "person"; id: string; person: SearchPerson }
	| { type: "place"; id: string; place: SearchPlace }
	| { type: "meetup"; id: string; meetup: SearchMeetup };

export type ResultSection = {
	title: string;
	/** Suppressed on the All tab, which shows no counts on the artboard. */
	count: number | null;
	data: ResultItem[];
};

export function buildSections(results: SearchResults, showCounts: boolean): ResultSection[] {
	const sections: ResultSection[] = [];

	if (results.people.length > 0) {
		sections.push({
			title: "People",
			count: showCounts ? results.people.length : null,
			data: results.people.map((person) => ({ type: "person", id: person.id, person })),
		});
	}

	if (results.meetups.length > 0) {
		sections.push({
			title: "Events",
			count: showCounts ? results.meetups.length : null,
			data: results.meetups.map((meetup) => ({ type: "meetup", id: meetup.id, meetup })),
		});
	}

	if (results.places.length > 0) {
		const kinds = new Set(results.places.map((place) => place.kind));
		const title = kinds.size === 1 && kinds.has("workspace") ? "Work Space" : "Places";

		sections.push({
			title,
			count: showCounts ? results.places.length : null,
			data: results.places.map((place) => ({ type: "place", id: place.id, place })),
		});
	}

	return sections;
}

export type ResultSectionsProps = {
	sections: ResultSection[];
	connectionFor: (id: string) => ConnectionState;
	joinStateFor: (id: string) => JoinState;
	onOpenPerson: (id: string) => void;
	onConnect: (id: string) => void;
	onOpenPlace: (id: string) => void;
	onOpenMeetup: (id: string) => void;
	onJoinMeetup: (id: string) => void;
	contentInset: number;
	ListHeaderComponent?: React.ComponentType | React.ReactElement | null;
	ListEmptyComponent?: React.ComponentType | React.ReactElement | null;
};

export function ResultSections({
	sections,
	connectionFor,
	joinStateFor,
	onOpenPerson,
	onConnect,
	onOpenPlace,
	onOpenMeetup,
	onJoinMeetup,
	contentInset,
	ListHeaderComponent,
	ListEmptyComponent,
}: ResultSectionsProps) {
	const renderItem: SectionListRenderItem<ResultItem, ResultSection> = ({ item }) => {
		if (item.type === "person") {
			return (
				<PersonRow
					connectionState={connectionFor(item.person.id)}
					onConnect={onConnect}
					onOpen={onOpenPerson}
					person={item.person}
				/>
			);
		}

		if (item.type === "place") {
			return <PlaceRow onOpen={onOpenPlace} place={item.place} />;
		}

		return (
			<MeetupCard
				hasJoined={joinStateFor(item.meetup.id) === "joined"}
				isJoining={joinStateFor(item.meetup.id) === "joining"}
				meetup={item.meetup}
				onJoin={onJoinMeetup}
				onOpen={onOpenMeetup}
			/>
		);
	};

	return (
		<SectionList
			ListEmptyComponent={ListEmptyComponent}
			ListHeaderComponent={ListHeaderComponent}
			contentContainerStyle={[styles.content, { paddingBottom: contentInset }]}
			keyExtractor={(item) => `${item.type}-${item.id}`}
			renderItem={renderItem}
			renderSectionHeader={({ section }) => (
				<View style={styles.sectionHeader}>
					<SectionHeader
						title={section.title}
						trailingText={
							section.count === null
								? undefined
								: `${section.count} result${section.count === 1 ? "" : "s"}`
						}
					/>
				</View>
			)}
			SectionSeparatorComponent={() => <View style={styles.sectionGap} />}
			sections={sections}
			showsVerticalScrollIndicator={false}
			stickySectionHeadersEnabled={false}
			style={styles.list}
		/>
	);
}

const styles = StyleSheet.create({
	list: {
		flex: 1,
	},
	content: {
		flexGrow: 1,
		gap: Gap.card,
		paddingHorizontal: Spacing.three,
		width: "100%",
		maxWidth: MaxColumnWidth,
		alignSelf: "center",
	},
	sectionHeader: {
		paddingTop: Spacing.two,
	},
	sectionGap: {
		height: Spacing.one,
	},
});
