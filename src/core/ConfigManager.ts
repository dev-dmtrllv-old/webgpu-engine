import { SubSystem } from "./SubSystem";

export class ConfigManager extends SubSystem
{
	protected async initialize(config: {}): Promise<void>
	{
		console.log("init", this);
	}
	
	protected async terminate(): Promise<void>
	{
		console.log("terminate", this);
	}
}