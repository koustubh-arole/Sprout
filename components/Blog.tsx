"use client";

import { useMemo, useState } from "react";
import { readingMinutes, SEED_POSTS, type BlogPost } from "@/lib/blog";
import { useHydrateWorld, useWorld } from "@/lib/store";

const TAGS = ["Tips", "Food", "Energy", "Transport", "Mindset"];

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function Blog() {
  useHydrateWorld();
  const userPosts = useWorld((s) => s.userPosts);
  const addPost = useWorld((s) => s.addPost);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [tag, setTag] = useState(TAGS[0]);
  const [body, setBody] = useState("");

  const posts = useMemo<BlogPost[]>(() => [...userPosts, ...SEED_POSTS], [userPosts]);

  function publish() {
    if (!title.trim() || !body.trim()) return;
    addPost(title, author, body, tag);
    setTitle("");
    setAuthor("");
    setBody("");
    setTag(TAGS[0]);
    setOpen(false);
  }

  return (
    <section aria-labelledby="blog-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 id="blog-heading" className="font-display text-3xl font-bold text-emerald-950">
            Awareness blog
          </h1>
          <p className="mt-1 text-stone-600">Short reads from the community on cutting carbon.</p>
        </div>
        <button type="button" onClick={() => setOpen((o) => !o)} className="clay-btn px-4 py-2 text-sm font-bold">
          {open ? "Close" : "Write a post ✍️"}
        </button>
      </div>

      {open && (
        <div className="clay mt-5 space-y-3 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              aria-label="Post title"
              maxLength={90}
              className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            />
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name (optional)"
              aria-label="Your name"
              maxLength={40}
              className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            />
          </div>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            aria-label="Topic"
            className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            {TAGS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share a tip or story… (blank lines separate paragraphs)"
            aria-label="Post body"
            rows={6}
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          />
          <button type="button" onClick={publish} disabled={!title.trim() || !body.trim()} className="clay-btn px-5 py-2.5 text-sm font-bold disabled:opacity-50">
            Publish
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {posts.map((p) => (
          <article key={p.id} className="clay flex flex-col p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              <span className="rounded-full bg-emerald-50 px-2 py-0.5">{p.tag}</span>
              {!p.seed && <span className="rounded-full bg-honey/15 px-2 py-0.5 text-amber-800">community</span>}
            </div>
            <h2 className="mt-2 font-display text-xl font-bold text-stone-900">{p.title}</h2>
            <p className="mt-1 text-xs text-stone-400">
              {p.author} · {fmtDate(p.at)} · {readingMinutes(p.body)} min read
            </p>
            <div className="mt-3 space-y-2 text-sm leading-6 text-stone-700">
              {p.body.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
