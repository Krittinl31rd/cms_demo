import { useNavigate } from "react-router-dom";
import { getRoleRedirectPath } from "@/utilities/getRoleRedirectPath";

const useRoleRedirect = () => {
  const navigate = useNavigate();
  return (role_id) => {
    const path = getRoleRedirectPath(role_id);
    navigate(path);
  };
};

export default useRoleRedirect;
