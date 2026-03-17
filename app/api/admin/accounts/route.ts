import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit/logging";
import {
  createAuthUserAndRecord,
  getFriendlyAccountErrorMessage,
  mapAccountRecord,
  validateCreateAccountInput
} from "@/lib/admin/accounts";
import {
  getFirebaseAdminFirestore,
  getHttpErrorStatus,
  verifyAdminRouteRequest
} from "@/lib/firebase-admin";
import type { CreateManagedAccountInput } from "@/types/accounts";

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
    const routeUser = await verifyAdminRouteRequest(request);
    const body = (await request.json()) as Partial<CreateManagedAccountInput>;
    const input = validateCreateAccountInput(body);
    const createdAccount = await createAuthUserAndRecord(input);

    await writeAuditLog({
      action: "account_created",
      actorUid: routeUser.uid,
      actorEmail: routeUser.email,
      targetType: "account",
      targetId: createdAccount.uid,
      targetLabel: createdAccount.email,
      summary: `Created ${createdAccount.role} account for ${createdAccount.displayName}.`,
      metadata: {
        role: createdAccount.role,
        isActive: createdAccount.isActive
      }
    });

    return NextResponse.json({ data: createdAccount });
  } catch (error) {
    return NextResponse.json(
      { error: getFriendlyAccountErrorMessage(error) },
      { status: getHttpErrorStatus(error) }
    );
  }
}
