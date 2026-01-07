import { useState, useCallback, useRef } from 'react';

interface Provider {
  address: string;
  name: string;
}

interface ServiceMetadata {
  endpoint: string;
  model: string;
}

interface TranscriptionResult {
  id: string;
  fileName: string;
  text: string;
  timestamp: number;
  duration?: number; // in seconds
  providerAddress: string;
  providerName: string;
}

interface SpeechToTextConfig {
  broker: any;
  selectedProvider: Provider | null;
  serviceMetadata: ServiceMetadata | null;
  onError?: (error: string) => void;
}

interface TranscriptionOptions {
  file: File;
  language?: string;
  responseFormat?: 'json' | 'text' | 'srt' | 'vtt';
}

export function useSpeechToText(config: SpeechToTextConfig) {
  const { broker, selectedProvider, serviceMetadata, onError } = config;

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptions, setTranscriptions] = useState<TranscriptionResult[]>([]);
  const [currentTranscription, setCurrentTranscription] = useState<TranscriptionResult | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Stop transcription
  const stopTranscription = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsTranscribing(false);
    }
  }, []);

  // Transcribe audio file
  const transcribeAudio = useCallback(async (options: TranscriptionOptions) => {
    const { file, language, responseFormat = 'json' } = options;

    if (!file || !selectedProvider || !broker) {
      onError?.('Please provide an audio file and select a provider');
      return null;
    }

    setIsTranscribing(true);
    setCurrentTranscription(null);

    // Create AbortController for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // Get service metadata
      let currentMetadata = serviceMetadata;
      if (!currentMetadata) {
        currentMetadata = await broker.inference.getServiceMetadata(
          selectedProvider.address
        );
        if (!currentMetadata) {
          throw new Error('Failed to get service metadata');
        }
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('model', currentMetadata.model);
      formData.append('response_format', responseFormat);
      if (language) {
        formData.append('language', language);
      }

      // Get request headers from broker
      // For multipart/form-data, we need to pass a placeholder for content
      const headers = await broker.inference.getRequestHeaders(
        selectedProvider.address,
        JSON.stringify({ model: currentMetadata.model, file: file.name })
      );

      // Remove Content-Type header - let browser set it for multipart/form-data
      const { 'Content-Type': _, ...headersWithoutContentType } = headers;

      // Send request to transcription endpoint
      // The endpoint already includes the base path (e.g., http://host:port/v1/proxy)
      const { endpoint } = currentMetadata;
      const response = await fetch(`${endpoint}/audio/transcriptions`, {
        method: 'POST',
        headers: headersWithoutContentType,
        body: formData,
        signal,
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorBody = await response.text();
          if (errorBody) {
            try {
              const errorJson = JSON.parse(errorBody);
              errorMessage = errorJson.error?.message || JSON.stringify(errorJson, null, 2);
            } catch {
              errorMessage = errorBody;
            }
          }
        } catch {
          // Keep original message
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Handle response
      const transcriptionResult: TranscriptionResult = {
        id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        fileName: file.name,
        text: data.text || '',
        timestamp: Date.now(),
        providerAddress: selectedProvider.address,
        providerName: selectedProvider.name,
      };

      setCurrentTranscription(transcriptionResult);
      setTranscriptions(prev => [transcriptionResult, ...prev]);

      // Save to localStorage for history
      saveToHistory(transcriptionResult);

      setIsTranscribing(false);
      abortControllerRef.current = null;
      return transcriptionResult;

    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setIsTranscribing(false);
        abortControllerRef.current = null;
        return null;
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to transcribe audio';
      onError?.(errorMessage);
      setIsTranscribing(false);
      abortControllerRef.current = null;
      return null;
    }
  }, [broker, selectedProvider, serviceMetadata, onError]);

  // Clear current transcription
  const clearCurrentTranscription = useCallback(() => {
    setCurrentTranscription(null);
  }, []);

  // Load history from localStorage
  const loadHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem('speechToTextHistory');
      if (stored) {
        const history = JSON.parse(stored) as TranscriptionResult[];
        setTranscriptions(history);
      }
    } catch {
      // Silent fail
    }
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setTranscriptions([]);
    try {
      localStorage.removeItem('speechToTextHistory');
    } catch {
      // Silent fail
    }
  }, []);

  return {
    isTranscribing,
    currentTranscription,
    transcriptions,
    transcribeAudio,
    stopTranscription,
    clearCurrentTranscription,
    loadHistory,
    clearHistory,
  };
}

// Helper function to save to localStorage
function saveToHistory(transcription: TranscriptionResult) {
  try {
    const stored = localStorage.getItem('speechToTextHistory');
    const existing = stored ? JSON.parse(stored) as TranscriptionResult[] : [];
    // Keep only last 50 transcriptions
    const updated = [transcription, ...existing].slice(0, 50);
    localStorage.setItem('speechToTextHistory', JSON.stringify(updated));
  } catch {
    // Silent fail
  }
}
