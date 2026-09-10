import { Module } from "@nestjs/common";
import * as Commands from "./cli/commands/index.js";
import * as Questions from "./cli/questions/index.js";
import * as Services from "./cli/services/index.js";

const CommandsMap = Object.values(Commands);
const ServicesMap = Object.values(Services);
const QuestionsMap = Object.values(Questions);

@Module({
	providers: [...CommandsMap, ...ServicesMap, ...QuestionsMap],
})
export class CLIModule {}
