// The core module, not the `Clipboard` export of "react-native": that getter
// logs a deprecation warning on every access. The module itself still ships
// in RN 0.86 (RCTClipboard is in CoreModules), so this needs no native
// rebuild. Move to expo-clipboard with the next batched native build.
import Clipboard from "react-native/Libraries/Components/Clipboard/Clipboard";

export function copyToClipboard(text: string): void {
	Clipboard.setString(text);
}
