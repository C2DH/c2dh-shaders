import { useEffect, useRef } from "react";
import Button from "./Button";
import { Microphone } from "iconoir-react";
import useGlobalState from "./store";

interface MicInputProps {
  onAudioData: (data: number) => void; // Now sending a single number
}

interface GlobalState {
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
}

const MicInput: React.FC<MicInputProps> = ({ onAudioData }) => {
  const { isListening, setIsListening } = useGlobalState() as GlobalState;

  const audioRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!isListening) return;

    const initAudio = async () => {
      const AudioContext = (window.AudioContext ||
        (window as any).webkitAudioContext) as typeof window.AudioContext;
      contextRef.current = new AudioContext();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (contextRef.current) {
        sourceRef.current = contextRef.current.createMediaStreamSource(stream);
        audioRef.current = contextRef.current.createAnalyser();
        audioRef.current.fftSize = 32; // Lower FFT size for efficiency
      }

      if (sourceRef.current && audioRef.current) {
        sourceRef.current.connect(audioRef.current);
      }

      const update = () => {
        if (!audioRef.current) return;

        const dataArray = new Uint8Array(audioRef.current.frequencyBinCount);
        audioRef.current.getByteFrequencyData(dataArray);

        // Extract a single value (e.g., average volume)
        const averageVolume =
          dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

        const normalizedValue = averageVolume / 200; // Normalize to 0 - 1

        onAudioData(normalizedValue);
        requestAnimationFrame(update);
      };

      update();
    };

    initAudio();
  }, [isListening, onAudioData]);

  return (
    <div className="absolute z-1 w-full flex justify-center bottom-20">
      <Button
        onClick={() => setIsListening(!isListening)}
        className={`light ${isListening ? "" : "inactive"}`}
      >
        <i>
          <Microphone />
        </i>
        <span>{isListening ? "Stop Mic" : "Start Mic"}</span>
      </Button>
    </div>
  );
};

export default MicInput;
