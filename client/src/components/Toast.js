import { ToastContainer } from "react-toastify";

function Toast() {
  return (
    <ToastContainer
      autoClose={1000}
      className="custom-toast"
      progressClassName="Toastify__progress-bar"
    />
  );
}

export default Toast;
