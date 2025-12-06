import createMiddleware from "next-intl/middleware";

import { routing } from "./src/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next`, `/_vercel`, `/docs` or `/legal`
    // - … the ones ending with file extensions (e.g. `favicon.ico`, `image.png`)
    "/(es|en)/:path*",
    "/",
  ],
};
