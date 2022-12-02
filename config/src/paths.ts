import * as path from "path";

export const root = path.resolve(__dirname, "../..");

export const resolve = (...parts: string[]) => path.resolve(root, ...parts);

export const src = resolve("src");
export const config = resolve("config");
export const build = resolve("build"); 
export const npmPackage = resolve("package.json");
export const electronAsar = resolve(build, "resources", "default_app.asar");
export const electronAppFolder = resolve(build, "resources", "app");
export const publicSrc = resolve("public");
export const electronExec = resolve(build, "electron.exe");