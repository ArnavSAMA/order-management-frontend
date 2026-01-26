import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import type { Role } from "./types";

export default function ProtectedRoute({ allow }: { allow?: Role[] }){
    const { user, ready } = useAuth()

    if(!ready){
        return(
            <div className="p-6 text-sm text-gray-600">
                Loading...
            </div>
        )
    }

    if(!user) return <Navigate to="/login" replace />

    if(allow && !allow.includes(user.role)) return <Navigate to="/orders" replace />

    return <Outlet />

}