import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const {user, loading, logout} = useAuth()
    
    return (
        <nav className="flex items-center justify-between border-b p-4">
            <Link to="/" className="text-xl font-bold">Kicks</Link>
            <div className="flex items-center gap-4">
                <Link to="/store">Store</Link>
                <Link to="/cart">Cart</Link>
                {!loading && (
                    user ? (
                        <>
                            <span>{user.name}</span>
                            <button onClick={logout} className="rounded bg-black px-3 py-1 text-white">
                                Logout
                            </button>
                        </>
                    
                    ) : (
                        <Link to='/login'>Login</Link>
                    )
                )}
            </div>
        </nav>
    )
}