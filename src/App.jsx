import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Top from './pages/Top';
import Blogs from './pages/Blogs';
import Works from './pages/Works';
import BlogPost from './pages/BlogPost';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Top />} />
        <Route path="/blog" element={<Blogs />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/works" element={<Works />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
