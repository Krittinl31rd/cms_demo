import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { initOneSignal } from "@/utilities/onesignal-init";

const App = () => {
  useEffect(() => {
    (async () => {
      await initOneSignal();
    })();
  }, []);
  return (
    <>
      <ToastContainer autoClose={2000} closeOnClick />
      <AppRoutes />
    </>
  );
};

export default App;
