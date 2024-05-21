export async function getPackageName() {
	return (await import("../package.json")).name;
}
