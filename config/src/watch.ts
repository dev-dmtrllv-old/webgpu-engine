import { spawn } from "child_process";
import Find from "find-process";
import readline from "readline";

import * as Electron from "./electron";
import { exec } from "./utils";
import { watch } from "./webpack";
import * as Paths from "./paths";

let proc = null;

const kill = async () =>
{
	let processes = await Find("name", "electron");
	processes = processes.filter((p: any) => p.bin === Paths.electronExec);
	while (processes.length > 0)
	{
		processes.forEach(p =>
		{
			try
			{
				process.kill(p.pid);
			}
			catch (e)
			{
				console.log("Failed to kill process", p.pid, "at", (p as any).bin);
			}
		});

		processes = await Find("name", "electron");
		processes = processes.filter((p: any) => p.bin === Paths.electronExec);
	}
	proc = null;
}

const restartApp = async () =>
{
	if (proc)
	{
		console.log("Restarting app...");
		await kill();
	}
	else
	{
		console.log("Starting app...");
	}

	proc = spawn(Paths.electronExec, ["--dev"], {
		stdio: "inherit"
	});
}


const onMainChange = async () =>
{
	await restartApp();
}

const onRendererChange = async () =>
{
	if (!proc)
		await restartApp();
}

exec(async () => 
{
	await kill();
	await Electron.setup();
	watch(onMainChange, onRendererChange);
});


if (process.platform === "win32")
{
	const rl = readline.createInterface(process.stdin);

	rl.on("SIGINT", () => process.emit("SIGINT"));
}

process.on("SIGINT", async () =>
{
	await kill();
	process.exit();
});