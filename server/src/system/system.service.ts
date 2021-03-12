import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { Observable } from 'rxjs';

@Injectable()
export class SystemService {
  restartApp(): void {
    process.exit(1);
  }

  restartServer(): Observable<string> {
    return new Observable((subscriber) => {
      exec('sudo shutdown -r now', (error, out) => {
        if (error) {
          subscriber.error(error);
        } else {
          subscriber.next(out);
          subscriber.complete();
        }
      })
    });
  }
}
