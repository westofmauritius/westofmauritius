import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth/roles";
import { exportHouseholdData } from "@/lib/services/privacy";

/** The signed-in household's own data as a JSON download (right of access). */
export async function GET() {
  const viewer = await getViewer();
  if (!viewer?.household)
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const data = await exportHouseholdData(viewer.household.id);
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="soley-my-data-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
