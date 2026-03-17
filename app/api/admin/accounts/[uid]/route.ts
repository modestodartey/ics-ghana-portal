import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { writeAuditLog } from "@/lib/audit/logging";
import {
  getFirebaseAdminAuth,
  getFirebaseAdminFirestore,
  getHttpErrorStatus,
  verifyAdminRouteRequest
} from "@/lib/firebase-admin";
import type { ManagedAccountRecord } from "@/types/accounts";

function getFriendlyAccountErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "The account status could not be updated.";
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ uid: string }> }
) {
  try {
    const routeUser = await verifyAdminRouteRequest(request);
    const { uid } = await context.params;
    const body = (await request.json()) as { isActive?: boolean };

    if (typeof body.isActive !== "boolean") {
      throw new Error("Please choose a valid account status.");
    }

    if (!body.isActive && routeUser.uid === uid) {
      throw new Error("You cannot disable your own administrator account from the portal.");
    }

    await getFirebaseAdminAuth().updateUser(uid, {
      disabled: !body.isActive
    });

    await getFirebaseAdminFirestore().collection("users").doc(uid).set(
      {
        isActive: body.isActive,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    const updatedSnapshot = await getFirebaseAdminFirestore().collection("users").doc(uid).get();
    const updatedData = updatedSnapshot.data();

    if (!updatedSnapshot.exists || !updatedData) {
      throw new Error("The updated account record could not be loaded.");
    }

    const account: ManagedAccountRecord = {
      uid,
      email: typeof updatedData.email === "string" ? updatedData.email : "",
      displayName: typeof updatedData.displayName === "string" ? updatedData.displayName : "",
      role: updatedData.role === "admin" || updatedData.role === "staff" ? updatedData.role : "student",
      createdAt:
        updatedData.createdAt && typeof updatedData.createdAt.toDate === "function"
          ? updatedData.createdAt.toDate().toISOString()
          : null,
      isActive: updatedData.isActive !== false
    };

    await writeAuditLog({
      action: "account_status_updated",
      actorUid: routeUser.uid,
      actorEmail: routeUser.email,
      targetType: "account",
      targetId: uid,
      targetLabel: account.email,
      summary: body.isActive
        ? `Reactivated account for ${account.displayName}.`
        : `Disabled account for ${account.displayName}.`,
      metadata: {
        role: account.role,
        isActive: account.isActive
      }
    });

    return NextResponse.json({ data: account });
  } catch (error) {
    return NextResponse.json(
      { error: getFriendlyAccountErrorMessage(error) },
      { status: getHttpErrorStatus(error) }
    );
  }
}
