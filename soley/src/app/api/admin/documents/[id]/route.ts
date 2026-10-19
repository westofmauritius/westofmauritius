import { NextResponse } from "next/server";
import { currentEmail, isAdmin } from "@/lib/auth/session";
import { getDb, getFileStore } from "@/lib/data";

/** Downloads an installer document. Admins only; never cached. */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/admin/documents/[id]">,
) {
  const email = await currentEmail();
  if (!email || !(await isAdmin(email))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const [doc] = await getDb().select("installer_documents", { id });
  const file = doc ? await getFileStore().get(doc.storage_path) : null;
  if (!doc || !file)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(file.data, {
    headers: {
      "Content-Type": doc.content_type,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(doc.file_name)}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
