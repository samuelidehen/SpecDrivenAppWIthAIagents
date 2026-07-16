import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  `${process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}(.*)`,
  `${process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL}(.*)`,
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};
