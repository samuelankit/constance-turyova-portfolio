import { Helmet } from "react-helmet-async";
import { useListSlides } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import Slider from "@/components/Slider";

export default function AboutPage() {
  const { data: slides } = useListSlides();

  const slideData = (slides ?? []).map((s) => ({
    imageUrl: s.imageUrl,
    altText: s.altText,
  }));

  const panel = (
    <div className="nk-tab-content active">
      <h2>Character-driven storytelling across stage and screen.</h2>
      <p>
        Constance Turyova is an actor dedicated to character-driven storytelling across stage and screen.
        Her work emphasizes emotional authenticity, intellectual engagement, and ensemble collaboration,
        reflecting a disciplined and versatile approach to performance.
      </p>
      <p>
        She brings curiosity, focus, and collaborative commitment to every production, contributing
        meaningfully to the creative process. Constance's work is guided by a belief that every
        performance is an opportunity to illuminate truth, engage audiences, and enrich the story
        being told.
      </p>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>About &mdash; Constance Turyova</title>
        <meta
          name="description"
          content="Learn about Constance Turyova — her training, philosophy, and approach to character-driven performance across stage and screen."
        />
        <meta property="og:title" content="About — Constance Turyova" />
        <meta
          property="og:description"
          content="Constance Turyova's methodology integrates textual analysis, physical embodiment, and psychological realism."
        />
      </Helmet>

      <Layout
        slider={<Slider images={slideData} />}
        contentPanel={panel}
        pageTitle="About."
        showBlogLink={true}
      />
    </>
  );
}
