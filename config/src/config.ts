import * as Paths from "./paths";

export const getConfig = (path: string) => require(path);

export const getPackage = (): Pkg => require(Paths.npmPackage);

const parseVersion = (version: string) => version.replace("^", "");

export const getPackageVersion = (dependencyName: string) =>
{
	const pkg = getPackage();
	const version = pkg.dependencies[dependencyName] || pkg.devDependencies[dependencyName];
	if(!version)
		throw new Error(`Could not get version for ${dependencyName}!`);
	return parseVersion(version);
}

type Pkg = {
	name: string;
	dependencies: {
		[key: string]: string;
	};
	devDependencies: {
		[key: string]: string;
	};
}