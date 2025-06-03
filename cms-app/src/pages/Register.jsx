import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckToken, RegisterWithToken } from "@/api/auth";

const Register = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [form, setForm] = useState({
    email: "",
    full_name: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleCheckToken = async (token) => {
    try {
      const res = await CheckToken(token);
      const data = res.data;

      if (!res.status === 200 || !data.valid) {
        throw new Error(data.message || "The link is invalid or expired.");
      }

      setTokenValid(true);
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
      setTokenValid(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCheckToken(token);
  }, [token]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await RegisterWithToken(token, form);
      const data = res.data;

      setMessage(data?.message);
      setForm({ email: "", full_name: "", password: "" });

      setTimeout(() => {
        navigate("/thank-you");
      }, 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Checking link...</div>;
  }

  if (!tokenValid) {
    return (
      <div className="text-center mt-10 text-red-500">
        {message || "The link is not working."}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full p-4">
      <div className="max-w-md mx-auto w-full p-4 bg-white shadow-xl rounded-2xl space-y-4">
        <h2 className="text-xl font-semibold border-gray-300 border-b pb-2">
          Apply for membership
        </h2>
        <p>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nam
          inventore autem expedita tenetur. Numquam quibusdam id aliquid debitis
          incidunt doloribus, iste repellendus ex cupiditate quaerat illum illo
          quia totam facere!
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="full_name"
            placeholder="Name - Lastname"
            className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.full_name}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded"
          >
            Submit
          </button>
        </form>
        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
      </div>
    </div>
  );
};

export default Register;
