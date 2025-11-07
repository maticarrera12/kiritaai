import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { Layout, Navbar, Footer } from "nextra-theme-docs";
import "nextra-theme-docs/style.css";
import "./legal.css";

const navbar = (
  <Navbar
    logo={<span className="font-bold">OpenNextJS - Legal</span>}
    logoLink="/"
    projectLink="https://github.com/maticarrera12/open_next"
  />
);

const footer = <Footer>{new Date().getFullYear()} © OpenNextJS.</Footer>;

export default async function LegalLayout({ children }: { children: React.ReactNode }) {
  const pageMap = await getPageMap("/legal");

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body suppressHydrationWarning>
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
