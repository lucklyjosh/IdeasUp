import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MAX_IMAGE_SIZE_MB,
  MAX_VIDEO_SIZE_MB,
} from "./constants"

export function isAcceptedImageType(type: string): boolean {
  return (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(type)
}

export function isAcceptedVideoType(type: string): boolean {
  return (ACCEPTED_VIDEO_TYPES as readonly string[]).includes(type)
}

export function isWithinSizeLimit(file: File): boolean {
  const limitMb = isAcceptedVideoType(file.type) ? MAX_VIDEO_SIZE_MB : MAX_IMAGE_SIZE_MB
  return file.size <= limitMb * 1024 * 1024
}

export function getUploadError(file: File): string | null {
  if (!isAcceptedImageType(file.type) && !isAcceptedVideoType(file.type)) {
    return "Unsupported file type."
  }
  if (!isWithinSizeLimit(file)) {
    const limit = isAcceptedVideoType(file.type) ? MAX_VIDEO_SIZE_MB : MAX_IMAGE_SIZE_MB
    return `File exceeds ${limit}MB limit.`
  }
  return null
}
