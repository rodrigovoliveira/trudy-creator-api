import type { Metadata } from "next";
import "./docs.css";

export const metadata: Metadata = {
  title: "Documentação da API | trudy-creator-api",
  description: "OpenAPI / Swagger — trudy-creator-api",
};

export default function DocsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh w-full bg-[#fafafa] text-neutral-900 [color-scheme:light]">
      {children}
    </div>
  );
}
