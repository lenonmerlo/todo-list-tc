import { useAuth } from "./contexts/useAuth";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <DashboardPage /> : <AuthPage />;
}

export default App;
