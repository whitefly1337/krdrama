import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, Trash2, Film, Upload, Save } from "lucide-react";

export default function Admin() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("series");
  const [editing, setEditing] = useState(null);
  const [episodes, setEpisodes] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Series.list();
      setSeries(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const loadEpisodes = async (sid) => {
    const eps = await base44.entities.Episode.filter({ series_id: sid });
    eps.sort((a, b) => a.episode_number - b.episode_number);
    setEpisodes(eps);
  };

  const blankSeries = () => ({
    title: "",
    description: "",
    poster_url: "",
    backdrop_url: "",
    trailer_url: "",
    format: "horizontal",
    genre: "",
    is_featured: false,
    is_published: false,
    total_episodes: 0,
  });

  const saveSeries = async () => {
    if (!editing.title) return alert("Enter a title");
    try {
      if (editing.id) {
        await base44.entities.Series.update(editing.id, editing);
      } else {
        const created = await base44.entities.Series.create(editing);
        setEditing({ ...created });
      }
      await load();
      alert("Saved");
    } catch (e) {
      console.error(e);
      alert("Save error");
    }
  };

  const deleteSeries = async (s) => {
    if (!confirm(`Delete "${s.title}"?`)) return;
    await base44.entities.Series.delete(s.id);
    await load();
  };

  const addEpisode = async () => {
    if (!editing?.id) return alert("Save the series first");
    const num = episodes.length + 1;
    const created = await base44.entities.Episode.create({
      series_id: editing.id,
      title: `Episode ${num}`,
      episode_number: num,
      video_url: "",
      thumbnail_url: "",
      duration: 0,
      is_free: num === 1,
    });
    setEpisodes([...episodes, created]);
  };

  const updateEpisode = async (ep, field, value) => {
    const updated = { ...ep, [field]: value };
    setEpisodes(episodes.map((e) => (e.id === ep.id ? updated : e)));
  };

  const saveEpisode = async (ep) => {
    await base44.entities.Episode.update(ep.id, ep);
    alert("Episode saved");
  };

  const deleteEpisode = async (ep) => {
    if (!confirm("Delete episode?")) return;
    await base44.entities.Episode.delete(ep.id);
    setEpisodes(episodes.filter((e) => e.id !== ep.id));
  };

  const uploadFile = async (file, target, ep) => {
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      if (target === "series-poster") setEditing({ ...editing, poster_url: file_url });
      else if (target === "series-backdrop") setEditing({ ...editing, backdrop_url: file_url });
      else if (target === "ep-video") updateEpisode(ep, "video_url", file_url);
      else if (target === "ep-thumb") updateEpisode(ep, "thumbnail_url", file_url);
    } catch (e) {
      console.error(e);
      alert("File upload error");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-24">
      <h1 className="text-2xl font-bold text-white">Admin</h1>
      <p className="text-sm text-zinc-400">Manage series and episodes</p>

      <div className="mt-6 flex gap-2 border-b border-white/10">
        <button
          onClick={() => setTab("series")}
          className={`px-4 py-2 text-sm font-medium ${tab === "series" ? "border-b-2 border-rose-500 text-white" : "text-zinc-400"}`}
        >
          Series
        </button>
        {editing && (
          <button
            onClick={() => { setTab("episodes"); loadEpisodes(editing.id); }}
            className={`px-4 py-2 text-sm font-medium ${tab === "episodes" ? "border-b-2 border-rose-500 text-white" : "text-zinc-400"}`}
          >
            Episodes
          </button>
        )}
      </div>

      {tab === "series" && (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* list */}
          <div className="space-y-2">
            <button
              onClick={() => { setEditing(blankSeries()); setEpisodes([]); }}
              className="flex w-full items-center gap-2 rounded-lg border border-dashed border-white/20 px-4 py-3 text-sm text-zinc-300 hover:border-rose-500"
            >
              <Plus className="h-4 w-4" /> New Series
            </button>
            {series.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-lg bg-white/5 p-3 ring-1 ring-white/5">
                <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-zinc-800">
                  {s.poster_url && <img src={s.poster_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-white">{s.title}</p>
                  <p className="text-xs text-zinc-500">{s.format} · {s.is_published ? "published" : "draft"}</p>
                </div>
                <button
                  onClick={() => { setEditing(s); }}
                  className="rounded px-2 py-1 text-xs text-rose-400 hover:bg-white/10"
                >
                  Edit
                </button>
                <button onClick={() => deleteSeries(s)} className="text-zinc-500 hover:text-rose-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* editor */}
          {editing && (
            <div className="space-y-3 rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
              <h3 className="text-sm font-semibold text-white">{editing.id ? "Edit" : "New Series"}</h3>
              <Field label="Title">
                <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Genre">
                <input value={editing.genre} onChange={(e) => setEditing({ ...editing, genre: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Description">
                <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={inputCls} rows={3} />
              </Field>
              <Field label="Player format">
                <select
                  value={editing.format}
                  onChange={(e) => setEditing({ ...editing, format: e.target.value })}
                  className={inputCls}
                >
                  <option value="horizontal">Horizontal</option>
                  <option value="vertical">Vertical</option>
                </select>
              </Field>
              <Field label="Poster (vertical URL)">
                <div className="flex gap-2">
                  <input value={editing.poster_url} onChange={(e) => setEditing({ ...editing, poster_url: e.target.value })} className={inputCls} />
                  <label className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-white/10 px-3 text-xs text-white">
                    <Upload className="h-3 w-3" /> File
                    <input type="file" className="hidden" onChange={(e) => e.target.files[0] && uploadFile(e.target.files[0], "series-poster")} />
                  </label>
                </div>
              </Field>
              <Field label="Backdrop (horizontal URL)">
                <div className="flex gap-2">
                  <input value={editing.backdrop_url} onChange={(e) => setEditing({ ...editing, backdrop_url: e.target.value })} className={inputCls} />
                  <label className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-white/10 px-3 text-xs text-white">
                    <Upload className="h-3 w-3" /> File
                    <input type="file" className="hidden" onChange={(e) => e.target.files[0] && uploadFile(e.target.files[0], "series-backdrop")} />
                  </label>
                </div>
              </Field>
              <Field label="Trailer (video URL)">
                <input value={editing.trailer_url} onChange={(e) => setEditing({ ...editing, trailer_url: e.target.value })} className={inputCls} />
              </Field>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input type="checkbox" checked={editing.is_featured} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} />
                  Featured on home
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input type="checkbox" checked={editing.is_published} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
                  Published
                </label>
              </div>
              <button onClick={saveSeries} className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700">
                <Save className="h-4 w-4" /> Save Series
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "episodes" && editing && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Episodes: {editing.title}</h3>
            <button onClick={addEpisode} className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20">
              <Plus className="h-4 w-4" /> Add Episode
            </button>
          </div>
          {episodes.map((ep) => (
            <div key={ep.id} className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Title">
                  <input value={ep.title} onChange={(e) => updateEpisode(ep, "title", e.target.value)} className={inputCls} />
                </Field>
                <Field label="Number">
                  <input type="number" value={ep.episode_number} onChange={(e) => updateEpisode(ep, "episode_number", parseInt(e.target.value) || 1)} className={inputCls} />
                </Field>
                <Field label="Video (URL)">
                  <div className="flex gap-2">
                    <input value={ep.video_url} onChange={(e) => updateEpisode(ep, "video_url", e.target.value)} className={inputCls} />
                    <label className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-white/10 px-3 text-xs text-white">
                      <Film className="h-3 w-3" />
                      <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files[0] && uploadFile(e.target.files[0], "ep-video", ep)} />
                    </label>
                  </div>
                </Field>
                <Field label="Thumbnail (URL)">
                  <div className="flex gap-2">
                    <input value={ep.thumbnail_url} onChange={(e) => updateEpisode(ep, "thumbnail_url", e.target.value)} className={inputCls} />
                    <label className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-white/10 px-3 text-xs text-white">
                      <Upload className="h-3 w-3" />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && uploadFile(e.target.files[0], "ep-thumb", ep)} />
                    </label>
                  </div>
                </Field>
                <Field label="Duration (sec)">
                  <input type="number" value={ep.duration} onChange={(e) => updateEpisode(ep, "duration", parseInt(e.target.value) || 0)} className={inputCls} />
                </Field>
                <label className="flex items-center gap-2 pt-6 text-sm text-zinc-300">
                  <input type="checkbox" checked={ep.is_free} onChange={(e) => updateEpisode(ep, "is_free", e.target.checked)} />
                  Free episode
                </label>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => saveEpisode(ep)} className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white">
                  <Save className="h-3 w-3" /> Save
                </button>
                <button onClick={() => deleteEpisode(ep)} className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs text-white hover:bg-rose-600">
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-rose-500 focus:outline-none";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-400">{label}</span>
      {children}
    </label>
  );
}