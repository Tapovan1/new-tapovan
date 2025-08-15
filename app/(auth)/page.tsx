import LoginForm from "./Form";
import { login } from "@/lib/actions/auth.action";

export default function LoginPage() {
  async function loginAction(prevState: unknown, formData: FormData) {
    "use server";
    const data = await login(formData);
    if (data?.success) {
      return { success: true, error: undefined };
    }
    return {
      error: "Login Failed. Please check your credentials and Try again",
      success: false,
    };
  }

  return (
    <div className="min-h-screen flex items-center justify-center  p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Login Form Card */}
        <div className=" rounded-lg shadow-md border border-slate-200 dark:border-gray-700 p-8 transition-colors duration-300">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-gray-100 mb-2 transition-colors duration-300">
              Welcome Back
              <div className="w-10 h-1 bg-blue-600 rounded-full mx-auto mt-1"></div>
            </h1>
            <p className="text-slate-600 dark:text-gray-300 text-sm mb-4 transition-colors duration-300">
              Enter your credentials below to access your account
            </p>
            <h2 className="text-blue-600 dark:text-blue-400 text-lg font-semibold transition-colors duration-300">
              Tapovan School
            </h2>
            <p className="text-slate-500 dark:text-gray-400 text-xs transition-colors duration-300">
              Please login to continue
            </p>
          </div>

          <LoginForm loginAction={loginAction} />
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-slate-500 dark:text-gray-400 text-sm transition-colors duration-300">
            Need help?{" "}
            <span className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors cursor-pointer">
              Contact your administrator
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
