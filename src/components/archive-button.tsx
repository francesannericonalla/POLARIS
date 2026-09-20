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
      <button
        type="submit"
        className={`text-xs font-medium px-2 py-1.5 rounded transition-colors ${
          archived
            ? "text-green-700 hover:bg-green-50"
            : "text-gray-400 hover:text-red-500 hover:bg-red-50"
        }`}
      >
        {archived ? "Restore" : "Archive"}
      </button>
    </form>
  );
}
