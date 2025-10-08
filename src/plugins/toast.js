/**
 * plugins/toast.js
 *
 * Vue Toastification configuration
 */

import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const options = {
  // Default options
  position: "top-right",
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false,
};

export default function (app) {
  app.use(Toast, options);
}
