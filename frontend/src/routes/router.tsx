import { createBrowserRouter } from "react-router-dom"
import ClassesPage from "@/pages/ClassesPage"
import ClassDetailPage from "@/pages/ClassDetailPage"
import HoldDetailPage from "@/pages/HoldDetailPage"

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
    element: <HoldDetailPage />,
  },
])

export default router
