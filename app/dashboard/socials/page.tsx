import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardPagination } from "@/components/dashboard/pagination";
import { deleteSocialAction } from "@/lib/actions/socials-actions";
import { schema } from "@/lib/db";
import { getOffset, parsePagination } from "@/lib/dashboard-utils";
import { OfflineDataPanel } from "@/components/local-first/offline-data-panel";
import { getSocialsPageData } from "@/lib/dashboard-queries";
import { requireAdminSession } from "@/lib/auth/session";

type PageProps = {
  searchParams?: Promise<{
    page?: string;
    pageSize?: string;
  }>;
};

type SocialRow = typeof schema.socialLink.$inferSelect;

export default async function DashboardSocialsPage({ searchParams }: PageProps) {
  await requireAdminSession();
  const resolvedSearchParams = (await searchParams) ?? {};
  const pagination = parsePagination(resolvedSearchParams);
  const offset = getOffset(pagination);
  let totalItems = 0;
  let socialLinks: SocialRow[] = [];
  let dbUnavailable = false;

  try {
    const data = await getSocialsPageData(pagination.pageSize, offset);
    totalItems = data.totalItems;
    socialLinks = data.socialLinks;
  } catch {
    dbUnavailable = true;
  }

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
      <OfflineDataPanel entity="socials" dbUnavailable={dbUnavailable} />

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
                      <form data-local-first="on" data-local-entity="socials" data-local-op="delete" action={deleteSocialAction}>
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
