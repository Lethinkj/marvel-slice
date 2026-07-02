-- ============================================================
-- MARVEL SLICE — SEED DATA (run after schema.sql)
-- ============================================================
-- All IDs are deterministic for traceable FK relationships.
-- ============================================================

-- 1. SITE SETTINGS
insert into site_settings (id, logo_url, contact_email, contact_phone, social_links) values
(
  'a0000000-0000-0000-0000-000000000001',
  null,
  'sales@marvelslice.com',
  '+91 6380957390',
  '{"twitter":"https://twitter.com/marvelslice","facebook":"https://facebook.com/marvelslice","instagram":"https://instagram.com/marvelslice","linkedin":"https://linkedin.com/company/marvelslice"}'
);

-- 2. NAV ITEMS — top-level + children; parents are static in code
-- parent_label links each child to its top-level label-based parent.

insert into nav_items (id, parent_id, parent_label, label, path, sort_order, is_active) values
('b0000000-0000-0000-0000-000000000001', null, null, 'Home', '/', 1, true),
('b0000000-0000-0000-0000-000000000002', null, null, 'About', '/about', 2, true),
('b0000000-0000-0000-0000-000000000003', null, null, 'Software Learning', null, 3, true),
('b0000000-0000-0000-0000-000000000004', null, null, 'Competitive Exam', null, 4, true),
('b0000000-0000-0000-0000-000000000005', null, null, 'Services', null, 5, true),
('b0000000-0000-0000-0000-000000000006', null, null, 'Training', null, 6, true),
('b0000000-0000-0000-0000-000000000007', null, null, 'Career', '/career', 7, true),
('b0000000-0000-0000-0000-000000000008', null, null, 'Blog', '/blog', 8, true),
('b0000000-0000-0000-0000-000000000009', null, null, 'Contact', '/contact', 9, true);

-- Software Learning
insert into nav_items (id, parent_id, parent_label, label, path, sort_order) values
('b1000000-0000-0000-0000-000000000001', null, 'Software Learning', 'Full Stack Development', '/courses/category/full-stack-development', 1),
('b1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', null, 'MERN Stack Course', '/courses/mern-stack', 1),
('b1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', null, 'MEAN Stack Course', '/courses/mean-stack', 2),
('b1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', null, 'Java Full Stack', '/courses/java-full-stack', 3);

insert into nav_items (id, parent_id, parent_label, label, path, sort_order) values
('b1000000-0000-0000-0000-000000000005', null, 'Software Learning', 'Front End Development', '/courses/category/front-end-development', 2),
('b1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000005', null, 'Angular Training', '/courses/angular', 1),
('b1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000005', null, 'React JS Training', '/courses/react', 2),
('b1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000005', null, 'Vue JS Training', '/courses/vue', 3);

insert into nav_items (id, parent_id, parent_label, label, path, sort_order) values
('b1000000-0000-0000-0000-000000000009', null, 'Software Learning', 'Back End Development', '/courses/category/back-end-development', 3),
('b1000000-0000-0000-0000-00000000000a', 'b1000000-0000-0000-0000-000000000009', null, 'Node JS Training', '/courses/node', 1),
('b1000000-0000-0000-0000-00000000000b', 'b1000000-0000-0000-0000-000000000009', null, 'Python Django', '/courses/django', 2),
('b1000000-0000-0000-0000-00000000000c', 'b1000000-0000-0000-0000-000000000009', null, 'Spring Boot', '/courses/spring-boot', 3);

insert into nav_items (id, parent_id, parent_label, label, path, sort_order) values
('b1000000-0000-0000-0000-00000000000d', null, 'Software Learning', 'Programming Languages', '/courses/category/programming-languages', 4),
('b1000000-0000-0000-0000-00000000000e', 'b1000000-0000-0000-0000-00000000000d', null, 'Python Course', '/courses/python', 1),
('b1000000-0000-0000-0000-00000000000f', 'b1000000-0000-0000-0000-00000000000d', null, 'Java Course', '/courses/java', 2);

-- Competitive Exam
insert into nav_items (id, parent_id, parent_label, label, path, sort_order) values
('b2000000-0000-0000-0000-000000000001', null, 'Competitive Exam', 'Bank Exams', '/exams/bank-exams', 1),
('b2000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000001', null, 'IBPS PO', '/exams/ibps-po', 1),
('b2000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000001', null, 'SBI Clerk', '/exams/sbi-clerk', 2);

insert into nav_items (id, parent_id, parent_label, label, path, sort_order) values
('b2000000-0000-0000-0000-000000000004', null, 'Competitive Exam', 'SSC Exams', '/exams/ssc-exams', 2),
('b2000000-0000-0000-0000-000000000005', 'b2000000-0000-0000-0000-000000000004', null, 'SSC CGL', '/exams/ssc-cgl', 1),
('b2000000-0000-0000-0000-000000000006', 'b2000000-0000-0000-0000-000000000004', null, 'SSC CHSL', '/exams/ssc-chsl', 2);

insert into nav_items (id, parent_id, parent_label, label, path, sort_order) values
('b2000000-0000-0000-0000-000000000007', null, 'Competitive Exam', 'State PSC', '/exams/tnpsc', 3);

-- Services
insert into nav_items (id, parent_id, parent_label, label, path, sort_order) values
('b3000000-0000-0000-0000-000000000001', null, 'Services', 'Placement Training', '/services/placement', 1),
('b3000000-0000-0000-0000-000000000002', null, 'Services', 'Corporate Training', '/services/corporate', 2),
('b3000000-0000-0000-0000-000000000003', null, 'Services', 'Consultation', '/services/consultation', 3);

-- Training
insert into nav_items (id, parent_id, parent_label, label, path, sort_order) values
('b4000000-0000-0000-0000-000000000001', null, 'Training', 'Online Training', '/training/online', 1),
('b4000000-0000-0000-0000-000000000002', null, 'Training', 'Offline Training', '/training/offline', 2),
('b4000000-0000-0000-0000-000000000003', null, 'Training', 'Self Paced', '/training/self-paced', 3);

-- 3. COURSES
insert into courses (id, slug, title, subtitle, description, checklist_items, cta_left, cta_right, video_url, nav_item_id, is_published) values
(
  'c0000000-0000-0000-0000-000000000001',
  'angular',
  'Angular Training Course',
  null,
  'Master Angular from fundamentals to advanced concepts with expert-led training, real-time projects, and career support.',
  '["Expert-Led Live Training Sessions","Angular Fundamentals to Advanced Concepts","Real-Time Project Development Experience","API Integration and Dynamic Data Handling","Responsive UI Design Using Bootstrap & Angular Material","Career Guidance and Placement Support","Flexible Learning Schedule with Lifetime Access"]',
  'Talk to Advisor',
  'Download Brochure',
  null,
  'b1000000-0000-0000-0000-000000000005',
  true
);
insert into courses (id, slug, title, subtitle, description, checklist_items, nav_item_id, is_published) values
(
  'c0000000-0000-0000-0000-000000000002',
  'react',
  'React JS Training Course',
  null,
  'Build modern UIs with React. Master hooks, state management, and component architecture.',
  '["Expert-Led Live Training","React Hooks & State Management","Real-Time Project Experience","API Integration","Responsive UI Design","Placement Support","Flexible Schedule"]',
  'b1000000-0000-0000-0000-000000000005',
  true
);
insert into courses (id, slug, title, subtitle, description, checklist_items, nav_item_id, is_published) values
(
  'c0000000-0000-0000-0000-000000000003',
  'python',
  'Python Course',
  null,
  'Learn Python from scratch to advanced. Covers data structures, OOP, web scraping, and automation.',
  '["Expert-Led Live Training","Python Fundamentals to Advanced","Real-Time Projects","API Integration","Career Guidance","Lifetime Access"]',
  'b1000000-0000-0000-0000-00000000000d',
  true
);
insert into courses (id, slug, title, subtitle, description, checklist_items, nav_item_id, is_published) values
(
  'c0000000-0000-0000-0000-000000000004',
  'mern-stack',
  'MERN Stack Course',
  null,
  'Become a full-stack developer with MongoDB, Express, React, and Node.js.',
  '["Expert-Led Live Training","Frontend & Backend Development","Real-Time Projects","API Integration","Placement Support"]',
  'b1000000-0000-0000-0000-000000000001',
  true
);

-- 4. HIGHLIGHTS (for Angular)
insert into highlights (id, course_id, icon, label, sort_order) values
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'FiClock', '24 Hrs Instructor Led Training', 1),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'FiVideo', '24 Hrs Self-paced Videos', 2),
('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'FiCode', '48 Hrs Project & Exercises', 3),
('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'FiAward', 'Certification', 4),
('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'FiCalendar', 'Flexible Schedule', 5),
('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', 'FiRefreshCw', 'Lifetime Free Upgrade', 6),
('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000001', 'FiMessageCircle', 'Mentor Support', 7);

-- 5. OVERVIEW FAQS (accordion)
insert into overview_faqs (id, course_id, question, answer, list_items, sort_order) values
(
  'e0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'What will you learn in this Angular certification course?',
  'This course covers building dynamic SPAs with Angular, TypeScript, Angular Router, responsive UI with Bootstrap & Angular Material, templates, directives, pipes, decorators, and dependency injection.',
  '["Building dynamic single-page applications with Angular","TypeScript fundamentals and advanced type system","Angular Router for client-side navigation","Responsive UI design with Bootstrap & Angular Material","Templates, directives, pipes, and decorators","Dependency injection and services architecture"]',
  1
),
(
  'e0000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000001',
  'Who should take this Angular Training? Why should you take this online course?',
  'This course is ideal for front-end developers, full-stack engineers, and IT professionals who want to build scalable web applications with Angular.',
  '[]',
  2
);

-- 6. COURSE FEES
insert into course_fees (id, course_id, plan_name, features, price, currency, cta_label, sort_order) values
(
  'f0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'Self Paced Training',
  '["24 Hrs e-learning videos","Flexible Schedule","Lifetime Free Upgrade"]',
  15048, 'INR', 'Enroll Now', 1
),
(
  'f0000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000001',
  'Corporate Training',
  '["Customized Learning","Enterprise LMS","24/7 Support","Enterprise Reporting"]',
  null, 'INR', 'Contact Us', 2
);

-- 7. PROJECTS
insert into projects (id, course_id, title, description, sort_order) values
(
  '00000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'Bootstrap',
  'Build a responsive Angular application integrated with Bootstrap components for rapid UI development and consistent styling across devices.',
  1
),
(
  '00000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000001',
  'Routing and Navigation',
  'Implement a multi-page Angular application with lazy-loaded modules, nested routes, route guards, and navigation menus.',
  2
),
(
  '00000000-0000-0000-0000-000000000003',
  'c0000000-0000-0000-0000-000000000001',
  'Template Drive Forms',
  'Create a data-entry application using Angular template-driven forms with validation, error handling, and dynamic form controls.',
  3
);

-- 8. CERTIFICATIONS
insert into certifications (id, course_id, description, image_url, certificate_image_url, recognized_companies) values
(
  '10000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'Upon successful completion of the Angular certification course, you will receive a recognized certificate that validates your expertise in Angular development. This certification is valued by over 500+ MNCs worldwide.',
  'https://placehold.co/500x350/1E56C7/white?text=Classroom',
  'https://placehold.co/500x350/0B2D6B/white?text=Certificate',
  '["Google","Amazon","Microsoft","Infosys","Accenture","TCS"]'
);

-- 9. ALUMNI COMPANIES
insert into alumni_companies (id, name, sort_order) values
('20000000-0000-0000-0000-000000000001', 'Google', 1),
('20000000-0000-0000-0000-000000000002', 'Amazon', 2),
('20000000-0000-0000-0000-000000000003', 'Microsoft', 3),
('20000000-0000-0000-0000-000000000004', 'TATA', 4),
('20000000-0000-0000-0000-000000000005', 'Cisco', 5),
('20000000-0000-0000-0000-000000000006', 'Sony', 6),
('20000000-0000-0000-0000-000000000007', 'Infosys', 7),
('20000000-0000-0000-0000-000000000008', 'Accenture', 8),
('20000000-0000-0000-0000-000000000009', 'IBM', 9),
('20000000-0000-0000-0000-00000000000a', 'Wipro', 10),
('20000000-0000-0000-0000-00000000000b', 'TCS', 11),
('20000000-0000-0000-0000-00000000000c', 'Deloitte', 12);

-- 10. GENERAL FAQS
insert into faqs (id, course_id, question, answer, sort_order) values
('30000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Why should I join this Angular Certification Training Course?', 'This course provides comprehensive training from fundamentals to advanced concepts, hands-on project experience, and placement support.', 1),
('30000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Why learn Angular?', 'Angular is one of the most popular front-end frameworks used by enterprises worldwide with powerful features like two-way data binding and dependency injection.', 2),
('30000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'What is the objective of this Angular Training?', 'To equip learners with the skills to build dynamic, responsive single-page applications using Angular, TypeScript, RxJS, and related technologies.', 3),
('30000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'Does Marvel Slice provide free Angular resources?', 'Yes, we provide free Angular resources including introductory videos, blog posts, and downloadable cheat sheets.', 4),
('30000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'What is Angular?', 'Angular is a TypeScript-based open-source front-end web application framework led by Google for building SPAs.', 5),
('30000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', 'What is Angular used for?', 'Angular is used for building dynamic web applications, enterprise-grade SPAs, mobile apps, and progressive web apps.', 6);

-- 11. TAGS
insert into tags (id, name) values
('40000000-0000-0000-0000-000000000001', 'Frontend'),
('40000000-0000-0000-0000-000000000002', 'Backend'),
('40000000-0000-0000-0000-000000000003', 'Full Stack'),
('40000000-0000-0000-0000-000000000004', 'Programming'),
('40000000-0000-0000-0000-000000000005', 'Database'),
('40000000-0000-0000-0000-000000000006', 'Data Science');

-- 12. COURSE TAGS
insert into course_tags (course_id, tag_id) values
('c0000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001'),
('c0000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001'),
('c0000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000004'),
('c0000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000006'),
('c0000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000003');

-- 13. RELATED COURSES
insert into related_courses (id, course_id, related_course_id, rating, review_count, learner_count, sort_order) values
('50000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 4.6, 791, 87800, 1),
('50000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 4.7, 650, 95000, 2);

-- 14. COURSE TABS (for Angular course, content_type drives which panel renders)
insert into course_tabs (id, course_id, label, content_type, content, sort_order) values
(
  '90000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'Overview',
  'overview',
  '{"text":"This Angular certification course covers everything from TypeScript fundamentals to advanced concepts like reactive forms, routing, NgRx state management, and deployment.","list_items":["Building dynamic single-page applications with Angular","TypeScript fundamentals and advanced type system","Angular Router for client-side navigation","Responsive UI design with Bootstrap & Angular Material","Templates, directives, pipes, and decorators","Dependency injection and services architecture"]}',
  1
),
(
  '90000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000001',
  'Syllabus',
  'syllabus',
  '{"text":"Our comprehensive syllabus covers every module needed to become a professional Angular developer."}',
  2
),
(
  '90000000-0000-0000-0000-000000000003',
  'c0000000-0000-0000-0000-000000000001',
  'Pricing',
  'pricing',
  '{}',
  3
),
(
  '90000000-0000-0000-0000-000000000004',
  'c0000000-0000-0000-0000-000000000001',
  'Apply Now',
  'apply_now',
  '{}',
  4
);

-- 15. FOOTER COLUMNS + LINKS
insert into footer_columns (id, title, sort_order) values
('60000000-0000-0000-0000-000000000001', 'About Us', 1),
('60000000-0000-0000-0000-000000000002', 'Services', 2),
('60000000-0000-0000-0000-000000000003', 'Courses', 3),
('60000000-0000-0000-0000-000000000004', 'Connect', 4);

insert into footer_links (id, column_id, label, path, sort_order) values
('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'Our Story', '/about', 1),
('70000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000001', 'Placement Training', '/services/placement', 2),
('70000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000001', 'Certification Courses', '/courses', 3),
('70000000-0000-0000-0000-000000000004', '60000000-0000-0000-0000-000000000001', 'Career', '/career', 4),
('70000000-0000-0000-0000-000000000005', '60000000-0000-0000-0000-000000000001', 'Blog', '/blog', 5),
('70000000-0000-0000-0000-000000000006', '60000000-0000-0000-0000-000000000001', 'Contact', '/contact', 6);

insert into footer_links (id, column_id, label, path, sort_order) values
('70000000-0000-0000-0000-000000000007', '60000000-0000-0000-0000-000000000002', 'Software Learning', '/courses', 1),
('70000000-0000-0000-0000-000000000008', '60000000-0000-0000-0000-000000000002', 'Competitive Exam', '/exams', 2),
('70000000-0000-0000-0000-000000000009', '60000000-0000-0000-0000-000000000002', 'Consultation', '/services/consultation', 3);

insert into footer_links (id, column_id, label, path, sort_order) values
('70000000-0000-0000-0000-00000000000a', '60000000-0000-0000-0000-000000000003', 'Full Stack Development', '/courses/mern-stack', 1),
('70000000-0000-0000-0000-00000000000b', '60000000-0000-0000-0000-000000000003', 'Front End Developer', '/courses/react', 2),
('70000000-0000-0000-0000-00000000000c', '60000000-0000-0000-0000-000000000003', 'Bank Coaching', '/exams', 3),
('70000000-0000-0000-0000-00000000000d', '60000000-0000-0000-0000-000000000003', 'TNPSC', '/exams/tnpsc', 4),
('70000000-0000-0000-0000-00000000000e', '60000000-0000-0000-0000-000000000003', 'SSC', '/exams/ssc-cgl', 5);

insert into footer_links (id, column_id, label, path, sort_order) values
('70000000-0000-0000-0000-00000000000f', '60000000-0000-0000-0000-000000000004', 'Start Course', '/courses', 1),
('70000000-0000-0000-0000-000000000010', '60000000-0000-0000-0000-000000000004', 'Demo Class', '/training/online', 2),
('70000000-0000-0000-0000-000000000011', '60000000-0000-0000-0000-000000000004', 'Join Newsletter', '#', 3),
('70000000-0000-0000-0000-000000000012', '60000000-0000-0000-0000-000000000004', 'Follow Updates', '/blog', 4);

-- 16. NAV PAGES
-- (created via admin /admin/nav-pages/:id)

-- 17. BLOG CATEGORIES
insert into blog_categories (id, name, slug, sort_order) values
('0d000000-0000-0000-0000-000000000001', 'Technology', 'technology', 1),
('0d000000-0000-0000-0000-000000000002', 'Web Development', 'web-development', 2),
('0d000000-0000-0000-0000-000000000003', 'Career Advice', 'career-advice', 3),
('0d000000-0000-0000-0000-000000000004', 'Industry Insights', 'industry-insights', 4);

-- 18. BLOG POSTS
insert into blog_posts (id, title, slug, excerpt, image_url, category_id, author, is_published, is_featured, published_at) values
(
  '0e000000-0000-0000-0000-000000000001',
  'Getting Started with Angular: A Complete Guide for Beginners',
  'getting-started-with-angular',
  'Learn the fundamentals of Angular framework, from setting up your environment to building your first component. This comprehensive guide covers everything you need to know.',
  null,
  '0d000000-0000-0000-0000-000000000002',
  'Admin',
  true, true,
  '2025-06-15T10:00:00Z'
),
(
  '0e000000-0000-0000-0000-000000000002',
  'Top 10 Web Development Trends in 2026',
  'web-development-trends-2026',
  'Stay ahead of the curve with these emerging web development trends. From AI-powered tools to new frameworks, the landscape is evolving rapidly.',
  null,
  '0d000000-0000-0000-0000-000000000001',
  'Admin',
  true, false,
  '2025-06-10T10:00:00Z'
),
(
  '0e000000-0000-0000-0000-000000000003',
  'How to Build a Successful Career in Software Development',
  'successful-career-software-development',
  'Practical tips and strategies for building a rewarding career in software development. Learn about skills, certifications, and networking.',
  null,
  '0d000000-0000-0000-0000-000000000003',
  'Admin',
  true, false,
  '2025-06-05T10:00:00Z'
),
(
  '0e000000-0000-0000-0000-000000000004',
  'Understanding RxJS: Reactive Programming in Angular',
  'understanding-rxjs-angular',
  'Dive deep into RxJS and reactive programming patterns in Angular. Master observables, operators, and state management.',
  null,
  '0d000000-0000-0000-0000-000000000002',
  'Admin',
  true, false,
  '2025-05-28T10:00:00Z'
),
(
  '0e000000-0000-0000-0000-000000000005',
  'The Future of AI in Education',
  'future-of-ai-in-education',
  'Explore how artificial intelligence is transforming education and training. From personalized learning to automated assessments.',
  null,
  '0d000000-0000-0000-0000-000000000004',
  'Admin',
  true, false,
  '2025-05-20T10:00:00Z'
),
(
  '0e000000-0000-0000-0000-000000000006',
  'Why TypeScript is Essential for Modern Web Development',
  'why-typescript-essential',
  'TypeScript has become the standard for large-scale web applications. Discover why it matters and how to get started.',
  null,
  '0d000000-0000-0000-0000-000000000001',
  'Admin',
  true, false,
  '2025-05-15T10:00:00Z'
);

-- 19. BLOG POST TAGS
insert into blog_post_tags (post_id, tag_id) values
('0e000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001'),
('0e000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002'),
('0e000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001'),
('0e000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000001'),
('0e000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000003'),
('0e000000-0000-0000-0000-000000000006', '50000000-0000-0000-0000-000000000001');

-- 20. ADMIN PROFILES
insert into admin_profiles (id, email, full_name, password_hash, role) values
('0a000000-0000-0000-0000-000000000001', 'admin@marvelslice.com', 'Admin', '$2b$10$PLACEHOLDER_HASH', 'admin');

-- 21. PROMO BANNER
insert into promo_banners (id, heading, highlighted_text, subtext, cta_label, cta_link, is_active) values
(
  '80000000-0000-0000-0000-000000000001',
  'Looking for Executive Course? Certification in',
  'Data Science and AI',
  'Learn From IIT Faculty & Industry Experts · 620 Hrs of Applied Learning · 90+ Live Sessions · Placement Assistance',
  'Know More',
  '/courses/data-science',
  true
);

-- 22. HOME SECTIONS (editable from admin /admin/home-page)
insert into home_sections (id, section_key, heading, subheading, content, sort_order) values
(
  '0b000000-0000-0000-0000-000000000001',
  'hero',
  'Master Angular Development',
  'Expert-Led Training with Real-Time Projects',
  '{"description":"Build modern, scalable web applications with Angular. Our comprehensive training takes you from fundamentals to advanced concepts with hands-on projects.","cta_left":"Talk to Advisor","cta_right":"Download Brochure","checklist":"Expert-Led Live Training Sessions\nAngular Fundamentals to Advanced Concepts\nReal-Time Project Development Experience\nAPI Integration and Dynamic Data Handling\nCareer Guidance and Placement Support"}',
  1
),
(
  '0b000000-0000-0000-0000-000000000002',
  'highlights',
  'Key Highlights',
  null,
  '{"items":[{"icon":"FiClock","label":"Industry-recognized Certification"},{"icon":"FiVideo","label":"50+ Hours of Live Training"},{"icon":"FiCode","label":"Hands-on Coding Exercises"},{"icon":"FiAward","label":"Placement Assistance"},{"icon":"FiCalendar","label":"Flexible Schedule"},{"icon":"FiRefreshCw","label":"Lifetime Access & Updates"},{"icon":"FiMessageCircle","label":"1-on-1 Mentorship"}]}',
  2
),
(
  '0b000000-0000-0000-0000-000000000003',
  'projects',
  'Angular Projects',
  null,
  '{"items":[{"title":"Bootstrap","description":"Build a responsive Angular application integrated with Bootstrap components for rapid UI development and consistent styling across devices."},{"title":"Routing and Navigation","description":"Implement a multi-page Angular application with lazy-loaded modules, nested routes, route guards, and navigation menus."},{"title":"Template Driven Forms","description":"Create a data-entry application using Angular template-driven forms with validation, error handling, and dynamic form controls."}]}',
  3
),
(
  '0b000000-0000-0000-0000-000000000004',
  'certification',
  'Certification',
  null,
  '{"description":"Earn a recognized certificate upon completion that validates your Angular development skills and boosts your career prospects.","image_url":"https://placehold.co/400x300/0B2D6B/white?text=Certificate","companies":"Google\nMicrosoft\nAmazon\nTCS\nInfosys"}',
  4
),
(
  '0b000000-0000-0000-0000-000000000005',
  'faqs',
  'Frequently Asked Questions',
  null,
  '{"items":[{"question":"What are the prerequisites for this course?","answer":"Basic knowledge of HTML, CSS, and JavaScript is recommended. Familiarity with any programming language is helpful."},{"question":"How long is the course duration?","answer":"The course runs for 8 weeks with 6-8 hours of weekly commitment including live sessions and self-paced practice."},{"question":"Will I get a certificate?","answer":"Yes, you will receive a certificate upon successful completion of the course and projects."}]}',
  5
);
