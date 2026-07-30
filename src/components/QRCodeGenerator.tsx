import * as React from "react"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import { IconDownload, IconCopy, IconCheck, IconLoader2 } from "@tabler/icons-react"
import { toast } from "sonner"

interface QRCodeGeneratorProps {
  value: string
  size?: number
  className?: string
  logo?: string // Optional center logo image URL
}

export function QRCodeGenerator({ value, size = 256, className, logo }: QRCodeGeneratorProps) {
  const [qrUrl, setQrUrl] = React.useState<string>("")
  const [loading, setLoading] = React.useState<boolean>(true)
  const [copied, setCopied] = React.useState<boolean>(false)

  React.useEffect(() => {
    let active = true
    setLoading(true)
    QRCode.toDataURL(
      value,
      {
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      },
      (err, url) => {
        if (!active) return
        setLoading(false)
        if (err) {
          console.error("Failed to generate QR code:", err)
          toast.error("Failed to generate QR code")
          return
        }
        setQrUrl(url)
      }
    )
    return () => {
      active = false
    }
  }, [value, size])

  const handleDownload = () => {
    if (!qrUrl) return
    const link = document.createElement("a")
    link.href = qrUrl
    link.download = `qrcode-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("QR Code downloaded!")
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success("URL copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy URL")
    }
  }

  return (
    <div className={`flex flex-col items-center gap-4 ${className || ""}`}>
      <div className="relative flex items-center justify-center border border-border bg-white p-4 rounded-xl shadow-xs">
        {loading ? (
          <div style={{ width: size, height: size }} className="flex items-center justify-center">
            <IconLoader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="relative">
            <img
              src={qrUrl}
              alt="QR Code"
              style={{ width: size, height: size }}
              className="block"
            />
            {logo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={logo}
                  alt="Logo"
                  className="size-10 rounded-lg bg-white p-1 border border-border shadow-xs"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2 w-full max-w-xs">
        <Button variant="outline" size="sm" onClick={handleCopyLink} className="flex-1 gap-1.5 h-9 text-xs cursor-pointer">
          {copied ? <IconCheck className="size-4 text-emerald-500" /> : <IconCopy className="size-4" />}
          {copied ? "Copied" : "Copy Link"}
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload} className="flex-1 gap-1.5 h-9 text-xs cursor-pointer" disabled={loading || !qrUrl}>
          <IconDownload className="size-4" />
          Download
        </Button>
      </div>
    </div>
  )
}

export default QRCodeGenerator
