import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GridShape from "../../components/common/GridShape";
import PageMeta from "../../components/common/PageMeta";
import { Link } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  // Retrieve last valid route or default to home
  const [_lastValidRoute] = useState(
    sessionStorage.getItem("lastValidRoute") || "/home"
  );

  useEffect(() => {
    // Remove the invalid route from history to prevent back-button issues
    window.history.replaceState(null, "", lastValidRoute);
  }, [lastValidRoute]);

  const goBack = () => {
    navigate(lastValidRoute, { replace: true }); // Navigate back to last valid route
  };

  return (
    <>
      <PageMeta
        title="404 Not Found | Dashboard"
        description="Oops! The page you are looking for doesn't exist."
      />
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
        <GridShape />
        <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
          <h1 className="mb-8 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl">
            ERROR 404
          </h1>

          <img src="/images/error/404.svg" alt="404" className="dark:hidden" />
          <img src="/images/error/404-dark.svg" alt="404" className="hidden dark:block" />

          <p className="mt-10 mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
            We can’t seem to find the page you are looking for!
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={goBack}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              Go Back
            </button>

            <Link
              to="/home"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              Back to Home
            </Link>
          </div>
        </div>
        <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
          &copy; {new Date().getFullYear()} - Your Dashboard
        </p>
      </div>
    </>
  );
}
