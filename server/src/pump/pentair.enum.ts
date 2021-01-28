export enum PentairAction {
  SET = 1,
  GET = 2,
  REMOTE_CONTROL = 4,
  SET_MODE = 5,
  CHANGE_RUNNING_STATE = 6,
  GET_STATUS = 7,
}

export enum PentairData {
  PUMP_SPEED_1 = 2,
  PUMP_SPEED_2 = 3,
  PUMP_SPEED_3 = 4,
  PUMP_SPEED_4 = 5,
  REMOTE_CONTROL_ON = 255,
  REMOTE_CONTROL_OFF = 0,
  RUNNING_STATE_ON = 10,
  RUNNING_STATE_OFF = 4,
}
