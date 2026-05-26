import { useAuth } from "../contexts/useAuth";

function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 text-slate-900">
      <section className="mx-auto flex max-w-6x1 items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase text-blue-600">
            {" "}
            Todo List TC
          </span>
          <h1 className="mt-2 text-3xl font-bold">Olá, {user.username}</h1>
        </div>

        <button
          className="rounded-md bg-slate-200 px-4 py-2 font-bold text-slate-800 transition hover:bg-slate-300"
          type="button"
          onClick={logout}
        >
          Sair
        </button>
      </section>

      <section className="mx-auto mt-8 max-w-6xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <span className="text-xs font-bold uppercase text-blue-600">
          Autenticação validada
        </span>
        <h2 className="mt-3 text-2xl font-bold">
          Próximo passo: tarefas e categorias
        </h2>
        <p className="mt-3 max-w-2xl text-slate-600">
          O login já está integrado ao backend. Agora a interface pode começar a
          consumir o CRUD de tarefas usando o token salvo.
        </p>
      </section>
    </main>
  );
}
export default DashboardPage;
