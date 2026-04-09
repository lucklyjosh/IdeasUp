"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/Button"
import { getUploadError } from "@/lib/utils/upload"
import { MAX_IMAGES_PER_POST } from "@/lib/utils/constants"

type MediaUploadProps = {
  mediaUrls: string[]
  onAdd: (url: string) => void
  onRemove: (index: number) => void
}

export function MediaUpload({ mediaUrls, onAdd, onRemove }: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const uploadError = getUploadError(file)
    if (uploadError) {
      setError(uploadError)
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const { error } = await res.json()
        setError(error ?? "Upload failed")
        return
      }

      const { data } = await res.json()
      onAdd(data.url)
    } catch {
      setError("Upload failed")
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-700">Media</label>

      {mediaUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {mediaUrls.map((url, i) => (
            <div key={url} className="group relative">
              <div className="relative h-24 w-full">
                <Image src={url} alt="" fill className="rounded-md border object-cover" />
              </div>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute -right-1.5 -top-1.5 hidden rounded-full bg-red-500 p-0.5 text-white group-hover:block"
              >
                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M3 3l6 6M9 3l-6 6" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {mediaUrls.length < MAX_IMAGES_PER_POST && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            isLoading={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            Add media
          </Button>
        </>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
