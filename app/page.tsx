import Link from 'next/link'

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-6">
        Welcome to Epic Fantasy
      </h1>
      <div className="space-y-4">
        <Link 
          href="/auth/login"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          tabIndex={0}
          aria-label="Login to the game"
        >
          Login
        </Link>
        <Link
          href="/auth/register"
          className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ml-4"
          tabIndex={0}
          aria-label="Register new account"
        >
          Register
        </Link>
      </div>
    </div>
  )
}

export default HomePage
