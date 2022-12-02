import CopyPlugin from "copy-webpack-plugin";
import * as webpack from "webpack";
import * as Paths from "./paths";
import { loaders, moduleResolver } from "./webpack.shared";

export default (dev: boolean = true): webpack.Configuration => 
{
	return {
		name: "Main",
		mode: dev ? "development" : "production",
		entry: Paths.resolve(Paths.src, "main/index.ts"),
		devtool: "inline-source-map",
		stats: "minimal",
		target: "electron-main",
		module: {
			rules: [
				loaders.ts
			],
		},
		resolve: moduleResolver,
		output: {
			filename: "[name].bundle.js",
			chunkFilename: "[id].chunk.js",
			path: Paths.resolve(Paths.electronAppFolder),
		},
		plugins: [
			new CopyPlugin({
				patterns: [
					{
						from: "package.json"
					},
				],
			})
		],
		experiments: {
			topLevelAwait: true,
		}
	};
}