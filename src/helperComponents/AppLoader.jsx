// src/components/AppLoader.jsx
import CarLogo from "../assets/car_logo.svg";

const AppLoader = () => {
  return (
    <div className="relative flex flex-col items-center justify-center w-screen h-[calc(100vh-40px)] bg-gradient-to-b from-black via-gray-900 to-red-800 overflow-hidden">
      {/* Speed trails in the background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-[-20%] w-[140%] h-1 bg-gradient-to-r from-transparent via-red-500/40 to-transparent animate-slide" />
        <div className="absolute top-2/3 left-[-20%] w-[140%] h-1 bg-gradient-to-r from-transparent via-gray-400/30 to-transparent animate-slide-slow" />
      </div>

      {/* Car logo animation */}
      <div className="relative">
        <img
          src={CarLogo}
          alt="F1 Loader"
          className="w-28 sm:w-32 drop-shadow-[0_0_15px_rgba(255,0,0,0.4)] animate-car-bounce"
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-transparent animate-trail" />
      </div>

      {/* Text */}
      <p className="mt-6 text-sm sm:text-base font-semibold tracking-widest text-gray-200 animate-blink uppercase">
        Loading PitStop...
      </p>
    </div>
  );
};

export default AppLoader;
