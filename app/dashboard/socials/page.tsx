import Link from "next/link";
import { desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardPagination } from "@/components/dashboard/pagination";
import { deleteSocialAction } from "@/lib/actions/socials-actions";
import { db, schema } from "@/lib/db";
import { getOffset, getTotalItems, parsePagination } from "@/lib/dashboard-utils";

type PageProps = {
  searchParams?: Promise<{
    page?: string;
    pageSize?: string;
  }>;
};

export default async function DashboardSocialsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const pagination = parsePagination(resolvedSearchParams);
  const totalItems = await getTotalItems("social");
  const offset = getOffset(pagination);

  const socialLinks = await db
    .select()
    .from(schema.socialLink)
    .orderBy(desc(schema.socialLink.createdAt))
    .limit(pagination.pageSize)
    .offset(offset);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Social Links</h1>
          <p className="text-sm text-muted-foreground">Manage external profile links and icon images.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/socials/new">New Social Link</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Social Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Name</th>
                  <th className="p-2">URL</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {socialLinks.map((link) => (
                  <tr key={link.id} className="border-b">
                    <td className="p-2 font-medium">{link.name}</td>
                    <td className="p-2">
                      <a href={link.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                        {link.url}
                      </a>
                    </td>
                    <td className="flex flex-wrap gap-2 p-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/socials/${link.id}/edit`}>Edit</Link>
                      </Button>
                      <form action={deleteSocialAction}>
                        <input type="hidden" name="id" value={link.id} />
                        <Button type="submit" variant="destructive" size="sm">
                          Delete
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DashboardPagination
            basePath="/dashboard/socials"
            page={pagination.page}
            pageSize={pagination.pageSize}
            totalItems={totalItems}
          />
        </CardContent>
      </Card>
    </div>
  );
}
