import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { map } from 'rxjs/operators';
import { ConfigService } from 'src/config/config.service';
import { ItemState } from 'src/interfaces/PoolConfig';
import { OutputDeletedEvent, OutputUpdatedEvent } from 'src/item/item.event';
import { LoggerService } from 'src/logger/logger.service';
import { SerialPortService } from 'src/serial-port/serial-port.service';
import { PentairService } from './pentair.service';

@Injectable()
export class PumpService {
  constructor(
    private loggerService: LoggerService,
    private serialPortService: SerialPortService,
    private pentairService: PentairService,
    private configService: ConfigService,
  ) {
    this.loggerService.setContext(PumpService.name);
  }

  private queuedPumpUpdate = false;

  private handlePumpUpdates(itemId: string) {
    const pumpConfig = this.configService
      .getConfig()
      .items.find((i) => i.id === itemId);

    // Can only be one
    const onOutput = pumpConfig.outputs.find((o) => o.state === ItemState.ON);

    if (onOutput) {
      this.serialPortService
        .write(this.pentairService.remoteControl(true))
        .pipe(
          map(() =>
            this.serialPortService.write(
              this.pentairService.setMode(onOutput.pumpMode),
            ),
          ),
          map(() =>
            this.serialPortService.write(this.pentairService.togglePower(true)),
          ),
        )
        .subscribe(
          () => {
            this.loggerService.log(
              `Output ${onOutput.name} on pump mode ${onOutput.pumpMode} now turned on`,
            );
            this.queuedPumpUpdate = false;
          },
          (err) => {
            this.loggerService.error(
              `Encountered error: ${JSON.stringify(err)}`,
            );
            this.queuedPumpUpdate = false;
          },
        );
    } else {
      this.loggerService.log(
        'No pump outputs turned on, proceeding to shut off',
      );

      this.serialPortService
        .write(this.pentairService.remoteControl(true))
        .pipe(
          // Pressing stop twice kicks it back to any scheduled mode
          map(() =>
            this.serialPortService.write(
              this.pentairService.togglePower(false),
            ),
          ),
          map(() =>
            this.serialPortService.write(
              this.pentairService.togglePower(false),
            ),
          ),
          map(() =>
            this.serialPortService.write(
              this.pentairService.togglePower(true),
            ),
          ),
          map(() =>
            this.serialPortService.write(
              this.pentairService.remoteControl(false),
            ),
          ),
        )
        .subscribe(
          () => {
            this.loggerService.log('All outputs shut down');
            this.queuedPumpUpdate = false;
          },
          (err) => {
            this.loggerService.error(
              `Encountered error: ${JSON.stringify(err)}`,
            );
            this.queuedPumpUpdate = false;
          },
        );
    }
  }

  @OnEvent('output.deleted.pump')
  handleOutputDeleted(payload: OutputDeletedEvent): void {
    if (payload.output.state === ItemState.OFF) {
      this.loggerService.log(
        `Output ${payload.output.name} was already turned off`,
      );
      return;
    }

    // @todo Handle output being deleted
  }

  @OnEvent('output.updated.pump')
  handleOutputUpdated(payload: OutputUpdatedEvent): void {
    this.loggerService.log(
      `Output ${payload.newOutput.name} now ${payload.newOutput.state} (was ${payload.oldOutput.state})`,
    );

    // Pump we need to buffer and flush to avoid spamming the pumps message bus
    if (!this.queuedPumpUpdate) {
      this.queuedPumpUpdate = true;
      this.loggerService.log('Queued a pump update');
      setTimeout(() => {
        this.handlePumpUpdates(payload.item.id);
      }, 5000);
    } else {
      this.loggerService.log('Pump update already underway');
    }
  }
}
