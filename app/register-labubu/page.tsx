"use client";

import { useState, useRef, useEffect } from "react";

export default function RegisterLabubuPage() {
  const [ens, setEns] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);

  // Camera states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Photo capture states
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contractAddress && uploadedPhotoUrl) {
      setSubmitted(true);
    }
  };

  // Camera functions
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError("Unable to access camera. Please check permissions.");
    }
  };

  useEffect(() => {
    if (isCameraOpen && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current
        .play()
        .then(() => {
          setIsStreaming(true);
        })
        .catch((playError) => {
          videoRef.current!.onloadedmetadata = async () => {
            try {
              await videoRef.current!.play();
              setIsStreaming(true);
            } catch (playError) {
              console.error("Error playing video after metadata:", playError);
              setCameraError("Unable to play video stream.");
            }
          };
        });
    }
  }, [isCameraOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIsCameraOpen(false);
    setCameraError(null);
    setCapturedPhoto(null);
    setUploadStatus(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.save();
    context.scale(-1, 1);
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    context.restore();

    const photoDataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedPhoto(photoDataUrl);
  };

  const uploadToCloudinary = async (photoDataUrl: string) => {
    setIsUploading(true);
    setUploadStatus("Uploading photo...");

    // Simulate an upload delay of 1.5 seconds
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsUploading(false);
    setUploadStatus("Image uploaded successfully!");
    setUploadedPhotoUrl(photoDataUrl);
    setCapturedPhoto(null);
    stopCamera();
  };

  const handleCaptureAndUpload = async () => {
    if (!capturedPhoto) {
      capturePhoto();
      return;
    }

    try {
      await uploadToCloudinary(capturedPhoto);
    } catch (error) {
      console.error("Capture and upload failed:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 lg:p-12 bg-gray-50">
      <div className="w-full max-w-md mx-auto space-y-8 py-8">
        <h1 className="text-2xl font-bold text-center mb-8">
          Register Labubu
        </h1>
        <section className="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg">
          {submitted ? (
            <div>
              <h2 className="text-xl font-bold text-center mb-4">
                Your Labubu NFT
              </h2>
              {uploadedPhotoUrl && (
                <img
                  src={uploadedPhotoUrl}
                  alt="Your Labubu"
                  className="rounded-lg mb-4 w-full"
                />
              )}
              <div className="text-sm">
                <p className="font-medium text-gray-600">Contract Address:</p>
                <p className="text-gray-800 font-mono break-all">
                  {contractAddress}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="ens"
                  className="block text-sm font-medium text-gray-700"
                >
                  Your ENS
                </label>
                <input
                  type="text"
                  name="ens"
                  id="ens"
                  className="mt-1 block w-full px-3 py-2 text-black bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={ens}
                  onChange={(e) => setEns(e.target.value)}
                  placeholder="yourname.eth"
                />
              </div>
              <div>
                <label
                  htmlFor="contractAddress"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contract Address
                </label>
                <input
                  type="text"
                  name="contractAddress"
                  id="contractAddress"
                  className="mt-1 block w-full px-3 py-2 text-black bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  placeholder="0x..."
                  required
                />
              </div>

              {/* Camera Section */}
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-700">
                    📸 Picture of your Labubu
                  </h4>
                  <div className="flex gap-2">
                    {!isCameraOpen ? (
                      <button
                        onClick={startCamera}
                        className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-md text-sm font-medium"
                        type="button"
                      >
                        📷 Open Camera
                      </button>
                    ) : (
                      <button
                        onClick={stopCamera}
                        className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-md text-sm font-medium"
                        type="button"
                      >
                        ❌ Close
                      </button>
                    )}
                  </div>
                </div>

                {isCameraOpen && (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-200"
                      style={{ transform: "scaleX(-1)" }}
                    />
                    {!isStreaming && !cameraError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                        <p className="text-gray-600 text-sm text-center p-4">
                          Loading camera...
                        </p>
                      </div>
                    )}
                    {cameraError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-100 rounded-lg">
                        <p className="text-red-600 text-sm text-center p-4">
                          {cameraError}
                        </p>
                      </div>
                    )}

                    <canvas ref={canvasRef} style={{ display: "none" }} />

                    {isStreaming && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <button
                          onClick={handleCaptureAndUpload}
                          disabled={isUploading}
                          className="bg-white/90 hover:bg-white text-black px-6 py-2 rounded-full shadow-lg"
                          type="button"
                        >
                          {isUploading
                            ? "⏳ Uploading..."
                            : capturedPhoto
                            ? "📤 Upload Photo"
                            : "📸 Capture Photo"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {capturedPhoto && !isUploading && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Captured Photo Preview:
                    </h5>
                    <div className="relative">
                      <img
                        src={capturedPhoto}
                        alt="Captured photo"
                        className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-200"
                      />
                      <button
                        onClick={() => setCapturedPhoto(null)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-full text-xs"
                        type="button"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
                
                {uploadedPhotoUrl && (
                    <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                        Uploaded Labubu:
                        </h5>
                        <img
                        src={uploadedPhotoUrl}
                        alt="Uploaded labubu"
                        className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-200"
                        />
                    </div>
                )}

                {uploadStatus && (
                  <div
                    className={`mt-2 text-center text-sm ${
                      uploadStatus.includes("successfully")
                        ? "text-green-600"
                        : uploadStatus.includes("failed")
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  >
                    {uploadStatus}
                  </div>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Submit
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
