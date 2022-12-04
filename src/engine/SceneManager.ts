import { TransformType } from "./components/Transform";
import { SubSystem } from "./SubSystem";

export class SceneManager extends SubSystem
{
	public initialize()
	{
		this.engine.ecs.registerSystem([this.engine.ecs.getComponent(TransformType)], (arches) => 
		{
			arches.forEach(arch => 
			{
				
			});
		});
	}
}