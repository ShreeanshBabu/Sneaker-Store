import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { apiFetch } from "../api/client"
import { formatPrice } from "../utils/sneaker"

export default function ProductDetail() {
    const { id } = useParams()
    const [sneaker, setSneaker] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [colorIndex, setColorIndex] = useState(0)
    const [variantId, setVariantId] = useState(null)
    const [imageIndex, setImageIndex] = useState(0)

    useEffect(() => {
        let ignore = false
        setLoading(true)
        setError('')
        setColorIndex(0)
        setVariantId(null)
        setImageIndex(0)
        apiFetch(`/sneakers/${id}`)
            .then((data) => { if (!ignore) setSneaker(data) })
            .catch((err) => { if (!ignore) setError(err.message) })
            .finally(() => { if (!ignore) setLoading(false) })
        return () => { ignore = true }
    }, [id])

    if (loading) return <p>Loading...</p>
    if (error) return <p className="text-red-600">{error}</p>
    if (sneaker.colorways.length === 0) return <p>This sneaker is unavailable.</p>

    const colorway = sneaker.colorways[colorIndex]

    const variants = [...colorway.variants].sort((a, b) => 
        a.size.localeCompare(b.size, undefined, {numeric: true})
    )
    const images = [...colorway.images].sort((a, b) => a.indexNo - b.indexNo)

    const selectedVariant = variants.find((v) => v.id === variantId)
    const mrp = Number(sneaker.mrp)
    const displayPrice = selectedVariant
        ? Number(selectedVariant.discountedPrice)
        : variants.length > 0
            ? Math.min(...variants.map((v) => Number(v.discountedPrice)))
            : null

    return (
        <div className="grid gap-10 lg:grid-cols-2">
            <div className="flex flex-col-reverse gap-4 lg:flex-row">
                <div className="flex gap-3 lg:flex-col">
                    {images.map((img, i) => (
                        <button
                            key={img.id}
                            onClick={() => setImageIndex(i)}
                            className={`h-20 w-20 rounded-xl bg-card p-1 ${i === imageIndex ? 'ring-2 ring-ink' : ''}`}
                        >
                            <img src={img.url} alt="" className="h-full w-full object-contain" />
                        </button>
                    ))}
                </div>
                <div className="flex-1 rounded-[28px] bg-card p-4">
                    {images[imageIndex] && (
                        <img src={images[imageIndex].url} alt={sneaker.name} className="h-full w-full object-contain" />
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-6">
                <div>
                    <p className="opacity-70">{sneaker.brand}</p>
                    <h1 className="font-heading text-3xl font-semibold uppercase">{sneaker.name}</h1>
                </div>

                {displayPrice !== null && (
                    <div>
                        <span className="font-heading text-2xl font-semibold text-brand">{formatPrice(displayPrice)}</span>
                        {displayPrice < mrp && <span className="line-through opacity-60">{formatPrice(mrp)}</span>}
                    </div>
                )}

                <div>
                    <p className="mb-2 font-heading font-semibold uppercase">Color: {colorway.color}</p>
                    <div className="flex gap-3">
                        {sneaker.colorways.map((c, i) => (
                            <button 
                                key={c.id}
                                aria-label={c.color}
                                onClick={() => {
                                    setColorIndex(i)
                                    setVariantId(null)
                                    setImageIndex(0)
                                }}
                                style={{backgroundColor: c.colorCode}}
                                className={`h-9 w-9 rounded-full border ${i === colorIndex ? 'ring-2 ring-ink ring-offset-2' : ''}`}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <p className="mb-2 font-heading font-semibold uppercase">Size</p>
                    <div className="grid grid-cols-4 gap-3">
                        {variants.map((v) => {
                            const outOfStock = v.stock <= 0
                            const stateClasses = outOfStock
                                ? 'bg-[#d2d1d3] text-[#8f8c91] line-through cursor-not-allowed'
                                : v.id === variantId
                                    ? 'bg-ink text-white'
                                    : 'bg-white text-ink'

                            return (
                                <button 
                                    key={v.id} 
                                    disabled={outOfStock} 
                                    onClick={() => setVariantId(v.id)} 
                                    className={`h-12 rounded-lg font-heading text-sm font-medium ${stateClasses}`}
                                >
                                    {v.size}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <button disabled className="h-12 rounded-lg bg-ink font-heading text-sm font-medium uppercase text-white opacity-50">
                    Add to cart
                </button>
            </div>
        </div>
    )
}