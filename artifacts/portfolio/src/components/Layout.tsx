import { useState } from "react";
import { Link, useLocation } from "wouter";
import Logo from "./Logo";
import SocialIcons from "./SocialIcons";

interface LayoutProps {
  children?: React.ReactNode;
  slider?: React.ReactNode;
  contentPanel?: React.ReactNode;
  contentPanelSide?: "left" | "right";
  blogPanel?: React.ReactNode;
  pageTitle?: string;
  bottomLeft?: React.ReactNode;
  showBlogLink?: boolean;
  panelCloseTo?: string;
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/portfolio", label: "My Portfolio" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Layout({
  slider,
  contentPanel,
  contentPanelSide = "right",
  blogPanel,
  pageTitle,
  bottomLeft,
  showBlogLink = true,
  panelCloseTo = "/",
}: LayoutProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [location] = useLocation();

  return (
    <>
      {/* Slider background */}
      {slider}

      {/* Fixed UI layer */}
      <div className="nk-layout">
        {/* Top Left — Logo */}
        <div className="nk-layout-top-left">
          <Link href="/" className="nk-logo" style={{ lineHeight: 0 }}>
            <Logo />
          </Link>
        </div>

        {/* Top Right — Hamburger */}
        <div className="nk-layout-top-right">
          <div
            className={`nk-nav-toggle${navOpen ? " open" : ""}`}
            onClick={() => setNavOpen(!navOpen)}
            role="button"
            aria-label="Toggle navigation"
            style={{ zIndex: 201, position: "relative" }}
          >
            <span />
            <span />
            <span />
          </div>
        </div>

        {/* Bottom Left */}
        <div className="nk-layout-bottom-left nk-bottom-nav">
          {bottomLeft ?? (
            showBlogLink ? (
              <Link href="/blog">Blog</Link>
            ) : null
          )}
        </div>

        {/* Bottom Center — email */}
        <div className="nk-layout-bottom-center nk-bottom-nav">
          <a href="mailto:contact@lcperforms.com">
            contact@lcperforms.com
          </a>
        </div>

        {/* Bottom Right — Social Icons */}
        <div className="nk-layout-bottom-right">
          <SocialIcons />
        </div>
      </div>

      {/* Page title (vertical, visible when panel open) */}
      {pageTitle && (
        <div className={`nk-page-title${contentPanel || blogPanel ? " visible" : ""}`}>
          {pageTitle}
        </div>
      )}

      {/* Content panel (right side — about, contact) */}
      {contentPanel && (
        <div className={`nk-content-panel ${contentPanelSide === "left" ? "nk-blog-panel" : ""} open`}>
          <Link href={panelCloseTo} className="nk-panel-close" aria-label="Close panel">×</Link>
          {contentPanel}
        </div>
      )}

      {/* Blog panel (left side) */}
      {blogPanel && (
        <div className="nk-blog-panel open">
          <Link href={panelCloseTo} className="nk-panel-close" aria-label="Close panel">×</Link>
          {blogPanel}
        </div>
      )}

      {/* Nav overlay */}
      <nav className={`nk-navbar-overlay${navOpen ? " open" : ""}`} onClick={() => setNavOpen(false)}>
        <button
          className="nk-nav-close"
          onClick={() => setNavOpen(false)}
          aria-label="Close navigation"
        >
          ×
        </button>
        <ul className="nk-nav-links" onClick={(e) => e.stopPropagation()}>
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={location === l.href ? "active-link" : ""}
                onClick={() => setNavOpen(false)}
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <a
              href="https://www.instagram.com/lcperforms/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setNavOpen(false)}
            >
              @lcperforms
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}
