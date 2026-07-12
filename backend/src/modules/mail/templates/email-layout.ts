// Shared chrome for notification emails: header band, content card, footer.
// Everything is inline-styled — email clients strip <style> blocks — and kept to
// simple divs; layout tricks like flex/absolute don't survive Outlook/Gmail.

const BRAND = 'TheConnection';

// User-provided values (names, venues) are interpolated into HTML; escape them.
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function emailLayout(bodyHtml: string): string {
  return `
    <div style="background: #f4f4f5; padding: 24px 12px; font-family: -apple-system, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 520px; margin: 0 auto;">
        <div style="background: #111114; border-radius: 12px 12px 0 0; padding: 20px 24px; text-align: center;">
          <span style="color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 1px;">${BRAND}</span>
        </div>
        <div style="background: #ffffff; border-radius: 0 0 12px 12px; padding: 28px 24px; color: #26262b;">
          ${bodyHtml}
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">
          ${BRAND} · Citas reales para universitarios
        </p>
      </div>
    </div>
  `;
}

// Primary CTA: a padded <a> instead of <button> — buttons don't link in email.
export function ctaButton(label: string, url: string): string {
  return `
    <div style="text-align: center; margin: 24px 0 8px;">
      <a href="${url}" style="display: inline-block; background: #111114; color: #ffffff; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none;">${label}</a>
    </div>
    <p style="text-align: center; color: #9ca3af; font-size: 12px; word-break: break-all;">
      Si el botón no funciona, copia este enlace:<br />
      <a href="${url}" style="color: #6b7280;">${url}</a>
    </p>
  `;
}
