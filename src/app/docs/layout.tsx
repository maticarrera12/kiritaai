import { getPageMap } from "nextra/page-map";
import { Layout, Navbar, Footer } from "nextra-theme-docs";
import "nextra-theme-docs/style.css";

const navbar = (
  <Navbar
    logo={<span className="font-bold">KiritaAI</span>}
    projectLink="https://github.com/maticarrera12/open_next"
  />
);

const footer = <Footer> {new Date().getFullYear()} © KiritaAI.</Footer>;

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const pageMap = await getPageMap("/docs");

  return (
    <Layout
      navbar={navbar}
      pageMap={pageMap}
      docsRepositoryBase="https://github.com/maticarrera12/open_next"
      footer={footer}
    >
      {children}
    </Layout>
  );
}
