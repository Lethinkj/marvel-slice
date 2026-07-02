import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import Hero from '../components/home/Hero';
import KeyHighlights from '../components/home/KeyHighlights';
import CourseTabsNav from '../components/home/CourseTabsNav';
import CourseOverview from '../components/home/CourseOverview';
import PromoBanner from '../components/home/PromoBanner';
import ProjectsSection from '../components/home/ProjectsSection';
import CertificationSection from '../components/home/CertificationSection';
import AlumniCompanies from '../components/home/AlumniCompanies';
import FAQSection from '../components/home/FAQSection';
import RelatedCourses from '../components/home/RelatedCourses';

function buildFallback(course) {
  if (!course) return {};
  return {
    hero: {
      heading: course.title,
      subheading: '',
      content: {
        description: course.description,
        cta_left: course.cta_left || 'Talk to Advisor',
        cta_right: course.cta_right || 'Download Brochure',
        checklist: Array.isArray(course.checklist_items) ? course.checklist_items.join('\n') : '',
        video_url: course.video_url || '',
      },
    },
    highlights: {
      heading: 'Key Highlights',
      content: { items: (course.highlights || []).map((h) => ({ icon: h.icon, label: h.label })) },
    },
    projects: {
      heading: 'Projects',
      content: { items: (course.projects || []).map((p) => ({ title: p.title, description: p.description })) },
    },
    certification: {
      heading: 'Certification',
      content: {
        description: course.certifications?.[0]?.description || '',
        image_url: course.certifications?.[0]?.image_url || '',
        companies: Array.isArray(course.certifications?.[0]?.recognized_companies) ? course.certifications[0].recognized_companies.join('\n') : '',
      },
    },
    overview: {
      heading: 'Course Overview',
      content: {
        description: course.description,
        items: (course.overview_faqs || []).map((f) => ({ question: f.question, answer: f.answer, list_items: f.list_items })),
      },
    },
    faqs: {
      heading: 'Frequently Asked Questions',
      content: { items: (course.faqs || []).map((f) => ({ question: f.question, answer: f.answer })) },
    },
  };
}

export default function Home() {
  const { data: homeSections } = useQuery({
    queryKey: ['homeSections'],
    queryFn: async () => {
      const { data, error } = await supabase.from('home_sections').select('*').order('sort_order');
      if (error) {
        if (error.code === '42P01') return {};
        throw error;
      }
      const map = {};
      (data || []).forEach((s) => { map[s.section_key] = s; });
      return map;
    },
  });

  const { data: course } = useQuery({
    queryKey: ['homeFallbackCourse'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*, highlights(*), overview_faqs(*), projects(*), certifications(*), faqs(*)')
        .eq('is_published', true)
        .limit(1)
        .maybeSingle();
      if (error) return null;
      return data;
    },
    enabled: !homeSections || Object.keys(homeSections).length === 0,
  });

  const fallback = buildFallback(course);
  const hasHomeData = homeSections && Object.keys(homeSections).length > 0;

  function sec(key) {
    return hasHomeData ? homeSections[key] : (fallback[key] || null);
  }

  return (
    <>
      <Hero section={sec('hero')} />
      <KeyHighlights section={sec('highlights')} />
      <CourseTabsNav section={sec('tabs')} />
      <CourseOverview section={sec('overview')} />
      <PromoBanner />
      <ProjectsSection section={sec('projects')} />
      <CertificationSection section={sec('certification')} />
      <AlumniCompanies />
      <FAQSection section={sec('faqs')} />
      <RelatedCourses />
    </>
  );
}
