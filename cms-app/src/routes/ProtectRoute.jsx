import React, { useState, useEffect } from "react";
import useStore from "@/store/store";
import { Current } from "@/api/auth";
import LoadingToRedirect from "./LoadingToRedirect";
import { Outlet, Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const ProtectRoute = ({
  element: Element,
  allowedRoles = [],
  requiredPermission = null,
}) => {
  const [status, setStatus] = useState(false);
  const [checking, setChecking] = useState(true);
  const { user, token, actionLogout2 } = useStore((state) => state);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && token) {
      Current(token)
        .then((res) => {
          // check role and permission
          const userRole = res.data.user.role_id;
          const userPerms = res.data.user.permissions || [];

          const roleCheck =
            allowedRoles.length == 0 || allowedRoles.includes(userRole);
          const permCheck =
            !requiredPermission || userPerms.includes(requiredPermission);

          if (roleCheck && permCheck) {
            setStatus(true);
          } else {
            setStatus(false);
          }
        })
        .catch((err) => {
          if (err.response?.status === 401) {
            actionLogout2();
            // navigate("/login");
            window.location.href = "http://192.168.1.147:3000/Login";
          }
          setStatus(false);
        })
        .finally(() => setChecking(false));
    } else {
      setStatus(false);
      setChecking(false);
    }
  }, [user, token]);

  if (checking) return <LoadingToRedirect />;

  // if (!status) return <Navigate to="/login" />;
  if (!status)
    return (window.location.href = "http://192.168.1.147:3000/Login");

  return (
    <Element>
      <Outlet />
    </Element>
  );
};

export default ProtectRoute;
