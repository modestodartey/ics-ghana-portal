import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit/logging";
import {
  createAuthUserAndRecord,
  getFriendlyAccountErrorMessage,
  isManagedAccountRole,
  validateCreateAccountInput
} from "@/lib/admin/accounts";
import { normalizeEmail } from "@/lib/auth";
import { getFirebaseAdminFirestore, getHttpErrorStatus, verifyAdminRouteRequest } from "@/lib/firebase-admin";
import type { BulkAccountCreateResult, BulkAccountCsvRow, BulkAccountResultItem } from "@/types/accounts";

function normalizeBulkRow(row: Partial<BulkAccountCsvRow>): Omit<BulkAccountResultItem, "status" | "message"> & {
  temporaryPassword: string;
} {
  const fullName = typeof row.fullName === "string" ? row.fullName.trim() : "";
  const email = typeof row.email === "string" ? normalizeEmail(row.email) : "";
  const temporaryPassword = typeof row.temporaryPassword === "string" ? row.temporaryPassword.trim() : "";
  const role = isManagedAccountRole(row.role) ? row.role : "";

  return {
    fullName,
    email,
    temporaryPassword,
    role
  };
}

export async function POST(request: Request) {
  try {
    const routeUser = await verifyAdminRouteRequest(request);
    const body = (await request.json()) as { rows?: Partial<BulkAccountCsvRow>[] };
    const rawRows = Array.isArray(body.rows) ? body.rows : [];

    if (rawRows.length === 0) {
      throw new Error("Please provide at least one CSV row to import.");
    }

    const snapshot = await getFirebaseAdminFirestore().collection("users").get();
    const existingEmails = new Set(
      snapshot.docs
        .map((documentSnapshot) => documentSnapshot.data().email)
        .filter((email): email is string => typeof email === "string")
        .map((email) => normalizeEmail(email))
    );

    const results: BulkAccountResultItem[] = [];
    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const rawRow of rawRows) {
      const row = normalizeBulkRow(rawRow);

      if (!row.fullName || !row.email || !row.temporaryPassword || !row.role) {
        skipped += 1;
        results.push({
          email: row.email,
          fullName: row.fullName,
          role: row.role,
          status: "skipped",
          message: "This row is missing one or more required values."
        });
        continue;
      }

      if (existingEmails.has(row.email)) {
        skipped += 1;
        results.push({
          email: row.email,
          fullName: row.fullName,
          role: row.role,
          status: "skipped",
          message: "An account with this email already exists."
        });
        continue;
      }

      try {
        await createAuthUserAndRecord(
          validateCreateAccountInput({
            displayName: row.fullName,
            email: row.email,
            role: row.role,
            temporaryPassword: row.temporaryPassword
          })
        );

        existingEmails.add(row.email);
        created += 1;
        results.push({
          email: row.email,
          fullName: row.fullName,
          role: row.role,
          status: "created",
          message: "Account created successfully."
        });
      } catch (error) {
        failed += 1;
        results.push({
          email: row.email,
          fullName: row.fullName,
          role: row.role,
          status: "failed",
          message: getFriendlyAccountErrorMessage(error)
        });
      }
    }

    const result: BulkAccountCreateResult = {
      created,
      skipped,
      failed,
      results
    };

    await writeAuditLog({
      action: "accounts_bulk_created",
      actorUid: routeUser.uid,
      actorEmail: routeUser.email,
      targetType: "bulk_import",
      targetId: `bulk-${Date.now()}`,
      targetLabel: "Bulk account import",
      summary: `Processed ${rawRows.length} CSV row${rawRows.length === 1 ? "" : "s"} for account creation.`,
      metadata: {
        created,
        skipped,
        failed
      }
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json(
      { error: getFriendlyAccountErrorMessage(error) },
      { status: getHttpErrorStatus(error) }
    );
  }
}
