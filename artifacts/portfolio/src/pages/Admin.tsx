import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListSlides,
  useCreateSlide,
  useDeleteSlide,
  useListBlogPosts,
  useCreateBlogPost,
  useUpdateBlogPost,
  useDeleteBlogPost,
  useGetSettings,
  useUpdateSettings,
  useListPortfolioPhotos,
  useCreatePortfolioPhoto,
  useDeletePortfolioPhoto,
  useListPortfolioVideos,
  useCreatePortfolioVideo,
  useDeletePortfolioVideo,
  getListSlidesQueryKey,
  getListBlogPostsQueryKey,
  getGetSettingsQueryKey,
  getListPortfolioPhotosQueryKey,
  getListPortfolioVideosQueryKey,
} from "@workspace/api-client-react";

const ADMIN_PASSWORD = "constance2024";
const AUTH_KEY = "ct_admin_auth";

function Login({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      localStorage.setItem(AUTH_KEY, "1");
      onLogin();
    } else {
      setErr(true);
      setPw("");
    }
  }

  return (
    <div className="nk-login">
      <Helmet><title>Admin — Constance Turyova</title></Helmet>
      <div className="nk-login-box">
        <p className="nk-login-title">Admin Access</p>
        {err && (
          <p style={{ color: "#c0392b", fontSize: 13, textAlign: "center", marginBottom: 16 }}>
            Incorrect password.
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="nk-form-group">
            <input
              type="password"
              className="nk-admin-input"
              placeholder="Password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoFocus
            />
          </div>
          <button type="submit" className="nk-admin-btn" style={{ width: "100%" }}>
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<"slides" | "blog" | "portfolio" | "about" | "settings">("slides");

  return (
    <div className="nk-admin">
      <Helmet><title>Admin — Constance Turyova</title></Helmet>
      <div className="nk-admin-header">
        <h1>Admin — Constance Turyova</h1>
        <button className="nk-admin-logout" onClick={onLogout}>Log out</button>
      </div>
      <div className="nk-admin-body">
        <div className="nk-admin-tabs">
          <button className={`nk-admin-tab${tab === "slides" ? " active" : ""}`} onClick={() => setTab("slides")}>Slides</button>
          <button className={`nk-admin-tab${tab === "blog" ? " active" : ""}`} onClick={() => setTab("blog")}>Blog</button>
          <button className={`nk-admin-tab${tab === "portfolio" ? " active" : ""}`} onClick={() => setTab("portfolio")}>Portfolio</button>
          <button className={`nk-admin-tab${tab === "about" ? " active" : ""}`} onClick={() => setTab("about")}>About</button>
          <button className={`nk-admin-tab${tab === "settings" ? " active" : ""}`} onClick={() => setTab("settings")}>Settings</button>
        </div>
        {tab === "slides" && <SlidesManager />}
        {tab === "blog" && <BlogManager />}
        {tab === "portfolio" && <PortfolioManager />}
        {tab === "about" && <AboutManager />}
        {tab === "settings" && <SettingsManager />}
      </div>
    </div>
  );
}

function SlidesManager() {
  const qc = useQueryClient();
  const { data: slides, isLoading } = useListSlides();
  const createSlide = useCreateSlide();
  const deleteSlide = useDeleteSlide();
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      await createSlide.mutateAsync({
        data: { imageUrl: url, altText: file.name.replace(/\.[^.]+$/, ""), sortOrder: (slides?.length ?? 0) },
      });
      await qc.invalidateQueries({ queryKey: getListSlidesQueryKey() });
      setMsg({ type: "success", text: "Slide added." });
    } catch {
      setMsg({ type: "error", text: "Upload failed. Please try again." });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this slide?")) return;
    await deleteSlide.mutateAsync({ id });
    await qc.invalidateQueries({ queryKey: getListSlidesQueryKey() });
  }

  return (
    <div>
      <p className="nk-admin-section-title">Slider Images</p>
      {msg && <div className={`nk-admin-msg ${msg.type}`}>{msg.text}</div>}

      <div className="nk-admin-card">
        <label className="nk-admin-label">Upload new image</label>
        <div className="nk-admin-upload-zone">
          <p>{uploading ? "Uploading..." : "Click to select an image (JPG, PNG, GIF — max 10 MB)"}</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            style={{ marginTop: 12 }}
          />
        </div>
      </div>

      {isLoading && <div className="nk-spinner" style={{ margin: "20px auto" }} />}

      <div className="nk-admin-slide-grid">
        {(slides ?? []).map((s) => (
          <div key={s.id} className="nk-admin-slide-card">
            <img
              src={s.imageUrl}
              alt={s.altText}
              className="nk-admin-slide-img"
              onError={(e) => { (e.target as HTMLImageElement).src = "/assets/images/slide-1-light.jpg"; }}
            />
            <div className="nk-admin-slide-actions">
              <button
                className="nk-admin-btn danger"
                style={{ padding: "4px 10px", fontSize: 10 }}
                onClick={() => handleDelete(s.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BlogManager() {
  const qc = useQueryClient();
  const { data: blogData, isLoading } = useListBlogPosts({ limit: 100 });
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const deletePost = useDeleteBlogPost();

  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", imageUrl: "", published: true });
  const [imgUploading, setImgUploading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const posts = blogData?.posts ?? [];

  function startNew() {
    setEditing("new");
    setForm({ title: "", excerpt: "", content: "", imageUrl: "", published: true });
  }

  function startEdit(p: typeof posts[0]) {
    setEditing(p.id);
    setForm({ title: p.title, excerpt: p.excerpt, content: p.content, imageUrl: p.imageUrl ?? "", published: p.published });
  }

  function cancel() {
    setEditing(null);
    setMsg(null);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch {
      setMsg({ type: "error", text: "Image upload failed." });
    } finally {
      setImgUploading(false);
      e.target.value = "";
    }
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setMsg({ type: "error", text: "Title is required." });
      return;
    }
    try {
      const data = { ...form, imageUrl: form.imageUrl || undefined };
      if (editing === "new") {
        await createPost.mutateAsync({ data });
      } else if (typeof editing === "number") {
        await updatePost.mutateAsync({ id: editing, data });
      }
      await qc.invalidateQueries({ queryKey: getListBlogPostsQueryKey() });
      setMsg({ type: "success", text: editing === "new" ? "Post created." : "Post updated." });
      setEditing(null);
    } catch {
      setMsg({ type: "error", text: "Failed to save." });
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this post?")) return;
    await deletePost.mutateAsync({ id });
    await qc.invalidateQueries({ queryKey: getListBlogPostsQueryKey() });
  }

  async function togglePublish(p: typeof posts[0]) {
    await updatePost.mutateAsync({ id: p.id, data: { published: !p.published } });
    await qc.invalidateQueries({ queryKey: getListBlogPostsQueryKey() });
  }

  if (editing !== null) {
    return (
      <div>
        <p className="nk-admin-section-title">{editing === "new" ? "New Post" : "Edit Post"}</p>
        {msg && <div className={`nk-admin-msg ${msg.type}`}>{msg.text}</div>}
        <div className="nk-admin-card">
          <label className="nk-admin-label">Title</label>
          <input className="nk-admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Post title" />
          <label className="nk-admin-label">Excerpt</label>
          <input className="nk-admin-input" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Short summary" />
          <label className="nk-admin-label">Cover Image</label>
          {form.imageUrl ? (
            <div style={{ marginBottom: 12 }}>
              <img src={form.imageUrl} alt="Cover" style={{ maxWidth: "100%", maxHeight: 180, objectFit: "cover", display: "block", marginBottom: 8, borderRadius: 4 }} />
              <button className="nk-admin-btn secondary" style={{ padding: "4px 10px", fontSize: 10 }} onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}>Remove image</button>
            </div>
          ) : (
            <div style={{ marginBottom: 12 }}>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={imgUploading} style={{ fontSize: 13 }} />
              {imgUploading && <span style={{ fontSize: 12, color: "var(--color-muted)", marginLeft: 8 }}>Uploading…</span>}
            </div>
          )}
          <label className="nk-admin-label">Content</label>
          <textarea className="nk-admin-textarea" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Full post content..." style={{ minHeight: 200 }} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", marginBottom: 16 }}>
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            Published
          </label>
          <div>
            <button className="nk-admin-btn" onClick={handleSave}>Save</button>
            <button className="nk-admin-btn secondary" onClick={cancel}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <p className="nk-admin-section-title" style={{ margin: 0 }}>Blog Posts</p>
        <button className="nk-admin-btn" onClick={startNew}>New Post</button>
      </div>
      {msg && <div className={`nk-admin-msg ${msg.type}`}>{msg.text}</div>}
      {isLoading && <div className="nk-spinner" style={{ margin: "20px auto" }} />}
      {posts.length === 0 && !isLoading && (
        <p style={{ color: "var(--color-muted)", fontSize: 14 }}>No posts yet. Create your first post.</p>
      )}
      {posts.map((p) => (
        <div key={p.id} className="nk-admin-post-row">
          <span className="nk-admin-post-title">{p.title}</span>
          <span className={`nk-badge ${p.published ? "published" : "draft"}`}>
            {p.published ? "Published" : "Draft"}
          </span>
          <div className="nk-admin-post-actions">
            <button className="nk-admin-btn secondary" style={{ padding: "6px 12px", fontSize: 10 }} onClick={() => startEdit(p)}>Edit</button>
            <button className="nk-admin-btn secondary" style={{ padding: "6px 12px", fontSize: 10 }} onClick={() => togglePublish(p)}>
              {p.published ? "Unpublish" : "Publish"}
            </button>
            <button className="nk-admin-btn danger" style={{ padding: "6px 12px", fontSize: 10 }} onClick={() => handleDelete(p.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PortfolioManager() {
  const [subTab, setSubTab] = useState<"photos" | "videos">("photos");
  return (
    <div>
      <p className="nk-admin-section-title">Portfolio</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button
          className={`nk-admin-btn${subTab === "photos" ? "" : " secondary"}`}
          style={{ padding: "6px 16px", fontSize: 10 }}
          onClick={() => setSubTab("photos")}
        >
          Photos
        </button>
        <button
          className={`nk-admin-btn${subTab === "videos" ? "" : " secondary"}`}
          style={{ padding: "6px 16px", fontSize: 10 }}
          onClick={() => setSubTab("videos")}
        >
          Videos
        </button>
      </div>
      {subTab === "photos" && <PortfolioPhotosManager />}
      {subTab === "videos" && <PortfolioVideosManager />}
    </div>
  );
}

function PortfolioPhotosManager() {
  const qc = useQueryClient();
  const { data: photos, isLoading } = useListPortfolioPhotos();
  const createPhoto = useCreatePortfolioPhoto();
  const deletePhoto = useDeletePortfolioPhoto();
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      await createPhoto.mutateAsync({
        data: { imageUrl: url, altText: file.name.replace(/\.[^.]+$/, ""), sortOrder: (photos?.length ?? 0) },
      });
      await qc.invalidateQueries({ queryKey: getListPortfolioPhotosQueryKey() });
      setMsg({ type: "success", text: "Photo added." });
    } catch {
      setMsg({ type: "error", text: "Upload failed. Please try again." });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this photo?")) return;
    await deletePhoto.mutateAsync({ id });
    await qc.invalidateQueries({ queryKey: getListPortfolioPhotosQueryKey() });
  }

  return (
    <div>
      {msg && <div className={`nk-admin-msg ${msg.type}`}>{msg.text}</div>}
      <div className="nk-admin-card">
        <label className="nk-admin-label">Upload new photo</label>
        <div className="nk-admin-upload-zone">
          <p>{uploading ? "Uploading..." : "Click to select an image (JPG, PNG, GIF — max 10 MB)"}</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            style={{ marginTop: 12 }}
          />
        </div>
      </div>
      {isLoading && <div className="nk-spinner" style={{ margin: "20px auto" }} />}
      <div className="nk-admin-slide-grid">
        {(photos ?? []).map((p) => (
          <div key={p.id} className="nk-admin-slide-card">
            <img
              src={p.imageUrl}
              alt={p.altText}
              className="nk-admin-slide-img"
            />
            <div className="nk-admin-slide-actions">
              <button
                className="nk-admin-btn danger"
                style={{ padding: "4px 10px", fontSize: 10 }}
                onClick={() => handleDelete(p.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {!isLoading && (photos ?? []).length === 0 && (
        <p style={{ color: "var(--color-muted)", fontSize: 14 }}>No photos yet. Upload your first photo.</p>
      )}
    </div>
  );
}

function getYoutubeThumbnail(url: string): string | null {
  try {
    const u = new URL(url);
    let id: string | null = null;
    if (u.hostname === "youtu.be") {
      id = u.pathname.slice(1).split("/")[0];
    } else if (u.hostname.includes("youtube.com")) {
      id = u.searchParams.get("v");
      if (!id) {
        const m = u.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/);
        if (m) id = m[1];
      }
    }
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    return null;
  } catch {
    return null;
  }
}

function PortfolioVideosManager() {
  const qc = useQueryClient();
  const { data: videos, isLoading } = useListPortfolioVideos();
  const createVideo = useCreatePortfolioVideo();
  const deleteVideo = useDeletePortfolioVideo();
  const [form, setForm] = useState({ videoUrl: "", title: "" });
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [adding, setAdding] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkUrls, setBulkUrls] = useState("");
  const [bulkAdding, setBulkAdding] = useState(false);

  const liveThumbnail = getYoutubeThumbnail(form.videoUrl);

  async function handleAdd() {
    if (!form.videoUrl.trim()) {
      setMsg({ type: "error", text: "Video URL is required." });
      return;
    }
    setAdding(true);
    try {
      await createVideo.mutateAsync({
        data: { videoUrl: form.videoUrl.trim(), title: form.title.trim(), sortOrder: (videos?.length ?? 0) },
      });
      await qc.invalidateQueries({ queryKey: getListPortfolioVideosQueryKey() });
      setForm({ videoUrl: "", title: "" });
      setMsg({ type: "success", text: "Video added." });
    } catch {
      setMsg({ type: "error", text: "Failed to add video." });
    } finally {
      setAdding(false);
    }
  }

  async function handleBulkAdd() {
    const urls = bulkUrls
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (urls.length === 0) {
      setMsg({ type: "error", text: "Paste at least one URL." });
      return;
    }
    setBulkAdding(true);
    setMsg(null);
    let added = 0;
    let failed = 0;
    for (const url of urls) {
      try {
        await createVideo.mutateAsync({
          data: { videoUrl: url, title: "", sortOrder: (videos?.length ?? 0) + added },
        });
        added++;
      } catch {
        failed++;
      }
    }
    await qc.invalidateQueries({ queryKey: getListPortfolioVideosQueryKey() });
    setBulkUrls("");
    setMsg({
      type: failed === 0 ? "success" : "error",
      text: failed === 0
        ? `Added ${added} video${added !== 1 ? "s" : ""}.`
        : `Added ${added}, failed ${failed}.`,
    });
    setBulkAdding(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this video?")) return;
    await deleteVideo.mutateAsync({ id });
    await qc.invalidateQueries({ queryKey: getListPortfolioVideosQueryKey() });
  }

  return (
    <div>
      {msg && <div className={`nk-admin-msg ${msg.type}`}>{msg.text}</div>}
      <div className="nk-admin-card">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <label className="nk-admin-label" style={{ margin: 0 }}>Add Video</label>
          <button
            className={`nk-admin-btn${bulkMode ? "" : " secondary"}`}
            style={{ padding: "4px 12px", fontSize: 10, marginLeft: "auto" }}
            onClick={() => setBulkMode((v) => !v)}
          >
            {bulkMode ? "Single add" : "Bulk add (multiple)"}
          </button>
        </div>

        {!bulkMode && (
          <>
            <label className="nk-admin-label">Video URL (YouTube, Vimeo, etc.)</label>
            <input
              className="nk-admin-input"
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            {liveThumbnail && (
              <div style={{ margin: "8px 0 12px" }}>
                <img
                  src={liveThumbnail}
                  alt="YouTube preview"
                  style={{ width: 160, height: 90, objectFit: "cover", borderRadius: 4, display: "block", background: "#eee" }}
                />
              </div>
            )}
            <label className="nk-admin-label">Title (optional)</label>
            <input
              className="nk-admin-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Video title"
            />
            <button className="nk-admin-btn" onClick={handleAdd} disabled={adding}>
              {adding ? "Adding…" : "Add Video"}
            </button>
          </>
        )}

        {bulkMode && (
          <>
            <label className="nk-admin-label">Paste URLs — one per line</label>
            <textarea
              className="nk-admin-input"
              value={bulkUrls}
              onChange={(e) => setBulkUrls(e.target.value)}
              placeholder={"https://www.youtube.com/watch?v=...\nhttps://vimeo.com/..."}
              rows={6}
              style={{ resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
            />
            <button className="nk-admin-btn" onClick={handleBulkAdd} disabled={bulkAdding}>
              {bulkAdding ? "Adding…" : `Add All`}
            </button>
          </>
        )}
      </div>

      {isLoading && <div className="nk-spinner" style={{ margin: "20px auto" }} />}
      {!isLoading && (videos ?? []).length === 0 && (
        <p style={{ color: "var(--color-muted)", fontSize: 14 }}>No videos yet. Paste a YouTube or Vimeo URL above.</p>
      )}
      {(videos ?? []).map((v) => {
        const thumb = getYoutubeThumbnail(v.videoUrl);
        return (
          <div key={v.id} className="nk-admin-post-row" style={{ alignItems: "center" }}>
            <div style={{ flexShrink: 0, marginRight: 12 }}>
              {thumb ? (
                <img
                  src={thumb}
                  alt=""
                  style={{ width: 72, height: 40, objectFit: "cover", borderRadius: 3, display: "block", background: "#eee" }}
                />
              ) : (
                <div style={{
                  width: 72, height: 40, background: "var(--color-border)", borderRadius: 3,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, color: "var(--color-muted)"
                }}>▶</div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, color: "var(--color-dark)", fontWeight: 400, marginBottom: 2 }}>
                {v.title || <span style={{ color: "var(--color-muted)", fontStyle: "italic" }}>Untitled</span>}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {v.videoUrl}
              </div>
            </div>
            <div className="nk-admin-post-actions">
              <button
                className="nk-admin-btn danger"
                style={{ padding: "6px 12px", fontSize: 10 }}
                onClick={() => handleDelete(v.id)}
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AboutManager() {
  const qc = useQueryClient();
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const [heading, setHeading] = useState<string | null>(null);
  const [body, setBody] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentHeading = heading ?? settings?.aboutHeading ?? "";
  const currentBody = body ?? settings?.aboutBody ?? "";

  async function handleSave() {
    setSaving(true);
    try {
      await updateSettings.mutateAsync({ data: { aboutHeading: currentHeading, aboutBody: currentBody } });
      await qc.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <div className="nk-spinner" style={{ margin: "20px auto" }} />;

  return (
    <div>
      <p className="nk-admin-section-title">About Page</p>
      {saved && <div className="nk-admin-msg success">About page saved.</div>}
      <div className="nk-admin-card">
        <label className="nk-admin-label">Heading</label>
        <input
          className="nk-admin-input"
          value={currentHeading}
          onChange={(e) => setHeading(e.target.value)}
          placeholder="About page heading"
        />
        <label className="nk-admin-label">Body</label>
        <p style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 8, marginTop: 0 }}>
          Each line break becomes a new paragraph.
        </p>
        <textarea
          className="nk-admin-textarea"
          value={currentBody}
          onChange={(e) => setBody(e.target.value)}
          placeholder="About page body text..."
          style={{ minHeight: 200 }}
        />
        <button className="nk-admin-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save About"}
        </button>
      </div>
    </div>
  );
}

function SettingsManager() {
  const qc = useQueryClient();
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const current = {
    siteName: form.siteName ?? settings?.siteName ?? "",
    tagline: form.tagline ?? settings?.tagline ?? "",
    email: form.email ?? settings?.email ?? "",
    instagramUrl: form.instagramUrl ?? settings?.instagramUrl ?? "",
    metaDescription: form.metaDescription ?? settings?.metaDescription ?? "",
    metaKeywords: form.metaKeywords ?? settings?.metaKeywords ?? "",
  };

  async function handleSave() {
    await updateSettings.mutateAsync({ data: current });
    await qc.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (isLoading) return <div className="nk-spinner" style={{ margin: "20px auto" }} />;

  return (
    <div>
      <p className="nk-admin-section-title">Site Settings</p>
      {saved && <div className="nk-admin-msg success">Settings saved.</div>}
      <div className="nk-admin-card">
        {(["siteName", "tagline", "email", "instagramUrl", "metaDescription", "metaKeywords"] as const).map((key) => (
          <div key={key}>
            <label className="nk-admin-label">{key.replace(/([A-Z])/g, " $1").trim()}</label>
            <input
              className="nk-admin-input"
              value={current[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </div>
        ))}
        <button className="nk-admin-btn" onClick={handleSave}>Save Settings</button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => localStorage.getItem(AUTH_KEY) === "1");

  function handleLogin() { setAuthed(true); }
  function handleLogout() {
    localStorage.removeItem(AUTH_KEY);
    setAuthed(false);
  }

  if (!authed) return <Login onLogin={handleLogin} />;
  return <AdminPanel onLogout={handleLogout} />;
}
