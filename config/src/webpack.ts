import webpack from "webpack";
import webpackMain from "./webpack.main";
import webpackRenderer from "./webpack.renderer";

export const watch = (onMainChange: () => any, onRendererChange: () => any) =>
{
	const isDoneFlags = [false, false];

	const isAllCompiled = () => isDoneFlags[0] && isDoneFlags[1];

	webpack(webpackMain(true)).watch({ ignored: ["package.json", "config", "build"] }, (err, stats) => 
	{
		isDoneFlags[0] = true;

		if (err)
			console.error(err);

		if (stats)
		{
			console.log("");
			console.log(stats.toString("minimal"));
		}

		if (isAllCompiled())
			onMainChange();
	});

	webpack(webpackRenderer(true)).watch({ ignored: ["package.json", "config", "build"] }, (err, stats) => 
	{
		isDoneFlags[1] = true;

		if (err)
			console.error(err);

		if (stats)
		{
			console.log("");
			console.log(stats.toString("minimal"));
		}

		if (isAllCompiled())
			onRendererChange();
	});
}

export const build = () =>
{

}