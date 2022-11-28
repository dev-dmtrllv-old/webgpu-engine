import { ConfigManager } from "./ConfigManager";
import { SubSystem } from "./SubSystem";

@SubSystem.dependencies([ConfigManager])
export class SceneManager extends SubSystem
{
	protected async initialize(): Promise<void>
	{

	}
}