import { Link } from "react-router";

export default function Navbar() {
    return (
        <nav className="flex items-center justify-between border-b p-4">
            <Link to="/" className="text-xl font-bold">Kicks</Link>
            <div className="flex gap-4">
                <Link to="/store">Store</Link>
                <Link to="/cart">Cart</Link>
                <Link to="/login">Login</Link>
            </div>
        </nav>
    )
}