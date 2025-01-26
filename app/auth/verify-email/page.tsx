const VerifyEmailPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 text-center shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="text-gray-600 dark:text-gray-400">
          We've sent you an email with a link to verify your account. Please check your inbox and follow the instructions.
        </p>
      </div>
    </div>
  )
}

export default VerifyEmailPage 