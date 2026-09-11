import AppTabs from "@/components/app-tabs";
import { useNotificationSocket } from "@/features/notifications/use-notification-socket";

export default function TabsLayout() {
	// Mounted here rather than on a screen: a notification is addressed to the
	// account, so the bell has to update on whichever tab is open.
	useNotificationSocket();

	return <AppTabs />;
}
