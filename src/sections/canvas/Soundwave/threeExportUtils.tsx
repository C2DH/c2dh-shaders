import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { Object3D } from 'three'

export const exportToGLTF = (object: Object3D, filename: string = 'visualization.gltf') => {
  return new Promise<void>((resolve, reject) => {
    const exporter = new GLTFExporter()

    exporter.parse(
      object,
      (gltf) => {
        // Create and download the file
        const blob = new Blob([JSON.stringify(gltf)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.click()
        URL.revokeObjectURL(url)
        resolve()
      },
      (error) => {
        console.error('Error exporting GLTF:', error)
        reject(error)
      },
      {
        binary: false, // Set to true if you want .glb format instead
        embedImages: true,
        includeCustomExtensions: true,
      },
    )
  })
}
