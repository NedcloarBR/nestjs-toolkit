import { Question, QuestionSet } from "nest-commander";

@QuestionSet({ name: "recreate" })
export class RecreateQuestion {
	@Question({
		name: "recreate",
		message: "Config file already exists. Do you want to recreate it?",
		type: "confirm",
		default: false,
	})
	public parseRecreate(value: boolean) {
		return value;
	}
}
