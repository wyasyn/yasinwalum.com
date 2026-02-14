import { remark } from "remark";
import remarkHtml from "remark-html";

export async function markdownToHtml(markdown: string): Promise<string> {
  if (!markdown.trim()) {
    return "";
  }

  const result = await remark().use(remarkHtml).process(markdown);
  return String(result);
}
