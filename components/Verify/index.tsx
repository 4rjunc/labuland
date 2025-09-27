"use client";
import {
  VerificationLevel,
  ISuccessResult as ISuccessResultFromKit,
  MiniAppVerifyActionErrorPayload,
  IVerifyResponse as IVerifyResponseFromKit,
} from "@worldcoin/minikit-js";
import { Button } from "@worldcoin/mini-apps-ui-kit-react";
import { useVerify } from "../hooks/useVerify";

export type ISuccessResult = ISuccessResultFromKit;
export type IVerifyResponse = IVerifyResponseFromKit;

export type VerifyCommandInput = {
  action: string;
  signal?: string;
  verification_level?: VerificationLevel; // Default: Orb
};

export const verifyPayload: VerifyCommandInput = {
  action: "labuland-pro", // This is your action ID from the Developer Portal
  signal: "",
  verification_level: VerificationLevel.Device, // Orb | Device
};

export const VerifyBlock = () => {
  const { verified, handleVerifyResponse, handleVerify, reset } = useVerify();

  return (
    <div className="flex flex-col items-center">
      {!handleVerifyResponse ? (
        <Button 
          onClick={handleVerify}
        >
          Verify with World ID
        </Button>
      ) : (
        <div className="flex flex-col items-center space-y-2">
          {verified ? (
            <>
              <div className="text-green-600 font-medium">✓ Verified</div>
              <div className="bg-gray-100 p-4 rounded-md max-w-md overflow-auto">
                <pre className="text-xs">{JSON.stringify(handleVerifyResponse, null, 2)}</pre>
              </div>
            </>
          ) : (
            <>
              <div className="text-red-600 font-medium">✗ Verification Failed</div>
              <div className="bg-gray-100 p-4 rounded-md max-w-md overflow-auto">
                <pre className="text-xs">{JSON.stringify(handleVerifyResponse, null, 2)}</pre>
              </div>
            </>
          )}
          <Button
            onClick={reset}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};
