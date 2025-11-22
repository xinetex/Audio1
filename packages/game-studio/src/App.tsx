import { Game } from './components/Game';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <h1>ThunderVerse</h1>
        </div>
        <p className="tagline">AI-Powered Social Gaming Platform</p>
      </header>

      <main className="app-main">
        <Game />
      </main>

      <footer className="app-footer">
        <p>Built with PixiJS • Powered by AI • Community-Driven</p>
      </footer>
    </div>
  );
}

export default App;
