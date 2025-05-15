import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import UserService from "../UserService";
import toast from "react-hot-toast";

const VerifyEmail = () => {
  const { token } = useParams();
  const [verificationStatus, setVerificationStatus] = useState("loading");
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const verifyEmail = async () => {
      // Add a small delay to ensure URL parameters are properly loaded
      timeoutId = setTimeout(async () => {
        if (!token) {
          console.error("No token found in URL");
          if (isMounted) {
            setVerificationStatus("error");
            toast.error("No verification token found");
          }
          return;
        }

        try {
          console.log("Attempting to verify email with token:", token);
          const response = await UserService.verifyEmail(token);
          
          if (isMounted) {
            if (response.data.success) {
              setVerificationStatus("success");
              toast.success(response.data.message);
              setTimeout(() => {
                navigate("/auth/login");
              }, 3000);
            } else {
              setVerificationStatus("error");
              toast.error(response.data.message || "Verification failed");
            }
          }
        } catch (error) {
          console.error("Verification error:", error.response?.data || error.message);
          if (isMounted) {
            setVerificationStatus("error");
            toast.error(error.response?.data?.message || "Email verification failed");
          }
        }
      }, 1000); // 1 second delay to ensure URL parameters are loaded
    };

    verifyEmail();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        {verificationStatus === "loading" && (
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Verification</h2>
            <p className="text-gray-600">Please wait while we prepare your verification...</p>
          </div>
        )}

        {verificationStatus === "verifying" && (
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Your Email</h2>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
          </div>
        )}

        {verificationStatus === "success" && (
          <div className="text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified Successfully!</h2>
            <p className="text-gray-600 mb-4">Your email has been verified. You will be redirected to the login page shortly.</p>
            <div className="animate-pulse text-indigo-600">Redirecting...</div>
          </div>
        )}

        {verificationStatus === "error" && (
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-4">The verification link is invalid or has expired.</p>
            <button
              onClick={() => navigate("/auth/login")}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;