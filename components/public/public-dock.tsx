import { getPublicSocialsData } from "@/lib/public-queries";
import { PublicDockClient } from "@/components/public/public-dock-client";

type DockSocialLink = {
  id: string;
  label: string;
  href: string;
};

export async function PublicDock() {
  const [socialsResult] = await Promise.allSettled([getPublicSocialsData()]);
  const socials = socialsResult.status === "fulfilled" ? socialsResult.value : [];

  const socialLinks: DockSocialLink[] = socials.slice(0, 5).map((social) => ({
    id: `social-${social.id}`,
    label: social.name,
    href: social.url,
  }));

  return <PublicDockClient socialLinks={socialLinks} />;
}
