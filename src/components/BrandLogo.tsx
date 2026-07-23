import { Link } from "react-router-dom"
import { IconFlame } from "@tabler/icons-react"

interface BrandLogoProps {
  className?: string
  iconSize?: string
  textSize?: string
}

export function BrandLogo({
  className = "",
  iconSize = "size-5",
  textSize = "text-lg",
}: BrandLogoProps) {
  return (
    <Link to="/" className={`group flex items-center gap-2.5 ${className}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30 transition-transform group-hover:scale-110">
        <IconFlame className={`${iconSize} text-primary-foreground`} stroke={2} />
      </div>
      <span className={`${textSize} font-bold tracking-tight text-foreground`}>
        TheSmart<span className="text-primary">Bills</span>
      </span>
    </Link>
  )
}

export function BrandLogoSmall() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-md shadow-primary/20">
        <IconFlame className="size-4.5 text-primary-foreground" stroke={2} />
      </div>
      <span className="text-md font-bold tracking-tight text-foreground">
        TheSmart<span className="text-primary">Bills</span>
      </span>
    </div>
  )
}
