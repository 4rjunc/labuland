"use client";
import { useEffect, useState, useRef } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import Labubu from "@/components/Labubu";
import styles from "./Home.module.css";

const initialLabubus = [
  { contractAddress: '0x123...', owner: 'owner1.eth', top: '10%', left: '15%', animationDelay: '0s', imageUrl: '/labubu.png' },
  { contractAddress: '0x456...', owner: 'owner2.eth', top: '50%', left: '80%', animationDelay: '1.5s', imageUrl: '/labubu.png' },
  { contractAddress: '0x789...', owner: 'owner3.eth', top: '70%', left: '10%', animationDelay: '3s', imageUrl: '/labubu.png' },
  { contractAddress: '0xabc...', owner: 'owner4.eth', top: '25%', left: '60%', animationDelay: '4.5s', imageUrl: '/labubu.png' },
  { contractAddress: '0xdef...', owner: 'owner5.eth', top: '80%', left: '45%', animationDelay: '5.5s', imageUrl: '/labubu.png' },
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [labubusData, setLabubusData] = useState(initialLabubus);

  // Camera states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Mating animation states
  const [isMating, setIsMating] = useState(false);
  const [matingPairIndices, setMatingPairIndices] = useState<[number, number] | null>(null);
  const [showHeart, setShowHeart] = useState(false);

  useEffect(() => {
    const checkMiniKit = async () => {
      const isInstalled = MiniKit.isInstalled();
      if (isInstalled) {
        setIsLoading(false);
      } else {
        setTimeout(checkMiniKit, 500);
      }
    };
    checkMiniKit();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    setIsCameraOpen(false);
  };

  const handleMateClick = () => {
    setIsCameraOpen(true);
    startCamera();
  };

  const signMessage = async () => {
    const signMessagePayload = {
      message: "Mate the Labubu",
    };

    const { finalPayload } = await MiniKit.commandsAsync.signMessage(signMessagePayload);


    handleCaptureSuccess()
  }

  const handleCaptureSuccess = () => {
    stopCamera();
    if (labubusData.length < 2) return;

    const parent1Index = Math.floor(Math.random() * labubusData.length);
    let parent2Index = Math.floor(Math.random() * labubusData.length);
    while (parent1Index === parent2Index) {
      parent2Index = Math.floor(Math.random() * labubusData.length);
    }
    setMatingPairIndices([parent1Index, parent2Index]);
    setIsMating(true);

    setTimeout(() => {
      setShowHeart(true);
      setTimeout(() => {
        const newBaby = {
          contractAddress: `0xnew...${Date.now().toString().slice(-4)}`,
          owner: 'newborn.eth',
          top: '50%',
          left: '50%',
          animationDelay: `${Math.random() * 1}s`,
          imageUrl: '/baby.png',
        };
        setLabubusData(prev => [...prev, newBaby]);
        setShowHeart(false);
        setIsMating(false);
        setMatingPairIndices(null);
      }, 2000);
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  if (isLoading) {
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 lg:p-12"
        style={{
          backgroundImage: "url('/bg.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <svg className="animate-spin h-10 w-10 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg font-medium text-gray-900">Loading MiniKit...</p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-8 lg:p-12 overflow-hidden"
      style={{
        backgroundImage: "url('/bg.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {labubusData.map((labubu, index) => {
        let style: React.CSSProperties = {
          top: labubu.top,
          left: labubu.left,
          animationDelay: labubu.animationDelay,
          transition: 'top 1.5s ease-in-out, left 1.5s ease-in-out',
        };

        if (isMating && matingPairIndices?.includes(index)) {
          style.top = '50%';
          style.left = '50%';
          style.transform = 'translate(-50%, -50%)';
        }

        return (
          <Labubu
            key={index}
            contractAddress={labubu.contractAddress}
            owner={labubu.owner}
            imageUrl={labubu.imageUrl}
            style={style}
          />
        )
      })}

      {showHeart && (
        <div className={styles.heart} style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          ❤️
        </div>
      )}

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={handleMateClick}
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105"
        >
          Mate
        </button>
      </div>

      {isCameraOpen && (
        <div className={styles.cameraModal}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-w-md rounded-lg border-2 border-gray-200"
            style={{ transform: "scaleX(-1)" }}
          />
          <div className="flex gap-4">
            <button
              onClick={() => {
                signMessage()
              }}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full"
            >
              Done
            </button>
            <button
              onClick={stopCamera}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
