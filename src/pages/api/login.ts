// Local mock auth (no Shopify)

// Exporting the handler function for the API route
export const POST = async ({ request }: { request: Request }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({
          errors: [{ message: "Email and password are required." }],
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Local auth: accept any non-empty email/password and mint a fake token
    const token = Buffer.from(`${email}:${Date.now()}`).toString("base64");
    const customer = { firstName: email.split("@")[0], lastName: "", email };

    const response = new Response(JSON.stringify({ ...customer, token }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    // Set token in cookie with HttpOnly flag
    response.headers.set("Set-Cookie", `token=${token}; Path=/; SameSite=Lax`);

    return response;
  } catch (error: any) {
    console.error("Error during login:", error);

    return new Response(
      JSON.stringify({
        errors: [
          {
            code: "INTERNAL_ERROR",
            message: error.message || "An unknown error occurred",
          },
        ],
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
