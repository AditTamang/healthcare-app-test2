import { requireRole } from "@/lib/auth"
import { getAllUsers } from "@/lib/admin"
import { UserList } from "@/components/user-list"

export default async function AdminUsersPage() {
  const user = await requireRole("ADMIN")

  // Get all users
  const users = await getAllUsers()

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <UserList users={users} />
    </div>
  )
}

