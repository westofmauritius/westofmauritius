const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export type EmailContent = {
  /** First line, e.g. "Hello Priya,". */
  greeting: string;
  paragraphs: string[];
  button?: { label: string; url: string };
  /** Small print at the bottom (independence notice, why you got this). */
  footer: string[];
};

/**
 * A plain, readable e-mail: one column, the brand colours, a big button.
 * Every value is escaped; templates pass plain text only.
 */
export function renderEmail(content: EmailContent): {
  html: string;
  text: string;
} {
  const p = (text: string) =>
    `<p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#0a2e4a">${escapeHtml(text)}</p>`;
  const button = content.button
    ? `<p style="margin:24px 0"><a href="${escapeHtml(content.button.url)}" style="display:inline-block;background:#fcc436;color:#061f33;font-weight:700;text-decoration:none;padding:14px 24px;border-radius:999px;font-size:16px">${escapeHtml(content.button.label)}</a></p>`
    : "";
  const footer = content.footer
    .map(
      (line) =>
        `<p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#44596e">${escapeHtml(line)}</p>`,
    )
    .join("");

  const html = `<!doctype html><html><body style="margin:0;background:#fffbf3;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #e6dac3">
<tr><td style="padding:24px 24px 8px;font-size:22px;font-weight:800;color:#0a2e4a">☀ Soley</td></tr>
<tr><td style="padding:8px 24px 16px">${p(content.greeting)}${content.paragraphs.map(p).join("")}${button}</td></tr>
<tr><td style="padding:16px 24px 24px;border-top:1px solid #e6dac3">${footer}</td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    content.greeting,
    "",
    ...content.paragraphs.flatMap((paragraph) => [paragraph, ""]),
    ...(content.button
      ? [`${content.button.label}: ${content.button.url}`, ""]
      : []),
    "--",
    ...content.footer,
  ].join("\n");

  return { html, text };
}
