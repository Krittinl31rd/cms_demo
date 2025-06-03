import React, { useState } from "react";
import DataTable from "@/components/table/DataTable";
import CardSummary from "@/components/ui/CardSummary";
import CardRoom from "@/components/ui/CardRoom";
import ModalPopup from "@/components/ui/ModalPopup";
import ElementDevices from "@/components/ui/ElementDevices";
import { Wifi, WifiOff, Globe, ListFilter, Check } from "lucide-react";
import { data } from "@/constant/data";
const stats = data.stats;
const rooms = data.rooms;

const Rooms = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [isModalFilterOpen, setIsModalFilterOpen] = useState(false);
  const filterLabels = {
    status_online: "Online",
    status_offline: "Offline",
    check_1: "Check-IN",
    check_0: "Check-OUT",
    gi_1: "Guest In",
    gi_0: "Guest Out",
    dnd_1: "DND",
    mur_1: "MUR",
    noservice: "No Service",
  };
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalRoomOpen, setIsModalRoomOpen] = useState(false);

  const toggleFilter = (filterKey) => {
    setFilters((prev) => {
      const updated = { ...prev };
      const isChecked = !prev[filterKey];
      updated[filterKey] = isChecked;

      if (filterKey == "status_online" && isChecked) {
        updated["status_offline"] = false;
      }

      if (filterKey == "status_offline" && isChecked) {
        updated["status_online"] = false;
      }

      if (filterKey == "check_1" && isChecked) {
        updated["check_0"] = false;
      }

      if (filterKey == "check_0" && isChecked) {
        updated["check_1"] = false;
      }

      if (filterKey == "gi_1" && isChecked) {
        updated["gi_0"] = false;
      }

      if (filterKey == "gi_0" && isChecked) {
        updated["gi_1"] = false;
      }

      if (filterKey == "dnd_1" && isChecked) {
        updated["mur_1"] = false;
        updated["noservice"] = false;
      }

      if (filterKey == "mur_1" && isChecked) {
        updated["dnd_1"] = false;
        updated["noservice"] = false;
      }

      if (filterKey == "noservice" && isChecked) {
        updated["dnd_1"] = false;
        updated["mur_1"] = false;
      }

      return updated;
    });
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const activeFilters = Object.entries(filters).filter(([_, value]) => value);

    if (activeFilters.length == 0) return matchesSearch;

    const matchAnyFilter = activeFilters.every(([filterKey]) => {
      if (filterKey === "noservice") {
        return room.devices.dnd == 0 && room.devices.mur == 0;
      }

      const [key, rawValue] = filterKey.split("_");
      const value = isNaN(rawValue) ? rawValue : Number(rawValue);

      if (key == "status") return room.status == value;
      if (["check", "dnd", "mur", "gi"].includes(key))
        return room.devices[key] == value;

      return false;
    });

    return matchesSearch && matchAnyFilter;
  });

  const activeFilterLabels = Object.entries(filters)
    .filter(([_, value]) => value)
    .map(([key]) => filterLabels[key])
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-2">
      <div className="hidden sm:grid md:grid-cols-2 lg:grid-cols-4 gap-2">
        <CardSummary
          title="Online"
          value={stats.onlineRooms}
          icon={Globe}
          iconColor="text-green-500"
        />
        <CardSummary
          title="Offline"
          value={stats.offlineRooms}
          icon={Globe}
          iconColor="text-red-500"
        />
      </div>

      <div className="w-full flex items-center justify-between gap-2 bg-white rounded-xl shadow-xl p-4">
        <input
          type="text"
          placeholder="Search by room number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => setIsModalFilterOpen(true)}
          className="flex items-center gap-1  text-primary cursor-pointer rounded-lg p-1 hover:bg-gray-100"
        >
          Filter <ListFilter size={16} />
        </button>
      </div>
      <h1 className="text-sm">
        Filter by:{" "}
        {activeFilterLabels.length > 0 ? (
          <span className="font-semibold">{activeFilterLabels.join(", ")}</span>
        ) : (
          <span className="font-semibold">None</span>
        )}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => (
            <CardRoom
              onClick={() => {
                setSelectedRoom(room);
                setIsModalRoomOpen(true);
              }}
              key={room.id}
              room={room}
            />
          ))
        ) : (
          <p className="text-center col-span-full text-gray-500">
            No rooms found.
          </p>
        )}
      </div>

      <ModalPopup
        isOpen={isModalFilterOpen}
        onClose={() => setIsModalFilterOpen(false)}
        title={`Filter`}
      >
        <div className="space-y-2 text-sm">
          <button
            className="absolute top-12 right-6 text-primary font-semibold hover:underline cursor-pointer"
            onClick={() => {
              setSearch("");
              setFilters({});
            }}
          >
            Reset
          </button>
          <h1 className=" font-semibold">General</h1>
          <div className="w-full flex items-center flex-wrap gap-2 pb-2 border-b border-gray-300">
            {[
              { key: "status", value: "online", label: "Online" },
              { key: "status", value: "offline", label: "Offline" },
              { key: "check", value: 1, label: "Check-IN" },
              { key: "check", value: 0, label: "Check-OUT" },
              { key: "gi", value: 1, label: "Guest In" },
              { key: "gi", value: 0, label: "Guest Out" },
            ].map(({ key, value, label }) => {
              const filterKey = `${key}_${value}`;
              return (
                <label
                  key={filterKey}
                  className="relative flex items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={!!filters[filterKey]}
                    className="peer hidden"
                    onChange={() => toggleFilter(filterKey)}
                  />

                  <div
                    className="flex items-center gap-1 border border-gray-400 px-2 py-1 rounded-full 
                  peer-checked:bg-blue-100 peer-checked:border-blue-100 peer-checked:text-blue-500 peer-checked:pl-7"
                  >
                    <span className="font-semibold">{label}</span>
                  </div>
                  <Check className="absolute top-2 left-2 w-4 h-4 text-blue-500 hidden peer-checked:block" />
                </label>
              );
            })}
          </div>
          <h1 className=" font-semibold">Room Service</h1>
          <div className="w-full flex items-center flex-wrap gap-2 pb-2 border-b border-gray-300">
            {[
              { key: "dnd", value: 1, label: "DND" },
              { key: "mur", value: 1, label: "MUR" },
              { key: "noservice", label: "No Service" },
            ].map(({ key, value, label }) => {
              const filterKey = value != undefined ? `${key}_${value}` : key;
              return (
                <label
                  key={filterKey}
                  className="relative flex items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={!!filters[filterKey]}
                    className="peer hidden"
                    onChange={() => toggleFilter(filterKey)}
                  />

                  <div
                    className="flex items-center gap-1 border border-gray-400 px-2 py-1 rounded-full 
                  peer-checked:bg-blue-100 peer-checked:border-blue-100 peer-checked:text-blue-500 peer-checked:pl-7"
                  >
                    <span className="font-semibold">{label}</span>
                  </div>
                  <Check className="absolute top-2 left-2 w-4 h-4 text-blue-500 hidden peer-checked:block" />
                </label>
              );
            })}
          </div>
        </div>
      </ModalPopup>
      <ModalPopup
        isOpen={isModalRoomOpen}
        onClose={() => setIsModalRoomOpen(false)}
        title={`${selectedRoom?.name}`}
      >
        <ElementDevices room={selectedRoom || {}} />
      </ModalPopup>
    </div>
  );
};

export default Rooms;
