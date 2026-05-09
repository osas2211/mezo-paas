export interface Framework {
  id: string
  name: string
  iconUrl: string
  brandColor: string // Included if you want to use it for UI accents
}

export const SUPPORTED_FRAMEWORKS: Framework[] = [
  {
    id: "nextjs",
    name: "Next.js",
    iconUrl: "https://cdn.simpleicons.org/nextdotjs/000000",
    brandColor: "#000000",
  },
  {
    id: "nestjs",
    name: "NestJS",
    iconUrl: "https://cdn.simpleicons.org/nestjs/E0234E",
    brandColor: "#E0234E",
  },
  {
    id: "nuxtjs",
    name: "Nuxt",
    iconUrl: "https://cdn.simpleicons.org/nuxtdotjs/00DC82",
    brandColor: "#00DC82",
  },
  {
    id: "sveltekit",
    name: "SvelteKit",
    iconUrl: "https://cdn.simpleicons.org/svelte/FF3E00",
    brandColor: "#FF3E00",
  },
  {
    id: "remix",
    name: "Remix",
    iconUrl: "https://cdn.simpleicons.org/remix/000000",
    brandColor: "#000000",
  },
  {
    id: "angular",
    name: "Angular",
    iconUrl: "https://cdn.simpleicons.org/angular/DD0031",
    brandColor: "#DD0031",
  },
  {
    id: "gatsby",
    name: "Gatsby",
    iconUrl: "https://cdn.simpleicons.org/gatsby/663399",
    brandColor: "#663399",
  },
  {
    id: "vite",
    name: "Vite",
    iconUrl: "https://cdn.simpleicons.org/vite/646CFF",
    brandColor: "#646CFF",
  },
  {
    id: "create-react-app",
    name: "React (CRA)",
    iconUrl: "https://cdn.simpleicons.org/react/61DAFB",
    brandColor: "#61DAFB",
  },
  {
    id: "node",
    name: "Node.js",
    iconUrl: "https://cdn.simpleicons.org/nodedotjs/5FA04E",
    brandColor: "#5FA04E",
  },
]
