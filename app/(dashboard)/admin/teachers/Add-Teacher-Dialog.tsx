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
import { Plus, Loader2, UserPlus } from "lucide-react";
import { addTeacher } from "@/lib/actions/teacher.action";

const TEACHER_ROLES = [
  { value: "ADMIN", label: "Admin", description: "Full system access" },
  { value: "TEACHER", label: "Teacher", description: "Teaching and grading" },
  {
    value: "ATEACHER",
    label: "Attendance",
    description: "Attendance management",
  },
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
        <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300">
          <Plus className="h-4 w-4 mr-2" />
          Add Teacher
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-md backdrop-blur-sm">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-foreground text-xl">
                Add New Teacher
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Create a new teacher account with role permissions
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form action={action} className="space-y-5 mt-6">
          <div className="space-y-2">
            <Label className="text-foreground font-medium">Full Name</Label>
            <Input
              name="name"
              required
              className="bg-background/50 border-border/50 text-foreground focus:border-primary/50 transition-colors"
              placeholder="Enter full name"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground font-medium">Email Address</Label>
            <Input
              name="email"
              type="email"
              required
              className="bg-background/50 border-border/50 text-foreground focus:border-primary/50 transition-colors"
              placeholder="Enter email address"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground font-medium">Username</Label>
            <Input
              name="username"
              required
              className="bg-background/50 border-border/50 text-foreground focus:border-primary/50 transition-colors"
              placeholder="Enter username"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground font-medium">Password</Label>
            <Input
              name="password"
              type="password"
              required
              className="bg-background/50 border-border/50 text-foreground focus:border-primary/50 transition-colors"
              placeholder="Enter secure password"
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
              onClick={() => {
                setIsOpen(false);
                setSelectedRole("");
              }}
              className="border-border/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Teacher
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
