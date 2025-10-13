import fs from "node:fs";
import path from "node:path";
import { Project } from "ts-morph";

const helpersDir = path.resolve(__dirname, "../src/helpers");
const outputTypesFile = path.resolve(
	__dirname,
	"../src/helpers/helpers.types.ts",
);
const outputGlobalFile = path.resolve(__dirname, "../typings/global.d.ts");

async function main() {
	const files = (await fs.promises.readdir(helpersDir)).filter((f) =>
		f.endsWith(".helpers.ts"),
	);

	// ---------- Generate HelperCategory Enum ----------
	const categories = files.map((f) => f.replace(".helpers.ts", ""));
	const enumEntries = categories
		.map((c) => `  ${c.toUpperCase()} = "${c}",`)
		.join("\n");

	const enumContent = `/**
 * This file is auto-generated.
 * DO NOT EDIT MANUALLY — run "yarn generate:helpers" to refresh.
 */

export enum HelperCategory {
${enumEntries}
}

export const HELPER_CATEGORIES = Object.values(HelperCategory);
`;

	await fs.promises.writeFile(outputTypesFile, enumContent, "utf-8");
	console.log(
		`✅ Generated helpers.types.ts with ${categories.length} categories.`,
	);

	// ---------- Generate global.d.ts ----------
	let globalContent = `/**
 * AUTO-GENERATED FILE.
 * Global helper function declarations.
 * Run "yarn generate:helpers" to update automatically.
 */

declare global {\n`;

	const project = new Project({
		tsConfigFilePath: path.resolve(__dirname, "../tsconfig.json"),
	});

	for (const file of files) {
		const filePath = path.join(helpersDir, file);
		const sourceFile = project.addSourceFileAtPath(filePath);

		for (const func of sourceFile.getFunctions()) {
			if (!func.isExported()) continue;

			const name = func.getName();
			if (!name) continue;

			const docs = func
				.getJsDocs()
				.map((d) => d.getText())
				.join("\n");

			const returnType = func.getReturnType().getText(func);
			const params = func
				.getParameters()
				.map((p) => `${p.getName()}: ${p.getType().getText(p)}`)
				.join(", ");

			globalContent += `\n${docs ? `  ${docs.replace(/\n/g, "\n  ")}` : ""}
  function ${name}(${params}): ${returnType};
`;
		}
	}

	globalContent += `}\n\nexport {};\n`;

	await fs.promises.writeFile(outputGlobalFile, globalContent, "utf-8");
	console.log(`✅ Generated global.d.ts with all helper declarations.`);
}

main().catch(console.error);
