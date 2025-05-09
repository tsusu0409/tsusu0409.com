import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Top from './pages/Top';
import Blogs from './pages/Blogs';
import Works from './pages/Works';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Top />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/works" element={<Works />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
