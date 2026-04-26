"use client"
import React, { ReactNode } from "react"
import { ConfigProvider, theme } from "antd"

interface ContentWrapperI extends React.HtmlHTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export const AntProvider: React.FC<ContentWrapperI> = ({
  children,
  ...props
}) => {
  return (
    <div {...props}>
      <ConfigProvider
        theme={{
          token: { colorPrimary: "#b3ec11", colorText: "" },
          components: {
            Table: {
              headerBg: "#99E48A4D",
              headerBorderRadius: 0,
              cellPaddingBlock: 17,
              cellPaddingInline: 18,
              headerColor: "#00000099",
            },
            Collapse: {
              headerBg: "#fff",
              contentBg: "#99E48A33",
              headerPadding: "16px",
              padding: 16,
              contentPadding: 0,
            },
            Button: {
              colorText: "#000",
            },
            Modal: {
              contentBg: "#0a0a0a",
              headerBg: "#0a0a0a",
              titleColor: "#fff",
            },
          },
          algorithm: theme.darkAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </div>
  )
}
