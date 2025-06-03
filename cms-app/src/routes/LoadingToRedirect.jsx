import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import useStore from "@/store/store";
import { getRoleRedirectPath } from "@/utilities/getRoleRedirectPath";

const LoadingToRedirect = () => {
  const { user } = useStore((state) => state);
  const [count, setCount] = useState(2);
  const [redirect, setRedirect] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((current) => {
        if (current === 1) {
          clearInterval(interval);
          setRedirect(true);
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (redirect) {
      if (user?.role_id) {
        const path = getRoleRedirectPath(user.role_id);
        navigate(path);
      } else {
        navigate("/login");
      }
    }
  }, [redirect, user, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center space-x-2">
        <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        <span className="text-lg">Redirecting in {count}...</span>
      </div>
    </div>
  );
};

export default LoadingToRedirect;
