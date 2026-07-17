import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUp, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { useSiteSettings } from '../../hooks/useSupabase';
import { topNav } from './Header';
import { useNavChildren } from '../../hooks/useSupabase';

function NavColumn({ parentLabel }) {
  const { data: children } = useNavChildren(parentLabel);
  if (!children || children.length === 0) return null;
  return (
    <div>
      <h4 className="font-semibold text-base uppercase tracking-wider mb-4 text-white/80">
        {parentLabel}
      </h4>
      <ul className="space-y-3">
        {children.map((child, i) => (
          <li key={i}>
            <Link to={child.path || '#'}
              className="text-base text-gray-400 hover:text-brand-orange transition-colors">
              {child.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { data: settings } = useSiteSettings();

  const phone = settings?.contact_phone || '+91 6380957390';
  const email = settings?.contact_email || 'sales@marvelslice.com';

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 400);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const linkItems = topNav.filter((item) => item.path);
  const columnItems = topNav.filter((item) => !item.path);

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-12">
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-brand-orange mb-4">Marvel Slice</h3>
            <p className="text-base text-gray-400 mb-6 leading-relaxed">
              Empowering careers through expert-led training and hands-on learning experiences.
            </p>
            <div className="space-y-3 text-base text-gray-400">
              <p className="flex items-start gap-3">
                <FiMapPin className="w-5 h-5 mt-0.5 shrink-0 text-brand-orange" />
                <span>123 Tech Park, Chennai, Tamil Nadu, India</span>
              </p>
              <a href={`tel:${phone}`} className="flex items-center gap-3 hover:text-brand-orange transition-colors">
                <FiPhone className="w-5 h-5 shrink-0 text-brand-orange" />
                <span>{phone}</span>
              </a>
              <a href={`mailto:${email}`} className="flex items-center gap-3 hover:text-brand-orange transition-colors">
                <FiMail className="w-5 h-5 shrink-0 text-brand-orange" />
                <span>{email}</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-base uppercase tracking-wider mb-4 text-white/80">Quick Links</h4>
            <ul className="space-y-3">
              {linkItems.map((item, i) => (
                <li key={i}>
                  <Link to={item.path} className="text-base text-gray-400 hover:text-brand-orange transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {columnItems.map((item) => (
            <NavColumn key={item.label} parentLabel={item.label} />
          ))}
        </div>
      </div>

      <div className="bg-brand-orange py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm sm:text-base text-white">
          <span>&copy; Marvel Slice. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <span className="text-white/60">|</span>
            <a href="#" className="hover:underline">Terms of Service</a>
            <span className="text-white/60">|</span>
            <a href="#" className="hover:underline">Designed by Marvel Slice</a>
          </div>
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-brand-blue text-white p-3.5 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
          aria-label="Scroll to top"
        >
          <FiArrowUp className="w-5 h-5" />
        </button>
      )}
    </footer>
  );
}
