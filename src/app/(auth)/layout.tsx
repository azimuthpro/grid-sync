export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">GridSync</h1>
          <p className="text-gray-600 mt-2">Zarządzanie energią dla prosumentów</p>
        </div>
        {children}
      </div>
    </div>
  )
}