import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { flatMap, map } from 'rxjs/operators';
import { ItemOutput, ItemState, PoolItem } from 'src/interfaces/PoolConfig';
import { OutputDeletedEvent, OutputUpdatedEvent } from 'src/item/item.event';
import { ItemService } from 'src/item/item.service';
import { LoggerService } from 'src/logger/logger.service';
import { SerialPortService } from 'src/serial-port/serial-port.service';
import { PentairService } from './pentair.service';

@Injectable()
export class PumpService {
  constructor(
    private loggerService: LoggerService,
    private serialPortService: SerialPortService,
    private pentairService: PentairService,
    private itemService: ItemService,
  ) { }

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

    if (payload.newOutput.state === ItemState.ON) {
      this.serialPortService
        .write(this.pentairService.remoteControl(true))
        .pipe(
          map(() =>
            this.serialPortService.write(
              this.pentairService.setMode(payload.newOutput.pumpMode),
            ),
          ),
          map(() =>
            this.serialPortService.write(this.pentairService.togglePower(true)),
          ),
          map(() =>
            this.serialPortService.write(
              this.pentairService.remoteControl(false),
            ),
          ),
        )
        .subscribe(() => {
          this.loggerService.log(
            `Output ${payload.newOutput.name} on pump mode ${payload.newOutput.pumpMode} now turned on`,
          );
        });
    } else {
      // Probably a cleaner way to do this, but want to ensure I have the latest at this point...
      const item: PoolItem = this.itemService.getItem(payload.item.id);
      const onOutputs: ItemOutput[] = item.outputs.filter(
        (output) => output.state === ItemState.ON,
      );

      if (onOutputs.length === 0) {
        this.loggerService.log(
          'No pump outputs turned on, proceeding to shut off',
        );

        this.serialPortService
          .write(this.pentairService.remoteControl(true))
          .pipe(
            map(() =>
              this.serialPortService.write(
                this.pentairService.togglePower(false),
              ),
            ),
            map(() =>
              this.serialPortService.write(
                this.pentairService.remoteControl(false),
              ),
            ),
          )
          .subscribe(() => {
            this.loggerService.log('All outputs shut down');
          });
      } else {
        this.loggerService.log('Skipping turn off as an output is still on');
      }
    }
  }
}
