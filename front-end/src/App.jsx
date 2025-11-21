import Chat from "./components/Chat";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-gold-500/30">
      <Navbar />
      <Chat />
    </div>
  );
}

export default App;
