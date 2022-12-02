import * as fs from "fs";
import * as asyncFs from "fs/promises";
import * as unzipper from "unzipper";
import * as ElectronGet from "@electron/get";
import { getPackageVersion } from "./config";
import * as Paths from "./paths";

export const setup = () => new Promise<void>(async (res) => 
{
	console.log("Setting up electron build...");
	const zipPath = await ElectronGet.download(getPackageVersion("electron"));

	fs.createReadStream(zipPath).pipe(unzipper.Extract({ path: Paths.build })).on("close", async () => 
	{
		await Promise.all([
			asyncFs.unlink(Paths.electronAsar),
			asyncFs.mkdir(Paths.electronAppFolder, { recursive: true })
		]);
		console.log("Done!");
		res();
	});
});