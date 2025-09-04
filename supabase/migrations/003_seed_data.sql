-- Insert countries
INSERT INTO countries (id, name, code, flag_url) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Sénégal', 'SN', '🇸🇳'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Côte d''Ivoire', 'CI', '🇨🇮'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Mali', 'ML', '🇲🇱'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Burkina Faso', 'BF', '🇧🇫'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Niger', 'NE', '🇳🇪');

-- Insert series for each country
-- Sénégal series
INSERT INTO series (id, name, description, country_id) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'S1', 'Première Scientifique', '550e8400-e29b-41d4-a716-446655440001'),
  ('650e8400-e29b-41d4-a716-446655440002', 'S2', 'Sciences Physiques', '550e8400-e29b-41d4-a716-446655440001'),
  ('650e8400-e29b-41d4-a716-446655440003', 'L1', 'Littéraire 1', '550e8400-e29b-41d4-a716-446655440001'),
  ('650e8400-e29b-41d4-a716-446655440004', 'L2', 'Littéraire 2', '550e8400-e29b-41d4-a716-446655440001'),
  ('650e8400-e29b-41d4-a716-446655440005', 'ES', 'Économique et Social', '550e8400-e29b-41d4-a716-446655440001');

-- Côte d'Ivoire series  
INSERT INTO series (id, name, description, country_id) VALUES
  ('650e8400-e29b-41d4-a716-446655440006', 'S1', 'Première Scientifique', '550e8400-e29b-41d4-a716-446655440002'),
  ('650e8400-e29b-41d4-a716-446655440007', 'S2', 'Sciences Physiques', '550e8400-e29b-41d4-a716-446655440002'),
  ('650e8400-e29b-41d4-a716-446655440008', 'L1', 'Littéraire 1', '550e8400-e29b-41d4-a716-446655440002'),
  ('650e8400-e29b-41d4-a716-446655440009', 'L2', 'Littéraire 2', '550e8400-e29b-41d4-a716-446655440002'),
  ('650e8400-e29b-41d4-a716-446655440010', 'ES', 'Économique et Social', '550e8400-e29b-41d4-a716-446655440002');

-- Mali series
INSERT INTO series (id, name, description, country_id) VALUES
  ('650e8400-e29b-41d4-a716-446655440011', 'S1', 'Première Scientifique', '550e8400-e29b-41d4-a716-446655440003'),
  ('650e8400-e29b-41d4-a716-446655440012', 'S2', 'Sciences Physiques', '550e8400-e29b-41d4-a716-446655440003'),
  ('650e8400-e29b-41d4-a716-446655440013', 'L1', 'Littéraire 1', '550e8400-e29b-41d4-a716-446655440003'),
  ('650e8400-e29b-41d4-a716-446655440014', 'L2', 'Littéraire 2', '550e8400-e29b-41d4-a716-446655440003'),
  ('650e8400-e29b-41d4-a716-446655440015', 'ES', 'Économique et Social', '550e8400-e29b-41d4-a716-446655440003');

-- Burkina Faso series
INSERT INTO series (id, name, description, country_id) VALUES
  ('650e8400-e29b-41d4-a716-446655440016', 'S1', 'Première Scientifique', '550e8400-e29b-41d4-a716-446655440004'),
  ('650e8400-e29b-41d4-a716-446655440017', 'S2', 'Sciences Physiques', '550e8400-e29b-41d4-a716-446655440004'),
  ('650e8400-e29b-41d4-a716-446655440018', 'L1', 'Littéraire 1', '550e8400-e29b-41d4-a716-446655440004'),
  ('650e8400-e29b-41d4-a716-446655440019', 'L2', 'Littéraire 2', '550e8400-e29b-41d4-a716-446655440004'),
  ('650e8400-e29b-41d4-a716-446655440020', 'ES', 'Économique et Social', '550e8400-e29b-41d4-a716-446655440004');

-- Niger series
INSERT INTO series (id, name, description, country_id) VALUES
  ('650e8400-e29b-41d4-a716-446655440021', 'S1', 'Première Scientifique', '550e8400-e29b-41d4-a716-446655440005'),
  ('650e8400-e29b-41d4-a716-446655440022', 'S2', 'Sciences Physiques', '550e8400-e29b-41d4-a716-446655440005'),
  ('650e8400-e29b-41d4-a716-446655440023', 'L1', 'Littéraire 1', '550e8400-e29b-41d4-a716-446655440005'),
  ('650e8400-e29b-41d4-a716-446655440024', 'L2', 'Littéraire 2', '550e8400-e29b-41d4-a716-446655440005'),
  ('650e8400-e29b-41d4-a716-446655440025', 'ES', 'Économique et Social', '550e8400-e29b-41d4-a716-446655440005');

-- Insert subjects
INSERT INTO subjects (id, name, description, color, icon) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', 'Mathématiques', 'Mathematics and numerical analysis', '#3B82F6', 'calculator'),
  ('750e8400-e29b-41d4-a716-446655440002', 'Physique', 'Physics and applied sciences', '#8B5CF6', 'zap'),
  ('750e8400-e29b-41d4-a716-446655440003', 'Chimie', 'Chemistry and molecular science', '#10B981', 'flask-conical'),
  ('750e8400-e29b-41d4-a716-446655440004', 'Biologie', 'Biology and life sciences', '#059669', 'leaf'),
  ('750e8400-e29b-41d4-a716-446655440005', 'Français', 'French language and literature', '#DC2626', 'book-open'),
  ('750e8400-e29b-41d4-a716-446655440006', 'Anglais', 'English language', '#2563EB', 'languages'),
  ('750e8400-e29b-41d4-a716-446655440007', 'Histoire-Géographie', 'History and Geography', '#A855F7', 'map'),
  ('750e8400-e29b-41d4-a716-446655440008', 'Philosophie', 'Philosophy and critical thinking', '#7C3AED', 'brain'),
  ('750e8400-e29b-41d4-a716-446655440009', 'Sciences Économiques', 'Economics and social sciences', '#F59E0B', 'trending-up'),
  ('750e8400-e29b-41d4-a716-446655440010', 'Sciences Naturelles', 'Natural sciences (SVT)', '#22C55E', 'microscope'),
  ('750e8400-e29b-41d4-a716-446655440011', 'Éducation Physique', 'Physical education and sports', '#EF4444', 'activity'),
  ('750e8400-e29b-41d4-a716-446655440012', 'Arts Plastiques', 'Visual arts and creativity', '#EC4899', 'palette');

-- Associate subjects with series (coefficients vary by series type)
-- Scientific series (S1, S2) - Higher coefficients for sciences
INSERT INTO series_subjects (series_id, subject_id, coefficient) 
SELECT s.id, sub.id, 
  CASE 
    WHEN sub.name IN ('Mathématiques', 'Physique') THEN 4
    WHEN sub.name IN ('Chimie', 'Sciences Naturelles') THEN 3
    WHEN sub.name IN ('Français', 'Anglais') THEN 2
    WHEN sub.name = 'Histoire-Géographie' THEN 2
    ELSE 1
  END
FROM series s
CROSS JOIN subjects sub
WHERE s.name IN ('S1', 'S2');

-- Literary series (L1, L2) - Higher coefficients for humanities
INSERT INTO series_subjects (series_id, subject_id, coefficient)
SELECT s.id, sub.id,
  CASE 
    WHEN sub.name IN ('Français', 'Histoire-Géographie', 'Philosophie') THEN 4
    WHEN sub.name IN ('Anglais', 'Arts Plastiques') THEN 3
    WHEN sub.name = 'Mathématiques' THEN 2
    WHEN sub.name IN ('Sciences Naturelles', 'Physique') THEN 2
    ELSE 1
  END
FROM series s
CROSS JOIN subjects sub
WHERE s.name IN ('L1', 'L2');

-- Economic and Social series (ES) - Balanced with economics focus
INSERT INTO series_subjects (series_id, subject_id, coefficient)
SELECT s.id, sub.id,
  CASE 
    WHEN sub.name IN ('Sciences Économiques', 'Mathématiques') THEN 4
    WHEN sub.name IN ('Histoire-Géographie', 'Français') THEN 3
    WHEN sub.name IN ('Anglais', 'Philosophie') THEN 2
    WHEN sub.name = 'Sciences Naturelles' THEN 2
    ELSE 1
  END
FROM series s
CROSS JOIN subjects sub
WHERE s.name = 'ES';

-- Insert some basic tags
INSERT INTO tags (id, name, type, color, description) VALUES
  ('850e8400-e29b-41d4-a716-446655440001', 'Chapitre 1', 'chapter', '#3B82F6', 'First chapter content'),
  ('850e8400-e29b-41d4-a716-446655440002', 'Chapitre 2', 'chapter', '#3B82F6', 'Second chapter content'),
  ('850e8400-e29b-41d4-a716-446655440003', 'Chapitre 3', 'chapter', '#3B82F6', 'Third chapter content'),
  ('850e8400-e29b-41d4-a716-446655440004', 'Débutant', 'difficulty', '#10B981', 'Beginner level content'),
  ('850e8400-e29b-41d4-a716-446655440005', 'Intermédiaire', 'difficulty', '#F59E0B', 'Intermediate level content'),
  ('850e8400-e29b-41d4-a716-446655440006', 'Avancé', 'difficulty', '#EF4444', 'Advanced level content'),
  ('850e8400-e29b-41d4-a716-446655440007', 'Baccalauréat', 'exam_type', '#8B5CF6', 'Bac exam preparation'),
  ('850e8400-e29b-41d4-a716-446655440008', 'Contrôle Continu', 'exam_type', '#64748B', 'Continuous assessment'),
  ('850e8400-e29b-41d4-a716-446655440009', 'Révisions', 'topic', '#06B6D4', 'Review and practice'),
  ('850e8400-e29b-41d4-a716-446655440010', 'Exercices', 'topic', '#84CC16', 'Practice exercises'),
  ('850e8400-e29b-41d4-a716-446655440011', 'Lycée Technique', 'school', '#F97316', 'Technical high school'),
  ('850e8400-e29b-41d4-a716-446655440012', 'Lycée Général', 'school', '#0EA5E9', 'General high school'),
  ('850e8400-e29b-41d4-a716-446655440013', 'École Privée', 'school', '#8B5CF6', 'Private school');
