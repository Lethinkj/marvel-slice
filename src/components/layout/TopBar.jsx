import { FiMail, FiPhone } from 'react-icons/fi';
import { FaTwitter, FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { useSiteSettings } from '../../hooks/useSupabase';

export default function TopBar() {
  const { data: settings } = useSiteSettings();

  const email = settings?.contact_email || 'sales@marvelslice.com';
  const phone = settings?.contact_phone || '+91 6380957390';
  const social = settings?.social_links || {};

  return (
    <div className="bg-brand-blue text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between min-h-[44px] py-1.5">
        <div className="flex items-center gap-5">
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-2 text-sm lg:text-base hover:underline"
          >
            <FiMail className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{email}</span>
          </a>
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-2 text-sm lg:text-base hover:underline"
          >
            <FiPhone className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{phone}</span>
          </a>
        </div>
        <div className="flex items-center gap-4 text-sm lg:text-base">
          <a href="#" className="hover:underline">Login</a>
          <span className="text-white/40">|</span>
          <a href="#" className="hover:underline font-semibold">SIGN UP</a>
          <span className="text-white/40 hidden sm:inline">|</span>
          <div className="items-center gap-3 hidden sm:flex">
            {social.twitter && <a href={social.twitter} aria-label="Twitter"><FaTwitter className="w-4 h-4 hover:text-brand-orange transition-colors" /></a>}
            {social.facebook && <a href={social.facebook} aria-label="Facebook"><FaFacebookF className="w-4 h-4 hover:text-brand-orange transition-colors" /></a>}
            {social.instagram && <a href={social.instagram} aria-label="Instagram"><FaInstagram className="w-4 h-4 hover:text-brand-orange transition-colors" /></a>}
            {social.linkedin && <a href={social.linkedin} aria-label="LinkedIn"><FaLinkedinIn className="w-4 h-4 hover:text-brand-orange transition-colors" /></a>}
          </div>
        </div>
      </div>
    </div>
  );
}
