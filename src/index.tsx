import { Ecs } from "ecs";
import { SpriteRenderer, Transform } from "ecs/components";

// craeate an entity
const entity = Ecs.addEntity();

// add components Transform (This will move the component to the Transform arch buffers)
entity.addComponent(Transform);

// get the component from the arch buffer
let transform = entity.getComponent(Transform);

transform.isStatic = true;

transform.position.x = 1;
transform.position.y = 2;

transform.rotation.x = 4;
transform.rotation.y = 5;

transform.scale.x = 7;
transform.scale.y = 8;

// flush the binary data back to its buffer
entity.flushComponent(transform);

// add another component (Which will move/copy all the data to the [Transform + SpriteRenderer] arch) 
entity.addComponent(SpriteRenderer);

// again get the component since it has changed arches
transform = entity.getComponent(Transform);

console.log(transform); // if correct, all the properties should be the same as from line 14 till 23
