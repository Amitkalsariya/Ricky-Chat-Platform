import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, X, Play, Pause, Loader2 } from 'lucide-react';
import toast from './CustomToast';

const VoiceRecorder = ({ onSend, onCancel }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [duration, setDuration] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [waveformData, setWaveformData] = useState([]);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const audioRef = useRef(null);
    const analyserRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    const startRecording = async () => {
        // Check if mediaDevices is available (requires HTTPS or localhost)
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            toast.error(
                window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
                    ? "Microphone access denied. Please allow permissions."
                    : "Microphone requires a secure connection (HTTPS). Open chrome://flags/#unsafely-treat-insecure-origin-as-secure, add your URL, and restart Chrome."
            );
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Set up audio context for waveform
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(audioBlob);
                setAudioUrl(URL.createObjectURL(audioBlob));
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start(100);
            setIsRecording(true);
            setDuration(0);

            timerRef.current = setInterval(() => {
                setDuration(d => d + 1);
            }, 1000);

            // Start waveform visualization
            visualizeWaveform();
        } catch (error) {
            console.error('Error starting recording:', error);
            toast.error('Could not access microphone');
        }
    };

    const visualizeWaveform = () => {
        if (!analyserRef.current) return;

        const analyser = analyserRef.current;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateWaveform = () => {
            if (!isRecording) return;

            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

            setWaveformData(prev => {
                const newData = [...prev, average / 255];
                if (newData.length > 50) newData.shift();
                return newData;
            });

            animationRef.current = requestAnimationFrame(updateWaveform);
        };

        updateWaveform();
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        }
    };

    const cancelRecording = () => {
        stopRecording();
        setAudioBlob(null);
        setAudioUrl(null);
        setDuration(0);
        setWaveformData([]);
        onCancel?.();
    };

    const playAudio = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSend = async () => {
        if (!audioBlob) return;

        setIsSending(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result;
                await onSend({
                    url: base64Audio,
                    duration: duration,
                    waveform: waveformData.slice(-30) // Send last 30 points
                });
                cancelRecording();
            };
        } catch (error) {
            toast.error('Failed to send voice message');
        } finally {
            setIsSending(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-2 sm:gap-3 w-full bg-base-200 rounded-xl p-2 sm:p-3">
            {/* Hidden audio element */}
            {audioUrl && (
                <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                />
            )}

            {/* Cancel button */}
            <button
                onClick={cancelRecording}
                className="p-2 rounded-full hover:bg-base-300 text-error transition-colors"
                title="Cancel"
            >
                <X className="size-5" />
            </button>

            {/* Waveform or recording indicator */}
            <div className="flex-1 flex items-center gap-2">
                {isRecording ? (
                    <>
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <div className="flex-1 flex items-center gap-0.5 h-8">
                            {waveformData.map((height, i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-primary rounded-full transition-all duration-100"
                                    style={{ height: `${Math.max(4, height * 32)}px` }}
                                />
                            ))}
                        </div>
                    </>
                ) : audioUrl ? (
                    <>
                        <button
                            onClick={playAudio}
                            className="p-2 rounded-full bg-primary text-primary-content hover:bg-primary-focus transition-colors"
                        >
                            {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                        </button>
                        <div className="flex-1 flex items-center gap-0.5 h-8">
                            {waveformData.map((height, i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-base-content/30 rounded-full"
                                    style={{ height: `${Math.max(4, height * 32)}px` }}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <span className="text-sm text-base-content/60">Tap mic to start recording</span>
                )}
            </div>

            {/* Duration */}
            <span className="text-sm font-mono text-base-content/70 min-w-[40px]">
                {formatTime(duration)}
            </span>

            {/* Action buttons */}
            {isRecording ? (
                <button
                    onClick={stopRecording}
                    className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                    title="Stop recording"
                >
                    <Square className="size-4" />
                </button>
            ) : audioUrl ? (
                <button
                    onClick={handleSend}
                    disabled={isSending}
                    className="p-3 rounded-full bg-primary text-primary-content hover:bg-primary-focus transition-colors disabled:opacity-50"
                    title="Send voice message"
                >
                    {isSending ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Send className="size-4" />
                    )}
                </button>
            ) : (
                <button
                    onClick={startRecording}
                    className="p-3 rounded-full bg-primary text-primary-content hover:bg-primary-focus transition-colors animate-pulse"
                    title="Start recording"
                >
                    <Mic className="size-4" />
                </button>
            )}
        </div>
    );
};

// Voice message player component
export const VoiceMessagePlayer = ({ voiceNote, isOwn }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const audioRef = useRef(null);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const cyclePlaybackRate = () => {
        const rates = [1, 1.5, 2];
        const currentIndex = rates.indexOf(playbackRate);
        const nextRate = rates[(currentIndex + 1) % rates.length];
        setPlaybackRate(nextRate);
        if (audioRef.current) {
            audioRef.current.playbackRate = nextRate;
        }
    };

    const progress = voiceNote.duration ? (currentTime / voiceNote.duration) * 100 : 0;

    return (
        <div className={`flex items-center gap-2 p-2 rounded-xl min-w-[200px] ${isOwn ? 'bg-primary/20' : 'bg-base-200'}`}>
            <audio
                ref={audioRef}
                src={voiceNote.url}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => {
                    setIsPlaying(false);
                    setCurrentTime(0);
                }}
            />

            <button
                onClick={togglePlay}
                className={`p-2 rounded-full ${isOwn ? 'bg-primary text-primary-content' : 'bg-base-300'} transition-colors`}
            >
                {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>

            <div className="flex-1 flex flex-col gap-1">
                {/* Waveform visualization */}
                <div className="flex items-center gap-0.5 h-6">
                    {(voiceNote.waveform || Array(30).fill(0.5)).map((height, i) => {
                        const isPlayed = (i / 30) * 100 <= progress;
                        return (
                            <div
                                key={i}
                                className={`w-1 rounded-full transition-colors ${isPlayed ? 'bg-primary' : isOwn ? 'bg-primary/30' : 'bg-base-content/30'}`}
                                style={{ height: `${Math.max(4, height * 24)}px` }}
                            />
                        );
                    })}
                </div>

                {/* Time display */}
                <div className="flex justify-between text-xs text-base-content/60">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(voiceNote.duration || 0)}</span>
                </div>
            </div>

            {/* Playback speed */}
            <button
                onClick={cyclePlaybackRate}
                className="text-xs font-bold px-1.5 py-0.5 rounded bg-base-300 hover:bg-base-content/20 transition-colors"
            >
                {playbackRate}x
            </button>
        </div>
    );
};

export default VoiceRecorder;
