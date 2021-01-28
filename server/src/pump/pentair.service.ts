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
     * [ [PACKET_HEADER], PAYLOAD_HEADER, VERSION, DESTINATION, SOURCE
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
}
