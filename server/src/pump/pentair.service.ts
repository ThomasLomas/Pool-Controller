/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/logger/logger.service';
import { Message, MessageDirection } from 'src/serial-port/message';
import { PentairAction, PentairData, PentairStatus } from './pentair.enum';

// With help from:
//    http://cocoontech.com/forums/topic/13548-intelliflow-pump-rs485-protocol/page-5
//    http://www.wolfteck.com/pool/

@Injectable()
export class PentairService {
  constructor(private loggerService: LoggerService) {
    this.loggerService.setContext(PentairService.name);
  }

  private constructMessage(
    action: number,
    data: number[],
    requiresResponse = true,
  ): Message {
    /**
     * [ [PACKET_HEADER], [PAYLOAD_HEADER, VERSION, DESTINATION, SOURCE], ACTION, DATA_LENGTH, [DATA], [CHECKSUM] ]
     */
    const packetHeader = [255, 0, 255];
    const payloadHeader = [165, 0, 96, 33];

    const actionAndData = [action, data.length].concat(data);
    const payloadAndActionAndData = []
      .concat(payloadHeader)
      .concat(actionAndData);

    const constructedPayload = packetHeader
      .concat(payloadAndActionAndData)
      .concat(this.getChecksum(payloadAndActionAndData));

    return new Message(
      constructedPayload,
      requiresResponse,
      MessageDirection.OUTBOUND,
    );
  }

  getChecksum(data: number[]): number[] {
    const checkSumTotal = data.reduce((a, b) => a + b);
    const checkSumBig = Math.floor(checkSumTotal / 256);
    const checkSumLittle = checkSumTotal - (checkSumBig * 256);

    return [checkSumBig, checkSumLittle];
  }

  remoteControl(enable = true): Message {
    this.loggerService.debug(`Generated message: remoteControl(${enable})`);
    return this.constructMessage(PentairAction.REMOTE_CONTROL, [
      enable ? PentairData.REMOTE_CONTROL_ON : PentairData.REMOTE_CONTROL_OFF,
    ]);
  }

  togglePower(on = true): Message {
    this.loggerService.debug(`Generated message: togglePower(${on})`);

    return this.constructMessage(PentairAction.CHANGE_RUNNING_STATE, [
      on ? PentairData.RUNNING_STATE_ON : PentairData.RUNNING_STATE_OFF,
    ]);
  }

  setMode(mode = 1): Message {
    this.loggerService.debug(`Generated message: setMode(${mode})`);

    return this.constructMessage(PentairAction.SET_MODE, [
      PentairData[`PUMP_SPEED_${mode}`],
    ]);
  }

  getStatus(): Message {
    this.loggerService.debug(`Generated message: getStatus()`);

    return this.constructMessage(PentairAction.GET_STATUS, [], true);
  }

  parseStatus(response: Message): PentairStatus {
    // Example:
    //  [255,0,255,165,0,33,96,7,15,4,0,255,0,0,0,0,0,0,0,0,0,0,18,48,2,129]

    // Remove packet header and payload header
    response.data.splice(0, 7);

    // Remove action and data length
    response.data.splice(0, 2);

    // Remove last two checksum
    response.data.splice(-2, 2);

    // We are left with the data
    const [
      run,
      mode,
      driveState,
      wattsHigh,
      wattsLow,
      rpmHigh,
      rpmLow,
      timerHour,
      timerMin,

      dunno,
      dunno2,
      dunno3,
      dunno4,

      clockHour,
      clockMin,
    ] = response.data;

    return {
      isRunning: run === PentairData.RUNNING_STATE_ON,
      watts: wattsHigh * 256 + wattsLow,
      rpm: rpmHigh * 256 + rpmLow,
      timerHour,
      timerMin,
      clockHour,
      clockMin,
    };
  }
}
