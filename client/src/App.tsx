
import AuthForm from './components/AuthForm';
import Counter from './components/Counter';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user } = useAuth();
  
  return (
    <div>
      <h1>Mini Counter App</h1>
      <AuthForm />
      {user && <Counter user={user} />}
    </div>
  );
}