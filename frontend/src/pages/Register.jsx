import { useNavigate, Link } from "react-router"
import { useAuth } from "../context/AuthContext"
import { useState } from "react"

export default function Register() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [verifyPassword, setVerifyPassword] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSubmitting(true)
        try {
            if (password !== verifyPassword) throw setError('Passwords do not match')
            await register(name, email, password)
            navigate('/')
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mx-auto mt-10 flex max-w-sm flex-col gap-4">
            <h1 className="text-2xl font-bold">Register</h1>
            {error && <p className="text-red-600">{error}</p>}
            <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
                className="rounded border p-2" 
            />
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
                minLength={8}
                className="rounded border p-2" 
            />
            <input 
                type="password"
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
                placeholder="Confirm Password"
                required
                minLength={8}
                className="rounded border p-2" 
            />
            <button
                disabled={submitting}
                className="rounded bg-black p-2 text-white disabled:opacity-50"
            >
                {submitting ? 'Registering...' : 'Register'}
            </button>
            <p>
                Have an account? <Link to='/login' className='underline'>Login</Link>
            </p>
        </form>
    )
}