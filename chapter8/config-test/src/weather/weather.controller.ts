import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('weather')
export class WeatherController {
  constructor(private configService: ConfigService) {}

  @Get()
  public getWeather(): string {
    const apiUrl = this.configService.get('WEATHER_API_URL');
    const apiKey = this.configService.get('WEATHER_API_KEY');

    // 날씨 API 호출
    return this.callWheatherApi(apiUrl, apiKey);
  }

  private callWheatherApi(apiUrl: string, apiKey: string): string {
    console.log('날씨 정보 가져오는 중...');
    console.log(apiUrl);
    console.log(apiKey);
    return '내일은 맑음';
  }
}
