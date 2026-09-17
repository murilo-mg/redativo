export async function GET() {
  return Response.json(
    {
      status: "ok",
      application: "redativo",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}