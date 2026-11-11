import { createBrowserRouter } from "react-router-dom"
import ClassesPage from "@/pages/ClassesPage"
import ClassDetailPage from "@/pages/ClassDetailPage"
import HoldDetailsPage from "@/pages/HoldDetailsPage"

const router = createBrowserRouter([
  {
    path: "/",
    element: <ClassesPage />,
  },
  {
    path: "/classes/:classId",
    element: <ClassDetailPage />,
  },
  {
    path: "/holds/:holdId",
    element: <HoldDetailsPage />,
  },
])

export default router
