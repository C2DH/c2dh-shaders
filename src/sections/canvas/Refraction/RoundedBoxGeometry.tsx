import { useMemo } from 'react'
import { RoundedBoxGeometry } from 'three-stdlib'

type Params = {
  size?: number
  radius?: number
  smoothness?: number
  height?: number
}

export function useRoundedBoxGeometry({
  size = 1,
  height = 1,
  radius = 0.1,
  smoothness = 4,
}: Params = {}) {
  return useMemo(() => {
    const geo = new RoundedBoxGeometry(size, height, size, smoothness, radius)
    geo.computeVertexNormals()
    return geo
  }, [size, radius, smoothness])
}
