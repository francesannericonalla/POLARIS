import "server-only";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  meta: Record<string, string> | null;
  created_at: string;
};

export function getNotificationsForUser(userId: string, limit = 20): Promise<Notification[]> {
  return unstable_cache(
    async () => {
      const admin = createAdminClient();
      const { data } = await admin
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);
      return (data ?? []) as Notification[];
    },
    [`notifications-for-user-${userId}`],
    { revalidate: 30, tags: [`notifications-${userId}`, "notifications"] }
  )();
}

export function getUnreadCount(userId: string): Promise<number> {
  return unstable_cache(
    async () => {
      const admin = createAdminClient();
      const { count } = await admin
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("read", false);
      return count ?? 0;
    },
    [`notifications-unread-${userId}`],
    { revalidate: 30, tags: [`notifications-${userId}`, "notifications"] }
  )();
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  meta?: Record<string, string>
) {
  const admin = createAdminClient();
  await admin.from("notifications").insert({
    user_id: userId,
    type,
    title,
    body,
    meta: meta ?? null,
  });
  const { revalidateTag } = await import("next/cache");
  revalidateTag(`notifications-${userId}`);
}

export async function markAllRead(userId: string) {
  const admin = createAdminClient();
  await admin
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
  const { revalidateTag } = await import("next/cache");
  revalidateTag(`notifications-${userId}`);
}

export async function deleteAllReadNotifications(userId: string) {
  const admin = createAdminClient();
  await admin
    .from("notifications")
    .delete()
    .eq("user_id", userId)
    .eq("read", true);
  const { revalidateTag } = await import("next/cache");
  revalidateTag(`notifications-${userId}`);
}

export async function deleteNotification(userId: string, notificationId: string) {
  const admin = createAdminClient();
  await admin
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", userId);
  const { revalidateTag } = await import("next/cache");
  revalidateTag(`notifications-${userId}`);
}
