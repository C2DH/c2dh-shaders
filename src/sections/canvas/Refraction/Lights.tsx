export default function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[-3, -2, 5]} intensity={0.2} />
      <directionalLight position={[3, 2, 5]} intensity={0.2} />
    </>
  )
}
