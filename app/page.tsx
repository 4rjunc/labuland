"use client";
import { useEffect, useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import Labubu from "@/components/Labubu";

const labubus = [
    { contractAddress: '0x123...', owner: 'owner1.eth', top: '10%', left: '15%', animationDelay: '0s' },
    { contractAddress: '0x456...', owner: 'owner2.eth', top: '50%', left: '80%', animationDelay: '1.5s' },
    { contractAddress: '0x789...', owner: 'owner3.eth', top: '70%', left: '60%', animationDelay: '3s' },
    { contractAddress: '0xabc...', owner: 'owner4.eth', top: '25%', left: '60%', animationDelay: '4.5s' },
    { contractAddress: '0xdef...', owner: 'owner5.eth', top: '80%', left: '45%', animationDelay: '5.5s' },
    { contractAddress: '0x7829...', owner: 'owner6.eth', top: '60%', left: '10%', animationDelay: '3s' },
    { contractAddress: '0xa34bc...', owner: 'owner7.eth', top: '25%', left: '30%', animationDelay: '4.5s' },
    { contractAddress: '0xd12ef...', owner: 'owner8.eth', top: '50%', left: '45%', animationDelay: '5.5s' },

];

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

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
      className="relative flex min-h-screen flex-col items-center justify-between p-4 md:p-8 lg:p-12 overflow-hidden"
      style={{
        backgroundImage: "url('/bg.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {labubus.map((labubu, index) => (
        <Labubu
          key={index}
          contractAddress={labubu.contractAddress}
          owner={labubu.owner}
          style={{
            top: labubu.top,
            left: labubu.left,
            animationDelay: labubu.animationDelay,
          }}
        />
       ))}
      <div className="w-full max-w-md mx-auto space-y-8 py-8 z-10">
      </div>
    </main>
  );
}
