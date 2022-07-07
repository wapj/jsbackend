import { Controller, Dependencies, Get, Redirect } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
@Dependencies(AppService)
export class AppController {
  constructor(appService) {
    this.appService = appService;
  }

  @Get()
  @Redirect("/board", 301)
  getHello() {
    return this.appService.getHello();
  }
}
