import { Bounce, toast } from "react-toastify"

type postionT =
  | "top-right"
  | "top-center"
  | "top-left"
  | "bottom-right"
  | "bottom-center"
  | "bottom-left"

export const useToastify = () => {
  const errorToast = (message: string, position?: postionT) => {
    return toast.error(message, {
      position: position || "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
    })
  }

  const successToast = (message: string, position?: postionT) => {
    return toast.success(message, {
      position: position || "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
    })
  }

  return { successToast, errorToast }
}
