export default function Dashboard() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">כלים</h1>
        <div className="flex gap-4 justify-center pt-4">
          <a
            href="/translate"
            className="px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 transition-colors text-sm"
          >
            אפליקציית רומנית
          </a>
          <a
            href="/keys"
            className="px-6 py-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm"
          >
            KeyFix למק
          </a>
        </div>
      </div>
    </div>
  );
}
