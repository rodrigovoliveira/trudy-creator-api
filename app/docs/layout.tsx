import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentação da API | trudy-creator-api",
  description: "OpenAPI / Swagger — trudy-creator-api",
};

export default function DocsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
