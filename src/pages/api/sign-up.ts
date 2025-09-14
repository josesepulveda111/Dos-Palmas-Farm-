// Local mock sign-up (no Shopify)
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const firstName = formData.get("firstName")?.toString();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password || !firstName) {
      return new Response("Email and password are required", { status: 400 });
    }

    // Local sign-up: echo back minimal customer and fake token
    const token = Buffer.from(`${email}:${Date.now()}`).toString("base64");
    const customer = { firstName, lastName: "", email };

    const response = new Response(JSON.stringify({ customer, token }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    // Set the authentication token in a cookie without HttpOnly
    response.headers.set("Set-Cookie", `token=${token}; Path=/; SameSite=Lax`);

    return response;
  } catch (error: any) {
    console.error("Error in API:", error);
    return new Response(
      JSON.stringify({
        errors: [
          {
            code: "INTERNAL_ERROR",
            message: error.message || "An unknown error occurred",
          },
        ],
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
