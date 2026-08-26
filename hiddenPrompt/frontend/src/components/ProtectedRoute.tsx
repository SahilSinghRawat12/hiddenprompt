import React from 'react'
import { Navigate, Outlet, useParams } from 'react-router-dom';

const ProtectedRoute = () => {

    const username = localStorage.getItem("username");
    const {roomCode} = useParams<{roomCode: string}>();

    // Redirect to Home if username is missing or empty
  if (!username || !username.trim() || !roomCode) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute