import { NextResponse } from "next/server";
import {
  getFriendlyAccountErrorMessage,
  mapAccountRecord
} from "@/lib/admin/accounts";
import {
  getFirebaseAdminFirestore,
  getHttpErrorStatus,
  verifyAdminRouteRequest
} from "@/lib/firebase-admin";

export async function GET(request: Request) {
  try {
    await verifyAdminRouteRequest(request);

    const snapshot = await getFirebaseAdminFirestore().collection("users").get();
    const accounts = snapshot.docs
      .map((documentSnapshot) => mapAccountRecord(documentSnapshot.id, documentSnapshot.data()))
      .sort((left, right) => {
        const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
        const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
        return rightTime - leftTime;
      });

    return NextResponse.json({ data: accounts });
  } catch (error) {
    return NextResponse.json(
      { error: getFriendlyAccountErrorMessage(error) },
      { status: getHttpErrorStatus(error) }
    );
  }
}

export async function POST(request: Request) {
  try {
    await verifyAdminRouteRequest(request);
    return NextResponse.json(
      { error: "Account creation is temporarily unavailable." },
      { status: 503 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: getFriendlyAccountErrorMessage(error) },
      { status: getHttpErrorStatus(error) }
    );
  }
}
