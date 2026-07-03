import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import TopBar from './components/layout/TopBar';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Blog from './pages/Blog';
import NavPage from './pages/NavPage';
import Admin from './admin/Admin';
import { pageTransition } from './lib/motion';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Fades/slides each page in and out on route changes.
function AnimatedRoutes() {
  const location = useLocation();
  const reduce = useReducedMotion();

  const routes = (
    <Routes location={location}>
      <Route path="/" element={<Home />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<Blog />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/courses/category/:categorySlug" element={<Courses />} />
      <Route path="/courses/:slug" element={<CourseDetail />} />
      <Route path="/:slug" element={<NavPage />} />
    </Routes>
  );

  if (reduce) return routes;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={pageTransition.initial}
        animate={pageTransition.animate}
        exit={pageTransition.exit}
      >
        {routes}
      </motion.div>
    </AnimatePresence>
  );
}

function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <TopBar />
      <Header />
      <main className="flex-1">
        <AnimatedRoutes />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<PublicLayout />} />
        <Route path="/admin/*" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
