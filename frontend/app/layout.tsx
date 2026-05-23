import type { Metadata } from "next"
import "./globals.css"
import localFont from "next/font/local"
import { AntProvider } from "@/components/utilities/ant-provider"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { TanstackProvider } from "@/components/utilities/tanstack-provider"

const suiFont = localFont({
  src: [
    {
      path: "./fonts/SuisseIntl-Light.woff2",
      weight: "300",
    },
    {
      path: "./fonts/SuisseIntl-Regular.woff2",
      weight: "400",
    },
    {
      path: "./fonts/SuisseIntl-Medium.woff2",
      weight: "500",
    },
  ],
  variable: "--font-suisse-intl",
})

export const metadata: Metadata = {
  title: "Mezo PaaS | Decentralized Deployment Platform",
  description: "Explore Bitcoin DeFi deployment. Mezo PaaS lets you borrow, lend, and deploy applications using your Bitcoin. Run your services without giving up your BTC.",
  keywords: ["mezo", "bitcoin", "deployment", "paas", "decentralized hosting", "web3"],
  openGraph: {
    title: "Mezo PaaS | Everyday Finance & Compute using Bitcoin",
    description: "Explore Bitcoin DeFi: deploy applications and run services without giving up your BTC. Mezo makes your Bitcoin more powerful.",
    url: "https://mezo.host",
    siteName: "Mezo PaaS",
    images: [
      {
        url: "https://cdn.sanity.io/images/9zunswfd/production/735fc17b6da82a198c7db497f9bbedee14825902-900x473.png",
        width: 900,
        height: 473,
        alt: "Mezo Protocol",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mezo PaaS | Everyday Finance using Bitcoin",
    description: "Explore Bitcoin DeFi: deploy and manage applications without giving up your BTC.",
    images: ["https://cdn.sanity.io/images/9zunswfd/production/735fc17b6da82a198c7db497f9bbedee14825902-900x473.png"],
  },
  icons: {
    icon: "https://mezo.org/favicon.ico",
    shortcut: "https://mezo.org/favicon.svg",
    apple: "https://mezo.org/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${suiFont.variable} ${suiFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TanstackProvider>
          <AntProvider>{children}</AntProvider>
          <ToastContainer aria-label="Notifications" />
        </TanstackProvider>
      </body>
    </html>
  )
}
