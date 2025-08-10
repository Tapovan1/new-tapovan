"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, AlertCircle, Loader2, LogIn } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginFormProps {
  loginAction: (
    prevState: { error?: string; success?: boolean } | null,
    formData: FormData
  ) => Promise<{ error?: string; success?: boolean }>;
}

const initialState = { error: undefined, success: false };

export default function LoginForm({ loginAction }: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <div>
      <form action={formAction} className="space-y-6">
        {state.error && (
          <Alert className="bg-red-500/10 border-red-500/20 text-red-400 dark:bg-red-900/20 dark:border-red-700/40 dark:text-red-300 transition-colors duration-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2 text-sm font-medium">
              {state.error}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <Label
            htmlFor="username"
            className="text-slate-700 dark:text-gray-200 font-medium flex items-center transition-colors duration-300"
          >
            Username
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-gray-400 transition-colors duration-300" />
            <Input
              id="username"
              name="username"
              placeholder="Enter your username"
              type="text"
              required
              className="pl-10 h-12 bg-white dark:bg-gray-700 border-slate-200 dark:border-gray-600 text-slate-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:border-slate-300 dark:hover:border-gray-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label
            htmlFor="password"
            className="text-slate-700 dark:text-gray-200 font-medium flex items-center transition-colors duration-300"
          >
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-gray-400 transition-colors duration-300" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              className="pl-10 h-12 bg-white dark:bg-gray-700 border-slate-200 dark:border-gray-600 text-slate-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:border-slate-300 dark:hover:border-gray-500"
            />
          </div>
        </div>

        <div className="pt-6">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="h-5 w-5 mr-3 animate-spin" />
          Signing in...
        </>
      ) : (
        <>
          <LogIn className="w-5 h-5 mr-3" />
          Sign In to Dashboard
        </>
      )}
    </Button>
  );
}
