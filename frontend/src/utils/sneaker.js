export function getCardData(sneaker) {
    const variants = sneaker.colorways.flatMap((c) => c.variants)
    const prices = variants.map((v) => Number(v.discountedPrice))

    const price = prices.length > 0 ? Math.min(...prices) : null
    const mrp = Number(sneaker.mrp)

    const discountPercent = price !== null && price < mrp ? Math.round((1 - price/mrp) * 100) : 0

    const soldOut = !variants.some((v) => v.stock > 0)

    const images = sneaker.colorways[0]?.images ?? []
    const thumb = images.find((img) => img.isThumbnail) || images[0]
    const image = thumb ? thumb.url : null

    return { image, price, mrp, discountPercent, soldOut }
}

export function formatPrice(n) {
    return `₹${n.toLocaleString('en-IN')}`
}