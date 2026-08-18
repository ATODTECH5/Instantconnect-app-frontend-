import { TabList, TabSlot, TabTrigger, Tabs } from "expo-router/ui";
import { StyleSheet } from "react-native";

import ChatIcon from "@/assets/tabs/chat.svg";
import ConnectionIcon from "@/assets/tabs/connection.svg";
import DiscoverIcon from "@/assets/tabs/discover.svg";
import HomeIcon from "@/assets/tabs/home.svg";
import ProfileIcon from "@/assets/tabs/profile.svg";
import { NavBar } from "@/components/nav/nav-bar";
import { NavTab } from "@/components/nav/nav-tab";

export default function AppTabs() {
	return (
		<Tabs>
			<TabSlot style={styles.slot} />

			<TabList asChild>
				<NavBar>
					<TabTrigger asChild href="/" name="index">
						<NavTab Icon={HomeIcon} label="Home" />
					</TabTrigger>

					<TabTrigger asChild href="/discover" name="discover">
						<NavTab Icon={DiscoverIcon} label="Discover" />
					</TabTrigger>

					<TabTrigger asChild href="/chat" name="chat">
						<NavTab Icon={ChatIcon} floating label="Messages" />
					</TabTrigger>

					<TabTrigger asChild href="/connection" name="connection">
						<NavTab Icon={ConnectionIcon} label="Connection" />
					</TabTrigger>

					<TabTrigger asChild href="/profile" name="profile">
						<NavTab Icon={ProfileIcon} label="Profile" />
					</TabTrigger>
				</NavBar>
			</TabList>
		</Tabs>
	);
}

const styles = StyleSheet.create({
	slot: {
		flex: 1,
		minHeight: 0,
	},
});
