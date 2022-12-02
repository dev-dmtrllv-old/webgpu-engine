import * as webpack from "webpack";
import * as MiniCssExtractPlugin from "mini-css-extract-plugin";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";

export const loaders = {
	ts: {
		test: /\.tsx?$/,
		use: "ts-loader",
		exclude: /node_modules/,
	},
	css: {
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
	shaders: {
		test: /\.wgsl$/i,
		use: "raw-loader"
	}
};

export const moduleResolver: webpack.ResolveOptions = {
	extensions: [".tsx", ".ts", ".jsx", ".js"],
	plugins: [
		new TsconfigPathsPlugin()
	]
};