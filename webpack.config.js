/* global __dirname */
const webpack = require("webpack");
const path = require("path");
const entry = require("webpack-glob-entry");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const FriendlyErrorsPlugin = require("friendly-errors-webpack-plugin");
const StyleLintPlugin = require("stylelint-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

function recursiveIssuer(m) {

	if (m.issuer) {
		return recursiveIssuer(m.issuer);
	} else if (m.name) {
		return m.name;
	} else {
		return false;
	}
}

let compiledPath = "../../compiled/";

module.exports = {
	mode: "production",
	entry: {
		"main.js": [
			"./src/js/main.js"
		],
		"../../compiled/init": [
			"./src/css/critical/init.scss"
		],
		"../../compiled/main": [
			"./src/css/main.scss"
		]
	},
	output: {
		path: path.resolve(__dirname, "theme/assets/"),
		filename: "[name]",
		chunkFilename: compiledPath + "[id].chunk"
	},
	resolve: {
		extensions: [".webpack.js", ".web.js", ".js", ".jsx", ".js.liquid"]
	},
	optimization: {
		splitChunks: {
			cacheGroups: {
				init: {
					name: "_init.css",
					test: (m,c,entry = "../../compiled/init") => m.constructor.name === "CssModule" && recursiveIssuer(m) === entry,
					chunks: "initial",
					enforce: true
				},
				main: {
					name: "_main.css",
					test: (m,c,entry = "../../compiled/main") => m.constructor.name === "CssModule" && recursiveIssuer(m) === entry,
					chunks: "initial",
					enforce: true
				},
				default: false
			}
		},
		minimizer: [
			new UglifyJsPlugin({
				test: [
					/\.js$/i,
					/\.js.liquid$/i
				],
				sourceMap: false,
				uglifyOptions: {
					ecma: 8,
					compress: {
						warnings: false
					}
				}
			}),
			new OptimizeCssAssetsPlugin({
				assetNameRegExp: /\.css$/i,
				cssProcessor: require("cssnano"),
				cssProcessorOptions: {
					preset: [
						"advanced",
						{
							autoprefixer: {
								add: true
							},
							reduceIdents: false,
							zindex: {
								exclude: false
							}
						}
					]
				}
			})
		]
	},
	node: {
		fs: 'empty'
	},
	module: {
 		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: [
					{
						loader: "babel-loader",
						options: {
							presets: [
								[
									"@babel/preset-env"
								],
								[
									"@babel/preset-react"
								]
							],
							plugins: [
								[
									"@babel/plugin-proposal-decorators", {
										"legacy": true
									}
								],
								[
									"@babel/plugin-syntax-dynamic-import"
								],
								[
									"@babel/plugin-proposal-class-properties", {
										"loose": true
									}
								],
								[
									"@babel/plugin-transform-runtime", {
										"regenerator": true
									}
								]
							]
						}
					},
					{
						loader: "eslint-loader"
					}
		        ]
			},
			{
				test: /\.(png|woff|woff2|eot|ttf|svg)$/,
				loader: "url-loader?limit=100000"
			},
			{
				test: /\.(sa|sc|c)ss$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: "css-loader",
						options: {
							importLoaders: 1,
							minimize: true
						}
					},
					{
						loader: "postcss-loader",
						options: {
							config: {
								path: path.resolve(__dirname, "./postcss.config.js")
							}
						}
					},
					{
						loader: "sass-loader"
					}
				]
			}
		]
	},
	plugins: [
		new CleanWebpackPlugin({
			cleanStaleWebpackAssets: false,
			cleanAfterEveryBuildPatterns: [
				path.join(__dirname, "compiled")
			]
		}),
		new MiniCssExtractPlugin({
			filename: "[name]"
		}),
		new CopyWebpackPlugin([
			{
				from: path.join(__dirname, "src/models/*"),
				to: path.join(__dirname, "theme/assets/[name].glb"),
				force: true,
				ignore: [
					".gitkeep"
				]
			},
			{
				from: path.join(__dirname, "src/fonts"),
				to: path.join(__dirname, "theme/assets"),
				force: true,
				ignore: [
					".gitkeep"
				]
			},
			{
				from: path.join(__dirname, "src/js/_worker/workers/image-load.js"),
				to: path.join(__dirname, "theme/assets/[name].js.liquid"),
				force: true,
				ignore: [
					".gitkeep"
				]
			},
			{
				from: path.join(__dirname, "src/css/_fonts.css.liquid"),
				to: path.join(__dirname, "theme/assets"),
				force: true,
				ignore: [
					".gitkeep"
				]
			},
			{
				from: path.join(__dirname, "src/js/skio-plan-picker.js"),
				to: path.join(__dirname, "theme/assets/[name].js"),
				force: true,
				ignore: [
					".gitkeep"
				]
			}
		]),
		new StyleLintPlugin(),
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
		new webpack.NoEmitOnErrorsPlugin(),
		new FriendlyErrorsPlugin()
	]
};
