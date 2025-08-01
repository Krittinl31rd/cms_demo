import { member_role } from "@/constant/common";

export function getRoleRedirectPath(role_id) {
  switch (role_id) {
    case member_role.SUPER_ADMIN:
      return "/admin";
    case member_role.FRONT_DESK:
      return "/frontdesk";
    case member_role.TECHNICIAN_LEAD:
      return "/techlead";
    case member_role.TECHNICIAN:
      return "/tech";
    default:
      // return "/login";
      window.location.href = "http://192.168.1.147:3000/Login";
  }
}
