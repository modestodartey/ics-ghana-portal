import { NextResponse } from "next/server";
import { getFriendlyAccountErrorMessage } from "@/lib/admin/accounts";
import { getHttpErrorStatus, verifyAdminRouteRequest } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    await verifyAdminRouteRequest(request);
    return NextResponse.json(
      { error: "Bulk account creation is temporarily unavailable." },
      { status: 503 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: getFriendlyAccountErrorMessage(error) },
      { status: getHttpErrorStatus(error) }
    );
  }
}
