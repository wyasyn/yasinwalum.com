import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        {
          ok: false,
          reason: "unauthorized",
        },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    await db.execute(sql`select 1`);

    return NextResponse.json(
      {
        ok: true,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        reason: "db_unreachable",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
