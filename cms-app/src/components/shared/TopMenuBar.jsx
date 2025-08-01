import { useState, useRef, useEffect } from "react";
import classNames from "classnames";
import { User, CircleUser, LogOut, Settings, Bell } from "lucide-react";
import { PanelLeftOpen } from "lucide-react";
import { getDateNow } from "@/utilities/date";
import { sidebarItems } from "@/constant/sidebarItems";
import avatar from "@/assets/images/avatar/oasis.jpg";
import { role_id_to_name } from "@/constant/common";
import useStore from "@/store/store";
import { useNavigate, NavLink, useLocation, matchPath } from "react-router-dom";
import dayjs from "dayjs";
import { use } from "react";

const TopMenuBar = ({ user }) => {
  const navigate = useNavigate();
  const { actionLogout, subscribeId } = useStore((state) => state);
  const [isOpenProfile, setIsOpenProfile] = useState(false);
  const dropdownRef = useRef(null);
  const [now, setNow] = useState(dayjs().format("DD/MM/YYYY HH:mm"));

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(dayjs().format("DD/MM/YYYY HH:mm"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpenProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    actionLogout({ user_id: user.id, subscribe_id: subscribeId });
    navigate("/");
  };
  return (
    <header className="w-full h-16 bg-white fixed top-0 left-0 right-0 z-50 flex items-center px-4 border-b border-gray-200">
      <div className="flex-1 flex flex-row items-center justify-between gap-4 ">
        <div className="flex-1 flex flex-col justify-center ">
          <h1 className="text-xl  font-semibold">{now}</h1>
        </div>

        <div className="relative inline-block text-left" ref={dropdownRef}>
          <button
            onClick={() => setIsOpenProfile(!isOpenProfile)}
            className="flex items-center gap-2 transition p-1 rounded-full hover:bg-gray-300  cursor-pointer"
          >
            {user?.img_profile ? (
              <img
                src={`${import.meta.env.VITE_BASE_PROFILE_PATH}/${
                  user.img_profile
                }`}
                alt="avatar"
                className="w-10 h-10 rounded-full object-contain border border-gray-300"
              />
            ) : (
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-semibold">
                {user?.full_name?.charAt(0)}
              </span>
            )}
          </button>

          {isOpenProfile && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg z-50">
              <div className="py-2">
                <button
                  onClick={() =>
                    alert(
                      `Email: ${user.email} | Username: ${
                        user?.full_name
                      } | Role: ${
                        role_id_to_name[user?.role_id] || "Unknown Role"
                      }`
                    )
                  }
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <User size={16} className="mr-2" />
                  <div className="flex-1 flex flex-col items-start">
                    <div className="truncate max-w-[120px]">
                      {user?.full_name}
                    </div>
                    <div className="text-xs truncate max-w-[120px]">
                      {role_id_to_name[user?.role_id] || "Unknown Role"}
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => alert("Settings")}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <Settings size={16} className="mr-2" /> Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <LogOut size={16} className="mr-2" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopMenuBar;
