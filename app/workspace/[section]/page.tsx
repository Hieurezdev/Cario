import { notFound } from "next/navigation";
import Workspace from "../workspace";
import { sectionSlugs, type SectionSlug } from "../data";

export function generateStaticParams() {
  return sectionSlugs.map((section) => ({ section }));
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sectionSlugs.includes(section as SectionSlug)) notFound();
  return <Workspace section={section as SectionSlug} />;
}
