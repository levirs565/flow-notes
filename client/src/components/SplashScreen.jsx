import reactImageUrl from "../assets/react.svg";
import "./SplashScreen.css";

export function SplashScreen() {
  return (
    <div className="splash-screen">
      <img className="splash-screen--img" src={reactImageUrl} />
      <p className="splash-screen--text">React Notes</p>
    </div>
  );
}
