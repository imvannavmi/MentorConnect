insert into public.mentoring_categories (name, slug, description) values
  ('Software Engineering', 'software-engineering', 'Build practical engineering skills and ship reliable software.'),
  ('Product & Design', 'product-design', 'Shape useful products and thoughtful user experiences.'),
  ('Career Growth', 'career-growth', 'Navigate interviews, career choices, and professional transitions.'),
  ('Leadership', 'leadership', 'Grow your leadership, communication, and team-building skills.'),
  ('Data & AI', 'data-ai', 'Explore analytics, machine learning, and responsible AI.'),
  ('Entrepreneurship', 'entrepreneurship', 'Turn an idea into a focused and sustainable business.')
on conflict (slug) do nothing;

insert into public.skills (name, slug) values
  ('React', 'react'),
  ('TypeScript', 'typescript'),
  ('Backend Engineering', 'backend-engineering'),
  ('System Design', 'system-design'),
  ('Product Strategy', 'product-strategy'),
  ('UX Research', 'ux-research'),
  ('Interaction Design', 'interaction-design'),
  ('Portfolio Reviews', 'portfolio-reviews'),
  ('Interview Preparation', 'interview-preparation'),
  ('Career Transitions', 'career-transitions'),
  ('Public Speaking', 'public-speaking'),
  ('Team Leadership', 'team-leadership'),
  ('Data Analysis', 'data-analysis'),
  ('Machine Learning', 'machine-learning'),
  ('Entrepreneurship', 'entrepreneurship'),
  ('Business Planning', 'business-planning')
on conflict (slug) do nothing;
