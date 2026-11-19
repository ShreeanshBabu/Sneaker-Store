import { Link } from "react-router";
import { formatPrice, getCardData } from "../utils/sneaker";

export default function ProductCard({sneaker}) {
    const { image, price, mrp, discountPercent, soldOut } = getCardData(sneaker)
    const badgeText = soldOut ? 'Sold out' : discountPercent>0 ? `${discountPercent}% off` : null
    console.log(sneaker.name, discountPercent, badgeText)

    return (
        <Link to={`/sneakers/${sneaker.id}`} className="flex flex-col gap-5">
            <div className="relative h-[350px] rounded-[28px] bg-card p-2">
                {image && (
                    <img 
                        src={image} 
                        alt={sneaker.name} 
                        className={`h-full w-full rounded-[24px] object-contain ${soldOut ? 'opacity-50 grayscale' : ''}`}    
                    />
                )}
                {badgeText && (
                    <span 
                        className={`absolute left-2 top-2 rounded-br-[24px] rounded-tl-[24px] px-4 py-3 font-heading text-xs font-semibold ${soldOut ? 'bg-ink text-white' : 'bg-accent text-ink'}`}
                    >
                        {badgeText}
                    </span>
                )}
            </div>

            <h3 className="font-heading text-xl font-semibold uppercase">{sneaker.name}</h3>

            <div
                className={`flex h-12 items-center justify-center gap-1 rounded-lg px-4 font-heading text-sm font-medium uppercase tracking-wide ${soldOut ? 'bg-ink/30 text-ink/60' : 'bg-ink text-white'}`}
            >
                {soldOut ? (
                    'Sold out'
                ) : (
                    <>
                        <span>View Product - {formatPrice(price)}</span>
                        {discountPercent > 0 && (
                            <span className="text-accent line-through">{formatPrice(mrp)}</span>
                        )}
                    </>
                )}
            </div>
        </Link>
    )
}
