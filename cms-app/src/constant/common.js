export const member_role = {
  SUPER_ADMIN: 1,
  FRONT_DESK: 2,
  TECHNICIAN_LEAD: 3,
  TECHNICIAN: 4,
  MAID_SUPERVISOR: 5,
  MAID: 6,
};

export const technician_type = {
  RCU: 1,
  ELECTRICAL: 2,
  OTHER: 3,
  TEMPERATURE: 4,
};

export const role_id_to_name = {
  1: "Super Admin",
  2: "Front Desk",
  3: "Technician Lead",
  4: "Technician",
  5: "Maid Supervisor",
  6: "Maid",
};

export const guest_check_status = {
  CHECK_OUT: 0,
  CHECK_IN: 1,
  OCCUPIED: 2,
  VACANT: 4,
};

export const guest_presence_status = {
  GUEST_OUT: 0,
  GUEST_IN: 1,
  NOT_CHECKIN: 2,
};

export const rooms_request_status = {
  NO_REQ: 0,
  DND: 1,
  MUR: 2,
};

export const statusColor = {
  1: "bg-green-500",
  0: "bg-gray-400",
};

// Guest Check Status Colors
export const guestCheckStatusColor = {
  0: "bg-blue-500", // CHECK_OUT - Blue (departure)
  1: "bg-green-500", // CHECK_IN - Green (arrival/active)
  2: "bg-red-500", // OCCUPIED - Red (busy/unavailable)
  4: "bg-gray-400", // VACANT - Gray (available/empty)
};

// Guest Presence Status Colors
export const guestPresenceStatusColor = {
  0: "bg-orange-500", // GUEST_OUT - Orange (away)
  1: "bg-green-500", // GUEST_IN - Green (present)
  2: "bg-gray-400", // NOT_CHECKIN - Gray (no guest)
};

// Room Request Status Colors
export const roomsRequestStatusColor = {
  0: "bg-gray-400", // NO_REQ - Gray (no requests)
  1: "bg-purple-500", // DND - Purple (do not disturb)
  2: "bg-yellow-500", // MUR - Yellow (maintenance/service needed)
};

export const cleaning_status = {
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

export const maintenance_status = {
  //For Technician Task
  PENDING: 1, //Waiting For Assigning
  ASSIGNED: 2, //has been assigned, waiting For queue
  IN_PROGRESS: 3, //Technician repairing
  FIXED: 4, //Problem has been resolve, Finish Task
  UNRESOLVED: 5, //Cannot resolve, Then Add new claim report list
};

export const device_type = {
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
  DNDMUR: 13, //Room services
  POWER: 20, //Power consumption
  AIR_QAULITY: 21,
  TEMPERATURE: 22, //Archi Temp sensor
  LOSSNAY: 23,
  CONFIG: 24, //Config RCU
  OTHER: 25, //Other
  CONFIG_SENCE: 26, //Multi sence
};

export const deviceTypeTemplates = {
  [device_type.AIR]: [
    {
      id: 101,
      name: "status",
      addr: "",
    },
    {
      id: 102,
      name: "fanspeed",
      addr: "",
    },
    {
      id: 103,
      name: "temp",
      addr: "",
    },
  ],
  [device_type.DIMMER]: [
    {
      id: 101,
      name: "status",
      addr: "",
    },
    {
      id: 102,
      name: "brightness",
      addr: "",
    },
  ],
  [device_type.LIGHTING]: [
    {
      id: 101,
      name: "status",
      addr: "",
    },
  ],
  [device_type.SCENE]: [
    {
      id: 101,
      name: "master",
      addr: "",
    },
  ],
  [device_type.ACCESS]: [
    {
      id: 101,
      name: "access",
      addr: "",
    },
  ],
  [device_type.DNDMUR]: [
    {
      id: 101,
      name: "dndmur",
      addr: "",
    },
  ],
  [device_type.POWER]: [
    {
      id: 101,
      name: "voltage",
      addr: "",
    },
    {
      id: 102,
      name: "current",
      addr: "",
    },
    {
      id: 103,
      name: "power",
      addr: "",
    },
    {
      id: 104,
      name: "pf",
      addr: "",
    },
    {
      id: 105,
      name: "energy",
      addr: "",
    },
    {
      id: 106,
      name: "freq",
      addr: "",
    },
  ],
  [device_type.AIR_QAULITY]: [
    {
      id: 101,
      name: "pm25",
      addr: "",
    },
    {
      id: 102,
      name: "co2",
      addr: "",
    },
    {
      id: 103,
      name: "tvoc",
      addr: "",
    },
    {
      id: 104,
      name: "hcho",
      addr: "",
    },
    {
      id: 105,
      name: "temp",
      addr: "",
    },
    {
      id: 106,
      name: "hum",
      addr: "",
    },
  ],
  [device_type.TEMPERATURE]: [
    {
      id: 101,
      name: "sensor",
      addr: "",
    },
  ],
  [device_type.MOTION]: [
    {
      id: 101,
      name: "motion",
      addr: "",
    },
  ],
  //CHECK  OUT / ROOM  UNOCCUPIED
  // CHECK IN  /  ROOM  OCUUPIED / GUEST  IN
  // WELCOME FAST COOL / RFRESH
  // GUEST  OUT
  // GUEST  RETURN /  GUEST  IN
  // SLEEP  MODE
  // ENERGY  SAVING  MODES
  [device_type.CONFIG]: [
    { id: 101, name: "SLEEP  MODE - START HOUR", addr: 21 }, // SLEEP  MODE - START
    { id: 102, name: "SLEEP  MODE - START MIN", addr: 22 }, // SLEEP  MODE - START
    { id: 103, name: "SLEEP  MODE - ESM DELAY", addr: 23 }, // SLEEP  MODE - ESM DELAY
    { id: 104, name: "SLEEP  MODE - MAXIMUM TEMP", addr: 24 }, // SLEEP  MODE - MAXIMUM TEMPERATURE
    { id: 105, name: "SLEEP  MODE - END HOUR", addr: 25 }, // SLEEP  MODE - END
    { id: 106, name: "SLEEP  MODE - END MIN", addr: 26 }, // SLEEP  MODE - END
    { id: 107, name: "CHECK IN  / GUEST IN - FAN SPEED", addr: 37 }, // CHECK IN  / GUEST IN - FAN SPEED
    { id: 108, name: "CHECK IN  / GUEST IN - DEFAULT TEMP", addr: 38 }, // CHECK IN  / GUEST IN - DEFAULT TEMP
    { id: 109, name: "CHECK  OUT - FAN SPEED", addr: 39 }, //CHECK  OUT - FAN SPEED
    { id: 110, name: "CHECK  OUT - DEFAULT TEMP", addr: 40 }, //CHECK  OUT - DEFAULT TEMP
    { id: 111, name: "GUEST  OUT - FAN SPEED", addr: 41 }, // GUEST  OUT - FAN SPEED
    { id: 112, name: "GUEST  OUT - DEFAULT TEMP", addr: 42 }, // GUEST  OUT - DEFAULT TEMP
    { id: 113, name: "GUEST  OUT - ESM DELAY", addr: 43 }, // GUEST  OUT - ESM DELAY
    { id: 114, name: "CHECK IN  / GUEST IN - KEYCARD DELAY", addr: 44 }, // CHECK IN  / GUEST IN - KEYCARD DELAY
    {
      id: 115,
      name: "CHECK IN  / GUEST IN - FAN SPEED INSERT KEYCARD",
      addr: 45,
    }, // CHECK IN  / GUEST IN - FAN SPEED INSERT KEYCARD
    {
      id: 116,
      name: "CHECK IN  / GUEST IN - DEFAULT TEMP INSERT KEYCARD",
      addr: 46,
    }, // CHECK IN  / GUEST IN - DEFAULT TEMP INSERT KEYCARD
    {
      id: 117,
      name: "CHECK IN  / GUEST IN - FAN SPEED REMOVE KEYCARD",
      addr: 47,
    }, // CHECK IN  / GUEST IN - FAN SPEED REMOVE KEYCARD
    {
      id: 118,
      name: "CHECK IN  / GUEST IN - DEFAULT TEMP REMOVE KEYCARD",
      addr: 48,
    }, // CHECK IN  / GUEST IN - DEFAULT TEMP REMOVE KEYCARD
    { id: 119, name: "recheck_config_op", addr: 49 },
    { id: 120, name: "DATE TIME - HOUR", addr: 50 }, // DATE TIME - HOUR
    { id: 121, name: "DATE TIME - MIN", addr: 51 }, // DATE TIME - MIN
    { id: 122, name: "DATE TIME - SEC", addr: 52 }, // DATE TIME - SEC
    { id: 123, name: "DATE TIME - DATE", addr: 53 }, // DATE TIME - DATE
    { id: 124, name: "DATE TIME - MONTH", addr: 54 }, // DATE TIME - MONTH
    { id: 125, name: "DATE TIME - YEAR", addr: 55 }, // DATE TIME - YEAR
    { id: 126, name: "GUEST  OUT - FAN SPEED +60mins", addr: 81 }, // GUEST  OUT - FAN SPEED +60mins
    { id: 127, name: "GUEST  OUT - DEFAULT TEMP +60mins", addr: 82 }, // GUEST  OUT - DEFAULT TEMP +60mins
    { id: 128, name: "GUEST  OUT - ESM DELAY +60mins", addr: 83 }, // GUEST  OUT - ESM DELAY +60mins
    { id: 129, name: "GUEST  OUT - FAN SPEED +120mins", addr: 84 }, // GUEST  OUT - FAN SPEED +120mins
    { id: 130, name: "GUEST  OUT - DEFAULT TEMP +120mins", addr: 85 }, // GUEST  OUT - DEFAULT TEMP +120mins
    { id: 131, name: "GUEST  OUT - ESM DELAY +120mins", addr: 86 }, //GUEST  OUT - ESM DELAY +120mins
  ],
  // [device_type.CONFIG]: [
  //   { id: 101, name: "sleep_start_hour", addr: 21 }, // SLEEP  MODE
  //   { id: 102, name: "sleep_start_min", addr: 22 }, // SLEEP  MODE
  //   { id: 103, name: "energysaving_time", addr: 23 }, // ENERGY  SAVING  MODES
  //   { id: 104, name: "sleep_max_temp", addr: 24 }, // SLEEP  MODE
  //   { id: 105, name: "sleep_reverse_hour", addr: 25 }, // SLEEP  MODE
  //   { id: 106, name: "sleep_reverse_min", addr: 26 }, // SLEEP  MODE
  //   { id: 107, name: "fan_set_checkin", addr: 37 }, // CHECK IN  /  ROOM  OCUUPIED
  //   { id: 108, name: "temp_set_checkin", addr: 38 }, // CHECK IN  /  ROOM  OCUUPIED
  //   { id: 109, name: "fan_set_checkout", addr: 39 }, //CHECK  OUT / ROOM  UNOCCUPIED
  //   { id: 110, name: "temp_set_checkout", addr: 40 }, //CHECK  OUT / ROOM  UNOCCUPIED
  //   { id: 111, name: "fan_set_esm03", addr: 41 },  // GUEST  OUT
  //   { id: 112, name: "temp_set_esm03", addr: 42 },  // GUEST  OUT
  //   { id: 113, name: "timedelay_esm03", addr: 43 },  // GUEST  OUT
  //   { id: 114, name: "timeset_keycard", addr: 44 }, // CHECK IN  /  ROOM  OCUUPIED
  //   { id: 115, name: "fanset_on_keycard", addr: 45 }, // CHECK IN  /  ROOM  OCUUPIED
  //   { id: 116, name: "tempset_on_keycard", addr: 46 }, // CHECK IN  /  ROOM  OCUUPIED
  //   { id: 117, name: "fan_set_off_keycard", addr: 47 },  // CHECK IN  /  ROOM  OCUUPIED
  //   { id: 118, name: "temp_set_off_keycard", addr: 48 }, // CHECK IN  /  ROOM  OCUUPIED
  //   { id: 119, name: "recheck_config_op", addr: 49 },
  //   { id: 120, name: "hour", addr: 50 }, // DATE TIME
  //   { id: 121, name: "min", addr: 51 }, // DATE TIME
  //   { id: 122, name: "sec", addr: 52 }, // DATE TIME
  //   { id: 123, name: "date", addr: 53 }, // DATE TIME
  //   { id: 124, name: "month", addr: 54 }, // DATE TIME
  //   { id: 125, name: "year", addr: 55 }, // DATE TIME
  //   { id: 126, name: "fan_set_esm04", addr: 81 }, // GUEST  OUT +60
  //   { id: 127, name: "temp_set_esm04", addr: 82 }, // GUEST  OUT +60
  //   { id: 128, name: "time_delay_esm04", addr: 83 }, // GUEST  OUT +60
  //   { id: 129, name: "fan_set_esm05", addr: 84 }, // GUEST  OUT +120
  //   { id: 130, name: "temp_set_esm05", addr: 85 }, // GUEST  OUT +120
  //   { id: 131, name: "time_delay_esm05", addr: 86 }, // GUEST  OUT +120
  // ],
  [device_type.OTHER]: [
    {
      id: 101,
      name: "other",
      addr: "",
    },
  ],
  [device_type.CONFIG_SENCE]: (() => {
    const template = [];
    const baseConfig = [
      "hour_start",
      "min_start",
      "hour_stop",
      "min_stop",
      "enabled",
      "color_temp",
    ];

    let currentAddr = 101;

    for (let sceneIndex = 0; sceneIndex < 5; sceneIndex++) {
      baseConfig.forEach((key) => {
        template.push({
          id: currentAddr,
          name: `${key}_${sceneIndex + 1}`,
          addr: currentAddr,
          modbus_funct: 30000,
        });
        currentAddr++;
      });
    }

    return template;
  })(),
};

const deviceTypeColors = {
  1: "bg-blue-500 text-white", // AIR
  2: "bg-purple-500 text-white", // CURTAIN
  3: "bg-yellow-400 text-black", // DIMMER
  4: "bg-orange-400 text-white", // LIGHTING
  5: "bg-pink-500 text-white", // RGB
  6: "bg-cyan-600 text-white", // THERMOSTAT
  7: "bg-green-600 text-white", // MOTION
  10: "bg-indigo-700 text-white", // SCENE
  11: "bg-red-500 text-white", // URLBUTTON
  12: "bg-teal-600 text-white", // ACCESS
  13: "bg-rose-500 text-white", // DNDMUR
  20: "bg-amber-600 text-white", // POWER
  21: "bg-lime-600 text-white", // AIR_QUALITY
  22: "bg-sky-600 text-white", // TEMPERATURE
  23: "bg-neutral-500 text-white", // LOSSNAY
};

export const device_status = {
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

export const notification_type = {
  ALERT: 1,
  CLEANING: 2,
  MAINTENANCE: 3,
};

export const modbus_funct = {
  10000: "COIL_STATUS",
  20000: "INPUT_STATUS",
  30000: "HOLDING_REGISTER",
  40000: "INPUT_REGISTER",
};
