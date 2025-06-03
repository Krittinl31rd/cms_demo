import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import DataTable from "@/components/table/DataTable";
import Button from "@/components/ui/Button";
import { GetPendingUsers } from "@/api/user";
import { role_id_to_name } from "@/constant/common";
import useStore from "@/store/store";
import ModalPopUp from "@/components/ui/ModalPopUp";
import { UserSearch, X, CircleCheck } from "lucide-react";

export default function UserPending() {
  const { token } = useStore((state) => state);
  const [userPending, setUserPending] = useState([]);

  const fetchUserPending = async () => {
    try {
      const response = await GetPendingUsers(token);
      setUserPending(response.data.data || []);
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
      accessor: "status",
      cell: (row) =>
        row.status == "pending" ? (
          <span className="bg-yellow-500 text-white py-1 px-2 rounded-full font-semibold">
            Pending
          </span>
        ) : row.status == "approved" ? (
          <span className="bg-green-500 text-white py-1 px-2 rounded-full font-semibold">
            Approved
          </span>
        ) : (
          <span className="bg-red-500 text-white py-1 px-2 rounded-full font-semibold">
            rejected
          </span>
        ),
    },
    {
      header: "Submitted at",
      accessor: "submitted_at",
      cell: (row) => dayjs(row.created_at).format("DD/MM/YYYY HH.mm"),
    },
    {
      header: "Action",
      accessor: "action",
      cell: (row) =>
        row.status == "pending" ? (
          <div className="flex gap-2 items-center">
            <button className="text-green-500 hover:underline cursor-pointer">
              <CircleCheck />
            </button>
            <button className="text-red-500 hover:underline cursor-pointer">
              <X />
            </button>
          </div>
        ) : (
          <button className="inline-flex  items-center text-primary hover:underline cursor-pointer">
            <UserSearch />
          </button>
        ),
      //   <button className="text-red-500 hover:underline">Rejects</button>
      //    <button className="text-primary hover:underline">Details</button>
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">Users Pending</h1>
      <DataTable columns={columns} data={userPending} />
    </div>
  );
}
