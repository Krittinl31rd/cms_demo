import React, { useEffect, useState } from "react";
import Spinner from "@/components/ui/Spinner";
import dayjs from "dayjs";
import DataTable from "@/components/table/DataTable";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import { GetRoomByID } from "@/api/room";
import { device_type, member_role } from "@/constant/common";
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

  const renderDeviceCard = (dev, idx) => {
    switch (dev.type_id) {
      case device_type.LIGHTING: {
        const ctrlStatus = dev.controls.find((ctrl) => ctrl.control_id == 1);
        const ctrlAddress = dev.controls.find((ctrl) => ctrl.control_id == 101);
        const { name, address } = CheckFunctionModbus(ctrlAddress.value);

        return (
          <div
            key={idx}
            className="h-[190px] bg-white flex flex-col rounded-lg shadow-lg"
          >
            <div className="flex items-center justify-between px-2 pt-2 h-10 shrink-0">
              <span>
                ID: <strong>{dev.device_id}</strong>
              </span>
              <div className="space-x-2">
                <button type="button" className="text-yellow-500">
                  <SquarePen className="w-5 h-5" />
                </button>
                <button type="button" className="text-red-500">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto px-2 py-1">
              <div className="w-full space-y-2 text-xs">
                <div className="flex items-center justify-center">
                  <Lightbulb className="w-8 h-8 text-yellow-500" />
                </div>
                <div className="flex gap-2">
                  <span className="bg-gray-200 font-semibold text-black rounded-md px-1">
                    Status:
                  </span>
                  <span className="bg-blue-500 font-semibold text-white rounded-md px-1">
                    {address}
                  </span>
                  <span className="bg-blue-500 font-semibold text-white rounded-md px-1">
                    {name}
                  </span>
                  <span className="bg-blue-500 font-semibold text-white rounded-md px-1">
                    {ctrlStatus.value == 0
                      ? "OFF"
                      : ctrlStatus.value == 1
                      ? "ON"
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-9 flex items-center justify-center bg-sky-600 rounded-b-lg">
              <span className="text-white font-semibold">
                {dev.device_name}
              </span>
            </div>
          </div>
        );
      }

      case device_type.AIR: {
        const ctrlStatus = dev.controls.find((ctrl) => ctrl.control_id == 1);
        const ctrlFan = dev.controls.find((ctrl) => ctrl.control_id == 2);
        const ctrlTemp = dev.controls.find((ctrl) => ctrl.control_id == 3);
        const addressStatus = dev.controls.find(
          (ctrl) => ctrl.control_id == 101
        );
        const addressFan = dev.controls.find((ctrl) => ctrl.control_id == 102);
        const addressTemp = dev.controls.find((ctrl) => ctrl.control_id == 103);

        return (
          <div
            key={idx}
            className="h-[190px] bg-white flex flex-col rounded-lg shadow-lg"
          >
            <div className="flex items-center justify-between px-2 pt-2 h-10 shrink-0">
              <span>
                ID: <strong>{dev.device_id}</strong>
              </span>
              <div className="space-x-2">
                <button type="button" className="text-yellow-500">
                  <SquarePen className="w-5 h-5" />
                </button>
                <button type="button" className="text-red-500">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto px-2 py-1">
              <div className="w-full space-y-2 text-xs">
                <div className="flex items-center justify-center">
                  <AirVent className="w-8 h-8 text-sky-500" />
                </div>
                <div className="flex gap-2">
                  <span className="bg-gray-200 font-semibold text-black rounded-md px-1">
                    Status:
                  </span>
                  <span className="bg-blue-500 font-semibold text-white rounded-md px-1">
                    {ctrlStatus.value == 0
                      ? "OFF"
                      : ctrlStatus.value == 1
                      ? "ON"
                      : "N/A"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="bg-gray-200 font-semibold text-black rounded-md px-1">
                    Fan:
                  </span>
                  <span className="bg-blue-500 font-semibold text-white rounded-md px-1">
                    {ctrlFan.value == 0
                      ? "OFF"
                      : ctrlFan.value == 1
                      ? "LOW"
                      : ctrlFan.value == 2
                      ? "MED"
                      : ctrlFan.value == 3
                      ? "HIGH"
                      : "N/A"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="bg-gray-200 font-semibold text-black rounded-md px-1">
                    Temp:
                  </span>
                  <span className="bg-blue-500 font-semibold text-white rounded-md px-1">
                    {ctrlTemp.value} ℃
                  </span>
                </div>
                {/* <div className="flex gap-2">
                  <span className="bg-gray-200 font-semibold text-black rounded-md px-1">
                    Addrs Status:
                  </span>
                  <span className="bg-blue-500 font-semibold text-white rounded-md px-1">
                    {address}
                  </span>
                  <span className="bg-blue-500 font-semibold text-white rounded-md px-1">
                    {name}
                  </span>
                </div> */}
              </div>
            </div>

            <div className="h-9 flex items-center justify-center bg-sky-600 rounded-b-lg">
              <span className="text-white font-semibold">
                {dev.device_name}
              </span>
            </div>
          </div>
        );
      }
    }
  };

  // const items = new Array(12).fill(0);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <Button>
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
          roomByID.devices.map((dev, idx) => renderDeviceCard(dev, idx))
        ) : (
          <div className="col-span-4 text-center">
            <p>No devices in room, please create device.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomID;
