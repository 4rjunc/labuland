"use client";
import { Button } from "@worldcoin/mini-apps-ui-kit-react";
import { useLogin } from "../hooks/useLogin";

export const Login = () => {
    const { user, loading, handleLogin, handleLogout } = useLogin();

    return (
        <div className="flex flex-col items-center">
            {!user ? (
                <Button 
                    onClick={handleLogin} 
                    disabled={loading}
                >
                    {loading ? "Connecting..." : "Login"}
                </Button>
            ) : (
                <div className="flex flex-col items-center space-y-2">
                    <div className="text-green-600 font-medium">✓ Connected</div>
                    <div className="flex items-center space-x-2">
                        {user?.profilePictureUrl && (
                            <img
                                src={user.profilePictureUrl}
                                alt="Profile"
                                className="w-8 h-8 rounded-full"
                            />
                        )}
                        <span className="font-medium">
                            {user?.username || user?.walletAddress.slice(0, 6) + '...' + user?.walletAddress.slice(-4)}
                        </span>
                    </div>
                    <Button
                        onClick={handleLogout}
                        variant="secondary"
                        size="md"
                        disabled={loading}
                    >
                        {loading ? "Signing Out..." : "Sign Out"}
                    </Button>
                </div>
            )}
        </div>
    )
};
