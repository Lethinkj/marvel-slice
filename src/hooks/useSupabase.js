import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

/* ---------- top-level nav items (from DB) ---------- */

export function useTopNavItems() {
  return useQuery({
    queryKey: ['topNavItems'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nav_items')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      const filtered = (data || []).filter((item) => {
        console.log('topNav item:', item.label, '| parent_id:', JSON.stringify(item.parent_id), '| parent_label:', JSON.stringify(item.parent_label));
        return !item.parent_id && !item.parent_label;
      });
      console.log('topNav filtered:', filtered.map((i) => i.label));
      return filtered;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/* ---------- nav children by static parent label ---------- */

function buildIdSubtree(allItems, pid) {
  return allItems
    .filter((item) => item.parent_id === pid)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => ({
      ...item,
      children: buildIdSubtree(allItems, item.id),
    }));
}

export function useNavChildren(parentLabel) {
  return useQuery({
    queryKey: ['navChildren', parentLabel],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nav_items')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      const all = data || [];
      return all
        .filter((item) => item.parent_label === parentLabel)
        .map((item) => ({
          ...item,
          children: buildIdSubtree(all, item.id),
        }));
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!parentLabel,
  });
}

/* ---------- full course page data (single query) ---------- */

export function useCourse(slug) {
  return useQuery({
    queryKey: ['course', slug],
    queryFn: async () => {
      const { data: course, error } = await supabase
        .from('courses')
        .select(
          `*,
          highlights(*),
          overview_faqs(*),
          course_fees(*),
          projects(*),
          certifications(*)`
        )
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();
      if (error) throw error;
      if (!course) return null;

      const [tabsRes, faqsRes] = await Promise.all([
        supabase.from('course_tabs').select('*').eq('course_id', course.id).order('sort_order'),
        supabase.from('faqs').select('*').eq('course_id', course.id).order('sort_order'),
      ]);

      return { ...course, course_tabs: tabsRes.data || [], faqs: faqsRes.data || [] };
    },
    enabled: !!slug,
  });
}

/* ---------- related courses ---------- */

async function fetchLatestCourses() {
  const { data } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(4);
  return data || [];
}

export function useRelatedCourses(courseId) {
  return useQuery({
    queryKey: ['relatedCourses', courseId],
    queryFn: async () => {
      const { data: tagsData } = await supabase
        .from('course_tags')
        .select('tag_id')
        .eq('course_id', courseId);

      if (!tagsData || tagsData.length === 0) return [];

      const tagIds = tagsData.map((t) => t.tag_id);
      const { data: tagged } = await supabase
        .from('course_tags')
        .select('course_id')
        .in('tag_id', tagIds)
        .neq('course_id', courseId);

      if (!tagged || tagged.length === 0) return [];

      const relatedIds = [...new Set(tagged.map((t) => t.course_id))];
      const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .in('id', relatedIds)
        .eq('is_published', true);

      return courses || [];
    },
    enabled: !!courseId,
  });
}

/* ---------- alumni companies ---------- */

export function useAlumniCompanies() {
  return useQuery({
    queryKey: ['alumniCompanies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alumni_companies')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });
}

/* ---------- footer ---------- */

export function useFooter() {
  return useQuery({
    queryKey: ['footer'],
    queryFn: async () => {
      const { data: columns, error } = await supabase
        .from('footer_columns')
        .select('*, footer_links(*)')
        .order('sort_order');
      if (error) throw error;
      return columns;
    },
  });
}

/* ---------- site settings (top bar + social) ---------- */

export function useSiteSettings() {
  return useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

/* ---------- promo banner ---------- */

export function usePromoBanner() {
  return useQuery({
    queryKey: ['promoBanner'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promo_banners')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

/* ---------- course tabs (labels + content type) ---------- */

export function useCourseTabs(courseId) {
  return useQuery({
    queryKey: ['courseTabs', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_tabs')
        .select('*')
        .eq('course_id', courseId)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });
}

/* ---------- course FAQs ---------- */

export function useFAQs(courseId) {
  return useQuery({
    queryKey: ['faqs', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('course_id', courseId)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });
}

/* ---------- nav category pages ---------- */

export function useNavPage(navItemId) {
  return useQuery({
    queryKey: ['navPage', navItemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nav_pages')
        .select('*')
        .eq('nav_item_id', navItemId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!navItemId,
  });
}


/* ---------- home page sections ---------- */

export function useHomeSection(sectionKey) {
  return useQuery({
    queryKey: ['homeSection', sectionKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_sections')
        .select('*')
        .eq('section_key', sectionKey)
        .maybeSingle();
      if (error) {
        if (error.code === '42P01') return null;
        throw error;
      }
      return data;
    },
    enabled: !!sectionKey,
  });
}

export function useHomeSections() {
  return useQuery({
    queryKey: ['homeSections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_sections')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }
      return data || [];
    },
  });
}
