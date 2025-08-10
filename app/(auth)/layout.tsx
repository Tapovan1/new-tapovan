import "../globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <main className="flex-grow container flex items-center justify-center mx-auto max-w-7xl ">
        {children}
      </main>
    </div>
  );
}
