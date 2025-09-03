import LeaderDashboard from "../pages/LeaderDashboard";
import Login from "../pages/Login";
import MemberDashboard from "../pages/MemberDashboard";
import AllSchedule from "../pages/AllSchedule";
import App from "../App";
import {
    createBrowserRouter,
    Navigate,
    RouterProvider,
  } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Protected Route Component
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect based on user role
    if (user?.role === 'team_leader') {
      return <Navigate to="/leader-dashboard" replace />;
    } else {
      return <Navigate to="/member-dashboard" replace />;
    }
  }

  return children;
}

// Role-based Route Component
function RoleBasedRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  if (user?.role === 'team_leader') {
    return <Navigate to="/leader-dashboard" replace />;
  } else {
    return <Navigate to="/member-dashboard" replace />;
  }
}

export default function Index() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <App />,
      children: [
        {
          path: '/',
          element: <RoleBasedRoute><div /></RoleBasedRoute>
        },
        {
          path: '/member-dashboard',
          element: (
            <ProtectedRoute allowedRoles={['team_member']}>
              <MemberDashboard />
            </ProtectedRoute>
          )
        },
        {
          path: '/leader-dashboard',
          element: (
            <ProtectedRoute allowedRoles={['team_leader']}>
              <LeaderDashboard />
            </ProtectedRoute>
          )
        },
        {
          path: '/all-schedule',
          element: (
            <ProtectedRoute>
              <AllSchedule />
            </ProtectedRoute>
          )
        },
        {
          path: '/login',
          element: <Login />
        }
      ]
    }
  ]);

  return <RouterProvider router={router} />;
}