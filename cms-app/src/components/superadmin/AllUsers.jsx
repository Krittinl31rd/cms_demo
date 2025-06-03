import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import DataTable from "@/components/table/DataTable";
import Button from "@/components/ui/Button";
import { GetUsers } from "@/api/user";
import { role_id_to_name } from "@/constant/common";
import useStore from "@/store/store";
import ModalPopUp from "@/components/ui/ModalPopUp";
import { UserSearch, CircleX, CircleCheck, Plus } from "lucide-react";

export default function AllUsers() {
  const { token } = useStore((state) => state);
  const [users, setUsers] = useState([]);

  const fetchUserPending = async () => {
    try {
      const response = await GetUsers(token);
      setUsers(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch invitations:", err);
    }
  };

  useEffect(() => {
    fetchUserPending();
  }, [token]);

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
      header: "Status",
      accessor: "is_active",
      cell: (row) =>
        row.is_active == 0 ? (
          <span className="bg-red-500 text-white py-1 px-2 rounded-full font-semibold">
            Not active
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
      cell: (row) => dayjs(row.created_at).format("DD/MM/YYYY HH.mm"),
    },
    {
      header: "Valid Date",
      accessor: "valid_date",
      cell: (row) => dayjs(row.valid_date).format("DD/MM/YYYY HH.mm"),
    },
    // {
    //   header: "Action",
    //   accessor: "action",
    //   cell: (row) =>
    //     row.status == "pending" ? (
    //       <div className="flex gap-2 items-center">
    //         <button className="text-green-500 hover:underline cursor-pointer">
    //           <CircleCheck />
    //         </button>
    //         <button className="text-red-500 hover:underline cursor-pointer">
    //           <CircleX />
    //         </button>
    //       </div>
    //     ) : (
    //       <button className="inline-flex  items-center text-primary hover:underline cursor-pointer">
    //         <UserSearch />
    //       </button>
    //     ),
    // },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">All users</h1>
        <Button
          //   onClick={() => {
          //     setIsCreateLink(true);
          //   }}
          variants="primary"
        >
          <Plus size={18} />
          Create user
        </Button>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
}
