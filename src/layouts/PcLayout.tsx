import { Outlet, Link } from "react-router-dom";

export default function PcLayout() {
    return(
        <div>
            <div>
                <Outlet />
            </div>
        </div>
    )
}