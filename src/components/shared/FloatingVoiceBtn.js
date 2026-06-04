"use client";
import { useState, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

export default function FloatingVoiceBtn({ lang, onCommand }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  const toggleListen = () => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Voice features require Google Chrome or Edge on Desktop/Android.");
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (isListening) {
      stopListening();
      return;
    }

    // Clean up any existing recognition instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch (e) {
        // Ignore errors when stopping
      }
    }

    setError('');
    setIsListening(true);
    setTranscript('Listening...');

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    
    let isFinalResultReceived = false;

    recognition.onstart = () => {
      console.log('Voice recognition started');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptPart = result[0].transcript;
        
        if (result.isFinal) {
          setTranscript(transcriptPart);
          if (!isFinalResultReceived) {
            isFinalResultReceived = true;
            onCommand(transcriptPart);
            // Don't stop immediately, wait a bit for user to see the result
            setTimeout(() => {
              stopListening();
            }, 1500);
          }
        } else {
          interimTranscript += transcriptPart;
        }
      }
      
      // Only update interim transcript if we haven't received final result
      if (!isFinalResultReceived && interimTranscript) {
        setTranscript(interimTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      switch(event.error) {
        case 'aborted':
          // This is usually expected when we stop it manually
          console.log('Speech recognition stopped');
          break;
        case 'network':
          setError('Network error. Please check your connection.');
          break;
        case 'not-allowed':
        case 'service-not-allowed':
          setError('Microphone access denied. Please allow microphone access in your browser settings.');
          break;
        case 'audio-capture':
          setError('No microphone found. Please check your microphone.');
          break;
        case 'no-speech':
          setError('No speech detected. Please speak louder.');
          break;
        default:
          setError(`Voice recognition error: ${event.error}`);
      }
      
      setIsListening(false);
      setTranscript('');
      recognitionRef.current = null;
    };
    
    recognition.onend = () => {
      if (isListening && !isFinalResultReceived) {
        // Restart recognition if it ended unexpectedly
        console.log('Speech recognition ended unexpectedly, restarting...');
        setTimeout(() => {
          if (isListening) {
            try {
              recognition.start();
            } catch (e) {
              console.log('Cannot restart recognition:', e);
              setIsListening(false);
            }
          }
        }, 100);
      } else {
        setIsListening(false);
        setTranscript('');
        recognitionRef.current = null;
      }
    };
    
    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start recognition:', e);
      setError('Cannot start voice recognition. Please try again.');
      setIsListening(false);
      recognitionRef.current = null;
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors when stopping
      }
      recognitionRef.current = null;
    }
    
    setIsListening(false);
    // Keep the transcript for a moment before clearing
    setTimeout(() => {
      setTranscript('');
    }, 1000);
  };

  // Clean up on unmount
  const cleanup = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors
      }
      recognitionRef.current = null;
    }
  };

  // Add cleanup on component unmount
  // This is a client component, so we'll handle cleanup manually

  return (
    <>
      <button 
        onClick={toggleListen}
        className={`fixed bottom-8 right-8 p-5 rounded-full shadow-2xl z-50 transition-all transform hover:scale-110 active:scale-95 ${
          isListening 
            ? 'bg-gradient-to-br from-red-500 to-red-600 animate-pulse' 
            : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
        } text-white`}
        aria-label="Voice Navigation"
        title={isListening ? "Click to stop" : "Click to speak"}
      >
        {isListening ? <MicOff size={28} /> : <Mic size={28} />}
      </button>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-28 right-8 max-w-xs bg-red-50 border border-red-200 rounded-2xl shadow-2xl p-4 z-50 animate-in slide-in-from-bottom">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-red-800">Voice Error</p>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
            <button 
              onClick={() => setError('')}
              className="ml-auto text-red-400 hover:text-red-600 text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Transcript Display */}
      {transcript && !error && (
        <div className="fixed bottom-28 right-8 max-w-xs bg-white rounded-2xl shadow-2xl p-4 z-50 animate-in slide-in-from-bottom">
          <div className="text-sm text-gray-600 mb-1">
            {isListening ? "Listening..." : "Recognized:"}
          </div>
          <div className="font-medium text-gray-800 break-words">{transcript}</div>
          {!isListening && (
            <div className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Command sent
            </div>
          )}
        </div>
      )}

      {/* Listening indicator (optional) */}
      {isListening && !transcript && (
        <div className="fixed bottom-28 right-8 max-w-xs bg-white rounded-2xl shadow-2xl p-4 z-50 animate-in slide-in-from-bottom">
          <div className="flex items-center gap-3">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-sm text-gray-600">Speak now...</span>
          </div>
        </div>
      )}
    </>
  );
}