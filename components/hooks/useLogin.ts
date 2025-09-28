"use client";
import { MiniKit, WalletAuthInput } from "@worldcoin/minikit-js";
import { useCallback, useEffect, useState } from "react";

const walletAuthInput = (nonce: string): WalletAuthInput => {
    return {
        nonce,
        requestId: "0",
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        statement: "This is my statement and here is a link https://worldcoin.com/apps",
    };
};

type User = {
    walletAddress: string;
    username: string | null;
    profilePictureUrl: string | null;
};

export const useLogin = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    
    const refreshUserData = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                if (data.user) {
                    setUser(data.user);
                }
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    }, []);
    
    useEffect(() => {
        refreshUserData();
    }, [refreshUserData]);
    
    const handleLogin = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/nonce`);
            const { nonce } = await res.json();

            const { finalPayload } = await MiniKit.commandsAsync.walletAuth(walletAuthInput(nonce));

            if (finalPayload.status === 'error') {
                setLoading(false);
                return;
            } else {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        payload: finalPayload,
                        nonce,
                    }),
                });

                if (response.status === 200) {
                    setUser(MiniKit.user)
                }
                setLoading(false);
            }
        } catch (error) {
            console.error("Login error:", error);
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
            });
            
            setUser(null);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return { user, loading, handleLogin, handleLogout };
};
