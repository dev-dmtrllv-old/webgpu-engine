const path = require("path");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
	mode: "development",
	entry: "./src/index.tsx",
	devtool: "inline-source-map",
	stats: "minimal",
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
			{
				test: /\.s[ac]ss$/i,
				use: [
					// "style-loader",
					MiniCssExtractPlugin.loader,
					"css-loader",
					{
						loader: "resolve-url-loader",
						options: {

						}
					},
					{
						loader: "sass-loader",
						options: {
							sourceMap: true
						}
					}
				],
			},
			{
				test: /\.wgsl$/i,
				use: "raw-loader"
			}
		],
	},
	resolve: {
		extensions: [".tsx", ".ts", ".jsx", ".js"],
		plugins: [
			new TsconfigPathsPlugin()
		]
	},
	output: {
		filename: "js/[name].bundle.js",
		chunkFilename: "js/[id].chunk.js",
		path: path.resolve(__dirname, "dist"),
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve("./public/index.html")
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
	devServer: {
		static: {
			directory: path.join(__dirname, "public"),
		},
		compress: true,
		port: 3002,
		client: {
			overlay: false,
			logging: "none",
			progress: false,
		},
		liveReload: true,
		hot: false,
		devMiddleware: {
			writeToDisk: true
		}
	},
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
};