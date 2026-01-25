import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import type { Role } from "./types";

export default function ProtectedRoute({ allow }: { allow?: Role[] }){
    const { user } = useAuth()

    if(!user) return <Navigate to="/login" replace />

    if(allow && !allow.includes(user.role)) return <Navigate to="/orders" replace />

    return <Outlet />

}