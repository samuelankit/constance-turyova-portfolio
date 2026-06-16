import { useState } from "react";
import { Link, useLocation } from "wouter";
import Logo from "./Logo";

interface LayoutProps {
  children?: React.ReactNode;
  slider?: React.ReactNode;
  contentPanel?: React.ReactNode;
  contentPanelSide?: "left" | "right";
  blogPanel?: React.ReactNode;
  pageTitle?: string;
  bottomLeft?: React.ReactNode;
  showBlogLink?: boolean;
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
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
          <a href="mailto:contact@constanceturyova.com">
            contact@constanceturyova.com
          </a>
        </div>
      </div>

      {/* Page title (vertical, visible when panel open) */}
      {pageTitle && (
        <div className={`nk-page-title${contentPanel || blogPanel ? " visible" : ""}`}>
          {pageTitle}
        </div>
      )}

      {/* Content panel (right side — about, contact, blog article) */}
      {contentPanel && (
        <div className={`nk-content-panel ${contentPanelSide === "left" ? "nk-blog-panel" : ""} open`}>
          {contentPanel}
        </div>
      )}

      {/* Blog panel (left side) */}
      {blogPanel && (
        <div className="nk-blog-panel open">
          {blogPanel}
        </div>
      )}

      {/* Nav overlay */}
      <nav className={`nk-navbar-overlay${navOpen ? " open" : ""}`} onClick={() => setNavOpen(false)}>
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
              href="https://www.instagram.com/constanceturyova/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setNavOpen(false)}
            >
              Instagram
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}
