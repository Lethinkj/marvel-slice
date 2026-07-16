import { useParams, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import CourseCard from '../components/ui/CourseCard';
import Reveal, { Stagger, StaggerItem } from '../components/ui/Reveal';
import { FiArrowLeft, FiCheckCircle, FiMapPin, FiPhone, FiMail, FiBriefcase } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useState } from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

function AccordionItem({ title, children, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen || false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-dark-navy hover:bg-gray-50 transition-colors gap-4">
        <span className="text-base lg:text-lg leading-snug flex-1">{title}</span>
        <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
          {open ? <FiMinus className="w-4 h-4" /> : <FiPlus className="w-4 h-4" />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="content" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
            <div className="px-6 pb-5 text-text-gray leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionRenderer({ section }) {
  switch (section.section_type) {
    case 'text':
      return (
        <Reveal className="max-w-3xl mx-auto">
          {section.heading && <h2 className="text-xl sm:text-2xl font-bold text-dark-navy mb-4">{section.heading}</h2>}
          {section.content && <div className="text-text-gray text-base leading-relaxed whitespace-pre-line">{section.content}</div>}
        </Reveal>
      );
    case 'image':
      return (
        <Reveal className="max-w-4xl mx-auto text-center">
          {section.heading && <h2 className="text-xl sm:text-2xl font-bold text-dark-navy mb-4">{section.heading}</h2>}
          {section.image_url && <img src={section.image_url} alt={section.heading || ''} className="w-full max-h-96 object-cover rounded-xl shadow-sm" />}
          {section.content && <p className="text-text-gray text-base mt-4">{section.content}</p>}
        </Reveal>
      );
    case 'cards':
      return (
        <div>
          {section.heading && <Reveal as="h2" className="text-xl sm:text-2xl font-bold text-dark-navy mb-6 text-center">{section.heading}</Reveal>}
          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(section.content || '').split('\n').filter(Boolean).map((item, i) => (
              <StaggerItem key={i} className="h-full">
                <Card className="p-6">
                  {section.image_url && <img src={section.image_url} alt="" className="w-full h-40 object-cover rounded-lg mb-4" />}
                  <p className="text-dark-navy font-medium">{item}</p>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      );
    case 'features':
      return (
        <div className="max-w-3xl mx-auto">
          {section.heading && <Reveal as="h2" className="text-xl sm:text-2xl font-bold text-dark-navy mb-6 text-center">{section.heading}</Reveal>}
          <Stagger className="space-y-4">
            {(section.items || (section.content || '').split('\n').filter(Boolean)).map((item, i) => (
              <StaggerItem key={i} className="flex items-start gap-3">
                <FiCheckCircle className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
                <span className="text-text-gray text-base">{(typeof item === 'string') ? item : item.title}</span>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      );
    case 'stats_row':
      return (
        <Reveal>
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
            {(section.items || []).map((stat, i) => (
              <div key={i} className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="text-3xl sm:text-4xl font-extrabold text-brand-accent">{stat.number}</div>
                <div className="text-sm text-text-gray mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      );
    case 'team_grid':
      return (
        <div>
          {section.heading && <Reveal as="h2" className="text-xl sm:text-2xl font-bold text-dark-navy mb-8 text-center">{section.heading}</Reveal>}
          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {(section.items || []).map((member, i) => (
              <StaggerItem key={i} className="h-full">
                <Card className="p-6 text-center h-full">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-brand-blue to-brand-accent flex items-center justify-center text-white text-2xl font-bold mb-3 overflow-hidden">
                    {member.image_url ? <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" /> : (member.name?.[0] || '?')}
                  </div>
                  <h3 className="font-bold text-dark-navy">{member.name}</h3>
                  <p className="text-sm text-brand-accent font-medium mt-0.5">{member.role}</p>
                  {member.bio && <p className="text-xs text-text-gray mt-2 line-clamp-3">{member.bio}</p>}
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      );
    case 'contact_info':
      return (
        <Reveal className="max-w-lg mx-auto">
          {section.heading && <h2 className="text-xl sm:text-2xl font-bold text-dark-navy mb-6 text-center">{section.heading}</h2>}
          <div className="space-y-4">
            {section.address && <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center shrink-0"><FiMapPin className="w-5 h-5 text-brand-accent" /></div><div className="text-text-gray text-base whitespace-pre-line">{section.address}</div></div>}
            {section.phone && <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center shrink-0"><FiPhone className="w-5 h-5 text-brand-accent" /></div><a href={`tel:${section.phone}`} className="text-text-gray text-base hover:text-brand-accent transition-colors">{section.phone}</a></div>}
            {section.email && <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center shrink-0"><FiMail className="w-5 h-5 text-brand-accent" /></div><a href={`mailto:${section.email}`} className="text-text-gray text-base hover:text-brand-accent transition-colors">{section.email}</a></div>}
          </div>
        </Reveal>
      );
    case 'map_embed': {
      const raw = section.content || '';
      const match = raw.match(/src=["']([^"']+)["']/);
      const mapSrc = (match ? match[1] : raw).trim();
      if (!mapSrc) return null;
      return (
        <Reveal>
          {section.heading && <h2 className="text-xl sm:text-2xl font-bold text-dark-navy mb-6 text-center">{section.heading}</h2>}
          <div className="max-w-5xl mx-auto rounded-xl overflow-hidden shadow-sm border border-gray-200">
            <div className="relative w-full aspect-[16/9] max-h-[450px]">
              <iframe
                src={mapSrc}
                className="absolute inset-0 w-full h-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Map"
              />
            </div>
          </div>
        </Reveal>
      );
    }
    case 'faq_list':
      return (
        <Reveal className="w-full max-w-[70%] mx-auto">
          {section.heading && <h2 className="text-xl sm:text-2xl font-bold text-dark-navy mb-6 text-center">{section.heading}</h2>}
          <div className="space-y-2">
            {(section.items || []).map((faq, i) => (
              <AccordionItem key={i} title={faq.question}>{faq.answer}</AccordionItem>
            ))}
          </div>
        </Reveal>
      );
    case 'positions':
      return (
        <div>
          {section.heading && <Reveal as="h2" className="text-xl sm:text-2xl font-bold text-dark-navy mb-8 text-center">{section.heading}</Reveal>}
          <Stagger className="max-w-4xl mx-auto space-y-4">
            {(section.items || []).map((pos, i) => (
              <StaggerItem key={i}>
                <Card className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-dark-navy text-lg">{pos.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-text-gray">
                      {pos.location && <span className="flex items-center gap-1"><FiMapPin className="w-3.5 h-3.5" />{pos.location}</span>}
                      {pos.type && <span className="flex items-center gap-1"><FiBriefcase className="w-3.5 h-3.5" />{pos.type}</span>}
                    </div>
                    {pos.description && <p className="text-sm text-text-gray mt-3">{pos.description}</p>}
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0">Apply Now</Button>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      );
    case 'cta':
      return (
        <Reveal variant="scale" className="bg-gradient-to-r from-brand-blue to-brand-accent rounded-xl p-6 sm:p-8 text-center text-white">
          {section.heading && <h2 className="text-xl sm:text-2xl font-bold mb-3">{section.heading}</h2>}
          {section.content && <p className="text-white/80 text-base mb-6">{section.content}</p>}
          {section.image_url && (
            <Button to={section.image_url} variant="outline" size="lg">
              {section.heading || 'Learn More'}
            </Button>
          )}
        </Reveal>
      );
    default:
      return null;
  }
}

export default function NavPage() {
  const { slug } = useParams();
  const splat = useParams()['*'];
  const path = splat ? `/${slug}/${splat}` : `/${slug}`;

  const { data, isLoading } = useQuery({
    queryKey: ['navPageData', path],
    queryFn: async () => {
      const { data: navItems } = await supabase
        .from('nav_items')
        .select('id, label')
        .eq('path', path)
        .eq('is_active', true)
        .order('id')
        .limit(1);
      const navItem = navItems?.[0] || null;
      if (!navItem) return null;

      const [pageRes, directCoursesRes, childItemsRes] = await Promise.all([
        supabase.from('nav_pages').select('*').eq('nav_item_id', navItem.id).eq('is_published', true).order('id').limit(1),
        supabase.from('courses').select('*').eq('nav_item_id', navItem.id).eq('is_published', true).order('created_at', { ascending: false }),
        supabase.from('nav_items').select('id').eq('parent_id', navItem.id).eq('is_active', true),
      ]);

      const directCourses = directCoursesRes.data || [];
      const childIds = (childItemsRes.data || []).map(c => c.id);
      let childCourses = [];
      if (childIds.length > 0) {
        const { data } = await supabase.from('courses').select('*').in('nav_item_id', childIds).eq('is_published', true).order('created_at', { ascending: false });
        childCourses = data || [];
      }

      const allCourses = [...directCourses, ...childCourses];
      const unique = allCourses.filter((c, i, a) => a.findIndex(x => x.id === c.id) === i);

      const pageData = pageRes.data?.[0] || null;
      const page = pageData ? { ...pageData, courses: unique, navLabel: navItem.label } : { courses: unique, navLabel: navItem.label };
      return page;
    },
    enabled: !!path,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  const hasContent = data && (data.heading || data.subheading || data.sections?.length > 0 || data.courses?.length > 0);

  if (!hasContent) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-dark-navy mb-4">Page Not Found</h1>
        <p className="text-text-gray mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/" className="inline-flex items-center gap-2 text-brand-accent hover:underline"><FiArrowLeft className="w-4 h-4" /> Back to Home</Link>
      </div>
    );
  }

  return (
    <div>
      {data.hero_image && (
        <div className="h-48 sm:h-72 lg:h-96 w-full overflow-hidden"><img src={data.hero_image} alt="" className="w-full h-full object-cover" /></div>
      )}

      {(data.heading || data.subheading) && (
        <Reveal className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          {data.heading && <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark-navy mb-4">{data.heading}</h1>}
          {data.subheading && <p className="text-base sm:text-lg text-text-gray max-w-2xl mx-auto">{data.subheading}</p>}
        </Reveal>
      )}

      {!data.heading && !data.subheading && data.courses?.length > 0 && (
        <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark-navy mb-4">{data.navLabel}</h1>
          <p className="text-base sm:text-lg text-text-gray max-w-2xl mx-auto">Explore our {data.navLabel?.toLowerCase()} courses</p>
        </Reveal>
      )}

      {data.sections?.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-12 sm:space-y-16">
          {data.sections.map((section, i) => <SectionRenderer key={i} section={section} />)}
        </div>
      )}

      {data.courses?.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
          <Reveal as="h2" className="text-xl sm:text-2xl font-bold text-dark-navy mb-6 sm:mb-8">
            {data.navLabel ? `${data.navLabel} Courses` : 'Available Courses'}
          </Reveal>
          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.courses.map((course) => (
              <StaggerItem key={course.id} className="h-full">
                <CourseCard course={course} variant="image" showReviewCount />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      )}
    </div>
  );
}
