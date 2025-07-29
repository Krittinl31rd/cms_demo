import React, { useEffect, useState } from "react";
import Spinner from "@/components/ui/Spinner";
import { GetSummary } from "@/api/summary";
import useStore from "@/store/store";
import Table from "@/components/ui/Table";
import { ArrowLeft } from "lucide-react";
import RoomSummaryByFloor from "@/components/ui/RoomSummaryByFloor";
import { GetRooms } from "@/api/room";
import { technician_type } from "@/constant/common";
import { device_type, maintenance_status } from "../../constant/common";
import dayjs from "dayjs";
import Summary from "@/components/ui/Summary";
import SummaryNotification from "../../components/ui/SummaryNotification";
import { GetNotifications } from "../../api/summary";
import AssignWorkForm from "@/components/technician/AssignWorkForm";
import {
  GetMaintenanceTask,
  GetTechnician,
  GetRoomNumberFloor,
} from "@/api/task";
import { GetRoomDevicesLog } from "../../api/room";
import Chart from "../../components/ui/Chart";

const Main = () => {
  const { token, activeSection, setActiveSection, subscribeId } = useStore();
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [summary, setSummary] = useState({});
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [technicianList, setTechnicianList] = useState([]);
  const [rooms, setRooms] = useState([]);

  const fetchSummary = async () => {
    try {
      const response = await GetSummary(token);
      setSummary(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [token]);

  const fetchTechnicianList = async () => {
    try {
      const response = await GetTechnician(token);
      setTechnicianList(response?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTechnicianList();
  }, [token]);

  const fetchRooms = async () => {
    try {
      const response = await GetRoomNumberFloor(token);
      setRooms(response?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [token]);

  const handleClick = async (section) => {
    setActiveSection(section);
    setLoading(true);

    try {
      if (section.type === "total_rcu") {
        const response = await GetRooms(token);
        setData(response.data);
      } else if (section.type == "online") {
        const query = {
          is_online: 1,
        };
        const response = await GetRooms(token, query);
        setData(response.data);
      } else if (section.type == "offline") {
        const query = {
          is_online: 0,
        };
        const response = await GetRooms(token, query);
        setData(response.data);
      } else if (section.type == "rcu_fault_alert") {
        const statusIds = [
          maintenance_status.ASSIGNED,
          maintenance_status.PENDING,
          maintenance_status.IN_PROGRESS,
        ];
        const assignedTypes = [technician_type.RCU];
        const query = {
          assigned_to_type: assignedTypes.join(","),
          status_id: statusIds.join(","),
          started_at: selectedDate,
        };
        const response = await GetMaintenanceTask(token, query);
        setData(response.data);
      } else if (section.type == "hi_temp_alarm") {
        const statusIds = [
          maintenance_status.ASSIGNED,
          maintenance_status.PENDING,
          maintenance_status.IN_PROGRESS,
        ];
        const assignedTypes = [technician_type.TEMPERATURE];
        const query = {
          assigned_to_type: assignedTypes.join(","),
          status_id: statusIds.join(","),
          started_at: selectedDate,
        };
        const response = await GetMaintenanceTask(token, query);
        setData(response.data);
      } else if (section.type == "wip") {
        const statusIds = [maintenance_status.IN_PROGRESS];
        const query = {
          status_id: statusIds.join(","),
          started_at: selectedDate,
        };
        const response = await GetMaintenanceTask(token, query);
        setData(response.data);
      } else if (section.type == "fixed") {
        const statusIds = [
          maintenance_status.FIXED,
          maintenance_status.UNRESOLVED,
        ];
        const query = {
          status_id: statusIds.join(","),
          started_at: selectedDate,
        };
        const response = await GetMaintenanceTask(token, query);
        setData(response.data);
      } else if (section.type == "fault_sum") {
        const assignedTypes = [technician_type.RCU];
        const statusIds = [
          maintenance_status.ASSIGNED,
          maintenance_status.PENDING,
          maintenance_status.IN_PROGRESS,
          maintenance_status.FIXED,
          maintenance_status.UNRESOLVED,
        ];
        const query = {
          assigned_to_type: assignedTypes.join(","),
          status_id: statusIds.join(","),
          started_at: selectedDate,
        };
        const response = await GetMaintenanceTask(token, query);
        setData(response.data);
      } else if (section.type == "alert_sum") {
        const assignedTypes = [
          technician_type.ELECTRICAL,
          technician_type.TEMPERATURE,
          technician_type.OTHER,
        ];
        const query = {
          assigned_to_type: assignedTypes.join(","),
          // status_id: statusIds.join(","),
          started_at: selectedDate,
        };
        const response = await GetMaintenanceTask(token, query);
        setData(response.data);
      } else if (section.type == "wip_sum") {
        const statusIds = [maintenance_status.IN_PROGRESS];
        const query = {
          status_id: statusIds.join(","),
          started_at: selectedDate,
        };
        const response = await GetMaintenanceTask(token, query);
        setData(response.data);
      } else if (section.type == "done_sum") {
        const statusIds = [
          maintenance_status.FIXED,
          maintenance_status.UNRESOLVED,
        ];
        const query = {
          status_id: statusIds.join(","),
          started_at: selectedDate,
        };
        const response = await GetMaintenanceTask(token, query);
        setData(response.data);
      } else if (section.type == "notification_sum") {
        const query = {
          date: selectedDate,
        };
        const response = await GetNotifications(token, subscribeId, query);
        setData(response.data);
      } else if (section.type == "chart") {
        const query = {
          device_type_id: device_type.TEMPERATURE,
          date: selectedDate,
        };
        const response = await GetRoomDevicesLog(token, query);
        setData(response.data);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection !== null) {
      handleClick(activeSection);
    }
  }, [activeSection, selectedDate]);

  const cardFunct = (title, value, bg, text, onClick) => (
    <div
      onClick={onClick}
      className={`flex items-center justify-center h-24 px-8 ${bg} rounded-2xl ${text} font-bold cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 min-w-72`}
      key={title}
    >
      <h1 className={`${value != null && "mr-8"} text-lg`}>{title}</h1>
      {value != null && <h1 className="text-2xl">{value}</h1>}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-0">
      {activeSection === null ? (
        <>
          <h1 className="text-4xl font-bold text-center mb-4">
            ENGINEERING SYSTEM & ROOM STATUS
          </h1>

          <div className="w-full flex items-center justify-center flex-wrap gap-6">
            {cardFunct(
              "TOTAL RCUs: ",
              summary.total_rcu,
              "bg-blue-600",
              "text-white",
              () => handleClick({ type: "total_rcu", lable: "TOTAL RCUs" })
            )}
            {cardFunct(
              "ONLINE: ",
              summary.online,
              "bg-green-400",
              "text-black",
              () => handleClick({ type: "online", lable: "ONLINE" })
            )}
            {cardFunct(
              "OFFLINE: ",
              summary.offline,
              "bg-black",
              "text-white",
              () => handleClick({ type: "offline", lable: "OFFLINE" })
            )}
            {cardFunct(
              "RCU FAULT ALERT: ",
              summary.rcu_fault_alert,
              "bg-red-500",
              "text-white",
              () =>
                handleClick({
                  type: "rcu_fault_alert",
                  lable: "RCU FAULT ALERT",
                })
            )}
            {cardFunct(
              "HI-TEMP ALARM: ",
              summary.hi_temp_alarm,
              "bg-red-500",
              "text-white",
              () =>
                handleClick({ type: "hi_temp_alarm", lable: "HI-TEMP ALARM" })
            )}
            {cardFunct(
              "WIP: ",
              summary.wip,
              "bg-orange-400",
              "text-black",
              () => handleClick({ type: "wip", lable: "WIP" })
            )}
            {cardFunct(
              "FIXED: ",
              summary.fixed,
              "bg-yellow-300",
              "text-black",
              () => handleClick({ type: "fixed", lable: "FIXED" })
            )}
            {cardFunct(
              "ROOM  FAULT SUMMARY",
              null,
              "bg-orange-300",
              "text-black",
              () =>
                handleClick({
                  type: "fault_sum",
                  lable: "DAILY ROOM FAULT SUMMARY",
                })
            )}
            {cardFunct(
              "ROOM ALERT SUMMARY",
              null,
              "bg-orange-300",
              "text-black",
              () =>
                handleClick({
                  type: "alert_sum",
                  lable: "DAILY ROOM ALERT SUMMARY",
                })
            )}
            {cardFunct("WIP SUMMARY", null, "bg-orange-300", "text-black", () =>
              handleClick({ type: "wip_sum", lable: "DAILY WIP SUMMARY" })
            )}
            {cardFunct(
              "WORK DONE SUMMARY",
              null,
              "bg-orange-300",
              "text-black",
              () =>
                handleClick({
                  type: "done_sum",
                  lable: "DAILY WORK DONE SUMMARY",
                })
            )}
            {cardFunct(
              "NOTIFICATION SUMMARY",
              null,
              "bg-orange-300",
              "text-black",
              () =>
                handleClick({
                  type: "notification_sum",
                  lable: "DAILY NOTIFICATION SUMMARY",
                })
            )}
            {cardFunct("ASSIGN TASK", null, "bg-orange-300", "text-black", () =>
              handleClick({
                type: "assign_task",
                lable: "ASSIGN TASK",
              })
            )}
            {cardFunct("CHART", null, "bg-orange-300", "text-black", () =>
              handleClick({
                type: "chart",
                lable: "CHART",
              })
            )}
          </div>
        </>
      ) : (
        <div className="w-full">
          <div className="w-full flex items-center justify-between">
            <button
              onClick={() => {
                setActiveSection(null);
                setData([]);
              }}
              className="flex mb-2 px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300"
            >
              <ArrowLeft /> Back
            </button>
            {[
              "rcu_fault_alert",
              "hi_temp_alarm",
              "wip",
              "fixed",
              "fault_sum",
              "alert_sum",
              "wip_sum",
              "done_sum",
              "notification_sum",
              "chart",
            ].includes(activeSection?.type) && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className=" border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
          {loading ? (
            <Spinner />
          ) : activeSection.type == "fault_sum" ||
            activeSection.type == "alert_sum" ||
            activeSection.type == "wip_sum" ||
            activeSection.type == "done_sum" ? (
            <Summary
              data={data}
              activeSection={activeSection}
              setSelectedDate={(i) => setSelectedDate(i)}
            />
          ) : activeSection.type == "notification_sum" ? (
            <SummaryNotification
              data={data}
              activeSection={activeSection}
              setSelectedDate={(i) => setSelectedDate(i)}
            />
          ) : activeSection.type == "assign_task" ? (
            <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md">
              <h2 className="text-2xl font-bold">{activeSection.lable}</h2>
              <AssignWorkForm
                // fetchTaskList={fetchTaskList}
                technicianList={technicianList}
                rooms={rooms}
              />
            </div>
          ) : activeSection.type == "chart" ? (
            <Chart
              data={data}
              activeSection={activeSection}
              selectedDate={selectedDate}
              setSelectedDate={(i) => setSelectedDate(i)}
            />
          ) : (
            <RoomSummaryByFloor
              data={data}
              activeSection={activeSection}
              groupBy="floor"
              selectedDate={selectedDate}
              setSelectedDate={(i) => setSelectedDate(i)}
            />
          )}
        </div>
      )}
    </div>
  );
};

//ROOM SETTING
// GRAPH

export default Main;
