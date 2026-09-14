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
      <button type="submit" className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">
        {archived ? "Restore" : "Archive"}
      </button>
    </form>
  );
}
