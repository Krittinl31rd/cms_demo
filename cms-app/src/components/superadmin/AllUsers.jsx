import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import DataTable from "@/components/table/DataTable";
import Button from "@/components/ui/Button";
import { GetUsers, CreateUser, IsActiveUser, DeleteUser } from "@/api/user";
import { role_id_to_name, member_role } from "@/constant/common";
import useStore from "@/store/store";
import ModalPopUp from "@/components/ui/ModalPopUp";
import { UserSearch, CircleX, CircleCheck, Plus, Trash } from "lucide-react";
import { toast } from "react-toastify";
import classNames from "classnames";

export default function AllUsers() {
  const { token } = useStore((state) => state);
  const [users, setUsers] = useState([]);
  const [isModalCreateUser, setIsModalCreateUser] = useState(false);
  const [formCreateUser, setFormCreateUser] = useState({
    email: "",
    full_name: "",
    role_id: 2,
  });
  const [isTogglingId, setIsTogglingId] = useState(null);
  const [isSureDeleteUser, SetIsSureDeleteUser] = useState(false);
  const [selectUser, setSelectUser] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await GetUsers(token);
      const mappedUser = (response.data || []).map((row) => ({
        ...row,
        created_at: row.created_at
          ? dayjs(row.created_at).format("DD/MM/YYYY HH.mm")
          : null,
        valid_date: row.valid_date
          ? dayjs(row.valid_date).format("DD/MM/YYYY HH.mm")
          : null,
      }));
      setUsers(mappedUser);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormCreateUser({ ...formCreateUser, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await CreateUser(token, formCreateUser);
      setFormCreateUser({ email: "", full_name: "", role_id: 2 });
      toast.success(response?.data?.message || "Successfully to create user.");
      setIsModalCreateUser(false);
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Falied to create user.");
    }
  };

  const toggleUserStatus = async (user) => {
    if (isTogglingId === user.id) return;
    setIsTogglingId(user.id);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const updatedStatus = user.is_active == 1 ? 0 : 1;
      const response = await IsActiveUser(token, user.id, {
        is_active: updatedStatus,
      });
      toast.success(response?.data?.message || "User status updated.");
      fetchUsers();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update user status."
      );
    } finally {
      setIsTogglingId(null);
    }
  };

  const handleDeleteUser = async (user_id) => {
    try {
      const response = await DeleteUser(token, user_id);
      toast.success(response?.data?.message || "Successfully to delete user.");
      SetIsSureDeleteUser(false);
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Falied to delete user.");
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
      header: "Name",
      accessor: "full_name",
    },
    {
      header: "Email",
      accessor: "email",
    },
    {
      header: "Role",
      accessor: "role_name",
    },
    {
      header: "Status",
      accessor: "is_active",
      cell: (row) =>
        row.is_active == 0 ? (
          <span className="bg-red-500 text-white py-1 px-2 rounded-full font-semibold">
            Deactivate
          </span>
        ) : row.is_active == 1 ? (
          <span className="bg-green-500 text-white py-1 px-2 rounded-full font-semibold">
            Active
          </span>
        ) : (
          <span className="bg-gray-500 text-white py-1 px-2 rounded-full font-semibold">
            Unknow
          </span>
        ),
    },
    {
      header: "Created at",
      accessor: "created_at",
    },
    {
      header: "Valid Date",
      accessor: "valid_date",
    },
    {
      header: "Active",
      accessor: "",
      cell: (row) => (
        <div className="flex items-center gap-4">
          <button
            onClick={() => toggleUserStatus(row)}
            disabled={isTogglingId == row.id}
            className={classNames(
              "relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none",
              {
                "bg-green-500": row.is_active == 1,
                "bg-gray-300": row.is_active == 0,
                "opacity-50 cursor-not-allowed": isTogglingId == row.id,
              }
            )}
          >
            <span
              className={classNames(
                "inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300",
                {
                  "translate-x-6": row.is_active == 1,
                  "translate-x-1": row.is_active == 0,
                }
              )}
            />
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectUser(row);
              SetIsSureDeleteUser(true);
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
        <h1 className="text-2xl font-semibold">Users</h1>
        <Button
          onClick={() => {
            setIsModalCreateUser(true);
          }}
          variants="primary"
        >
          <Plus size={18} />
          Create user
        </Button>
      </div>
      <DataTable columns={columns} data={users} />
      <ModalPopUp
        isOpen={isModalCreateUser}
        onClose={() => setIsModalCreateUser(false)}
        title={"Create user"}
      >
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm"
        >
          <div>
            <label className="block text-sm font-semibold">Email</label>
            <input
              type="email"
              name="email"
              placeholder="john.doe@archi.com"
              value={formCreateUser.email}
              onChange={handleChange}
              className="w-full max-w-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Full Name</label>
            <input
              type="text"
              name="full_name"
              placeholder="John Doe"
              value={formCreateUser.full_name}
              onChange={handleChange}
              className="w-full max-w-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Role</label>
            <select
              name="role_id"
              placeholder="John Doe"
              required
              value={formCreateUser.role_id}
              onChange={handleChange}
              className="w-full max-w-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(member_role)
                .filter(([value, key]) => parseInt(key) != 1)
                .map(([value, key]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
            </select>
          </div>
          <div className="md:col-span-2 w-full flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="gray"
              onClick={() => setIsModalCreateUser(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Confirm</Button>
          </div>
        </form>
      </ModalPopUp>
      <ModalPopUp
        isOpen={isSureDeleteUser}
        onClose={() => SetIsSureDeleteUser(false)}
        title={"Are you sure?"}
      >
        {selectUser ? (
          <div className="text-sm space-y-2 ">
            <p>
              Are you sure you want to delete user{" "}
              <strong>{selectUser.full_name}</strong> ?
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="gray"
                onClick={() => SetIsSureDeleteUser(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleDeleteUser(selectUser.id)}
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
}
