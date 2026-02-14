import Link from "next/link";
import { getPublicProfileData, getPublicSocialsData } from "@/lib/public-queries";

export const revalidate = 300;

export default async function AboutPage() {
  const [profile, socials] = await Promise.all([getPublicProfileData(), getPublicSocialsData()]);

  return (
    <main className="container mx-auto flex w-full max-w-[1024px] flex-col gap-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">About</h1>
        <p className="text-sm text-muted-foreground">
          Structure scaffold for the dedicated about route. UI can be designed in the next step.
        </p>
      </header>

      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-medium">Profile Snapshot</h2>
        {profile ? (
          <div className="mt-3 space-y-1 text-sm">
            <p>
              <span className="font-medium">Name:</span> {profile.fullName}
            </p>
            <p>
              <span className="font-medium">Headline:</span> {profile.headline}
            </p>
            <p>
              <span className="font-medium">Location:</span> {profile.location ?? "Not set"}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No profile record found yet.</p>
        )}
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-medium">Social Links</h2>
        {socials.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No social links available.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {socials.map((social) => (
              <li key={social.id}>
                <a href={social.url} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
                  {social.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link href="/contact" className="text-sm underline-offset-4 hover:underline">
        Continue to contact page
      </Link>
    </main>
  );
}
