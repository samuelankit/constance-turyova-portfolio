import { Helmet } from "react-helmet-async";
import { useListSlides, useGetSettings } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import Slider from "@/components/Slider";

export default function AboutPage() {
  const { data: slides } = useListSlides();
  const { data: settings } = useGetSettings();

  const slideData = (slides ?? []).map((s) => ({
    imageUrl: s.imageUrl,
    altText: s.altText,
  }));

  const heading = settings?.aboutHeading ?? "Character-driven storytelling across stage and screen.";
  const body = settings?.aboutBody ?? "";

  const panel = (
    <div className="nk-tab-content active">
      <h2>{heading}</h2>
      {body
        ? body.split("\n").filter((line) => line.trim()).map((para, i) => (
            <p key={i}>{para}</p>
          ))
        : null}
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
