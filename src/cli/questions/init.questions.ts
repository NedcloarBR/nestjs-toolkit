import { Question, QuestionSet } from "nest-commander";

@QuestionSet({ name: "init" })
export class InitQuestions {
	@Question({
		name: "envFilePath",
		message: "Path to the .env file",
		default: ".env",
	})
	public parseEnvPath(value: string) {
		return value;
	}
}
