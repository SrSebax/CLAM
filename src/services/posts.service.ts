import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit as fsLimit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { setDoc } from 'firebase/firestore'

import { db } from '@/firebase/config'
import type { ArchivePostEntry, Post, PostAttachment, PostStatus } from '@/types'
import { slugify } from '@/utils/slug'

const postsCol = collection(db, 'posts')

export interface PostInput {
  title: string
  excerpt: string
  content: string
  coverImageUrl: string | null
  coverImagePath: string | null
  gallery: PostAttachment[]
  attachments: PostAttachment[]
  categoryId: string
  categoryName: string
  tags: string[]
  status: PostStatus
  featured: boolean
}

/** Genera un id de documento antes de guardar, para usarlo en las rutas de Storage. */
export function newPostRef() {
  return doc(postsCol)
}

async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title) || 'post'
  let candidate = base
  let attempt = 1

  while (true) {
    const snap = await getDocs(query(postsCol, where('slug', '==', candidate), fsLimit(1)))
    const clash = snap.docs.find((d) => d.id !== excludeId)
    if (!clash) return candidate
    attempt += 1
    candidate = `${base}-${attempt}`
  }
}

export async function createPost(postId: string, authorId: string, authorName: string, input: PostInput) {
  const slug = await generateUniqueSlug(input.title)
  const ref = doc(postsCol, postId)

  const data: Record<string, unknown> = {
    title: input.title,
    slug,
    excerpt: input.excerpt,
    content: input.content,
    coverImageUrl: input.coverImageUrl,
    coverImagePath: input.coverImagePath,
    gallery: input.gallery,
    attachments: input.attachments,
    categoryId: input.categoryId,
    categoryName: input.categoryName,
    tags: input.tags,
    authorId,
    authorName,
    status: input.status,
    featured: input.featured,
    likesCount: 0,
    commentsCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: input.status === 'published' ? serverTimestamp() : null,
  }

  await setDoc(ref, data)
  return { id: ref.id, slug }
}

export async function updatePost(postId: string, input: PostInput, wasPublished: boolean) {
  const slug = await generateUniqueSlug(input.title, postId)
  const ref = doc(postsCol, postId)

  const data: Record<string, unknown> = {
    title: input.title,
    slug,
    excerpt: input.excerpt,
    content: input.content,
    coverImageUrl: input.coverImageUrl,
    coverImagePath: input.coverImagePath,
    gallery: input.gallery,
    attachments: input.attachments,
    categoryId: input.categoryId,
    categoryName: input.categoryName,
    tags: input.tags,
    status: input.status,
    featured: input.featured,
    updatedAt: serverTimestamp(),
  }

  if (input.status === 'published' && !wasPublished) {
    data.publishedAt = serverTimestamp()
  }

  await updateDoc(ref, data)
  return { slug }
}

export async function deletePost(postId: string) {
  await deleteDoc(doc(postsCol, postId))
}

export async function getPostById(postId: string): Promise<Post | null> {
  const snap = await getDoc(doc(postsCol, postId))
  if (!snap.exists()) return null
  return { ...(snap.data() as Post), id: snap.id }
}

export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  const snap = await getDocs(
    query(postsCol, where('slug', '==', slug), where('status', '==', 'published'), fsLimit(1)),
  )
  const found = snap.docs[0]
  if (!found) return null
  return { ...(found.data() as Post), id: found.id }
}

export async function getFeaturedPost(): Promise<Post | null> {
  const snap = await getDocs(
    query(
      postsCol,
      where('status', '==', 'published'),
      where('featured', '==', true),
      orderBy('publishedAt', 'desc'),
      fsLimit(1),
    ),
  )
  const found = snap.docs[0]
  if (!found) return null
  return { ...(found.data() as Post), id: found.id }
}

export interface ListPostsResult {
  posts: Post[]
  lastDoc: QueryDocumentSnapshot | null
  hasMore: boolean
}

export async function listPublishedPosts(options: {
  categoryId?: string
  pageSize?: number
  cursor?: QueryDocumentSnapshot | null
}): Promise<ListPostsResult> {
  const pageSize = options.pageSize ?? 9
  const clauses = [where('status', '==', 'published')]
  if (options.categoryId) clauses.push(where('categoryId', '==', options.categoryId))

  let q = query(postsCol, ...clauses, orderBy('publishedAt', 'desc'), fsLimit(pageSize + 1))
  if (options.cursor) {
    q = query(postsCol, ...clauses, orderBy('publishedAt', 'desc'), startAfter(options.cursor), fsLimit(pageSize + 1))
  }

  const snap = await getDocs(q)
  const docs = snap.docs.slice(0, pageSize)
  const hasMore = snap.docs.length > pageSize

  return {
    posts: docs.map((d) => ({ ...(d.data() as Post), id: d.id })),
    lastDoc: docs[docs.length - 1] ?? null,
    hasMore,
  }
}

export async function listRecentPublishedPosts(count = 6): Promise<Post[]> {
  const snap = await getDocs(
    query(postsCol, where('status', '==', 'published'), orderBy('publishedAt', 'desc'), fsLimit(count)),
  )
  return snap.docs.map((d) => ({ ...(d.data() as Post), id: d.id }))
}

export async function listAllPostsAdmin(): Promise<Post[]> {
  const snap = await getDocs(query(postsCol, orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => ({ ...(d.data() as Post), id: d.id }))
}

export interface PostCounts {
  total: number
  published: number
  draft: number
}

export async function getPostCounts(): Promise<PostCounts> {
  const [totalSnap, publishedSnap] = await Promise.all([
    getCountFromServer(postsCol),
    getCountFromServer(query(postsCol, where('status', '==', 'published'))),
  ])
  const total = totalSnap.data().count
  const published = publishedSnap.data().count
  return { total, published, draft: total - published }
}

export async function listArchivePosts(): Promise<ArchivePostEntry[]> {
  const snap = await getDocs(
    query(postsCol, where('status', '==', 'published'), orderBy('publishedAt', 'desc'), fsLimit(200)),
  )
  return snap.docs.map((d) => {
    const data = d.data() as Post
    return { id: d.id, slug: data.slug, title: data.title, publishedAt: data.publishedAt as NonNullable<Post['publishedAt']> }
  })
}
