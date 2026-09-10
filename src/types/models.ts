import type { Timestamp } from 'firebase/firestore'

export type PostStatus = 'draft' | 'published'

export interface PostAttachment {
  name: string
  url: string
  path: string
  size: number
  contentType: string
}

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImageUrl: string | null
  coverImagePath: string | null
  gallery: PostAttachment[]
  attachments: PostAttachment[]
  categoryId: string
  categoryName: string
  tags: string[]
  authorId: string
  authorName: string
  status: PostStatus
  featured: boolean
  likesCount: number
  commentsCount: number
  createdAt: Timestamp
  updatedAt: Timestamp
  publishedAt: Timestamp | null
}

export type CommentStatus = 'visible' | 'hidden'

export interface Comment {
  id: string
  postId: string
  userId: string
  userName: string
  text: string
  status: CommentStatus
  parentId: string | null
  createdAt: Timestamp
}

export interface Like {
  id: string
  postId: string
  userId: string
  createdAt: Timestamp
}

export interface Category {
  id: string
  name: string
  slug: string
  postCount: number
}

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface SiteSettings {
  bannerImageUrl: string | null
  bannerImagePath: string | null
  siteTitle: string
  welcomeTitle: string
  welcomeText: string
  primaryColor: string
  secondaryColor: string
  marqueeText: string
  musicYoutubeIds: string[]
  updatedAt: Timestamp | null
}

export interface ArchivePostEntry {
  id: string
  slug: string
  title: string
  publishedAt: Timestamp
}
