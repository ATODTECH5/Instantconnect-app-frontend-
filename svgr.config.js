/**
 * Several card SVGs render inside the same document. SVGO's default id
 * minification renames every file's pattern and gradient ids to "a", so the
 * duplicates collide and every card paints the first file's image fill.
 * `cleanupIds` is disabled and ids are namespaced per file instead.
 *
 * react-native-svg-transformer spreads this over its defaults, so `svgoConfig`
 * replaces the default plugin list wholesale and has to restate it.
 */
module.exports = {
	native: true,
	plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
	svgoConfig: {
		plugins: [
			{
				name: "preset-default",
				params: {
					overrides: {
						inlineStyles: { onlyMatchedOnce: false },
						removeViewBox: false,
						removeUnknownsAndDefaults: false,
						convertColors: false,
						cleanupIds: false,
					},
				},
			},
			{ name: "prefixIds", params: { delim: "_" } },
		],
	},
};
