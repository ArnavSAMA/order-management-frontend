import { useAuth } from "@/app/providers/AuthProvider"
import { useNavigate } from "react-router-dom"
import type { Role } from './types'

export default function LoginPage(){
    const { login } = useAuth()
    const navigate = useNavigate()

    const doLogin = (role: Role) => {
        login(role)
        navigate('/orders')
    }
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6">
                <h1 className="text-xl font-semibold text-gray-900">Login (Temporary)</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Choose a role to simulate login. We'll replace this with API later.
                </p>

                <div className="mt-6 space-y-3">
                    <button 
                    onClick={()=> doLogin('clerk')}
                    className="w-full cursor-pointer rounded-lg bg-gray-900 px-4 py-3 text-white font-medium"
                    >Login as clerk(Admin)</button>
                    <button 
                    onClick={()=> doLogin('staff')}
                    className="w-full cursor-pointer rounded-lg border border-gray-300 px-4 py-3 font-medium"
                    >Login as Staff</button>
                    <button 
                    onClick={()=> doLogin('boss')}
                    className="w-full cursor-pointer rounded-lg border border-gray-300 px-4 py-3 font-medium"
                    >Login as Boss(President)</button>
                </div>
            </div>
        </div>
    )
}