import { Module } from "@nestjs/common";
import * as Commands from "./cli/commands";
import * as Questions from "./cli/questions";
import * as Services from "./cli/services";

const CommandsMap = Object.values(Commands);
const ServicesMap = Object.values(Services);
const QuestionsMap = Object.values(Questions);

@Module({
	providers: [...CommandsMap, ...ServicesMap, ...QuestionsMap],
})
export class AppModule {}
