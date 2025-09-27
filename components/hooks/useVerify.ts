"use client";
import { MiniKit } from "@worldcoin/minikit-js";
import { useCallback, useState } from "react";
import { ISuccessResult, IVerifyResponse, verifyPayload } from "../Verify";

export const useVerify = () => {
    const [handleVerifyResponse, setHandleVerifyResponse] = useState<
        IVerifyResponse | null
    >(null);
    const [verified, setVerified] = useState<boolean>(false);

    const handleVerify = useCallback(async () => {
        if (!MiniKit.isInstalled()) {
            console.warn("Tried to invoke 'verify', but MiniKit is not installed.");
            return;
        }

        const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);

        if (finalPayload.status === "error") {
            console.log("Command error");
            console.log(finalPayload);
            return finalPayload;
        }

        const verifyResponse = await fetch(`/api/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                payload: finalPayload as ISuccessResult,
                action: verifyPayload.action,
                signal: verifyPayload.signal,
            }),
        });

        const verifyResponseJson = await verifyResponse.json();

        if (verifyResponseJson.status === 200) {
            console.log("Verification success!");
            console.log(finalPayload);
            setVerified(true);
        }

        setHandleVerifyResponse(verifyResponseJson);
        return verifyResponseJson;
    }, []);

    const reset = () => {
        setHandleVerifyResponse(null);
        setVerified(false);
    }

    return { verified, handleVerifyResponse, handleVerify, reset };
}
