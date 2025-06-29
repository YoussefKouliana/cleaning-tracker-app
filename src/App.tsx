// src/App.tsx
import { LanguageProvider } from './contexts/LanguageContext';
import CleaningTracker from './components/CleaningTracker';
import './index.css';

function App() {
  return (
    <LanguageProvider>
      <CleaningTracker />
    </LanguageProvider>
  );
}

export default App;