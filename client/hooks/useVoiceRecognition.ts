import { useState, useEffect, useCallback, useRef } from "react";

// Add types for Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

export function useVoiceRecognition(onResult?: (transcript: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionConstructor) {
        const rec = new SpeechRecognitionConstructor();
        rec.continuous = false;
        rec.interimResults = false;
        // Default to English, but Hindi (hi-IN) is also supported by most browsers
        rec.lang = "en-IN";

        rec.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          if (onResultRef.current) {
            onResultRef.current(transcript);
          }
        };

        rec.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRecognition(rec);
      } else {
        setSupported(false);
      }
    }
  }, []);

  const toggleListening = useCallback((lang: string = "en-IN") => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      // eslint-disable-next-line react-hooks/immutability
      recognition.lang = lang; // Allow dynamic switching (en-IN or hi-IN)
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  }, [recognition, isListening]);

  return {
    isListening,
    supported,
    toggleListening,
    stopListening: () => {
      if (recognition && isListening) {
        recognition.stop();
        setIsListening(false);
      }
    }
  };
}
