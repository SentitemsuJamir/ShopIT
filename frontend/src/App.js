import "./App.css";
import Footer from "./components/layouts/Footer";
import Header from "./components/layouts/Header";
import {BrowserRouter as Router, Routes} from 'react-router-dom';
import {Toaster} from 'react-hot-toast';
import useUserRoutes from "./components/routes/userRoutes.jsx";
import useAdminRoutes from "./components/routes/adminRoutes.jsx";




function App() {

  const userRoutes =useUserRoutes();
  const adminRoutes= useAdminRoutes();
  return (
    <Router>
    <div className="App">
      <Toaster position="top-center" />
     <Header />
     <div className="container"> 
      <Routes>
       {userRoutes}
       {adminRoutes}
       </Routes>
      </div>
     <Footer />
    </div>
    </Router>
    
  );
}

export default App;
