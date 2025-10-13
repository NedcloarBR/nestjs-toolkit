import fs from "node:fs/promises";
import path from "node:path";

async function main() {
	const distIndex = path.resolve("dist/src/index.d.ts");
	const globalTypesPath = "../../typings/global.d.ts";
	const referenceLine = `/// <reference path="${globalTypesPath}" />`;

	try {
		let content = await fs.readFile(distIndex, "utf8");

		if (!content.includes(referenceLine)) {
			content = `${referenceLine}\n${content}`;
			await fs.writeFile(distIndex, content, "utf8");
			console.log("✅ Added global reference to dist/src/index.d.ts");
		} else {
			console.log("ℹ️ Global reference already present in dist/src/index.d.ts");
		}
	} catch (err) {
		console.error("❌ Failed to update dist/src/index.d.ts:", err);
		process.exit(1);
	}
}

main();
