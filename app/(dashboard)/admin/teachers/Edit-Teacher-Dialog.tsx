"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit, Loader2, UserCog } from "lucide-react";
import { updateTeacher } from "@/lib/actions/teacher.action";
import { useRouter } from "next/navigation";

const TEACHER_ROLES = [
  { value: "ADMIN", label: "Admin", description: "Full system access" },
  { value: "TEACHER", label: "Teacher", description: "Teaching and grading" },
  {
    value: "ATEACHER",
    label: "Attendance",
    description: "Attendance management",
  },
];

interface Teacher {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  password?: string;
}

interface EditTeacherDialogProps {
  teacher: Teacher;
}

export default function EditTeacherDialog({ teacher }: EditTeacherDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(teacher.role);
  const router = useRouter();

  const updateTeacherAction = async (prevState: any, formData: FormData) => {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const username = formData.get("username") as string;
    const role = formData.get("role") as "ADMIN | TEACHER | ATEACHER";

    const result = await updateTeacher(id, name, email, username, role);

    if (result.success) {
      setIsOpen(false);
      // Refresh the page or use router.refresh()
      router.reload();
    }

    return result;
  };

  const [state, action, isPending] = useActionState(updateTeacherAction, null);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="text-green-500 hover:text-green-600 hover:bg-green-500/10 transition-colors"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-md backdrop-blur-sm">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <UserCog className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-foreground text-xl">
                Edit Teacher
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Update {teacher.name}'s account details and permissions
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form action={action} className="space-y-5 mt-6">
          <input type="hidden" name="id" value={teacher.id} />
          <div className="space-y-2">
            <Label className="text-foreground font-medium">Full Name</Label>
            <Input
              name="name"
              defaultValue={teacher.name}
              required
              className="bg-background/50 border-border/50 text-foreground focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground font-medium">Email Address</Label>
            <Input
              name="email"
              type="email"
              defaultValue={teacher.email}
              required
              className="bg-background/50 border-border/50 text-foreground focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground font-medium">Username</Label>
            <Input
              name="username"
              defaultValue={teacher.username}
              required
              className="bg-background/50 border-border/50 text-foreground focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground font-medium">
              Role & Permissions
            </Label>
            <Select
              name="role"
              value={selectedRole}
              onValueChange={setSelectedRole}
              required
            >
              <SelectTrigger className="bg-background/50 border-border/50 text-foreground focus:border-primary/50 transition-colors">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {TEACHER_ROLES.map((role) => (
                  <SelectItem
                    key={role.value}
                    value={role.value}
                    className="text-foreground hover:bg-muted focus:bg-muted"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{role.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {role.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Hidden input to ensure form data includes role */}
            <input type="hidden" name="role" value={selectedRole} />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground font-medium">New Password</Label>
            <Input
              name="password"
              type="password"
              defaultValue={teacher.password || ""}
              className="bg-background/50 border-border/50 text-foreground focus:border-primary/50 transition-colors"
              placeholder="Leave blank to keep current password"
            />
            <p className="text-xs text-muted-foreground">
              Only enter a new password if you want to change it
            </p>
          </div>

          {state?.error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">{state.error}</p>
            </div>
          )}

          {state?.success && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-600 dark:text-green-400 text-sm">
                {state.message}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-border/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Teacher
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
