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
import { Edit, Loader2 } from "lucide-react";
import { updateTeacher } from "@/lib/actions/teacher.action";
import { useRouter } from "next/navigation";

const TEACHER_ROLES = [
  { value: "ADMIN", label: "Admin" },
  { value: "TEACHER", label: "Teacher" },
  { value: "ATEACHER", label: "Attendance" },
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
          className="text-green-400 hover:bg-green-500/20"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Teacher</DialogTitle>
          <DialogDescription className="text-slate-400">
            Update teacher account details
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <input type="hidden" name="id" value={teacher.id} />
          <div className="space-y-2">
            <Label className="text-slate-200">Full Name</Label>
            <Input
              name="name"
              defaultValue={teacher.name}
              required
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-200">Email</Label>
            <Input
              name="email"
              type="email"
              defaultValue={teacher.email}
              required
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-200">Username</Label>
            <Input
              name="username"
              defaultValue={teacher.username}
              required
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-200">Role</Label>
            <Select
              name="role"
              value={selectedRole}
              onValueChange={setSelectedRole}
              required
            >
              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {TEACHER_ROLES.map((role) => (
                  <SelectItem
                    key={role.value}
                    value={role.value}
                    className="text-white hover:bg-slate-600 focus:bg-slate-600"
                  >
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Hidden input to ensure form data includes role */}
            <input type="hidden" name="role" value={selectedRole} />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-200">Password</Label>
            <Input
              name="password"
              type="password"
              defaultValue={teacher.password || ""}
              className="bg-slate-700/50 border-slate-600 text-white"
              placeholder="Leave blank to keep current password"
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-slate-600 text-black"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-gradient-to-r from-green-500 to-emerald-500"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Teacher"
              )}
            </Button>
          </div>
        </form>

        {state?.success && (
          <p className="text-green-400 text-sm mt-2">{state.message}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
