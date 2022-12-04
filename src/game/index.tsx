import { Engine } from "engine/Engine";

const engine = await Engine.initialize(3);

const glob = global as any;

glob.engine = engine;