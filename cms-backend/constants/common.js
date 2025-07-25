//Users Role
const member_role = {
  SUPER_ADMIN: 1,
  FRONT_DESK: 2,
  TECHNICIAN_LEAD: 3,
  TECHNICIAN: 4,
  MAID_SUPERVISOR: 5,
  MAID: 6,
};

const guest_check_status = {
  CHECK_OUT: 0,
  CHECK_IN: 1,
};

const guest_presence_status = {
  GUEST_OUT: 0, //Guest_Absent
  GUEST_IN: 1, //Guest_Present
};

const cleaning_status = {
  DIRTY_VACANT: 1,
  DIRTY_OCCUPIED: 2,
  CLEAN_VACANT: 3,
  CLEAN_OCCUPIED: 4,
  INSPECTED_VACANT: 5,
  INSPECTED_OCCUPIED: 6,
};

const task_status = {
  //For Maid Task
  PENDING: 0, //Waiting For Assigning
  ASSIGNED: 1, //has been assigned, waiting For queue
  IN_PROGRESS: 2, //Maid cleaning
  COMPLETED: 3, //Finish Task
  INSPECTED: 4, //Just check and look around
};

const maintenance_status = {
  //For Technician Task
  PENDING: 1, //Waiting For Assigning
  ASSIGNED: 2, //has been assigned, waiting For queue
  IN_PROGRESS: 3, //Technician repairing
  COMPLETED: 4, //Problem has been resolve, Finish Task
  UNRESOLVED: 5, //Cannot resolve, Then Add new claim report list
};

const statusNameMap = {
  1: "pending",
  2: "assigned",
  3: "in_progress",
  4: "completed",
  5: "unresolved",
};

const device_type = {
  AIR: 1,
  CURTAIN: 2,
  DIMMER: 3,
  LIGHTING: 4,
  RGB: 5,
  THERMOSTAT: 6,
  MOTION: 7,
  SCENE: 10, //Scene, Master
  URLBUTTON: 11, //Webhook Button
  ACCESS: 12, //Key-card, Maid, Guest
  DNDMUR: 13, //Room serices
  POWER: 20, //Power consumption
  AIR_QAULITY: 21,
  TEMPERATURE: 22, //Archi Temp sensor
  LOSSNAY: 23,
  CONFIG: 24,
  OTHER: 25,
};

const device_status = {
  //RCU Status
  OK: 1, //Everything fine
  FAULT: 2, //Fault with any reason
  OFFLINE: 0, //RCU Offline
};

const logs_type = {
  // For Logs
  Guest_Presence: 1,
  Guest_Check_Status: 2,
  Cleaning_Status: 3,
  DNDMUR_Status: 4,
  Cleaning_Task_Status: 5,
  Maintenance_Task_Status: 6,
  Device_Status: 7,
  Device_Control: 8,
  RCU_Config_Updated: 9,
};

const notification_type = {
  ALERT: 1,
  CLEANING: 2,
  MAINTENANCE: 3,
};

const technician_type = {
  RCU: 1,
  ELECTRICAL: 2,
  OTHER: 3,
  TEMPERATURE: 4,
};

module.exports = {
  member_role,
  guest_check_status,
  guest_presence_status,
  notification_type,
  logs_type,
  device_status,
  device_type,
  maintenance_status,
  task_status,
  cleaning_status,
  statusNameMap,
  technician_type,
};
