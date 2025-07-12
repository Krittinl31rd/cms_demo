import React, { useEffect, useState } from "react";
import Spinner from "@/components/ui/Spinner";
import dayjs from "dayjs";
import DataTable from "@/components/table/DataTable";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import { GetRoomByID } from "@/api/room";
import { CreateDevice, UpdateDevice, DeleteDevice } from "@/api/device";
import {
  device_type,
  deviceTypeTemplates,
  modbus_funct,
} from "@/constant/common";
import useStore from "@/store/store";
import ModalPopUp from "@/components/ui/ModalPopUp";
import {
  UserSearch,
  CircleX,
  CircleCheck,
  Plus,
  Trash,
  List,
  SquarePen,
  Trash2,
  Lightbulb,
  AirVent,
} from "lucide-react";
import { toast } from "react-toastify";
import { useMemo } from "react";
import { useParams } from "react-router";
import useBreadcrumb from "@/hooks/useBreadcrumb";
import { CheckFunctionModbus } from "@/utilities/helpers";
import classNames from "classnames";

const RoomID = () => {
  const { room_id } = useParams();
  const { token } = useStore((state) => state);
  const [roomByID, setRoomByID] = useState({});
  const [loading, setLoading] = useState(true);
  const [isCreateDevice, setIsCreateDevice] = useState(false);
  const [formCreateDevice, setFormCreateDevice] = useState({
    room_id: room_id || "",
    type_id: "",
    name: "",
    address: [],
  });
  const [isUpdateDevice, setIsUpdateDevice] = useState(false);
  const [selectDevice, setSelectDevice] = useState("");
  const [formUpdateDevice, setFormUpdateDevice] = useState({
    room_id: room_id || "",
    device_id: "",
    type_id: "",
    name: "",
    address: [],
  });
  const [isDeleteDevice, setIsDeleteDevice] = useState(false);

  const breadcrumbItems = useMemo(
    () => [
      { label: "Rooms", href: "/admin/room" },
      {
        label: roomByID?.room_number
          ? `Room ${roomByID.room_number}`
          : `Room [ ${room_id} ]`,
      },
    ],
    [roomByID, room_id]
  );

  useBreadcrumb(breadcrumbItems);

  const fetchRoomByID = async () => {
    setLoading(true);
    const start = Date.now();

    try {
      const response = await GetRoomByID(token, room_id);
      setRoomByID(response?.data || {});
    } catch (err) {
      console.error(err);
    } finally {
      const elapsed = Date.now() - start;
      const delay = Math.max(0, 750 - elapsed);

      setTimeout(() => {
        setLoading(false);
      }, delay);
    }
  };

  useEffect(() => {
    fetchRoomByID();
  }, []);

  const handleSubmitCreateDevice = async (e) => {
    e.preventDefault();
    if (formCreateDevice.address.length == 0 || !formCreateDevice.type_id) {
      toast.warn("Please select a device type.");
      return;
    }
    const hasEmptyModbusFunct = formCreateDevice.address.some(
      (item) => !item.modbus_funct || item.modbus_funct == ""
    );
    if (hasEmptyModbusFunct) {
      toast.warn("Please select modbus function for all addresses.");
      return;
    }
    try {
      const addressesWithReal = formCreateDevice.address.map((item) => {
        const base = Number(item.modbus_funct) || 0;
        const addrNum = Number(item.addr) || 0;
        return {
          ...item,
          addr: base + addrNum,
        };
      });

      const dataToSend = {
        ...formCreateDevice,
        address: addressesWithReal,
      };
      const response = await CreateDevice(token, dataToSend);
      setFormCreateDevice({
        room_id: room_id || "",
        type_id: "",
        name: "",
        address: [],
      });
      toast.success(
        response?.data?.message || "Successfully to create device."
      );
      setIsCreateDevice(false);
      fetchRoomByID();
    } catch (err) {
      // console.log(err);
      toast.error(err?.response?.data?.message || "Falied to create device.");
    }
  };

  const handleChangeCreate = (name, value) => {
    if (name == "type_id") {
      const template = deviceTypeTemplates[value] || [];
      setFormCreateDevice((prev) => ({
        ...prev,
        [name]: value,
        address: template.map((item) => ({ ...item })),
      }));
    } else {
      setFormCreateDevice((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleChangeCreateAddress = (index, field, value) => {
    if (field == "modbus_funct" && value == "") {
      toast.warn("Modbus function cannot be empty.");
      return;
    }

    if (field == "addr") {
      const numericValue = Number(value);
      if (isNaN(numericValue) || numericValue < 0 || numericValue > 1000) {
        return;
      }
    }
    const updatedAddress = [...formCreateDevice.address];
    updatedAddress[index][field] = value;

    setFormCreateDevice((prev) => ({
      ...prev,
      address: updatedAddress,
    }));
  };

  const handleSubmitUpdateDevice = async (e) => {
    e.preventDefault();
    const hasEmptyModbusFunct = formUpdateDevice.address.some(
      (item) => !item.modbus_funct || item.modbus_funct == ""
    );
    if (hasEmptyModbusFunct) {
      toast.warn("Please select modbus function for all addresses.");
      return;
    }
    try {
      const addressesWithReal = formUpdateDevice.address.map((item) => {
        const base = Number(item.modbus_funct) || 0;
        const addrNum = Number(item.addr) || 0;
        return {
          ...item,
          addr: base + addrNum,
        };
      });

      const dataToSend = {
        ...formUpdateDevice,
        address: addressesWithReal,
      };
      const response = await UpdateDevice(token, dataToSend, room_id);
      setFormUpdateDevice({
        room_id: room_id || "",
        device_id: "",
        type_id: "",
        name: "",
        address: [],
      });
      toast.success(
        response?.data?.message || "Successfully to update device."
      );
      setIsUpdateDevice(false);
      fetchRoomByID();
    } catch (err) {
      // console.log(err);
      toast.error(err?.response?.data?.message || "Falied to update device.");
    }
  };

  const handleChnageUpdate = (name, value) => {
    setFormUpdateDevice((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangeUpdateAddress = (index, field, value) => {
    if (field == "modbus_funct" && value == "") {
      toast.warn("Modbus function cannot be empty.");
      return;
    }

    if (field == "addr") {
      const numericValue = Number(value);
      if (isNaN(numericValue) || numericValue < 0 || numericValue > 1000) {
        return;
      }
    }
    const updatedAddress = [...formUpdateDevice.address];
    updatedAddress[index][field] = value;

    setFormUpdateDevice((prev) => ({
      ...prev,
      address: updatedAddress,
    }));
  };

  const handleDelete = async (device_id) => {
    try {
      const response = await DeleteDevice(token, room_id, device_id);
      toast.success(
        response?.data?.message || "Successfully to delete device."
      );
      setIsDeleteDevice(false);
      fetchRoomByID();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Falied to delete device.");
    }
  };

  const renderDeviceCard = (dev, idx) => {
    const renderHeader = () => (
      <div className="flex items-center justify-between px-2 pt-2 h-10 shrink-0">
        <span>
          ID: <strong>{dev.device_id}</strong>
        </span>
        <div className="space-x-2">
          <button
            type="button"
            className="text-yellow-500"
            onClick={() => {
              setSelectDevice(dev);

              setFormUpdateDevice({
                room_id: room_id || "",
                device_id: dev.device_id,
                type_id: dev.type_id,
                name: dev.device_name,
                address: dev.controls
                  .filter((ctrl) => ctrl.control_id > 100)
                  .map((ctrl) => {
                    const { address, funct } = CheckFunctionModbus(
                      ctrl.value || 0
                    );
                    return {
                      id: ctrl.control_id,
                      name: ctrl.name,
                      addr: address,
                      modbus_funct: String(funct),
                    };
                  }),
              });

              setIsUpdateDevice(true);
            }}
          >
            <SquarePen className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setSelectDevice(dev);
              setIsDeleteDevice(true);
            }}
            type="button"
            className="text-red-500"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    );

    const renderFooter = (color) => (
      <div
        className={`h-9 flex items-center justify-center ${color} rounded-b-lg`}
      >
        <span className="text-white font-semibold">{dev.device_name}</span>
      </div>
    );

    const InfoRow = ({ label, modbus, value }) => (
      <div className="flex gap-2">
        <span className="bg-gray-200 font-semibold text-black rounded-md px-1">
          {label}:
        </span>
        {modbus?.name && (
          <span className="bg-blue-500 font-semibold text-white rounded-md px-1">
            {modbus.name}
          </span>
        )}
        {modbus?.address && (
          <span className="bg-blue-500 font-semibold text-white rounded-md px-1">
            {modbus.address}
          </span>
        )}
        <span className="bg-blue-500 font-semibold text-white rounded-md px-1">
          {value}
        </span>
      </div>
    );

    const DeviceCardWrapper = ({ children, footerColor }) => (
      <div
        key={idx}
        className="h-[150px] bg-white flex flex-col rounded-lg shadow-lg"
      >
        {renderHeader()}
        <div className="flex-1 overflow-auto px-2 py-1">
          <div className="min-h-full w-full space-y-2 text-xs flex flex-col items-center justify-start">
            {children}
          </div>
        </div>

        {renderFooter(footerColor)}
      </div>
    );

    // Card types
    switch (dev.type_id) {
      case device_type.LIGHTING: {
        const ctrlStatus = dev.controls?.find((c) => c.control_id == 1);
        const ctrlAddress = dev.controls?.find((c) => c.control_id == 101);
        const { name, address } = CheckFunctionModbus(ctrlAddress?.value);
        const statusLabel =
          ctrlStatus?.value === 0
            ? "OFF"
            : ctrlStatus?.value === 1
            ? "ON"
            : "N/A";

        return (
          <DeviceCardWrapper footerColor="bg-orange-400">
            <InfoRow
              label={ctrlStatus?.name}
              modbus={{ name, address }}
              value={statusLabel}
            />
          </DeviceCardWrapper>
        );
      }

      case device_type.AIR: {
        const getControlValue = (val, map) => map[val] ?? "N/A";

        const ctrlStatus = dev.controls?.find((c) => c.control_id == 1);
        const ctrlFan = dev.controls?.find((c) => c.control_id == 2);
        const ctrlTemp = dev.controls?.find((c) => c.control_id == 3);

        const modbusStatus = CheckFunctionModbus(
          dev.controls?.find((c) => c.control_id == 101)?.value
        );
        const modbusFan = CheckFunctionModbus(
          dev.controls?.find((c) => c.control_id == 102)?.value
        );
        const modbusTemp = CheckFunctionModbus(
          dev.controls?.find((c) => c.control_id == 103)?.value
        );

        const fanLevels = { 0: "OFF", 1: "LOW", 2: "MED", 3: "HIGH" };

        return (
          <DeviceCardWrapper footerColor="bg-blue-500">
            <InfoRow
              label={ctrlStatus?.name}
              modbus={modbusStatus}
              value={getControlValue(ctrlStatus?.value, { 0: "OFF", 1: "ON" })}
            />
            <InfoRow
              label={ctrlFan?.name}
              modbus={modbusFan}
              value={getControlValue(ctrlFan?.value, fanLevels)}
            />
            <InfoRow
              label={ctrlTemp?.name}
              modbus={modbusTemp}
              value={`${ctrlTemp?.value ?? "N/A"} ℃`}
            />
          </DeviceCardWrapper>
        );
      }

      case device_type.DIMMER: {
        const getControlValue = (val, map) => map[val] ?? "N/A";

        const ctrlStatus = dev.controls?.find((c) => c.control_id == 1);
        const ctrlBright = dev.controls?.find((c) => c.control_id == 2);

        const modbusStatus = CheckFunctionModbus(
          dev.controls?.find((c) => c.control_id == 101)?.value
        );
        const modbusBright = CheckFunctionModbus(
          dev.controls?.find((c) => c.control_id == 102)?.value
        );

        return (
          <DeviceCardWrapper footerColor="bg-yellow-400">
            <InfoRow
              label={ctrlStatus?.name}
              modbus={modbusStatus}
              value={getControlValue(ctrlStatus?.value, { 0: "OFF", 1: "ON" })}
            />
            <InfoRow
              label={ctrlBright?.name}
              modbus={modbusBright}
              value={`${
                ctrlBright?.value != null ? ctrlBright?.value : "N/A"
              } %`}
            />
          </DeviceCardWrapper>
        );
      }

      case device_type.SCENE: {
        const getControlValue = (val, map) => map[val] ?? "N/A";

        const ctrlStatus = dev.controls?.find((c) => c.control_id == 1);

        const modbusStatus = CheckFunctionModbus(
          dev.controls?.find((c) => c.control_id == 101)?.value
        );

        return (
          <DeviceCardWrapper footerColor="bg-indigo-700">
            <InfoRow
              label={ctrlStatus?.name}
              modbus={modbusStatus}
              value={getControlValue(ctrlStatus?.value, {
                0: "Deactivate",
                1: "Active",
              })}
            />
          </DeviceCardWrapper>
        );
      }
      case device_type.ACCESS: {
        const getControlValue = (val, map) => map[val] ?? "N/A";

        const ctrlAccess = dev.controls?.find((c) => c.control_id == 1);

        const modbusAccess = CheckFunctionModbus(
          dev.controls?.find((c) => c.control_id == 101)?.value
        );

        return (
          <DeviceCardWrapper footerColor="bg-teal-600">
            <InfoRow
              label={ctrlAccess?.name}
              modbus={modbusAccess}
              value={getControlValue(ctrlAccess?.value, { 0: "OFF", 1: "ON" })}
            />
          </DeviceCardWrapper>
        );
      }

      case device_type.OTHER: {
        const ctrlStatus = dev.controls?.find((c) => c.control_id == 1);
        const ctrlAddress = dev.controls?.find((c) => c.control_id == 101);
        const { name, address } = CheckFunctionModbus(ctrlAddress?.value);
        const statusLabel = ctrlStatus?.value;

        return (
          <DeviceCardWrapper footerColor="bg-orange-400">
            <InfoRow
              label={ctrlStatus?.name}
              modbus={{ name, address }}
              value={statusLabel}
            />
          </DeviceCardWrapper>
        );
      }

      case device_type.DNDMUR: {
        const getControlValue = (val, map) => map[val] ?? "N/A";

        const ctrlDNDMUR = dev.controls?.find((c) => c.control_id == 1);

        const modbusDNDMUR = CheckFunctionModbus(
          dev.controls?.find((c) => c.control_id == 101)?.value
        );

        return (
          <DeviceCardWrapper footerColor="bg-rose-500">
            <InfoRow
              label={ctrlDNDMUR?.name}
              modbus={modbusDNDMUR}
              value={getControlValue(ctrlDNDMUR?.value, {
                0: "OFF",
                1: "DND",
                2: "MUR",
              })}
            />
          </DeviceCardWrapper>
        );
      }

      case device_type.POWER: {
        const ctrlVoltage = dev.controls?.find((c) => c.control_id == 1);
        const ctrlCurrent = dev.controls?.find((c) => c.control_id == 2);
        const ctrlPower = dev.controls?.find((c) => c.control_id == 3);
        const ctrlPF = dev.controls?.find((c) => c.control_id == 4);
        const ctrlEngergy = dev.controls?.find((c) => c.control_id == 5);
        const ctrlFreq = dev.controls?.find((c) => c.control_id == 6);

        const modbusVoltage = CheckFunctionModbus(
          dev.controls?.find((c) => c.control_id == 101)?.value
        );
        const modbusCurrent = CheckFunctionModbus(
          dev.controls?.find((c) => c.control_id == 102)?.value
        );
        const modbusPower = CheckFunctionModbus(
          dev.controls?.find((c) => c.control_id == 103)?.value
        );
        const modbusPF = CheckFunctionModbus(
          dev.controls?.find((c) => c.control_id == 104)?.value
        );
        const modbusEngergy = CheckFunctionModbus(
          dev.controls?.find((c) => c.control_id == 105)?.value
        );
        const modbusFreq = CheckFunctionModbus(
          dev.controls?.find((c) => c.control_id == 106)?.value
        );

        return (
          <DeviceCardWrapper footerColor="bg-amber-600">
            <InfoRow
              label={ctrlVoltage?.name}
              modbus={modbusVoltage}
              value={
                ctrlVoltage?.value
                  ? `${(ctrlVoltage?.value / 1000).toFixed(2)} Volt`
                  : "N/A"
              }
            />
            <InfoRow
              label={ctrlCurrent?.name}
              modbus={modbusCurrent}
              value={
                ctrlCurrent?.value
                  ? `${(ctrlCurrent?.value / 1000).toFixed(2)} Amp`
                  : "N/A"
              }
            />
            <InfoRow
              label={ctrlPower?.name}
              modbus={modbusPower}
              value={
                ctrlPower?.value
                  ? `${(ctrlPower?.value / 1000).toFixed(2)} Watt`
                  : "N/A"
              }
            />
            <InfoRow
              label={ctrlPF?.name}
              modbus={modbusPF}
              value={
                ctrlPF?.value ? `${(ctrlPF?.value / 1000).toFixed(2)}` : "N/A"
              }
            />
            <InfoRow
              label={ctrlEngergy?.name}
              modbus={modbusEngergy}
              value={
                ctrlEngergy?.value
                  ? `${(ctrlEngergy?.value / 1000).toFixed(2)}`
                  : "N/A"
              }
            />
            <InfoRow
              label={ctrlFreq?.name}
              modbus={modbusFreq}
              value={
                ctrlFreq?.value
                  ? `${(ctrlFreq?.value / 1000).toFixed(2)}`
                  : "N/A"
              }
            />
          </DeviceCardWrapper>
        );
      }

      case device_type.AIR_QAULITY: {
        const ctrlPm25 = dev.controls?.find((c) => c.control_id == 1);
        const ctrlCo2 = dev.controls?.find((c) => c.control_id == 2);
        const ctrlTvoc = dev.controls?.find((c) => c.control_id == 3);
        const ctrlHcho = dev.controls?.find((c) => c.control_id == 4);
        const ctrlTemp = dev.controls?.find((c) => c.control_id == 5);
        const ctrlHum = dev.controls?.find((c) => c.control_id == 6);

        const modbusPm25 = CheckFunctionModbus(
          dev.controls?.find((c) => c.control_id == 101)?.value
        );
        const modbusCo2 = CheckFunctionModbus(
          dev.controls?.find((c) => c.control_id == 102)?.value
        );
        const modbusTvoc = CheckFunctionModbus(
          dev.controls?.find((c) => c.control_id == 103)?.value
        );
        const modbusHcho = CheckFunctionModbus(
          dev.controls?.find((c) => c.control_id == 104)?.value
        );
        const modbusTemp = CheckFunctionModbus(
          dev.controls?.find((c) => c.control_id == 105)?.value
        );
        const modbusHum = CheckFunctionModbus(
          dev.controls?.find((c) => c.control_id == 106)?.value
        );

        return (
          <DeviceCardWrapper footerColor="bg-lime-600">
            <InfoRow
              label={ctrlPm25?.name}
              modbus={modbusPm25}
              value={ctrlPm25?.value ? `${ctrlPm25.value} µg/m³` : "N/A"}
            />
            <InfoRow
              label={ctrlCo2?.name}
              modbus={modbusCo2}
              value={ctrlCo2?.value ? `${ctrlCo2.value} ppm` : "N/A"}
            />
            <InfoRow
              label={ctrlTvoc?.name}
              modbus={modbusTvoc}
              value={ctrlTvoc?.value ? `${ctrlPm25.value} ppb` : "N/A"}
            />
            <InfoRow
              label={ctrlHcho?.name}
              modbus={modbusHcho}
              value={ctrlHcho?.value ? `${ctrlHcho.value} ppb` : "N/A"}
            />
            <InfoRow
              label={ctrlTemp?.name}
              modbus={modbusTemp}
              value={ctrlTemp?.value ? `${ctrlTemp.value} ℃` : "N/A"}
            />
            <InfoRow
              label={ctrlHum?.name}
              modbus={modbusHum}
              value={ctrlHum?.value ? `${ctrlPm25.value} %` : "N/A"}
            />
          </DeviceCardWrapper>
        );
      }

      case device_type.TEMPERATURE: {
        const ctrlTemperature = dev.controls?.find((c) => c.control_id == 1);
        const modbusTemperature = CheckFunctionModbus(
          dev.controls?.find((c) => c.control_id == 101)?.value
        );

        return (
          <DeviceCardWrapper footerColor="bg-red-400">
            <InfoRow
              label={ctrlTemperature?.name}
              modbus={modbusTemperature}
              value={
                ctrlTemperature?.value ? `${ctrlTemperature?.value} ℃` : "N/A"
              }
            />
          </DeviceCardWrapper>
        );
      }

      case device_type.MOTION: {
        const ctrlMotion = dev.controls?.find((c) => c.control_id == 1);
        const modbusMotion = CheckFunctionModbus(
          dev.controls?.find((c) => c.control_id == 101)?.value
        );

        return (
          <DeviceCardWrapper footerColor="bg-red-400">
            <InfoRow
              label={ctrlMotion?.name}
              modbus={modbusMotion}
              value={ctrlMotion?.value ? `${ctrlMotion?.value}` : "N/A"}
            />
          </DeviceCardWrapper>
        );
      }
      case device_type.CONFIG: {
        const controlMap = [
          { id: 1, modbusId: 101 },
          { id: 2, modbusId: 102 },
          { id: 3, modbusId: 103 },
          { id: 4, modbusId: 104 },
          { id: 5, modbusId: 105 },
          { id: 6, modbusId: 106 },
          { id: 7, modbusId: 107 },
          { id: 8, modbusId: 108 },
          { id: 9, modbusId: 109 },
          { id: 10, modbusId: 110 },
          { id: 11, modbusId: 111 },
          { id: 12, modbusId: 112 },
          { id: 13, modbusId: 113 },
          { id: 14, modbusId: 114 },
          { id: 15, modbusId: 115 },
          { id: 16, modbusId: 116 },
          { id: 17, modbusId: 117 },
          { id: 18, modbusId: 118 },
          { id: 19, modbusId: 119 },
          { id: 20, modbusId: 120 },
          { id: 21, modbusId: 121 },
          { id: 22, modbusId: 122 },
          { id: 23, modbusId: 123 },
          { id: 24, modbusId: 124 },
          { id: 25, modbusId: 125 },
          { id: 26, modbusId: 126 },
          { id: 27, modbusId: 127 },
          { id: 28, modbusId: 128 },
          { id: 29, modbusId: 129 },
          { id: 30, modbusId: 130 },
          { id: 31, modbusId: 131 },
        ];

        const rows = controlMap.map(({ id, modbusId }) => {
          const ctrl = dev.controls?.find((c) => c.control_id === id);
          const modbus = CheckFunctionModbus(
            dev.controls?.find((c) => c.control_id === modbusId)?.value
          );
          return (
            <InfoRow
              key={id}
              label={ctrl?.name}
              modbus={modbus}
              value={ctrl?.value != null ? `${ctrl.value}` : "N/A"}
            />
          );
        });

        return (
          <DeviceCardWrapper footerColor="bg-black">{rows}</DeviceCardWrapper>
        );
      }

      default:
        return null;
    }
  };

  // const items = new Array(12).fill(0);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreateDevice(true)}>
            <Plus size={18} />
            Create Device
          </Button>
        </div>
      </div>
      {/* devices */}
      <div className="grid gap-4 p-0 grid-cols-[repeat(auto-fill,_minmax(280px,_1fr))] justify-center">
        {loading ? (
          <div className="col-span-full text-center py-10">
            <Spinner size="lg" />
            <p className="mt-2 text-gray-500 text-sm">Loading devices...</p>
          </div>
        ) : roomByID?.devices?.length > 0 ? (
          roomByID.devices.map((dev, idx) => (
            <React.Fragment key={dev.device_id || idx}>
              {renderDeviceCard(dev, idx)}
            </React.Fragment>
          ))
        ) : (
          <div className="col-span-4 text-center">
            <p>No devices in room, please create device.</p>
          </div>
        )}
      </div>
      <ModalPopUp
        isOpen={isCreateDevice}
        onClose={() => setIsCreateDevice(false)}
        title={`Create device room ${roomByID.room_number}`}
      >
        <form
          onSubmit={handleSubmitCreateDevice}
          className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm"
        >
          <div>
            <label className="block text-sm font-semibold">Device type</label>

            <select
              name="type_id"
              value={formCreateDevice.type_id || ""}
              onChange={(e) =>
                handleChangeCreate(
                  e.target.name,
                  parseInt(e.target.value) || ""
                )
              }
              className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Select device type
              </option>
              {Object.entries(device_type).map(([typeName, typeID]) => (
                <option key={typeID} value={typeID}>
                  {typeName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold">Device name</label>
            <input
              type="text"
              name="name"
              placeholder="Foyer light, Dimmable"
              value={formCreateDevice.name}
              onChange={(e) =>
                handleChangeCreate(e.target.name, e.target.value)
              }
              className="w-full max-w-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="md:col-span-2">
            {formCreateDevice.address.length > 0 ? (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-1">
                  Device Addresses
                </label>
                {formCreateDevice.address.map((addrItem, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                    <input
                      type="number"
                      placeholder="ID"
                      className="w-full max-w-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={addrItem.id}
                      readOnly
                      onChange={(e) =>
                        handleChangeCreateAddress(
                          index,
                          "id",
                          parseInt(e.target.value)
                        )
                      }
                    />
                    <input
                      type="text"
                      placeholder="Name"
                      className="w-full max-w-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={addrItem.name}
                      readOnly
                      onChange={(e) =>
                        handleChangeCreateAddress(index, "name", e.target.value)
                      }
                    />
                    <select
                      name="modbus_funct"
                      value={addrItem?.modbus_funct || ""}
                      onChange={(e) =>
                        handleChangeCreateAddress(
                          index,
                          "modbus_funct",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" disabled>
                        Modbus function
                      </option>
                      {Object.entries(modbus_funct).map(([id, name]) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Address"
                      className="w-full max-w-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={addrItem.addr}
                      required
                      onChange={(e) =>
                        handleChangeCreateAddress(index, "addr", e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="md:col-span-2 text-red-500 font-semibold italic">
                This device type isn't install controls.
              </div>
            )}
          </div>

          <div className="md:col-span-2 w-full flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="gray"
              onClick={() => setIsCreateDevice(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </ModalPopUp>

      {/* update device */}
      <ModalPopUp
        isOpen={isUpdateDevice}
        onClose={() => setIsUpdateDevice(false)}
        title={`Update [${selectDevice.device_id}] ${selectDevice?.device_name} `}
      >
        <form
          onSubmit={handleSubmitUpdateDevice}
          className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm"
        >
          <div>
            <label className="block text-sm font-semibold">Device name</label>
            <input
              type="text"
              name="name"
              placeholder="Foyer light, Dimmable"
              value={formUpdateDevice.name}
              onChange={(e) =>
                handleChnageUpdate(e.target.name, e.target.value)
              }
              className="w-full max-w-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="md:col-span-2">
            {formUpdateDevice.address.length > 0 && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-1">
                  Device Addresses
                </label>
                {formUpdateDevice.address.map((addrItem, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                    <input
                      type="number"
                      placeholder="ID"
                      className="w-full max-w-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={addrItem.id}
                      readOnly
                      onChange={(e) =>
                        handleChangeUpdateAddress(
                          index,
                          "id",
                          parseInt(e.target.value)
                        )
                      }
                    />
                    <input
                      type="text"
                      placeholder="Name"
                      className="w-full max-w-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={addrItem.name}
                      readOnly
                      onChange={(e) =>
                        handleChangeUpdateAddress(index, "name", e.target.value)
                      }
                    />
                    <select
                      name="modbus_funct"
                      value={addrItem?.modbus_funct || ""}
                      onChange={(e) =>
                        handleChangeUpdateAddress(
                          index,
                          "modbus_funct",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" disabled>
                        Modbus function
                      </option>
                      {Object.entries(modbus_funct).map(([id, name]) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Address"
                      className="w-full max-w-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={addrItem.addr}
                      required
                      onChange={(e) =>
                        handleChangeUpdateAddress(index, "addr", e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2 w-full flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="gray"
              onClick={() => setIsUpdateDevice(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Change</Button>
          </div>
        </form>
      </ModalPopUp>
      <ModalPopUp
        isOpen={isDeleteDevice}
        onClose={() => setIsDeleteDevice(false)}
        title={"Are you sure?"}
      >
        {selectDevice && (
          <div className="text-sm space-y-2 ">
            <p>
              Are you sure you want to delete{" "}
              <strong>{selectDevice?.device_name}</strong> ?
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="gray"
                onClick={() => setIsDeleteDevice(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleDelete(selectDevice?.device_id)}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </ModalPopUp>
    </div>
  );
};

export default RoomID;
