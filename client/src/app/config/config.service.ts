import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PoolConfig } from '../../../../server/src/interfaces/PoolConfig';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: PoolConfig | undefined;

  constructor(private httpClient: HttpClient) { }

  public load() {
    return this.httpClient.get<PoolConfig>('/api/config').toPromise().then(config => {
      this.config = config;
    });
  }

  public getConfig(): PoolConfig {
    if (this.config) {
      return this.config;
    }

    throw new Error('Config not loaded');
  }
}

export function initConfig(configService: ConfigService) {
  return () => configService.load();
}
