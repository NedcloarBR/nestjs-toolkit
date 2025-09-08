import fs from "node:fs";
import path from "node:path";
import { Injectable } from "@nestjs/common";
import { ConfigNotExistsError } from "../errors";
import type { ConfigFile } from "../types/config";

@Injectable()
export class ConfigService {
	public existConfigFile(): boolean {
		const configFile = this.getConfigFile();
		return fs.existsSync(configFile);
	}

	public getConfigFile(): string {
		return path.join(process.cwd(), "nestjs-toolkit.json");
	}

	public createConfigFile(config: ConfigFile): void {
		const configFile = this.getConfigFile();
		fs.writeFileSync(configFile, JSON.stringify(config, null, 2), "utf-8");
	}

	public readConfigFile(): ConfigFile {
		if (this.existConfigFile()) {
			return JSON.parse(this.readFile(this.getConfigFile()));
		}
		throw new ConfigNotExistsError();
	}

	public readFile(filePath: string): string {
		return fs.readFileSync(filePath, "utf-8");
	}

	public writeFile(filePath: string, content: string): void {
		fs.writeFileSync(filePath, content, "utf-8");
	}
}
