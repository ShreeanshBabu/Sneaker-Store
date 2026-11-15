import { useNavigate, Link } from "react-router"
import { useAuth } from "../context/AuthContext"
import { useState } from "react"

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSubmitting(true)
        try {
            await login(email, password)
            navigate('/')
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mx-auto mt-10 flex max-w-sm flex-col gap-4">
            <h1 className="text-2xl font-bold">Log in</h1>
            {error && <p className="text-red-600">{error}</p>}
            <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="rounded border p-2" 
            />
            <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="rounded border p-2" 
            />
            <button
                disabled={submitting}
                className="rounded bg-black p-2 text-white disabled:opacity-50"
            >
                {submitting ? 'Logging in...' : 'Log in'}
            </button>
            <p>
                No account? <Link to='/register' className='underline'>Register</Link>
            </p>
        </form>
    )
}