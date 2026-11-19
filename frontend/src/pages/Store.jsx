import { useEffect, useState } from "react"
import { apiFetch } from "../api/client"
import ProductCard from "../components/ProductCard"

export default function Store() {
    const [sneakers, setSneakers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        apiFetch('/sneakers')
            .then((list) => setSneakers(list))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <p>Loading...</p>
    if (error) return <p className="text-red-600">{error}</p>

    return (
        <section>
            <h1 className="font-heading text-4xl font-semibold">Store</h1>
            <p className="mb-6 opacity-80">{sneakers.length} items</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sneakers.map((s) => (
                    <ProductCard key={s.id} sneaker={s} />
                ))}
            </div>
        </section>
    )
}