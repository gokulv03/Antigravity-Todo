import { useState, useCallback, useEffect } from 'react';

const useVoiceInput = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [support, setSupport] = useState(true);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setSupport(false);
        }
    }, []);

    const startListening = useCallback(() => {
        if (!support) {
            alert("Voice input is not supported in this browser.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            const current = event.resultIndex;
            const transcriptText = event.results[current][0].transcript;
            setTranscript(transcriptText);
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    }, [support]);

    const resetTranscript = () => setTranscript('');

    return { isListening, transcript, startListening, resetTranscript, supported: support };
};

export default useVoiceInput;
