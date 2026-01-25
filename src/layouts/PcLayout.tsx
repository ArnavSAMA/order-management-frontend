import { useAuth } from "@/app/providers/AuthProvider";
import { useNavigate, Outlet, NavLink } from "react-router-dom";

function NavItem({ to, label}: { to: string; label: string}){
    return(
        <NavLink 
            to={to}
            className={({ isActive }) =>
                [
                    'block rounded-lg px-3 py-2 text-sm font-medium transition',
                    isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                ].join(' ')
            }
            end
        >
            {label}
        </NavLink>
    )
}

export default function PcLayout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return(
        <div className="min-h-screen bg-gray-50">
            {/* Top header */}
            <header className="border-b border-gray-200 bg-white ">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900">Order Management</h1>
                        <p className="text-sm text-gray-500">React+Vite</p>
                    </div>

                    <div className="text-sm text-gray-600">
                        Role:{' '} 
                        <span className="font-medium text-gray-900">
                            {user ? user.role : 'Not logged in'}
                        </span>
                    </div>
                </div>

                
            </header>

            {/* Body: sidebar+content */}
            <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 px-6 py-6">
                <aside className="col-span-12 md:col-span-3">
                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Menu
                        </p>

                        <nav className="space-y-2">
                            <NavItem to="/orders" label="Orders" />
                            {user?.role === 'clerk' && (
                                <NavItem to="/orders/new" label="New Order" />
                            )}
                            <button
                                onClick={handleLogout}
                                className="mt-4 w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-medium
                                 text-red-600 hover:bg-red-50 transition duration-300 ease-in-out"
                            >
                                Logout
                            </button>
                        </nav>

                    </div>
                </aside>
            

                {/* Page Content */}
                <main className="col-span-12 md:col-span-9">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6">
                        <Outlet />
                    </div>
                </main>
            </div>
            
        </div>
    )
}