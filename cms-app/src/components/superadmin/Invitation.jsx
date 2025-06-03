import React, { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import DataTable from "@/components/table/DataTable";
import DateTimePicker from "@/components/ui/DateTimePicker";
import Button from "@/components/ui/Button";
import { GetInvitationTokens } from "@/api/user";
import { role_id_to_name } from "@/constant/common";
import useStore from "@/store/store";
import { toast } from "react-toastify";
import { Copy, X, RotateCcw, Plus } from "lucide-react";
import ModalPopup from "@/components/ui/ModalPopup";
import { toUTCStringAuto } from "@/utilities/date";
import {
  CreateInvite,
  RevokeInvite,
  ApprovesUser,
  RejectUser,
} from "@/api/auth";
const BASE_INVITE_URL = import.meta.env.VITE_INVITE_BASE_URL;

export default function Invitation() {
  const { token } = useStore((state) => state);
  const [form, setForm] = useState({ role_id: "2" });
  const [isCreateLink, setIsCreateLink] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRevoke, setIsRevoke] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedExpiry, setSelectedExpiry] = useState("all");
  const [selectCancel, setSelectCancel] = useState("");
  const [resetPage, setResetPage] = useState(() => () => {});

  const fetchInvitations = async () => {
    try {
      const response = await GetInvitationTokens(token);
      const mappedInvitations = (response.data.data || []).map((inv) => ({
        ...inv,
        role_name: role_id_to_name[inv.role_id] || "Unknown Role",
      }));
      setInvitations(mappedInvitations);
    } catch (err) {
      console.error("Failed to fetch invitations:", err);
    }
  };

  const filteredInvitations = invitations.filter((inv) => {
    const matchRole = selectedRole === "all" || inv.role_name === selectedRole;

    const isExpired = dayjs(inv.expires_at).isBefore(dayjs());
    const matchExpiry =
      selectedExpiry === "all" ||
      (selectedExpiry === "expired" && isExpired) ||
      (selectedExpiry === "not_expired" && !isExpired);

    return matchRole && matchExpiry;
  });

  const filterComponent = (
    <div className="w-full flex flex-col md:flex-row items-center justify-between">
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={selectedRole}
          onChange={(e) => {
            setSelectedRole(e.target.value);
            resetPage();
          }}
          className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Roles All</option>
          {Object.entries(role_id_to_name)
            .filter(([roleId]) => parseInt(roleId) !== 1)
            .map(([roleId, roleName]) => (
              <option key={roleId} value={roleName}>
                {roleName}
              </option>
            ))}
        </select>

        <select
          value={selectedExpiry}
          onChange={(e) => {
            setSelectedExpiry(e.target.value);
            resetPage();
          }}
          className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Status All</option>
          <option value="expired">Expired</option>
          <option value="not_expired">Not Expired</option>
        </select>
      </div>
      <button
        className=" text-primary  hover:underline cursor-pointer"
        onClick={() => {
          setSelectedRole("all");
          setSelectedExpiry("all");
        }}
      >
        Reset
      </button>
    </div>
  );

  useEffect(() => {
    fetchInvitations();
  }, [token]);

  const handleCopy = (token) => {
    const inviteLink = `${BASE_INVITE_URL}/${token}`;
    navigator.clipboard.writeText(inviteLink).then(() => {
      toast.success("Invite link copied to clipboard!", {
        autoClose: 1500,
        closeOnClick: true,
      });
    });
  };

  const handleRegisterResetPage = useCallback((fn) => {
    setResetPage(() => fn);
  }, []);

  const handleFormChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!form.expires_at) {
      return toast.error(`Please input expired link date.`);
    }

    setIsSubmitting(true);
    try {
      const res = await CreateInvite({ token, form });
      toast.success(`${res.data?.message}`);
      fetchInvitations();
      resetPage?.();
    } catch (err) {
      const errMsg = err.response?.data?.message || "Error submitting form";
      toast.error(errMsg);
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 2500);
    }
  };

  const handleRevoke = async (id) => {
    try {
      const res = await RevokeInvite({ token, id });
      toast.success(`${res.data?.message}`);
      fetchInvitations();
      resetPage?.();
    } catch (err) {
      const errMsg =
        err.response?.data?.message || "Failed revoke invite link.";
      toast.error(errMsg);
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
      header: "Token",
      accessor: "token",
      cell: (row) => row.token.slice(-8),
    },
    {
      header: "Role",
      accessor: "role_name",
    },
    {
      header: "Used",
      accessor: "used_count",
      cell: (row) => {
        const isFull = row.used_count >= row.max_uses;
        return (
          <span className={isFull ? "text-red-500 font-semibold" : ""}>
            {row.used_count}/{row.max_uses}
          </span>
        );
      },
    },
    {
      header: "Status",
      accessor: "expires_at",
      cell: (row) =>
        dayjs(row.expires_at).isBefore(dayjs()) ? (
          <span className="bg-red-500 text-white py-1 px-2 rounded-full font-semibold">
            Expired
          </span>
        ) : (
          dayjs(row.expires_at).format("DD/MM/YYYY HH:mm")
        ),
    },
    {
      header: "Created at",
      accessor: "created_at",
      cell: (row) => dayjs(row.created_at).format("DD/MM/YYYY HH.mm"),
    },
    {
      header: "Action",
      accessor: "action",
      cell: (row) => (
        <div className="flex gap-4 items-center">
          <button
            className="text-primary hover:underline cursor-pointer"
            onClick={() => handleCopy(row.token)}
          >
            <Copy />
          </button>
          <button
            className="text-red-500 hover:underline cursor-pointer"
            onClick={() => {
              setSelectCancel(row);
              setIsRevoke(true);
            }}
          >
            <X />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Invitation Tokens</h1>
        <Button
          onClick={() => {
            setIsCreateLink(true);
          }}
          variants="primary"
        >
          <Plus size={18} />
          Create Link
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={filteredInvitations}
        filterComponent={filterComponent}
        enableSearch={true}
        onFilterChange={handleRegisterResetPage}
      />

      <ModalPopup
        isOpen={isCreateLink}
        onClose={() => setIsCreateLink(false)}
        title={`Create link for user`}
      >
        <div className="space-y-2">
          <form onSubmit={handleSubmit} className="w-full mx-auto space-y-2">
            <div>
              <label className="block text-sm font-semibold">Role</label>
              <select
                name="role_id"
                value={form.role_id}
                onChange={(e) =>
                  handleFormChange(e.target.name, e.target.value)
                }
                className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(role_id_to_name)
                  .filter(([roleId]) => parseInt(roleId) !== 1)
                  .map(([roleId, roleName]) => (
                    <option key={roleId} value={roleId}>
                      {roleName}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold">
                Expired link date
              </label>
              <DateTimePicker
                onDateTimeSelect={(dt) => {
                  const utcString = toUTCStringAuto(dt);
                  handleFormChange("expires_at", utcString);
                }}
              />
            </div>
            <div className="flex items-center justify-end">
              <button
                disabled={isSubmitting}
                className="  bg-primary text-white font-semibold py-2 px-4 rounded-lg"
              >
                {!isSubmitting ? "Create" : "Createing..."}
              </button>
            </div>
          </form>
        </div>
      </ModalPopup>
      <ModalPopup
        isOpen={isRevoke}
        onClose={() => setIsRevoke(false)}
        title={`Are you sure`}
      >
        {selectCancel ? (
          <div className="space-y-2 text-sm">
            <p>
              Revokes invitation{" "}
              <span className="font-semibold">
                {selectCancel.token.slice(-8)} | {selectCancel.role_name}
              </span>
            </p>
            <div className="w-full flex items-center justify-end gap-2">
              <Button variant="gray" onClick={() => setIsRevoke(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleRevoke(selectCancel.token);
                  setIsRevoke(false);
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        ) : (
          <p>No data available</p>
        )}
      </ModalPopup>
    </div>
  );
}
