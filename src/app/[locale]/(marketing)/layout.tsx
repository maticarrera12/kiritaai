import React from "react";

import Footer from "@/components/footer/footer";
import Navbar from "@/components/navbar/comp-582";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <div className="pt-16">{children}</div>
      <Footer />
    </>
  );
};

export default layout;
