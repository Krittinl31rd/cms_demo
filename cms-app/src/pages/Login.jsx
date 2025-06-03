import React, { useEffect, useState } from "react";
import useRoleRedirect from "@/hooks/useRoleRedirect";
import useStore from "@/store/store";
import { Eye, EyeOff, Lock, User, Hotel } from "lucide-react";
import { toast } from "react-toastify";

const Login = () => {
  const { user, actionLogin } = useStore((state) => state);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const redirectByRole = useRoleRedirect();

  const handelOnChage = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await actionLogin(form);
      const role_id = res.data.payload.role_id;
      redirectByRole(role_id);
      toast.success(
        `${res.data?.message} | Welcome ${res.data?.payload?.full_name}`
      );
    } catch (err) {
      const errMsg = err.response?.data?.message;
      toast.error(errMsg);
    }
  };

  useEffect(() => {
    if (user?.role_id) {
      redirectByRole(user.role_id);
    }
  }, [user, redirectByRole]);

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-gray-900 to-black">
      <div className="relative m-auto w-full max-w-md p-6">
        <div className="backdrop-blur-lg bg-white/10 rounded-2xl border border-white/20 shadow-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-white rounded-full p-3 mb-4">
              <Hotel size={32} className="text-black" />
            </div>
            <h1 className="text-white text-2xl font-bold">CMS System</h1>
            {/* <p className="text-gray-300 mt-1">Admin Portal</p> */}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="username"
                className="block text-gray-300 text-sm font-medium mb-2"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="username"
                  id="username"
                  type="username"
                  onChange={handelOnChage}
                  className="bg-black/30 text-white placeholder-gray-400 block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-gray-300 text-sm font-medium mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="password"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  onChange={handelOnChage}
                  className="bg-black/30 text-white placeholder-gray-400 block w-full pl-10 pr-10 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-white focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 bg-gray-800 border-gray-600 rounded text-white focus:ring-white/50"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-300"
                >
                  Remember me
                </label>
              </div>
              <div>
                <a href="#" className="text-sm text-gray-300 hover:text-white">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-white hover:bg-gray-200 text-black font-medium py-3 px-4 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-center text-sm text-gray-400">
              © 2025 Archi-tronic Co.,Ltd.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
