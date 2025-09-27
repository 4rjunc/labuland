"use client";
import {
  MiniKit,
  tokenToDecimals,
  Tokens,
  PayCommandInput,
} from "@worldcoin/minikit-js";
import { Button, Input, Select } from "@worldcoin/mini-apps-ui-kit-react";
import { useState, useRef, useEffect } from "react";

const sendPayment = async (recipientAddress: string, selectedToken: Tokens, amount: number) => {
  try {
    const res = await fetch(`/api/initiate-payment`, {
      method: "POST",
    });

    const { id } = await res.json();

    console.log(id);

    const payload: PayCommandInput = {
      reference: id,
      to: recipientAddress,
      tokens: [
        {
          symbol: selectedToken,
          token_amount: tokenToDecimals(amount, selectedToken).toString(),
        },
      ],
      description: "Thanks for the coffee! ☕",
    };
    if (MiniKit.isInstalled()) {
      return await MiniKit.commandsAsync.pay(payload);
    }
    return null;
  } catch (error: unknown) {
    console.log("Error sending payment", error);
    return null;
  }
};

const handlePay = async (
  recipientAddress: string,
  selectedToken: Tokens,
  amount: number,
  setStatus: (status: string | null) => void
) => {
  if (!MiniKit.isInstalled()) {
    setStatus("MiniKit is not installed");
    return;
  }

  setStatus("Processing payment...");
  const sendPaymentResponse = await sendPayment(recipientAddress, selectedToken, amount);
  const response = sendPaymentResponse?.finalPayload;

  if (!response) {
    setStatus("Payment failed");
    return;
  }

  if (response.status == "success") {
    const res = await fetch(`/api/confirm-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: response }),
    });
    const payment = await res.json();
    if (payment.success) {
      setStatus("Thank you for the coffee! ☕");
    } else {
      setStatus("Payment confirmation failed");
    }
  } else {
    setStatus("Payment failed");
  }
};

export const PayBlock = () => {
  const [recipientAddress, setRecipientAddress] = useState(process.env.NEXT_PUBLIC_RECIPIENT_ADDRESS || "");
  const [selectedToken, setSelectedToken] = useState<Tokens>(Tokens.WLD);
  const [amount, setAmount] = useState<number>(0.5);
  const [status, setStatus] = useState<string | null>(null);
  
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

  // Camera functions
  const startCamera = async () => {
    try {
      setCameraError(null);
      console.log('Requesting camera access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }, 
        audio: false 
      });
      
      console.log('Camera stream obtained:', stream);
      streamRef.current = stream;
      setIsCameraOpen(true);
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Unable to access camera. Please check permissions.');
    }
  };

  // Effect to set up video when camera opens and stream is available
  useEffect(() => {
    if (isCameraOpen && streamRef.current && videoRef.current) {
      console.log('Setting up video element...');
      videoRef.current.srcObject = streamRef.current;
      
      // Try immediate play
      videoRef.current.play().then(() => {
        console.log('Video playing successfully');
        setIsStreaming(true);
      }).catch((playError) => {
        console.log('Immediate play failed, waiting for metadata...');
        
        // Fallback: wait for metadata
        videoRef.current!.onloadedmetadata = async () => {
          console.log('Video metadata loaded');
          try {
            await videoRef.current!.play();
            console.log('Video playing after metadata load');
            setIsStreaming(true);
          } catch (playError) {
            console.error('Error playing video after metadata:', playError);
            setCameraError('Unable to play video stream.');
          }
        };
      });
    }
  }, [isCameraOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
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

  // Photo capture functions
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the video frame to canvas (mirrored)
    context.save();
    context.scale(-1, 1);
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    context.restore();
    
    // Convert to data URL
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedPhoto(photoDataUrl);
    console.log('Photo captured successfully');
  };

  const uploadToCloudinary = async (photoDataUrl: string) => {
    try {
      setIsUploading(true);
      setUploadStatus('Getting user info...');
      
      // Get user information to include in filename
      let userId = 'anonymous';
      let username = 'user';
      try {
        const userResponse = await fetch('/api/auth/me');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.authenticated && userData.user?.id) {
            userId = userData.user.id;
            username = userData.user.username || 'user';
            console.log('User info retrieved:', { id: userId, username: username });
          }
        }
      } catch (error) {
        console.log('Could not get user info, using anonymous:', error);
      }
      
      setUploadStatus('Uploading photo...');
      
      // Convert data URL to blob
      const response = await fetch(photoDataUrl);
      const blob = await response.blob();
      
      // Create timestamp for unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `photo_${username}_${userId}_${timestamp}.jpg`;
      
      // Log the image data for debugging
      console.log('Photo data URL:', photoDataUrl);
      console.log('Blob size:', blob.size, 'bytes');
      console.log('Blob type:', blob.type);
      console.log('Generated filename:', filename);
      
      // Create FormData for Cloudinary upload
      const formData = new FormData();
      formData.append('file', blob, filename);
      formData.append('upload_preset', 'your_upload_preset'); // Replace with your upload preset
      formData.append('folder', 'camera-photos'); // Optional: organize in folder
      formData.append('public_id', `photo_${username}_${userId}_${timestamp}`); // Set custom public ID
      
      // Upload to Cloudinary
      const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await uploadResponse.json();
      console.log('Upload successful:', result);
      setUploadStatus(`Photo uploaded successfully! Filename: ${filename}`);
      
      return result.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('Upload failed. Please try again.');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleCaptureAndUpload = async () => {
    if (!capturedPhoto) {
      capturePhoto();
      return;
    }
    
    try {
      await uploadToCloudinary(capturedPhoto);
    } catch (error) {
      console.error('Capture and upload failed:', error);
    }
  };

  const switchCamera = async () => {
    if (!isStreaming) return;
    
    try {
      stopCamera();
      // Small delay to ensure camera is released
      await new Promise(resolve => setTimeout(resolve, 100));
      await startCamera();
    } catch (error) {
      console.error('Error switching camera:', error);
      setCameraError('Unable to switch camera.');
    }
  };

  // Cleanup camera on component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold">Buy me a coffee ☕</h3>
      <p className="text-center text-gray-600 mb-4">
        Enjoyed this app? Buy me a coffee! 🎉 Or change the address to support someone else!
      </p>

      {/* Camera Section */}
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium">📸 Camera</h4>
          <div className="flex gap-2">
            {!isCameraOpen ? (
              <Button
                onClick={startCamera}
                variant="secondary"
                size="sm"
              >
                📷 Open Camera
              </Button>
            ) : (
              <>
                <Button
                  onClick={switchCamera}
                  variant="secondary"
                  size="sm"
                >
                  🔄 Switch
                </Button>
                <Button
                  onClick={stopCamera}
                  variant="secondary"
                  size="sm"
                >
                  ❌ Close
                </Button>
              </>
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
              style={{ transform: 'scaleX(-1)' }} // Mirror the video
              onLoadStart={() => console.log('Video load started')}
              onLoadedData={() => console.log('Video data loaded')}
              onCanPlay={() => console.log('Video can play')}
              onError={(e) => {
                console.error('Video error:', e);
                setCameraError('Video playback error');
              }}
            />
            {!isStreaming && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-gray-600 text-sm text-center p-4">Loading camera...</p>
              </div>
            )}
            {cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-100 rounded-lg">
                <p className="text-red-600 text-sm text-center p-4">{cameraError}</p>
              </div>
            )}
            
            {/* Hidden canvas for photo capture */}
            <canvas
              ref={canvasRef}
              style={{ display: 'none' }}
            />
            
            {/* Capture button */}
            {isStreaming && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <Button
                  onClick={handleCaptureAndUpload}
                  disabled={isUploading}
                  className="bg-white/90 hover:bg-white text-black px-6 py-2 rounded-full shadow-lg"
                >
                  {isUploading ? '⏳ Uploading...' : capturedPhoto ? '📤 Upload Photo' : '📸 Capture Photo'}
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Photo preview */}
        {capturedPhoto && (
          <div className="mt-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Captured Photo:</h5>
            <div className="relative">
              <img
                src={capturedPhoto}
                alt="Captured photo"
                className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-200"
              />
              <Button
                onClick={() => setCapturedPhoto(null)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-full text-xs"
              >
                ✕
              </Button>
            </div>
          </div>
        )}
        
        {/* Upload status */}
        {uploadStatus && (
          <div className={`mt-2 text-center text-sm ${
            uploadStatus.includes('successfully') ? 'text-green-600' : 
            uploadStatus.includes('failed') ? 'text-red-600' : 
            'text-blue-600'
          }`}>
            {uploadStatus}
          </div>
        )}
      </div>

      <div className="w-full space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Address</label>
          <Input
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="0x..."
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Token</label>
            <Select
              value={selectedToken}
              onChange={(value) => setSelectedToken(value as Tokens)}
              options={[
                { label: "WLD", value: Tokens.WLD },
                { label: "USDC", value: Tokens.USDCE }
              ]}
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <Input
              type="number"
              value={amount.toString()}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              placeholder="0.5"
            />
          </div>
        </div>
      </div>

      <Button
        onClick={() => handlePay(recipientAddress, selectedToken, amount, setStatus)}
        className="w-full mt-2"
      >
        Buy Coffee
      </Button>

      {status && (
        <div className={`mt-2 text-center ${status.includes("Thank you") ? "text-green-600" : "text-red-600"}`}>
          {status}
        </div>
      )}
    </div>
  );
};
