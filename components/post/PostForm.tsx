"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createPostSchema, type CreatePostInput } from "@/lib/validations/post"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Button } from "@/components/ui/Button"
import { TypeSelector } from "./TypeSelector"
import { StageSelector } from "./StageSelector"
import { MediaUpload } from "./MediaUpload"
import { INDUSTRIES, IDEA_CATEGORIES } from "@/lib/utils/constants"

export function PostForm() {
  const router = useRouter()
  const [mediaUrls, setMediaUrls] = useState<string[]>([])
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      type: "IDEA",
      title: "",
      description: "",
      techStack: [],
      links: [],
      categories: [],
      willingToPay: false,
    },
  })

  const postType = watch("type")
  const selectedCategories = watch("categories") ?? []

  async function onSubmit(data: CreatePostInput) {
    setServerError(null)

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const { error } = await res.json()
      setServerError(error ?? "Something went wrong")
      return
    }

    const { data: post } = await res.json()
    const path = post.type === "IDEA" ? `/ideas/${post.id}` : `/needs/${post.id}`
    router.push(path)
  }

  function handleTechStackChange(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return
    e.preventDefault()
    const input = e.currentTarget
    const val = input.value.trim()
    if (!val) return
    const current = watch("techStack") ?? []
    if (current.length >= 10 || current.includes(val)) return
    setValue("techStack", [...current, val])
    input.value = ""
  }

  function handleLinksChange(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return
    e.preventDefault()
    const input = e.currentTarget
    const val = input.value.trim()
    if (!val) return
    const current = watch("links") ?? []
    if (current.length >= 5) return
    setValue("links", [...current, val])
    input.value = ""
  }

  function toggleCategory(cat: string) {
    const current = selectedCategories
    if (current.includes(cat)) {
      setValue("categories", current.filter((c) => c !== cat))
    } else if (current.length < 5) {
      setValue("categories", [...current, cat])
    }
  }

  const techStack = watch("techStack") ?? []
  const links = watch("links") ?? []

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <TypeSelector
        value={postType}
        onChange={(v) => setValue("type", v)}
      />

      <Input
        id="title"
        label="Title"
        placeholder={postType === "IDEA" ? "What are you building?" : "What do you need built?"}
        error={errors.title?.message}
        {...register("title")}
      />

      <Textarea
        id="description"
        label="Description"
        placeholder={postType === "IDEA"
          ? "Describe your idea, what problem it solves, and what stage it's at..."
          : "Describe the problem you're facing and what kind of solution you're looking for..."
        }
        rows={6}
        error={errors.description?.message}
        {...register("description")}
      />

      {postType === "IDEA" && (
        <StageSelector
          value={watch("stage")}
          onChange={(v) => setValue("stage", v as CreatePostInput["stage"])}
        />
      )}

      {postType === "NEED" && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-700">Industry</label>
          <select
            className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            {...register("industry")}
          >
            <option value="">Select industry</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-sm font-medium text-zinc-700">Categories</label>
        <div className="flex flex-wrap gap-2">
          {IDEA_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCategory(cat)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                selectedCategories.includes(cat)
                  ? "border-violet-500 bg-violet-50 text-violet-700"
                  : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-zinc-700">Tech Stack</label>
        <input
          placeholder="Type and press Enter"
          onKeyDown={handleTechStackChange}
          className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {techStack.map((tech, i) => (
              <span key={tech} className="flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
                {tech}
                <button type="button" onClick={() => setValue("techStack", techStack.filter((_, j) => j !== i))} className="text-zinc-400 hover:text-zinc-600">&times;</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-zinc-700">Links</label>
        <input
          placeholder="Paste URL and press Enter"
          onKeyDown={handleLinksChange}
          className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
        {links.length > 0 && (
          <div className="flex flex-col gap-1 mt-2">
            {links.map((link, i) => (
              <div key={link} className="flex items-center gap-2 text-sm">
                <a href={link} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline truncate flex-1">{link}</a>
                <button type="button" onClick={() => setValue("links", links.filter((_, j) => j !== i))} className="text-zinc-400 hover:text-zinc-600 text-xs">&times;</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <MediaUpload
        mediaUrls={mediaUrls}
        onAdd={(url) => setMediaUrls((prev) => [...prev, url])}
        onRemove={(i) => setMediaUrls((prev) => prev.filter((_, j) => j !== i))}
      />

      {postType === "NEED" && (
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input type="checkbox" {...register("willingToPay")} className="rounded border-zinc-300" />
          Willing to pay
        </label>
      )}

      {serverError && (
        <p className="text-sm text-red-600">{serverError}</p>
      )}

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        {postType === "IDEA" ? "Share your idea" : "Post your need"}
      </Button>
    </form>
  )
}
