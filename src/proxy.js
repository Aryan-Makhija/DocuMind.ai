import { clerkMiddleware } from "@clerk/nextjs/server";

const publicRoutes = ["/", "/about", "/pricing"];

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  const isPublicRoute = publicRoutes.some(
    (route) =>
      pathname === route ||
      (route !== "/" && pathname.startsWith(`${route}/`))
  );

  if (!isPublicRoute) {
    const { userId } = await auth();

    if (!userId) {
      return (await auth()).redirectToSignIn({
        returnBackUrl: req.url,
      });
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/__clerk/:path*",
    "/(api|trpc)(.*)",
  ],
};