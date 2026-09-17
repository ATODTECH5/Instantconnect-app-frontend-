// The module's own typings declare a named `Clipboard`, but the runtime file
// only has a default export. This adds the default the typings left out.
declare module "react-native/Libraries/Components/Clipboard/Clipboard" {
	const Clipboard: { setString(content: string): void; getString(): Promise<string> };
	export default Clipboard;
}
