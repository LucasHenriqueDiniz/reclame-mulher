import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 space-y-6">
      <h1 className="text-4xl font-bold">Reclame Mulher</h1>
      <p className="text-lg text-center max-w-md opacity-80">
        Plataforma de denúncias e reclamações
      </p>
      
      <div className="flex gap-4">
        <Link 
          href="/login"
          className="px-6 py-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Entrar
        </Link>
        <Link 
          href="/register"
          className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-80 transition-opacity"
        >
          Criar conta
        </Link>
      </div>
    </main>
  );
}

