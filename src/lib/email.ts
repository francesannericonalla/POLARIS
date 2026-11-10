import "server-only";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "POLARIS <onboarding@resend.dev>";

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[email] failed to send:", err);
  }
}

export function accountApprovedHtml(name: string) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff">
      <h2 style="color:#7A1330;margin-bottom:8px">Account Approved</h2>
      <p style="color:#374151">Hi <strong>${name}</strong>,</p>
      <p style="color:#374151">Your POLARIS account has been approved. You can now log in and start submitting documents.</p>
      <p style="color:#6b7280;font-size:13px;margin-top:32px">— POLARIS / QAO</p>
    </div>`;
}

export function accountRejectedHtml(name: string) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff">
      <h2 style="color:#dc2626;margin-bottom:8px">Account Not Approved</h2>
      <p style="color:#374151">Hi <strong>${name}</strong>,</p>
      <p style="color:#374151">Unfortunately your POLARIS account request was not approved. Please contact the QAO office for more information.</p>
      <p style="color:#6b7280;font-size:13px;margin-top:32px">— POLARIS / QAO</p>
    </div>`;
}

export function documentUploadedHtml(uploaderName: string, unitName: string, docTitle: string, folderName: string) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff">
      <h2 style="color:#7A1330;margin-bottom:8px">New Document Uploaded</h2>
      <p style="color:#374151"><strong>${uploaderName}</strong> from <strong>${unitName}</strong> uploaded a new document:</p>
      <div style="background:#f9fafb;border-radius:10px;padding:16px;margin:16px 0">
        <p style="margin:0;font-weight:600;color:#1e293b">${docTitle}</p>
        <p style="margin:4px 0 0;color:#64748b;font-size:13px">Folder: ${folderName}</p>
      </div>
      <p style="color:#6b7280;font-size:13px;margin-top:32px">— POLARIS / QAO</p>
    </div>`;
}
