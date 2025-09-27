"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useLogin } from '../hooks/useLogin';
import { useVerify } from '../hooks/useVerify';

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, handleLogin, handleLogout } = useLogin();
  const { verified, handleVerifyResponse, handleVerify, reset } = useVerify();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLoginClick = async () => {
    await handleLogin();
    setIsOpen(false);
  };

  const handleVerifyClick = async () => {
    await handleVerify();
    setIsOpen(false);
  };

  const handleLogoutClick = async () => {
    await handleLogout();
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={toggleMenu}
          className="flex flex-col items-center justify-center w-12 h-12 bg-gray-800 rounded-md focus:outline-none"
        >
          <div className={`w-6 h-0.5 bg-white transition-transform duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <div className={`w-6 h-0.5 bg-white my-1 transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`} />
          <div className={`w-6 h-0.5 bg-white transition-transform duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-14 right-0 w-48 bg-white rounded-md shadow-lg z-10">
            <ul className="py-2">
              {!user ? (
                <li>
                  <button onClick={handleLoginClick} className="w-full text-left block px-4 py-2 text-gray-800 hover:bg-gray-200">
                    Login
                  </button>
                </li>
              ) : (
                <li>
                  <button onClick={handleLogoutClick} className="w-full text-left block px-4 py-2 text-gray-800 hover:bg-gray-200">
                    Logout
                  </button>
                </li>
              )}
              <li>
                <button onClick={handleVerifyClick} className="w-full text-left block px-4 py-2 text-gray-800 hover:bg-gray-200">
                  Verify with World ID
                </button>
              </li>
              <li>
                <Link href="/register-labubu" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">
                  Register Labubu
                </Link>
              </li>
              <li>
                <Link href="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">
                  Profile
                </Link>
              </li>
              <li>
                <Link href="/" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">
                  home
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>

    </>
  );
};

export default HamburgerMenu;
