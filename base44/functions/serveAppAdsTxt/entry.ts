export default async function(req) {
  const content = "google.com, pub-4765673509153947, DIRECT, f08c47fec0942fa0";
  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}