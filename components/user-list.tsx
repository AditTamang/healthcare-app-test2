"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { User } from "@prisma/client"
import { Trash2, UserCog } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { deleteUser } from "@/lib/admin"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserEditForm } from "@/components/user-edit-form"

export function UserList({ users }: { users: User[] }) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    setIsLoading(id)

    try {
      const result = await deleteUser(id)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setDialogOpen(true)
  }

  const handleEditSuccess = () => {
    setDialogOpen(false)
    router.refresh()
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "DOCTOR":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "PATIENT":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  if (users.length === 0) {
    return (
      <div className="text-center p-10 bg-muted rounded-lg">
        <h3 className="text-lg font-medium">No users found</h3>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {user.name}
                <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeClass(user.role)}`}>{user.role}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => handleEdit(user)}>
                <UserCog className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleDelete(user.id)}
                disabled={isLoading === user.id}
              >
                {isLoading === user.id ? (
                  "Deleting..."
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and role.</DialogDescription>
          </DialogHeader>
          {selectedUser && <UserEditForm user={selectedUser} onSuccess={handleEditSuccess} />}
        </DialogContent>
      </Dialog>
    </>
  )
}

