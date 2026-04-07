import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "react-hot-toast";
import { useUser, SignIn, useAuth } from "@clerk/clerk-react";
import { Scroll, ArrowLeft } from "lucide-react";

// ✅ IMPORT ANONYMOUS SUPABASE CLIENT (NO Clerk interference)
import { supabase } from "./lib/supabaseClient";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner";
import GlobalMusicPlayer from "./components/GlobalMusicPlayer";

//changes
import FloatingMenu from "./components/FloatingMenu";
import { ASSETS } from "./constants/assets";

// Pages
import HomePage from "./pages/HomePage";
import StatesPage from "./pages/StatesPage";
import HeritagePage from "./pages/HeritagePage";
import HeritageDetailPage from "./pages/HeritageDetailPage";
import FestivalsPage from "./pages/FestivalsPage";
import ArtsPage from "./pages/ArtsPage";
import HiddenGemsPage from "./pages/HiddenGemsPage";
import QuizPage from "./pages/QuizPage";
import ChatPage from "./pages/ChatPage";
import MapPage from "./pages/MapPage";
import AccountPage from "./pages/AccountPage";
import UploadPage from "./pages/UploadPage";
import TourPage360 from "./pages/TourPage360";
import RecommendationsPage from "./pages/RecommendationsPage";
import StoryTellingPage from "./pages/StoryTellingPage";
import ItineraryPlanner from "./pages/ItineraryPlanner";

//changes
import RitualExplorerPage from "./pages/RitualExplorerPage";

import { createOrUpdateUser } from "./services/userService";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  },
});

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { user: clerkUser, isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();

  // ✅ FIXED: Only sync user data (NO auth token mixing)
  useEffect(() => {
    if (isLoaded && isSignedIn && clerkUser) {
      createOrUpdateUser(clerkUser)
        .then(() => {
          console.log("✅ Clerk user profile synced (data only)");
        })
        .catch((err) => {
          console.warn("⚠️ User sync failed (non-critical):", err.message);
        });
    }
  }, [isLoaded, isSignedIn, clerkUser]);

  // ✅ FIXED: NO Supabase auth sync - Uploads use ANONYMOUS client
  useEffect(() => {
    if (isSignedIn) {
      console.log(
        "👤 Clerk signed in:",
        clerkUser?.emailAddresses[0]?.emailAddress
      );
      console.log(
        "📤 Hidden gems uploads remain 100% ANONYMOUS (separate client)"
      );
    } else {
      console.log("👤 Clerk signed out - Uploads still work anonymously");
    }
  }, [isSignedIn, clerkUser]);

  const handlePageChange = (page, item = null) => {
    setCurrentPage(page);
    setSelectedItem(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderCurrentPage = () => {
    const pageProps = {
      user: clerkUser,
      isSignedIn,
      searchQuery,
      onSearchChange: setSearchQuery,
      onPageChange: handlePageChange,
      selectedItem,
    };

    switch (currentPage) {
      case "home":
        return <HomePage {...pageProps} />;
      case "360tour":
        return <TourPage360 {...pageProps} onPageChange={handlePageChange} />;
      case "states":
        return <StatesPage {...pageProps} />;
      case "heritage":
        return selectedItem ? (
          <HeritageDetailPage {...pageProps} item={selectedItem} />
        ) : (
          <HeritagePage {...pageProps} />
        );
      case "festivals":
        return <FestivalsPage {...pageProps} />;
      case "arts":
        return <ArtsPage {...pageProps} />;
      case "gems":
        return <HiddenGemsPage {...pageProps} />;
      case "quiz":
        if (!isLoaded) {
          return (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          );
        }
        if (!isSignedIn) {
          return (
            <div
              className="fixed inset-0 flex justify-center items-start overflow-hidden bg-black"
              style={{
                zIndex: 50,
              }}
            >
              {/* Background Video */}
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-90"
                src={ASSETS.HERITAGE_BG}
              />
              {/* Overlay for better readability */}
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px] z-10" />

              {/* Back to Home Button */}
              <button
                onClick={() => handlePageChange("home")}
                className="absolute top-8 left-8 z-50 flex items-center space-x-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 transition-all duration-300 group"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold text-sm">Back to Home</span>
              </button>
              <div
                  style={{
                    width: "100vw",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    paddingTop: "18vh",
                    minHeight: "100vh",
                    zIndex: 20, // Sit on top of video and overlay
                  }}
              >
                <SignIn
                  afterSignInUrl="/quiz"
                  appearance={{
                    layout: {
                      socialButtonsPlacement: "bottom",
                      showOptionalFields: false,
                    },
                    variables: {
                      colorPrimary: "#d97706", // amber-600
                      colorText: "#1f2937",    // gray-800
                      borderRadius: "16px",
                      fontFamily: "Inter, system-ui, sans-serif",
                    },
                    elements: {
                      card: "bg-white/90 backdrop-blur-xl border border-amber-200/50 shadow-2xl rounded-2xl",
                      formButtonPrimary: 
                        "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 border-none shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95 py-3 text-sm font-bold uppercase tracking-wider",
                      headerTitle: "text-2xl font-heritage font-bold text-amber-900",
                      headerSubtitle: "text-amber-700/80 font-medium",
                      socialButtonsBlockButton: "border border-amber-100 hover:bg-amber-50 transition-colors duration-200",
                      formFieldInput: "border-amber-100 focus:ring-amber-500 focus:border-amber-500 rounded-xl",
                      footerActionLink: "text-amber-600 hover:text-amber-700 font-bold",
                      identityPreviewText: "text-amber-900",
                      rootBox: "flex justify-center items-center w-full"
                    },
                  }}
                />
              </div>
            </div>
          );
        }
        return <QuizPage {...pageProps} />;
      case "itinerary":
        return <ItineraryPlanner {...pageProps} />;
      case "chat":
        return <ChatPage {...pageProps} />;
      case "map":
        return <MapPage {...pageProps} />;
      case "account":
        if (!isLoaded) {
          return <LoadingSpinner size="lg" />;
        }
        return <AccountPage {...pageProps} />;

      // ✅ FIXED: UploadPage works for EVERYONE (anonymous)
      case "upload":
        return <UploadPage {...pageProps} />;

      case "salahkar":
        return <RecommendationsPage onBack={() => handlePageChange("home")} />;

      //changes

      case "riti-riwaj":
        return <RitualExplorerPage {...pageProps} />;
      case "storytelling":
        return (
          <StoryTellingPage
            {...pageProps}
            onBack={() => handlePageChange("home")}
          />
        );
      // YHA TK

      default:
        return <HomePage {...pageProps} />;
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
        <GlobalMusicPlayer />
        {/* Hide Header on Salahkar & Story pages */}
        {currentPage !== "salahkar" && currentPage !== "storytelling" && (
          <Header
            currentPage={currentPage}
            onPageChange={handlePageChange}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}
        {/* Adjust main padding based on current page */}
        <main
          className={
            currentPage === "salahkar" || currentPage === "storytelling"
              ? "min-h-screen"
              : "min-h-screen pt-20"
          }
        >
          {renderCurrentPage()}
        </main>
        {/* Hide Footer on Salahkar & Story pages */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#374151",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              borderRadius: "12px",
              padding: "16px",
            },
          }}
        />
        {currentPage !== "salahkar" && currentPage !== "storytelling" && (
          <Footer />
        )}

        {/* ✨ DIVINE AMBER SALAHKAR BUTTON - The Click Magnet ✨ */}
        {currentPage !== "salahkar" && currentPage !== "storytelling" && (
          <button
            onClick={() => handlePageChange("salahkar")}
            className="salahkar-trigger group"
            title="Ask Salahkar - AI Heritage Guide"
          >
            {/* Contextual Glow */}
            <div className="absolute inset-0 rounded-full bg-orange-500 blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000 animate-pulse-slow"></div>

            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Rotating Rune Ring */}
              <div className="absolute inset-0 border border-orange-300/30 rounded-full w-full h-full animate-spin-slow-reverse"></div>

              {/* Outer Golden Ripple */}
              <div className="absolute inset-0 rounded-full border border-orange-400/50 w-full h-full animate-ripple"></div>

              {/* The Gem Body */}
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-amber-700 via-orange-500 to-amber-300 shadow-2xl border-2 border-orange-200/50 flex flex-col items-center justify-center transform group-hover:scale-105 transition-all duration-500 ease-out overflow-hidden z-10">
                {/* Shine effect */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/30 to-transparent opacity-60"></div>

                {/* Inner Glow */}
                <div className="absolute inset-0 bg-radial-glow opacity-80 animate-breathe"></div>

                {/* Sparkling Particles */}
                <div className="sparkle s1"></div>
                <div className="sparkle s2"></div>
                <div className="sparkle s3"></div>

                {/* Content */}
                <span className="relative z-20 font-cinzel font-black text-xs text-amber-900 tracking-[0.2em] mb-0.5 drop-shadow-sm text-center">
                  ASK
                </span>
                <span className="relative z-20 font-cinzel font-bold text-[10px] text-amber-100 tracking-widest drop-shadow-md text-center">
                  SALAHKAR
                </span>
              </div>

              {/* Orbiting Firefly */}
              <div className="absolute inset-[-8px] animate-spin-slow pointer-events-none">
                <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_15px_4px_rgba(255,165,0,0.8)] absolute top-0 left-1/2 transform -translate-x-1/2 blur-[1px]"></div>
              </div>
            </div>
          </button>
        )}

        <div className="fixed bottom-6 left-6 z-50">
          <FloatingMenu onPageChange={handlePageChange} />
        </div>
        {/* 🎨 Advanced CSS for the Button */}
        <style>{`
          .font-cinzel { font-family: 'Cinzel', serif; }
          
          .salahkar-trigger {
            position: fixed;
            bottom: 40px;
            right: 40px;
            z-index: 1000;
            cursor: pointer;
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          
          .salahkar-trigger:hover {
            transform: translateY(-5px);
          }
          
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes spin-slow-reverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }

          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }
          
          .animate-spin-slow-reverse {
            animation: spin-slow-reverse 12s linear infinite;
          }

          @keyframes ripple {
            0% { transform: scale(1); opacity: 0.8; border-color: rgba(251, 146, 60, 0.6); }
            100% { transform: scale(1.6); opacity: 0; border-color: rgba(251, 146, 60, 0); }
          }

          .animate-ripple {
            animation: ripple 2.5s cubic-bezier(0, 0.2, 0.8, 1) infinite;
          }

          @keyframes breathe {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.1); opacity: 0.9; }
          }
          
          .animate-breathe {
            animation: breathe 4s ease-in-out infinite;
          }
          
          .bg-radial-glow {
            background: radial-gradient(circle at center, rgba(255, 255, 255, 0.8) 0%, rgba(251, 191, 36, 0.4) 40%, transparent 70%);
          }

          /* Sparkles */
          .sparkle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: white;
            border-radius: 50%;
            opacity: 0;
            box-shadow: 0 0 5px white;
            animation: sparkle-anim 3s infinite ease-in-out;
          }
          
          .s1 { top: 30%; left: 20%; animation-delay: 0.5s; }
          .s2 { top: 60%; left: 80%; animation-delay: 1.2s; }
          .s3 { top: 20%; left: 70%; animation-delay: 2.1s; }

          @keyframes sparkle-anim {
            0%, 100% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1); }
          }
          
          .animate-pulse-slow {
            animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        `}</style>
      </div>
    </QueryClientProvider>
  );
}

export default App;
