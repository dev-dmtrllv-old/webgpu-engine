import * as webpack from "webpack";
import * as Paths from "./paths";
import { loaders, moduleResolver } from "./webpack.shared";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";

export default (dev: boolean = true): webpack.Configuration => 
{
	return {
		name: "Renderer",
		mode: dev ? "development" : "production",
		entry: Paths.resolve(Paths.src, "game/index.tsx"),
		devtool: "inline-source-map",
		stats: "minimal",
		target: "electron-renderer",
		module: {
			rules: [
				loaders.ts,
				loaders.css,
				loaders.shaders
			],
		},
		resolve: moduleResolver,
		output: {
			filename: "js/[name].bundle.js",
			chunkFilename: "js/[id].chunk.js",
			path: Paths.resolve(Paths.electronAppFolder, "public"),
		},
		plugins: [
			new HtmlWebpackPlugin({
				template: Paths.resolve(Paths.publicSrc, "index.html")
			}),
			new CopyPlugin({
				patterns: [
					{
						from: "public",
						globOptions: {
							ignore: [
								"**/index.html"
							]
						}
					},
				],
			}),
		],
		optimization: {
			splitChunks: {
				chunks: "all",
				cacheGroups: {
					vendor: {
						test: /[\\/]node_modules[\\/]/,
						name: "vendors",
						chunks: "all"
					}
				}
			},
		},
		experiments: {
			topLevelAwait: true,
		}
	};
}