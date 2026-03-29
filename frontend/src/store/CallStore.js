import { create } from "zustand";
import { AuthStore } from "./AuthStore";
import toast from "../components/CustomToast";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export const CallStore = create((set, get) => ({
  // State
  callStatus: "idle", // idle | calling | ringing | connected | ended
  callType: null, // "audio" | "video"
  callDirection: null, // "outgoing" | "incoming"
  remoteUser: null,
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  isMuted: false,
  isCameraOff: false,
  callDuration: 0,
  callTimer: null,
  incomingOffer: null,

  // ── INITIATE A CALL ──
  startCall: async (user, type) => {
    const socket = AuthStore.getState().socket;
    if (!socket) {
      toast.error("Not connected to server");
      return;
    }

    // Check if mediaDevices is available (requires HTTPS or localhost)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error(
        window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
          ? "Microphone/Camera access denied. Please allow permissions."
          : "Microphone/Camera requires a secure connection (HTTPS). Open chrome://flags/#unsafely-treat-insecure-origin-as-secure, add your URL, and restart Chrome."
      );
      return;
    }

    try {
      const constraints = {
        audio: true,
        video: type === "video",
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      const pc = new RTCPeerConnection(ICE_SERVERS);

      // Add local tracks
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Handle remote stream
      const remoteStream = new MediaStream();
      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
        set({ remoteStream });
      };

      // ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("iceCandidate", {
            to: user._id,
            candidate: event.candidate,
          });
        }
      };

      // Connection state changes
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
          get().endCall();
        }
      };

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("callUser", {
        to: user._id,
        offer,
        callType: type,
      });

      set({
        callStatus: "calling",
        callType: type,
        callDirection: "outgoing",
        remoteUser: user,
        localStream: stream,
        remoteStream,
        peerConnection: pc,
        isMuted: false,
        isCameraOff: false,
        callDuration: 0,
      });

      // Auto-end after 30 seconds if no answer
      setTimeout(() => {
        if (get().callStatus === "calling") {
          toast.error("No answer");
          get().endCall();
        }
      }, 30000);
    } catch (error) {
      console.error("Failed to start call:", error);
      if (error.name === "NotAllowedError") {
        toast.error("Camera/microphone permission denied");
      } else {
        toast.error("Failed to start call");
      }
    }
  },

  // ── ANSWER AN INCOMING CALL ──
  answerCall: async () => {
    const { incomingOffer, remoteUser, callType, peerConnection } = get();
    const socket = AuthStore.getState().socket;
    if (!socket || !incomingOffer) return;

    // Check if mediaDevices is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Microphone/Camera not available. Secure connection (HTTPS) required.");
      get().rejectCall();
      return;
    }

    try {
      const constraints = {
        audio: true,
        video: callType === "video",
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      const pc = peerConnection || new RTCPeerConnection(ICE_SERVERS);

      // Add local tracks
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Handle remote stream
      const remoteStream = new MediaStream();
      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
        set({ remoteStream });
      };

      // ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("iceCandidate", {
            to: remoteUser._id,
            candidate: event.candidate,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
          get().endCall();
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answerCall", {
        to: remoteUser._id,
        answer,
      });

      // Start call timer
      const timer = setInterval(() => {
        set((state) => ({ callDuration: state.callDuration + 1 }));
      }, 1000);

      set({
        callStatus: "connected",
        localStream: stream,
        remoteStream,
        peerConnection: pc,
        callTimer: timer,
        isMuted: false,
        isCameraOff: false,
        incomingOffer: null,
      });
    } catch (error) {
      console.error("Failed to answer call:", error);
      toast.error("Failed to answer call");
      get().rejectCall();
    }
  },

  // ── REJECT INCOMING ──
  rejectCall: () => {
    const { remoteUser } = get();
    const socket = AuthStore.getState().socket;
    if (socket && remoteUser) {
      socket.emit("rejectCall", { to: remoteUser._id });
    }
    get().cleanup();
  },

  // ── END CALL ──
  endCall: () => {
    const { remoteUser } = get();
    const socket = AuthStore.getState().socket;
    if (socket && remoteUser) {
      socket.emit("endCall", { to: remoteUser._id });
    }
    get().cleanup();
  },

  // ── CLEANUP ──
  cleanup: () => {
    const { localStream, peerConnection, callTimer } = get();

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnection) {
      peerConnection.close();
    }
    if (callTimer) {
      clearInterval(callTimer);
    }

    set({
      callStatus: "idle",
      callType: null,
      callDirection: null,
      remoteUser: null,
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      isMuted: false,
      isCameraOff: false,
      callDuration: 0,
      callTimer: null,
      incomingOffer: null,
    });
  },

  // ── TOGGLE MUTE ──
  toggleMute: () => {
    const { localStream, isMuted } = get();
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
      set({ isMuted: !isMuted });
    }
  },

  // ── TOGGLE CAMERA ──
  toggleCamera: () => {
    const { localStream, isCameraOff } = get();
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = isCameraOff;
      });
      set({ isCameraOff: !isCameraOff });
    }
  },

  // ── SUBSCRIBE TO CALL EVENTS ──
  subscribeToCallEvents: () => {
    const socket = AuthStore.getState().socket;
    if (!socket?.on) return;

    // Incoming call
    socket.on("incomingCall", async ({ from, offer, callType }) => {
      // If already in a call, send busy
      if (get().callStatus !== "idle") {
        socket.emit("callBusy", { to: from });
        return;
      }

      // Find caller info from accepted contacts
      const { ChatRequestStore } = await import("./ChatRequestStore");
      const contacts = ChatRequestStore.getState().acceptedContacts;
      let callerInfo = contacts.find((c) => c._id === from);

      // Fallback: fetch caller info via API
      if (!callerInfo) {
        try {
          const { aixosIns } = await import("../lib/axios");
          const res = await aixosIns.get(`/chat-requests/search-users`, { params: { query: "", userId: from } });
          if (res.data && res.data.length > 0) {
            callerInfo = res.data.find((u) => u._id === from);
          }
        } catch (e) {
          console.error("Failed to fetch caller info:", e);
        }
      }

      // Create peer connection for receiving
      const pc = new RTCPeerConnection(ICE_SERVERS);
      
      set({
        callStatus: "ringing",
        callType,
        callDirection: "incoming",
        remoteUser: callerInfo || { _id: from, fullname: "Unknown Caller", profilePic: null },
        incomingOffer: offer,
        peerConnection: pc,
      });
    });

    // Call answered
    socket.on("callAnswered", async ({ answer }) => {
      const { peerConnection } = get();
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));

        // Start call timer
        const timer = setInterval(() => {
          set((state) => ({ callDuration: state.callDuration + 1 }));
        }, 1000);

        set({ callStatus: "connected", callTimer: timer });
      }
    });

    // ICE candidate received
    socket.on("iceCandidate", async ({ candidate }) => {
      const { peerConnection } = get();
      if (peerConnection && candidate) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding ICE candidate:", e);
        }
      }
    });

    // Call rejected
    socket.on("callRejected", () => {
      toast.error("Call was declined");
      get().cleanup();
    });

    // Call ended by other party
    socket.on("callEnded", () => {
      toast.info("Call ended");
      get().cleanup();
    });

    // User is busy
    socket.on("callBusy", () => {
      toast.error("User is busy on another call");
      get().cleanup();
    });

    // Call failed (user offline)
    socket.on("callFailed", ({ reason }) => {
      toast.error(reason || "Call failed");
      get().cleanup();
    });
  },

  // ── UNSUBSCRIBE ──
  unsubscribeFromCallEvents: () => {
    const socket = AuthStore.getState().socket;
    if (socket?.off) {
      socket.off("incomingCall");
      socket.off("callAnswered");
      socket.off("iceCandidate");
      socket.off("callRejected");
      socket.off("callEnded");
      socket.off("callBusy");
      socket.off("callFailed");
    }
  },
}));
