"use client";

import { useState, useEffect } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Link from "next/link";
import { Mail, CheckCircle, Loader } from "lucide-react";
import { resetPassword } from "../../../utils/api";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await resetPassword(email);
      setConfirmation(true);
    } catch (err) {
      setError("Please input your correct email address");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header />
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div
          className={`max-w-md w-full space-y-8 transition-opacity duration-500 ease-in-out ${isPageLoaded ? "opacity-100" : "opacity-0"
            }`}
        >
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 reset-password-header">
              Reset Your Password
            </h2>
          </div>
          <form
            className="mt-8 space-y-6 reset-password-form"
            onSubmit={handleResetPassword}
          >
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only email-label">
                  Email
                </label>
                <div className="relative email-input">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm email-input"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                  <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 email-icon" />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4 error-message">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 error-message">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 reset-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="animate-spin h-5 w-5 mr-3 loading-icon" />
                ) : (
                  <Mail className="h-5 w-5 mr-2 button-icon" />
                )}
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </form>

          {confirmation && (
            <div className="mt-4 text-sm text-green-600 flex items-center justify-center confirmation-message-container">
              <CheckCircle className="h-5 w-5 mr-2 confirmation-icon" />
              <span>We&apos;ve sent a reset link to your email address.</span> {/*escape apostrophe*/}
            </div>
          )}

          <p className="mt-2 text-center text-sm text-gray-600 sign-in-prompt">
            Remember your password?{" "}
            <Link
              href="/pages/login"
              className="font-medium text-purple-600 hover:text-purple-500 sign-in-link"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
