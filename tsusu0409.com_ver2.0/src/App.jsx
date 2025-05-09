import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Top from './pages/Top';
import Blogs from './pages/Blogs';
import Header from './components/Header'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Top />} />
        <Route path="/blogs" element={<Blogs />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
