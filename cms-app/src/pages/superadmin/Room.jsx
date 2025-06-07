import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import DataTable from "@/components/table/DataTable";
import Button from "@/components/ui/Button";
import { GetRooms, CreateRoom, UpadteRoom, DeleteRoom } from "@/api/room";
import { role_id_to_name, member_role } from "@/constant/common";
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
} from "lucide-react";
import { toast } from "react-toastify";
import classNames from "classnames";
import { NavLink } from "react-router-dom";

const Room = () => {
  const { token } = useStore((state) => state);
  const [rooms, setRooms] = useState([]);
  const [isCreateRoom, setIsCreateRoom] = useState(false);
  const [formCreateRoom, setFormCreateRoom] = useState({
    room_number: "",
    floor: "",
  });
  const [isUpdateRoom, setIsUpdateRoom] = useState(false);
  const [selectRoom, setSelectRoom] = useState("");
  const [formUpdateRoom, setFormUpdateRoom] = useState({
    room_number: "",
    floor: "",
  });
  const [sureDeleteRoom, setSureDeleteRoom] = useState(false);

  const fetchRooms = async () => {
    try {
      const response = await GetRooms(token);
      //   const mappedData = (response?.data || []).map((row) => ({
      //     ...row,
      //     devices_length: row.devices.length,
      //   }));
      setRooms(response?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleChangeCreate = (e) => {
    setFormCreateRoom({ ...formCreateRoom, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await CreateRoom(token, formCreateRoom);
      setFormCreateRoom({ room_number: "", floor: "" });
      toast.success(response?.data?.message || "Successfully to create room.");
      setIsCreateRoom(false);
      fetchRooms();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Falied to create room.");
    }
  };

  const handleChnageUpdate = (e) => {
    setFormUpdateRoom({ ...formUpdateRoom, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await UpadteRoom(
        token,
        selectRoom?.room_id,
        formUpdateRoom
      );
      setFormUpdateRoom({ room_number: "", floor: "" });
      toast.success(response?.data?.message || "Successfully to change room.");
      setIsUpdateRoom(false);
      fetchRooms();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Falied to change room.");
    }
  };

  const handleDelete = async (room_id) => {
    try {
      const response = await DeleteRoom(token, room_id);
      toast.success(response?.data?.message || "Successfully to delete room.");
      setSureDeleteRoom(false);
      fetchRooms();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Falied to delete room.");
    }
  };

  const columns = [
    {
      header: "No.",
      accessor: "no",
      cell: (_, rowIndex, currentPage, rowsPerPage) =>
        (currentPage - 1) * rowsPerPage + rowIndex + 1,
    },
    {
      header: "Floor",
      accessor: "floor",
      cell: (row) => `Floor ${row.floor}`,
    },
    {
      header: "Room",
      accessor: "room_number",
      cell: (row) => (
        <NavLink
          to={`/admin/room/${row.room_id}`}
          className="font-semibold text-blue-500 cursor-default"
        >
          Room {row.room_number}
        </NavLink>
      ),
    },
    {
      header: "Devices",
      accessor: "devices",
      cell: (row) => {
        const deviceCount = row.devices.length;
        return deviceCount == 0 ? (
          <span className="text-red-500">No devices</span>
        ) : (
          `${deviceCount} Devices`
        );
      },
    },
    {
      header: "Action",
      accessor: "",
      cell: (row) => (
        <div className="flex items-center gap-4">
          <NavLink
            to={`/admin/room/${row.room_id}`}
            className="inline-flex items-center w-4 h-4 text-green-500 cursor-default"
          >
            <List />
          </NavLink>
          <button
            type="button"
            onClick={() => {
              setSelectRoom(row);
              setFormUpdateRoom({
                ...formUpdateRoom,
                room_number: row.room_number,
                floor: row.floor,
              });
              setIsUpdateRoom(true);
            }}
            className="inline-flex items-center w-4 h-4 text-blue-500"
          >
            <SquarePen />
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectRoom(row);
              setSureDeleteRoom(true);
            }}
            className="inline-flex items-center w-4 h-4 text-red-500"
          >
            <Trash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Rooms</h1>
        <Button
          onClick={() => {
            setIsCreateRoom(true);
          }}
          variants="primary"
        >
          <Plus size={18} />
          Create Room
        </Button>
      </div>
      <DataTable columns={columns} data={rooms} />
      {/* modal create room */}
      <ModalPopUp
        isOpen={isCreateRoom}
        onClose={() => setIsCreateRoom(false)}
        title={"Create room"}
      >
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm"
        >
          <div>
            <label className="block text-sm font-semibold">Room</label>
            <input
              type="text"
              name="room_number"
              placeholder="101, 102, 103"
              value={formCreateRoom.room_number}
              onChange={handleChangeCreate}
              className="w-full max-w-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Floor</label>
            <input
              type="number"
              name="floor"
              placeholder="1, 2, 3"
              value={formCreateRoom.floor}
              onChange={handleChangeCreate}
              className="w-full max-w-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="md:col-span-2 w-full flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="gray"
              onClick={() => setIsCreateRoom(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Confirm</Button>
          </div>
        </form>
      </ModalPopUp>
      {/* modal update room */}
      <ModalPopUp
        isOpen={isUpdateRoom}
        onClose={() => setIsUpdateRoom(false)}
        title={`Update room ${selectRoom?.room_number}`}
      >
        {selectRoom ? (
          <form
            onSubmit={handleUpdate}
            className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm"
          >
            <div>
              <label className="block text-sm font-semibold">Room</label>
              <input
                type="text"
                name="room_number"
                placeholder="101, 102, 103"
                value={formUpdateRoom.room_number}
                onChange={handleChnageUpdate}
                className="w-full max-w-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Floor</label>
              <input
                type="number"
                name="floor"
                placeholder="1, 2, 3"
                value={formUpdateRoom.floor}
                onChange={handleChnageUpdate}
                className="w-full max-w-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="md:col-span-2 w-full flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="gray"
                onClick={() => setIsUpdateRoom(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Change</Button>
            </div>
          </form>
        ) : (
          <p>No data available</p>
        )}
      </ModalPopUp>
      {/* modal deltet room */}
      <ModalPopUp
        isOpen={sureDeleteRoom}
        onClose={() => setSureDeleteRoom(false)}
        title={"Are you sure?"}
      >
        {selectRoom ? (
          <div className="text-sm space-y-2 ">
            <p>
              Are you sure you want to delete Room{" "}
              <strong>{selectRoom?.room_number}</strong> ?
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="gray"
                onClick={() => setSureDeleteRoom(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleDelete(selectRoom.room_id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <p>No data available</p>
        )}
      </ModalPopUp>
    </div>
  );
};

export default Room;
