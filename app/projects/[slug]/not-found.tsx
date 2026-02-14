import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-3 p-6">
      <h1 className="text-2xl font-semibold">Project not found</h1>
      <p className="text-sm text-muted-foreground">This project may not exist or is not available yet.</p>
      <Link href="/projects" className="text-sm underline-offset-4 hover:underline">
        Back to projects
      </Link>
    </main>
  );
}
