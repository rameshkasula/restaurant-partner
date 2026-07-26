import { useState, useLayoutEffect, useEffect } from "react"

export interface UseVirtualizerOptions {
  itemCount: number
  itemHeight: number
  containerRef: React.RefObject<HTMLDivElement | null>
  overscan?: number
}

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

export function useVirtualizer({
  itemCount,
  itemHeight,
  containerRef,
  overscan = 5,
}: UseVirtualizerOptions) {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)

  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Initialize dimensions
    setScrollTop(container.scrollTop)
    setContainerHeight(container.clientHeight)

    const handleScroll = () => {
      setScrollTop(container.scrollTop)
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight((entry.target as HTMLElement).clientHeight || entry.contentRect.height)
      }
    })

    container.addEventListener("scroll", handleScroll, { passive: true })
    resizeObserver.observe(container)

    return () => {
      container.removeEventListener("scroll", handleScroll)
      resizeObserver.disconnect()
    }
  }, [containerRef])

  // Calculate indices
  const totalHeight = itemCount * itemHeight

  // Math.max(0, ...) ensures no negative index
  const rawStart = Math.floor(scrollTop / itemHeight)
  const startIndex = Math.max(0, rawStart - overscan)

  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const endIndex = Math.min(itemCount, rawStart + visibleCount + overscan)

  const offsetY = startIndex * itemHeight

  return {
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
  }
}
