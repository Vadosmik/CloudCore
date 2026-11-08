import { Link } from "react-router";
import { FiMenu, FiX } from "react-icons/fi";
import "./TopBar.css";

import IconButton from "./button/IconButton";

interface TopBarProps {
  navOpen: boolean;
  onToggleNav: () => void;
}

// Pasek górny tylko na mobile: logo po lewej, burger po prawej
export default function TopBar({ navOpen, onToggleNav }: TopBarProps) {
  return (
    <header className="top-bar">
      <Link to="/" className="top-bar__logo">
        <span>⌘</span> CloudCore
      </Link>

      <IconButton
        title={navOpen ? "Close menu" : "Open menu"}
        icon={navOpen ? <FiX /> : <FiMenu />}
        onClick={onToggleNav}
        aria-expanded={navOpen}
        aria-controls="sidebar"
      />
    </header>
  );
}
