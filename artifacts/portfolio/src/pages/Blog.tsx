import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useListSlides, useListBlogPosts } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import Slider from "@/components/Slider";
import BlogPost from "./BlogPost";

export default function BlogPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: slides } = useListSlides();
  const { data: blogData, isLoading } = useListBlogPosts({ limit: 50 });

  const slideData = (slides ?? []).map((s) => ({
    imageUrl: s.imageUrl,
    altText: s.altText,
  }));

  const posts = blogData?.posts ?? [];

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (selectedId !== null) {
    return <BlogPostInline id={selectedId} onBack={() => setSelectedId(null)} slides={slideData} />;
  }

  const panel = (
    <div>
      {isLoading && (
        <div style={{ padding: "40px 0", textAlign: "center" }}>
          <div className="nk-spinner" style={{ margin: "0 auto" }} />
        </div>
      )}
      {!isLoading && posts.length === 0 && (
        <p style={{ color: "var(--color-muted)", paddingTop: 20 }}>No posts yet.</p>
      )}
      <ul className="nk-blog-list">
        {posts.filter((p) => p.published).map((p) => (
          <li key={p.id} className="nk-blog-item" onClick={() => setSelectedId(p.id)}>
            <h2>{p.title}</h2>
            <p className="nk-blog-meta">{formatDate(p.createdAt)}</p>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Updates &mdash; Constance T</title>
        <meta
          name="description"
          content="Thoughts on acting, theatre, storytelling, and the craft of performance — from Constance T."
        />
        <meta property="og:title" content="Updates — Constance T" />
      </Helmet>

      <Layout
        slider={<Slider images={slideData} />}
        blogPanel={panel}
        pageTitle="Updates."
        bottomLeft={
          <span style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.5 }}>
            Updates
          </span>
        }
      />
    </>
  );
}

function BlogPostInline({
  id,
  onBack,
  slides,
}: {
  id: number;
  onBack: () => void;
  slides: { imageUrl: string; altText: string }[];
}) {
  return <BlogPost id={id} onBack={onBack} slides={slides} />;
}
