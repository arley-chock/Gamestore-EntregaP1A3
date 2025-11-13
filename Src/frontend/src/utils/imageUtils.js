// Utilitários para manipulação de imagens de jogos

export function slugifyGameName(name) {
  if (!name) return ''
  return name
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getLocalImageCandidates(name) {
  const slug = slugifyGameName(name)
  const exts = ['png', 'jpg', 'jpeg', 'webp']
  return exts.map(ext => `/images/${slug}.${ext}`)
}

export function getGifPath(gameName) {
  const slug = slugifyGameName(gameName)
  return `/images/Gifs/${slug}.gif`
}

