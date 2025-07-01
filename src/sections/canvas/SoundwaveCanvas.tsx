import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useEffect, useState } from 'react';

const SoundwaveCanvas = () => {
  type SoundVisualizerProps = {
    audioUrl: string;
  };

  const SoundVisualizer = ({ audioUrl }: SoundVisualizerProps) => {
    const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(0));
    const analyserRef = useRef<AnalyserNode | null>(null);
    const lastSliceTime = useRef(0);
    const lineRef = useRef<THREE.Line>(null);

    useEffect(() => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      let source: AudioBufferSourceNode | null = null;

      fetch(audioUrl)
        .then(res => res.arrayBuffer())
        .then(buffer => audioContext.decodeAudioData(buffer))
        .then(audioBuffer => {
          source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(analyser);
          analyser.connect(audioContext.destination);
          source.loop = true;
          source.start();
        });

      return () => {
        if (source) {
          try {
            source.stop();
          } catch {}
        }
        audioContext.close();
      };
    }, [audioUrl]);

    useFrame(({ clock }) => {
      if (!analyserRef.current) return;

      const currentTime = clock.getElapsedTime();

      // Get frequency data every frame for smooth updates
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Update the line geometry continuously
      if (lineRef.current && dataArray.length > 0) {
        const geometry = lineRef.current.geometry as THREE.BufferGeometry;
        const positions = new Float32Array(dataArray.length * 3);

        for (let i = 0; i < dataArray.length; i++) {
          const x = (i / dataArray.length) * 20 - 10; // X position (-10 to 10)
          const y = (dataArray[i] / 255) * 5; // Normalize (0-255 → 0-1) and scale
          positions[i * 3] = x;
          positions[i * 3 + 1] = y;
          positions[i * 3 + 2] = 0;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.attributes.position.needsUpdate = true;
        geometry.setDrawRange(0, dataArray.length);
      }

      // Store a snapshot every second (optional)
      if (currentTime - lastSliceTime.current >= 1) {
        setFrequencyData(new Uint8Array(dataArray));
        lastSliceTime.current = currentTime;
      }
    });

    return (
      <>
        {/* Current frequency spectrum (green line) */}
        <line ref={lineRef as React.MutableRefObject<THREE.Line>}>
          <bufferGeometry />
          <lineBasicMaterial color="green" linewidth={2} />
        </line>

        {/* Optional: Show previous snapshots as faint lines */}
        {frequencyData.length > 0 && (
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                array={
                  new Float32Array(
                    Array.from(frequencyData).flatMap((v, i) => [
                      (i / frequencyData.length) * 20 - 10,
                      (v / 255) * 5,
                      0,
                    ])
                  )
                }
                itemSize={3}
                count={frequencyData.length}
              />
            </bufferGeometry>
            <lineBasicMaterial color="green" opacity={0.3} transparent linewidth={1} />
          </line>
        )}
      </>
    );
  };

  return (
    <Canvas camera={{ position: [0, 2, 15], fov: 50 }}>
      <color attach="background" args={["black"]} />
      <OrbitControls />
      <gridHelper args={[20, 20, 0x444444, 0x222222]} /> {/* Optional grid */}
      <SoundVisualizer audioUrl="Sweden.mp3" />
    </Canvas>
  );
};

export default SoundwaveCanvas;