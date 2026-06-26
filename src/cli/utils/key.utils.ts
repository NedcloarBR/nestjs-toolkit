import { randomBytes } from "node:crypto";
import type { ConfigService } from "../services";

export interface AddToEnvOptions {
	/** Key length in bytes (hex output is twice this). Defaults to 32. */
	length?: number;
	/** Target env file. Defaults to the configured envFilePath. */
	envFilePath?: string;
	/** Only write when the variable is missing or has an empty value. */
	ifEmpty?: boolean;
}

// biome-ignore lint/complexity/noStaticOnlyClass: Utils class
export class KeyUtils {
	public static genKey(length = 32) {
		return randomBytes(length).toString("hex");
	}

	public static addToEnv(
		key: string,
		configService: ConfigService,
		options: AddToEnvOptions = {},
	): boolean {
		const envFilePath =
			options.envFilePath ?? configService.readConfigFile().envFilePath;

		const envContent = configService.readFile(envFilePath).trimEnd();
		const lines = envContent.split("\n");
		const keyIndex = lines.findIndex((line) =>
			line.trim().startsWith(`${key}=`),
		);

		if (options.ifEmpty && keyIndex !== -1) {
			const current = lines[keyIndex].slice(lines[keyIndex].indexOf("=") + 1);
			if (current.trim().length > 0) return false;
		}

		const kv = `${key}=${KeyUtils.genKey(options.length)}`;
		if (keyIndex !== -1) {
			lines[keyIndex] = kv;
		} else {
			lines.push(kv);
		}

		let newEnvContent = lines.join("\n");
		if (envContent.endsWith("\n")) {
			newEnvContent += "\n";
		}
		configService.writeFile(envFilePath, newEnvContent);

		return true;
	}
}
