import { Helmet } from "react-helmet-async";
import { useListSlides } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import Slider from "@/components/Slider";

export default function HomePage() {
  const { data: slides } = useListSlides();

  const slideData = (slides ?? []).map((s) => ({
    imageUrl: s.imageUrl,
    altText: s.altText,
  }));

  return (
    <>
      <Helmet>
        <title>Constance Turyova | Actor</title>
        <meta
          name="description"
          content="Constance Turyova is an actor dedicated to character-driven storytelling across stage and screen. Emotional authenticity, intellectual engagement, and ensemble collaboration."
        />
        <meta property="og:title" content="Constance Turyova | Actor" />
        <meta
          property="og:description"
          content="Character-driven storytelling across stage and screen."
        />
        <meta property="og:type" content="website" />
        <meta name="keywords" content="Constance Turyova, actor, acting, theatre, stage, screen, portfolio" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Constance Turyova",
          "jobTitle": "Actor",
          "description": "Character-driven actor working across stage and screen.",
          "email": "contact@constanceturyova.com",
          "sameAs": ["https://www.instagram.com/constanceturyova/"],
        })}</script>
      </Helmet>

      <Layout slider={<Slider images={slideData} />} showBlogLink={true} />
    </>
  );
}
