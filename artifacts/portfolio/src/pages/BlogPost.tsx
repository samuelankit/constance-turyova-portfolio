import { Helmet } from "react-helmet-async";
import { useGetBlogPost, useListSlides } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import Layout from "@/components/Layout";
import Slider from "@/components/Slider";

interface Props {
  id?: number;
  onBack?: () => void;
  slides?: { imageUrl: string; altText: string }[];
}

export default function BlogPost({ id: propId, onBack, slides: propSlides }: Props) {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const id = propId ?? Number(params.id);

  const { data: post, isLoading } = useGetBlogPost(id);
  const { data: slideList } = useListSlides();

  const slideData = propSlides ?? (slideList ?? []).map((s) => ({
    imageUrl: s.imageUrl,
    altText: s.altText,
  }));

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function handleBack() {
    if (onBack) onBack();
    else navigate("/blog");
  }

  const panel = (
    <div className="nk-blog-article">
      <button className="nk-back-btn" onClick={handleBack}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 12L4 7L9 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </button>

      {isLoading && (
        <div style={{ padding: "40px 0", textAlign: "center" }}>
          <div className="nk-spinner" style={{ margin: "0 auto" }} />
        </div>
      )}

      {post && (
        <>
          <p className="nk-blog-meta">{formatDate(post.createdAt)}</p>
          <h1>{post.title}</h1>
          {post.imageUrl && (
            <img src={post.imageUrl} alt={post.title} />
          )}
          <div className="nk-blog-article-content">
            {post.content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{post ? `${post.title} — Constance Turyova` : "Post — Constance Turyova"}</title>
        {post && <meta name="description" content={post.excerpt} />}
        {post && <meta property="og:title" content={post.title} />}
      </Helmet>

      <Layout
        slider={<Slider images={slideData} />}
        blogPanel={panel}
        showBlogLink={false}
        bottomLeft={
          <button
            onClick={handleBack}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 11,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--color-dark)",
              opacity: 0.7,
              fontFamily: "var(--font-sans)",
            }}
          >
            Close
          </button>
        }
      />
    </>
  );
}
