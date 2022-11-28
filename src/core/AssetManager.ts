import { ConfigManager } from "./ConfigManager";
import { SubSystem } from "./SubSystem";

@SubSystem.dependencies([ConfigManager])
export class AssetManager extends SubSystem
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