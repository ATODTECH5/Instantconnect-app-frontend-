import { SearchField } from "@/components/ui/search-field";

export type HomeSearchBarProps = {
	value: string;
	onChangeText: (value: string) => void;
	onSubmit: () => void;
	onOpenFilters: () => void;
};

export function HomeSearchBar(props: HomeSearchBarProps) {
	return (
		<SearchField
			{...props}
			accessibilityLabel="Search by categories and events"
			placeholder="Search by categories & events"
		/>
	);
}
