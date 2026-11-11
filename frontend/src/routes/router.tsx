import { createBrowserRouter } from "react-router-dom"
import { MainLayout } from "@/components/layout/MainLayout"
import ClassesPage from "@/pages/ClassesPage"
import ClassDetailPage from "@/pages/ClassDetailPage"
import HoldDetailsPage from "@/pages/HoldDetailsPage"
import MyApplicationsPage from "@/pages/MyApplicationsPage"

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <ClassesPage />,
      },
      {
        path: "classes/:classId",
        element: <ClassDetailPage />,
      },
      {
        path: "holds/:holdId",
        element: <HoldDetailsPage />,
      },
      {
        path: "my-applications",
        element: <MyApplicationsPage />,
      },
    ],
  },
])

export default router
