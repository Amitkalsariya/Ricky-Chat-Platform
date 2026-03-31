import React, { useEffect, useRef, useState } from "react";
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  X,
  PhoneIncoming,
  Maximize2,
  Minimize2,
  Volume2,
  Volume1,
} from "lucide-react";
import { CallStore } from "../store/CallStore";
import { ChatRequestStore } from "../store/ChatRequestStore";

// ── Format call duration ──
const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// ══════════════════════════════════════
// INCOMING CALL MODAL
// ══════════════════════════════════════
export const IncomingCallModal = () => {
  const { callStatus, callType, callDirection, remoteUser, answerCall, rejectCall } = CallStore();
  const { acceptedContacts } = ChatRequestStore();
  const [pulse, setPulse] = useState(false);

  // Resolve caller info from acceptedContacts
  const callerInfo = acceptedContacts.find((c) => c._id === remoteUser?._id) || remoteUser;

  useEffect(() => {
    if (callStatus === "ringing" && callDirection === "incoming") {
      const interval = setInterval(() => setPulse((p) => !p), 1000);
      return () => clearInterval(interval);
    }
  }, [callStatus, callDirection]);

  if (callStatus !== "ringing" || callDirection !== "incoming") return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Gradient Header */}
        <div className="bg-gradient-to-br from-primary via-secondary to-accent p-8 text-center relative overflow-hidden">
          {/* Animated rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`size-40 rounded-full border-2 border-white/10 absolute transition-transform duration-1000 ${pulse ? "scale-110 opacity-50" : "scale-100 opacity-20"}`} />
            <div className={`size-56 rounded-full border border-white/5 absolute transition-transform duration-1000 ${pulse ? "scale-105 opacity-30" : "scale-100 opacity-10"}`} />
          </div>

          <div className="relative z-10">
            <div className="size-24 rounded-full mx-auto mb-4 ring-4 ring-white/30 overflow-hidden shadow-2xl">
              <img
                src={callerInfo?.profilePic || "/avatar.png"}
                alt={callerInfo?.fullname}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{callerInfo?.fullname || "Unknown"}</h2>
            <p className="text-white/70 text-sm flex items-center justify-center gap-2">
              {callType === "video" ? <Video className="size-4" /> : <Phone className="size-4" />}
              Incoming {callType} call...
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-8 py-8 bg-base-100">
          {/* Reject */}
          <button
            onClick={rejectCall}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="size-16 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-110 group-active:scale-95 transition-transform">
              <PhoneOff className="size-7 text-white" />
            </div>
            <span className="text-xs font-medium text-base-content/60">Decline</span>
          </button>

          {/* Accept */}
          <button
            onClick={answerCall}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="size-16 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-active:scale-95 transition-transform animate-pulse">
              <Phone className="size-7 text-white" />
            </div>
            <span className="text-xs font-medium text-base-content/60">Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════
// CALL SCREEN (Full Screen)
// ══════════════════════════════════════
export const CallScreen = () => {
  const {
    callStatus,
    callType,
    callDirection,
    remoteUser,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    callDuration,
    toggleMute,
    toggleCamera,
    endCall,
  } = CallStore();
  const { acceptedContacts } = ChatRequestStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  const userInfo = acceptedContacts.find((c) => c._id === remoteUser?._id) || remoteUser;

  // Attach streams to video elements and force playback
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(e => console.warn("Local play error:", e));
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(e => console.warn("Remote play error:", e));
    }
  }, [remoteStream]);

  // Handle fake speaker effect on unsupported mobile devices
  useEffect(() => {
    if (remoteVideoRef.current) {
        remoteVideoRef.current.volume = isSpeakerOn ? 1.0 : 0.3;
    }
  }, [isSpeakerOn]);

  // Only show for outgoing calling or connected states
  if (callStatus !== "calling" && callStatus !== "connected") return null;

  const isVideo = callType === "video";

  // ── Minimized PiP View ──
  if (isMinimized) {
    return (
      <div className="fixed bottom-24 right-4 z-[200] animate-in fade-in slide-in-from-bottom duration-300">
        <div className="bg-base-100 rounded-2xl shadow-2xl border border-base-300 p-3 w-56">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-full overflow-hidden ring-2 ring-primary/30 flex-shrink-0">
              <img src={userInfo?.profilePic || "/avatar.png"} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{userInfo?.fullname}</p>
              <p className="text-xs text-primary">{callStatus === "connected" ? formatDuration(callDuration) : "Calling..."}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button onClick={() => setIsMinimized(false)} className="p-2 rounded-lg hover:bg-base-200 transition-colors">
              <Maximize2 className="size-4 text-base-content/60" />
            </button>
            <div className="flex items-center gap-1">
              <button onClick={toggleMute} className={`p-2 rounded-lg transition-colors ${isMuted ? "bg-rose-500/20 text-rose-500" : "hover:bg-base-200"}`}>
                {isMuted ? <MicOff className="size-4" /> : <Mic className="size-4 text-base-content/60" />}
              </button>
              <button onClick={endCall} className="p-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors">
                <PhoneOff className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Full Screen View ──
  return (
    <div className="fixed inset-0 bg-gray-950 z-[200] flex flex-col">
      {/* Video Area */}
      {isVideo ? (
        <div className="flex-1 relative bg-black flex items-center justify-center">
          {/* Remote video (full screen on mobile, contained on desktop) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover sm:object-contain"
          />

          {/* Fallback avatar when no video */}
          {(!remoteStream || remoteStream.getVideoTracks().length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-950">
              <div className="text-center">
                <div className="size-32 rounded-full mx-auto mb-6 ring-4 ring-white/10 overflow-hidden">
                  <img src={userInfo?.profilePic || "/avatar.png"} alt="" className="w-full h-full object-cover" />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">{userInfo?.fullname}</h2>
                <p className="text-white/50 text-sm">
                  {callStatus === "connected" ? "Camera off" : "Connecting..."}
                </p>
              </div>
            </div>
          )}

          {/* Local video PiP */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-28 sm:w-36 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/20 z-[50] bg-gray-900 cursor-move">
            {!isCameraOff ? (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover mirror"
                style={{ transform: "scaleX(-1)" }}
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <VideoOff className="size-6 text-white/40" />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Audio call view */
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 via-primary/5 to-gray-950 relative overflow-hidden">
          {/* Decorative rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-72 rounded-full border border-white/[0.03] animate-pulse" style={{ animationDuration: "3s" }} />
            <div className="size-96 rounded-full border border-white/[0.02] absolute animate-pulse" style={{ animationDuration: "4s" }} />
          </div>

          <div className="relative z-10 text-center">
            <div className={`size-36 sm:size-44 rounded-full mx-auto mb-8 overflow-hidden shadow-2xl ring-4 transition-all duration-1000 ${
              callStatus === "connected" ? "ring-emerald-500/30" : "ring-primary/20 animate-pulse"
            }`}>
              <img src={userInfo?.profilePic || "/avatar.png"} alt="" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{userInfo?.fullname}</h2>
            <p className={`text-lg font-medium ${callStatus === "connected" ? "text-emerald-400" : "text-white/50"}`}>
              {callStatus === "connected" ? formatDuration(callDuration) : "Calling..."}
            </p>
          </div>

          {/* Hidden audio element with playsInline */}
          <audio ref={remoteVideoRef} autoPlay playsInline />
        </div>
      )}

      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 px-4 sm:px-6 py-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3">
          <div className={`size-2 rounded-full ${callStatus === "connected" ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-pulse"}`} />
          <span className="text-white/80 text-sm font-medium">
            {callStatus === "connected" ? "Connected" : callDirection === "outgoing" ? "Ringing..." : "Connecting..."}
          </span>
        </div>
        <button onClick={() => setIsMinimized(true)} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
          <Minimize2 className="size-5 text-white/70" />
        </button>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 pb-8 sm:pb-12 pt-16 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          {/* Mute */}
          <button
            onClick={toggleMute}
            className={`size-14 sm:size-16 rounded-full flex items-center justify-center transition-all duration-200 ${
              isMuted
                ? "bg-white text-gray-900 shadow-lg shadow-white/20"
                : "bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm"
            }`}
          >
            {isMuted ? <MicOff className="size-6" /> : <Mic className="size-6" />}
          </button>

          {/* Speaker Toggle */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`size-14 sm:size-16 rounded-full flex items-center justify-center transition-all duration-200 ${
              isSpeakerOn
                ? "bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm"
                : "bg-white text-gray-900 shadow-lg shadow-white/20"
            }`}
          >
            {isSpeakerOn ? <Volume2 className="size-6" /> : <Volume1 className="size-6" />}
          </button>

          {/* Camera toggle (video calls only) */}
          {isVideo && (
            <button
              onClick={toggleCamera}
              className={`size-14 sm:size-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                isCameraOff
                  ? "bg-white text-gray-900 shadow-lg shadow-white/20"
                  : "bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm"
              }`}
            >
              {isCameraOff ? <VideoOff className="size-6" /> : <Video className="size-6" />}
            </button>
          )}

          {/* End Call */}
          <button
            onClick={endCall}
            className="size-16 sm:size-18 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-xl shadow-rose-500/30 hover:scale-105 active:scale-95 transition-transform"
          >
            <PhoneOff className="size-7" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallScreen;
