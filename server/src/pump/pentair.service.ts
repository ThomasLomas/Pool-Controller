/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { PentairAction, PentairData } from './pentair.enum';

// With help from:
//    http://cocoontech.com/forums/topic/13548-intelliflow-pump-rs485-protocol/page-5
//    http://www.wolfteck.com/pool/

@Injectable()
export class PentairService {
  getPacketHeader() {
    return [255, 0, 255];
  }

  getPayloadHeader() {
    return [165, 0, 96, 33];
  }
  constructMessage(action: number, data: number[]) {
    /**
     * [ [PACKET_HEADER], PAYLOAD_HEADER, VERSION, DESTINATION, SOURCE, ACTION, DATA_LENGTH, [DATA], [CHECKSUM] ]
     */

    const actionAndData = [action, data.length].concat(data);
    const payloadAndActionAndData = []
      .concat(this.getPayloadHeader())
      .concat(actionAndData);

    const checkSumTotal = payloadAndActionAndData.reduce((a, b) => a + b);
    const checkSumBig = Math.floor(checkSumTotal / 256);
    // eslint-disable-next-line prettier/prettier
    const checkSumLittle = checkSumTotal - (checkSumBig * 256);

    return this.getPacketHeader()
      .concat(payloadAndActionAndData)
      .concat([checkSumBig, checkSumLittle]);
  }

  remoteControl(enable = true) {
    return this.constructMessage(PentairAction.REMOTE_CONTROL, [
      enable ? PentairData.REMOTE_CONTROL_ON : PentairData.REMOTE_CONTROL_OFF,
    ]);
  }

  togglePower(on = true) {
    return this.constructMessage(PentairAction.CHANGE_RUNNING_STATE, [
      on ? PentairData.REMOTE_CONTROL_ON : PentairData.RUNNING_STATE_OFF,
    ]);
  }

  setMode(mode = 1) {
    return this.constructMessage(PentairAction.SET_MODE, [
      PentairData[`PUMP_SPEED_${mode}`],
    ]);
  }

  getStatus() {
    return this.constructMessage(PentairAction.GET_STATUS, []);
  }

  parseStatus(response: number[]) {
    // Example:
    // [255, 0, 255, 165, 0, 33, 96,
    //   7, 15, 10, 0, 0, 2, 62, 7, 208, 0, 0, 0, 0, 2, 49, 15, 11,
    // 2, 170]

    // Remove packet header and payload header
    response.splice(0, 7);

    // Remove action and data length
    response.splice(0, 2);

    // Remove last two checksum
    response.splice(-2, 2);

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
      clockHour,
      clockMin,
    ] = response;

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
