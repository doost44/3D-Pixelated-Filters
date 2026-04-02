"use client";
import { useRef, useState, useCallback, useEffect } from "react";

export interface VideoPlayerState {
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  loopIn: number;
  loopOut: number;
  videoSrc: string | null;
  mediaType: "none" | "video" | "image" | "gif";
}

export function useVideoPlayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sourceRef = useRef<HTMLVideoElement | HTMLImageElement | null>(null);
  const [state, setState] = useState<VideoPlayerState>({
    duration: 0,
    currentTime: 0,
    isPlaying: false,
    loopIn: 0,
    loopOut: 1,
    videoSrc: null,
    mediaType: "none",
  });
  const animRef = useRef<number>(0);
  const loopInRef = useRef(0);
  const loopOutRef = useRef(1);

  useEffect(() => {
    loopInRef.current = state.loopIn;
    loopOutRef.current = state.loopOut;
  }, [state.loopIn, state.loopOut]);

  const tick = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const ct = video.currentTime;
    if (ct >= loopOutRef.current) {
      video.currentTime = loopInRef.current;
    }
    setState((prev) => ({ ...prev, currentTime: ct }));
    animRef.current = requestAnimationFrame(tick);
  }, []);

  const loadVideo = useCallback((src: string, type: string = "video/mp4") => {
    const video = videoRef.current;
    if (!video) return;

    cancelAnimationFrame(animRef.current);
    video.pause();

    // Handle GIF files — treat as animated image
    if (type === "image/gif") {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        sourceRef.current = image;
        setState((prev) => ({
          ...prev,
          duration: 1,
          currentTime: 0,
          isPlaying: true,
          loopIn: 0,
          loopOut: 1,
          videoSrc: src,
          mediaType: "gif",
        }));
        loopInRef.current = 0;
        loopOutRef.current = 1;
      };
      image.src = src;
      return;
    }

    if (type.startsWith("image/")) {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        sourceRef.current = image;
        setState((prev) => ({
          ...prev,
          duration: 1,
          currentTime: 0,
          isPlaying: false,
          loopIn: 0,
          loopOut: 1,
          videoSrc: src,
          mediaType: "image",
        }));
        loopInRef.current = 0;
        loopOutRef.current = 1;
      };
      image.src = src;
      return;
    }

    sourceRef.current = video;
    video.src = src;
    video.load();
    video.onloadedmetadata = () => {
      const dur = video.duration;
      setState((prev) => ({
        ...prev,
        currentTime: 0,
        isPlaying: false,
        duration: dur,
        loopIn: 0,
        loopOut: dur,
        videoSrc: src,
        mediaType: "video",
      }));
      loopInRef.current = 0;
      loopOutRef.current = dur;
      video.currentTime = 0;
    };
  }, []);

  const play = useCallback(() => {
    if (state.mediaType !== "video") return;
    videoRef.current?.play();
    setState((prev) => ({ ...prev, isPlaying: true }));
    animRef.current = requestAnimationFrame(tick);
  }, [state.mediaType, tick]);

  const pause = useCallback(() => {
    videoRef.current?.pause();
    setState((prev) => ({ ...prev, isPlaying: false }));
    cancelAnimationFrame(animRef.current);
  }, []);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) pause();
    else play();
  }, [state.isPlaying, play, pause]);

  const seekTo = useCallback(
    (time: number) => {
      if (state.mediaType === "video" && videoRef.current) {
        videoRef.current.currentTime = time;
        setState((prev) => ({ ...prev, currentTime: time }));
        return;
      }

      if (state.mediaType === "image") {
        setState((prev) => ({ ...prev, currentTime: 0 }));
      }
    },
    [state.mediaType],
  );

  const setLoopIn = useCallback((t: number) => {
    setState((prev) => ({ ...prev, loopIn: t }));
  }, []);

  const setLoopOut = useCallback((t: number) => {
    setState((prev) => ({ ...prev, loopOut: t }));
  }, []);

  useEffect(() => {
    const video = document.createElement("video");
    video.muted = true;
    video.loop = false;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    videoRef.current = video;
    sourceRef.current = video;
    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return {
    videoRef,
    sourceRef,
    state,
    loadVideo,
    play,
    pause,
    togglePlay,
    seekTo,
    setLoopIn,
    setLoopOut,
  };
}
