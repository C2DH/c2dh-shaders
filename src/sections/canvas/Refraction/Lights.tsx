export default function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[-5, -50, 5]} intensity={1.5} />
    </>
  )
}
