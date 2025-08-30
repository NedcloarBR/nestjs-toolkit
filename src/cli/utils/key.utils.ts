import { randomBytes } from "node:crypto";
import type { ConfigService } from "../services";

// biome-ignore lint/complexity/noStaticOnlyClass: Utils class
export class KeyUtils {
	public static genKey() {
		return randomBytes(32).toString("hex");
	}

	public static addToEnv(key: string, configService: ConfigService) {
		const kv = `${key}=${KeyUtils.genKey()}`;

		const envContent = configService
			.readFile(configService.readConfigFile().envFilePath)
			.trimEnd();
		const lines = envContent.split("\n");

		const keyIndex = lines.findIndex((line) => line.trim().startsWith(key));

		if (keyIndex !== -1) {
			lines[keyIndex] = kv;
		} else {
			lines.push(kv);
		}

		let newEnvContent = lines.join("\n");
		if (envContent.endsWith("\n")) {
			newEnvContent += "\n";
		}
		configService.writeFile(
			configService.readConfigFile().envFilePath,
			newEnvContent,
		);
	}
}
