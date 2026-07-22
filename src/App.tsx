import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router/AppRouter";
// import "./variable.css"
// import "./global.css"

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;