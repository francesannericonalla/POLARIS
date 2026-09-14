import { archiveDocument, restoreDocument } from "@/lib/actions/document-actions";

export function ArchiveButton({ documentId, archived }: { documentId: string; archived: boolean }) {
  async function action() {
    "use server";
    if (archived) {
      await restoreDocument(documentId);
    } else {
      await archiveDocument(documentId);
    }
  }

  return (
    <form action={action}>
      <button type="submit" className="text-xs font-semibold hover:underline text-gray-500">
        {archived ? "Restore" : "Archive"}
      </button>
    </form>
  );
}
