import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useListSlides } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import Slider from "@/components/Slider";

const TABS = [
  {
    id: "history",
    label: "History",
    content: (
      <>
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
      </>
    ),
  },
  {
    id: "training",
    label: "Training",
    content: (
      <>
        <h2>Continually refining the craft.</h2>
        <p>
          Constance has trained extensively in scene study, improvisation, voice and vocal abilities,
          plus movement, continually refining her craft through workshops, masterclasses, and
          interdisciplinary practice.
        </p>
        <h3>Disciplines</h3>
        <p>Scene Study &mdash; Improvisation &mdash; Voice &amp; Vocal Training &mdash; Movement &amp; Physical Theatre</p>
        <p>
          She brings curiosity, focus, and collaborative commitment to every production, contributing
          meaningfully to the creative process.
        </p>
      </>
    ),
  },
  {
    id: "philosophy",
    label: "Philosophy",
    content: (
      <>
        <h2>Psychological realism and visceral presence.</h2>
        <p>
          Her methodology integrates textual analysis, physical embodiment, and psychological realism,
          prioritizing nuanced emotional expression and truthful reactions.
        </p>
        <p>
          Constance approaches each character with both intellectual insight and visceral presence,
          crafting performances that resonate with authenticity and depth. Every performance is an
          opportunity to illuminate truth, engage audiences, and enrich the story being told.
        </p>
      </>
    ),
  },
  {
    id: "goals",
    label: "Goals",
    content: (
      <>
        <h2>Roles that challenge the imagination.</h2>
        <p>
          Committed to evolving as a versatile performer, Constance seeks roles that challenge the
          imagination, explore complex human experience, and serve the narrative with integrity.
        </p>
        <p>
          She is dedicated to ensemble collaboration and to work that serves the story above all else.
          Constance's artistic vision is shaped by a deep respect for the written word and an
          unwavering commitment to truthful performance.
        </p>
      </>
    ),
  },
];

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState(0);
  const { data: slides } = useListSlides();

  const slideData = (slides ?? []).map((s) => ({
    imageUrl: s.imageUrl,
    altText: s.altText,
  }));

  const panel = (
    <div>
      <div className="nk-tabs">
        <div className="nk-tab-nav">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              className={`nk-tab-btn${activeTab === i ? " active" : ""}`}
              onClick={() => setActiveTab(i)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {TABS.map((t, i) => (
          <div
            key={t.id}
            className={`nk-tab-content${activeTab === i ? " active" : ""}`}
          >
            {t.content}
          </div>
        ))}
      </div>
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
