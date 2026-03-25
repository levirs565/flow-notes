import { useEffect } from "react";
import { matchPath, useLocation, useNavigate } from "react-router-dom";

export function useEnhancedLocation() {
  const location = useLocation();

  const backgroundLocation = location.state?.backgroundLocation;
  const currentLocation = backgroundLocation ?? location;

  return {
    rawLocation: location,
    backgroundLocation,
    currentLocation,
    hasModal: !!backgroundLocation,
  };
}

export function useSyncLastBackgroundLocation(enhancedLocation) {
  const { backgroundLocation, rawLocation: location } = enhancedLocation;
  useEffect(() => {
    let candidateBackgroundLocation = backgroundLocation;
    if (
      !candidateBackgroundLocation &&
      !matchPath({ path: "/note/:id" }, location.pathname)
    )
      candidateBackgroundLocation = location;

    if (candidateBackgroundLocation)
      sessionStorage.setItem(
        "lastBackgroundLocation",
        JSON.stringify(candidateBackgroundLocation)
      );
  }, [backgroundLocation, location]);
}

export function isInvalidLocation(enhancedLocation) {
  return matchPath(
    { path: "/note/:id" },
    enhancedLocation.currentLocation.pathname
  );
}

export function createToValidNavigation(enhancedLocation) {
  return {
    to: enhancedLocation.currentLocation.pathname,
    replace: true,
    state: {
      backgroundLocation: JSON.parse(
        sessionStorage.getItem("lastBackgroundLocation")
      ) ?? {
        pathname: "/",
      },
    },
  };
}

export function useEnhancedNavigate() {
  const { backgroundLocation } = useEnhancedLocation();
  const navigate = useNavigate();

  return {
    navigate,
    modalGoBack() {
      if (window.history.state?.idx === 0) {
        navigate(backgroundLocation);
        return;
      }
      navigate(-1);
    },
  };
}
