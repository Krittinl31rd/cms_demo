import React, { useEffect, useState, useMemo, useRef } from "react";
import FloorFilter from "./FloorFilter";
import CardRoom from "@/components/ui/CardRoom";
import ElementDevices from "@/components/ui/ElementDevices";
import ModalPopup from "@/components/ui/ModalPopup";
import Table from "./Table";
import CardWork from "@/components/technician/CardWork";
import AssignWorkForm from "@/components/technician/AssignWorkForm";
import UpdateWorkForm from "@/components/technician/UpdateWorkForm";
import DetailWork from "@/components/technician/DetailWork";
import {
  GetMaintenanceTask,
  GetTechnician,
  GetRoomNumberFloor,
} from "@/api/task";
import useStore from "@/store/store";
import { DeleteTask } from "@/api/task";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";

const RoomSummaryByFloor = ({
  data,
  activeSection,
  groupBy = "floor",
  selectedDate,
  setSelectedDate,
}) => {
  const { token } = useStore((state) => state);
  const [selectedFloor, setSelectedFloor] = useState("all");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalRoomOpen, setIsModalRoomOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isViewTask, setViewTask] = useState(false);
  const [isEditTask, setEditTask] = useState(false);
  const [isDeleteTask, setDeleteTask] = useState(false);
  const [technicianList, setTechnicianList] = useState([]);
  const [rooms, setRooms] = useState([]);

  const grouped = useMemo(() => {
    const map = new Map();
    data.forEach((item) => {
      const key = item[groupBy] ?? "Unknown";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [data, groupBy]);

  const floorOptions = useMemo(
    () => ["all", ...grouped.map(([floor]) => floor)],
    [grouped]
  );

  const displayData =
    selectedFloor === "all"
      ? grouped
      : grouped.filter(([floor]) => floor == selectedFloor);

  const fetchTechnicianList = async () => {
    try {
      const response = await GetTechnician(token);
      setTechnicianList(response?.data || []);
      // console.log(response?.data);
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

  const handleDeleteTask = async (id) => {
    try {
      const response = await DeleteTask(id, token);
      toast.success(response?.data?.message || "Delete task successfully");
      setDeleteTask(false);
      // fetchTaskList();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete task");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{activeSection.lable}</h2>
        <FloorFilter
          floors={floorOptions}
          selected={selectedFloor}
          onChange={setSelectedFloor}
        />
      </div>
      {activeSection.type == "total_rcu" ||
      activeSection.type == "online" ||
      activeSection.type == "offline" ? (
        displayData.map(([floor, rooms]) => {
          return (
            <div key={floor}>
              <h3 className="text-xl font-semibold mb-2 bg-white px-4 py-2 rounded-lg">
                Floor {floor}
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {rooms.map((room, index) => (
                  <CardRoom
                    onClick={() => {
                      setSelectedRoom(room);
                      setIsModalRoomOpen(true);
                    }}
                    key={index}
                    room={room}
                  />
                ))}
              </div>
            </div>
          );
        })
      ) : activeSection.type == "rcu_fault_alert" ||
        activeSection.type == "hi_temp_alarm" ||
        activeSection.type == "wip" ||
        activeSection.type == "fixed" ? (
        displayData.length > 0 ? (
          displayData.map(([floor, rooms]) => (
            <Table key={floor} floor={floor} rooms={rooms} />
          ))
        ) : (
          <p className="text-center">No result</p>
        )
      ) : (
        // displayData.length > 0 ? (
        //   displayData.map(([floor, rooms]) => {
        //     return (
        //       <div key={floor}>
        //         <h3 className="text-xl font-semibold mb-2 bg-white px-4 py-2 rounded-lg">
        //           Floor {floor}
        //         </h3>

        //         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
        //           {rooms.map((room, index) => (
        //             <CardWork
        //               key={index}
        //               task={room}
        //               onSelect={(selected) => setSelectedTask(selected)}
        //               onView={() => setViewTask(true)}
        //               onEdit={() => setEditTask(true)}
        //               onDelete={() => setDeleteTask(true)}
        //             />
        //           ))}
        //         </div>
        //       </div>
        //     );
        //   })
        // ) : (
        //   <p className="text-center">No result</p>
        // )
        <p>No Data</p>
      )}
      <ModalPopup
        isOpen={isModalRoomOpen}
        onClose={() => setIsModalRoomOpen(false)}
        title={`Room ${selectedRoom?.room_number}`}
      >
        <ElementDevices
          room={selectedRoom || {}}
          // sendWebSocketMessage={sendWebSocketMessage}
        />
      </ModalPopup>
      <ModalPopup
        isOpen={isViewTask}
        onClose={() => setViewTask(false)}
        title={`#${selectedTask?.id} Work Details Room ${selectedTask?.room_number}`}
      >
        <DetailWork selectedTask={selectedTask}></DetailWork>
      </ModalPopup>
      <ModalPopup
        isOpen={isEditTask}
        onClose={() => setEditTask(false)}
        title={`#${selectedTask?.id} Room ${selectedTask?.room_number}`}
      >
        <UpdateWorkForm
          selectedTask={selectedTask}
          onEdit={() => setEditTask(false)}
          // fetchTaskList={fetchTaskList}
          rooms={rooms}
          technicianList={technicianList}
        />
      </ModalPopup>
      <ModalPopup
        isOpen={isDeleteTask}
        onClose={() => setDeleteTask(false)}
        title={`Delete Task #${selectedTask?.id}`}
      >
        <div className="text-sm space-y-2 ">
          <p>
            Are you sure you want to delete <strong>#{selectedTask?.id}</strong>{" "}
            Room{" "}
            <strong>
              {selectedTask?.floor}
              {selectedTask?.room_number}
            </strong>{" "}
            ?
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="gray"
              onClick={() => setDeleteTask(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => handleDeleteTask(selectedTask?.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </ModalPopup>
    </div>
  );
};

export default RoomSummaryByFloor;
