import { Layout, Navbar, Footer } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";

const navbar = (
  <Navbar
    logo={<span className="font-bold">OpenNextJS</span>}
    projectLink="https://github.com/maticarrera12/open_next"
  />
);

const footer = <Footer> {new Date().getFullYear()} © OpenNextJS.</Footer>;

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pageMap = await getPageMap("/docs");

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/maticarrera12/open_next"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
