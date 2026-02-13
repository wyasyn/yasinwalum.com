import Link from "next/link";
import { Button } from "@/components/ui/button";

type PaginationProps = {
  basePath: string;
  page: number;
  pageSize: number;
  totalItems: number;
};

export function DashboardPagination({
  basePath,
  page,
  pageSize,
  totalItems,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalPages <= 1) {
    return null;
  }

  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm" disabled={page <= 1}>
          <Link href={`${basePath}?page=${prev}&pageSize=${pageSize}`}>Previous</Link>
        </Button>
        <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
          <Link href={`${basePath}?page=${next}&pageSize=${pageSize}`}>Next</Link>
        </Button>
      </div>
    </div>
  );
}
