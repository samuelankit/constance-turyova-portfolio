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
  getListSlidesQueryKey,
  getListBlogPostsQueryKey,
  getGetSettingsQueryKey,
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
  const [tab, setTab] = useState<"slides" | "blog" | "settings">("slides");

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
          <button className={`nk-admin-tab${tab === "settings" ? " active" : ""}`} onClick={() => setTab("settings")}>Settings</button>
        </div>
        {tab === "slides" && <SlidesManager />}
        {tab === "blog" && <BlogManager />}
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
