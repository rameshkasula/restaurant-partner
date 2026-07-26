import { Link } from "react-router-dom"

interface BrandLogoProps {
  className?: string
  textSize?: string
}

export function BrandLogo({
  className = "",
  textSize = "text-lg",
}: BrandLogoProps) {
  return (
    <Link to="/" className={`group flex items-center gap-2.5 ${className}`}>
      <span className={`${textSize} font-bold tracking-tight text-foreground`}>
        TheSmart<span className="text-primary">Bills</span>
      </span>
    </Link>
  )
}

export function BrandLogoSmall() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-md font-bold tracking-tight text-foreground">
        TheSmart<span className="text-primary">Bills</span>
      </span>
    </div>
  )
}
