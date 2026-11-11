import { createBrowserRouter } from "react-router-dom"
import ClassesPage from "@/pages/ClassesPage"
import ClassDetailPage from "@/pages/ClassDetailPage"

const router = createBrowserRouter([
  {
    path: "/",
    element: <ClassesPage />,
  },
  {
    path: "/classes/:classId",
    element: <ClassDetailPage />,
  },
])

export default router
