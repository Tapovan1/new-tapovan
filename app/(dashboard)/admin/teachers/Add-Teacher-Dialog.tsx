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
import { Plus, Loader2 } from "lucide-react";
import { addTeacher } from "@/lib/actions/teacher.action";

const TEACHER_ROLES = [
  { value: "ADMIN", label: "Admin" },
  { value: "TEACHER", label: "Teacher" },
  { value: "ATEACHER", label: "Attendance" },
];

export default function AddTeacherDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  const addTeacherAction = async (prevState: any, formData: FormData) => {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;

    const result = await addTeacher(name, email, username, password, role);

    if (result.success) {
      setIsOpen(false);
      setSelectedRole(""); // Reset role selection
      // Reset form by reloading the page or using router.refresh()
      window.location.reload();
    }

    return result;
  };

  const [state, action, isPending] = useActionState(addTeacherAction, null);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Teacher
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Teacher</DialogTitle>
          <DialogDescription className="text-slate-400">
            Enter teacher account details
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-200">Full Name</Label>
            <Input
              name="name"
              required
              className="bg-slate-700/50 border-slate-600 text-white"
              placeholder="Enter full name"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-200">Email</Label>
            <Input
              name="email"
              type="email"
              required
              className="bg-slate-700/50 border-slate-600 text-white"
              placeholder="Enter email"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-200">Username</Label>
            <Input
              name="username"
              required
              className="bg-slate-700/50 border-slate-600 text-white"
              placeholder="Enter username"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-200">Password</Label>
            <Input
              name="password"
              type="password"
              required
              className="bg-slate-700/50 border-slate-600 text-white"
              placeholder="Enter password"
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
          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setSelectedRole("");
              }}
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
                  Adding...
                </>
              ) : (
                "Add Teacher"
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
