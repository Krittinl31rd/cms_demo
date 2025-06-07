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
  PENDING: 0, //Waiting For Assigning
  ASSIGNED: 1, //has been assigned, waiting For queue
  IN_PROGRESS: 2, //Technician repairing
  FIXED: 3, //Problem has been resolve, Finish Task
  UNRESOLVED: 4, //Cannot resolve, Then Add new claim report list
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
  //Notification Type
  ALERT: 0, //No Type
  CLEANING: 1, //To Maid
  MAINTENANCE: 2, //To Technician
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
};

const example_data = [
  {
    room_id: 5,
    room_number: 101,
    floor: 1,
    guest_status_id: 0,
    cleaning_status_id: 1,
    dnd_status: 0,
    mur_status: 0,
    guest_check_id: 0,
    devices: [
      {
        device_id: 22,
        type_id: 1,
        status_id: null,
        name: "Air 1",
        last_online: null,
        config: null,
        controls: [
          {
            control_id: 1,
            name: "status",
            value: null,
            last_update: "2025-06-02 10:45:43",
          },
          {
            control_id: 2,
            name: "fanspeed",
            value: null,
            last_update: "2025-06-02 10:45:43",
          },
          {
            control_id: 3,
            name: "temp",
            value: null,
            last_update: "2025-06-02 10:45:43",
          },
          {
            control_id: 101,
            name: "status",
            value: 30001,
            last_update: "2025-06-02 10:45:43",
          },
          {
            control_id: 102,
            name: "fanspeed",
            value: 30002,
            last_update: "2025-06-02 10:45:43",
          },
          {
            control_id: 103,
            name: "temp",
            value: 30003,
            last_update: "2025-06-02 10:45:43",
          },
        ],
      },
    ],
  },
];
