import { Helmet } from "react-helmet-async";
import { useListSlides } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import Slider from "@/components/Slider";

export default function ContactPage() {
  const { data: slides } = useListSlides();

  const slideData = (slides ?? []).map((s) => ({
    imageUrl: s.imageUrl,
    altText: s.altText,
  }));

  const panel = (
    <div className="nk-contact-content">
      <div className="nk-contact-item">
        <p className="nk-contact-label">Instagram</p>
        <a
          href="https://www.instagram.com/lcperforms/"
          target="_blank"
          rel="noopener noreferrer"
          className="nk-instagram-link"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <circle cx="12" cy="12" r="4"/>
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
          </svg>
          @lcperforms
        </a>
      </div>

      <div className="nk-contact-item">
        <p className="nk-contact-label">Email</p>
        <a href="mailto:contact@lcperforms.com" className="nk-contact-value">
          contact@lcperforms.com
        </a>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Contact &mdash; Constance T</title>
        <meta
          name="description"
          content="Get in touch with Constance T — actor. Connect via Instagram @lcperforms or email."
        />
        <meta property="og:title" content="Contact — Constance T" />
        <meta
          property="og:description"
          content="Connect with Constance T. Available for stage and screen productions."
        />
      </Helmet>

      <Layout
        slider={<Slider images={slideData} />}
        contentPanel={panel}
        pageTitle="Contact."
        showBlogLink={true}
      />
    </>
  );
}
