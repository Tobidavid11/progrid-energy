import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router/AppRouter";
import { Analytics } from '@vercel/analytics/react';

// import "./variable.css"
// import "./global.css"

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
      <Analytics />
    </BrowserRouter>

  );
}

export default App;