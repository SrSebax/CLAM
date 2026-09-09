import { watchEffect } from 'vue'

interface SeoOptions {
  title: string
  description?: string
  image?: string
  type?: string
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  if (!content) return
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

/** SEO client-side: title + meta description + Open Graph. No sustituye pre-render/SSR
 * para crawlers de redes sociales, pero cubre el <title>/description real del documento. */
export function useSeo(getOptions: () => SeoOptions) {
  watchEffect(() => {
    const { title, description = '', image = '', type = 'article' } = getOptions()

    document.title = title ? `${title} · CLAM` : 'CLAM'
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:url', window.location.href)
    if (image) setMeta('property', 'og:image', image)
  })
}
