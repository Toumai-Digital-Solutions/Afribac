-- Insert countries (initial focus on Tchad & Maroc)
INSERT INTO countries (id, name, code, flag_url) VALUES
  ('1a111111-2b22-4c33-8d44-55ee66ff77aa', 'Tchad', 'TD', '🇹🇩'),
  ('2b222222-3c33-4d44-9e55-66ff77aa88bb', 'Maroc', 'MA', '🇲🇦');

-- Insert series for Tchad
INSERT INTO series (id, name, description, country_id) VALUES
  ('3c111111-2d22-4e33-9f44-112233445500', 'S1', 'Série Scientifique - Mathématiques et Sciences', '1a111111-2b22-4c33-8d44-55ee66ff77aa'),
  ('3c111111-2d22-4e33-9f44-112233445501', 'S2', 'Série Scientifique - Sciences Physiques', '1a111111-2b22-4c33-8d44-55ee66ff77aa'),
  ('3c111111-2d22-4e33-9f44-112233445502', 'L1', 'Série Littéraire - Langues et Lettres', '1a111111-2b22-4c33-8d44-55ee66ff77aa'),
  ('3c111111-2d22-4e33-9f44-112233445503', 'L2', 'Série Littéraire - Philosophie et Sciences Humaines', '1a111111-2b22-4c33-8d44-55ee66ff77aa'),
  ('3c111111-2d22-4e33-9f44-112233445504', 'ES', 'Série Économique et Sociale', '1a111111-2b22-4c33-8d44-55ee66ff77aa');

-- Insert series for Maroc
INSERT INTO series (id, name, description, country_id) VALUES
  ('4d222222-3e33-4f44-8a55-223344556600', 'S1', 'Série Scientifique - Sciences Mathématiques A', '2b222222-3c33-4d44-9e55-66ff77aa88bb'),
  ('4d222222-3e33-4f44-8a55-223344556601', 'S2', 'Série Scientifique - Sciences Physiques & Chimie', '2b222222-3c33-4d44-9e55-66ff77aa88bb'),
  ('4d222222-3e33-4f44-8a55-223344556602', 'L1', 'Série Lettres et Sciences Humaines', '2b222222-3c33-4d44-9e55-66ff77aa88bb'),
  ('4d222222-3e33-4f44-8a55-223344556603', 'L2', 'Série Lettres et Langues Étrangères', '2b222222-3c33-4d44-9e55-66ff77aa88bb'),
  ('4d222222-3e33-4f44-8a55-223344556604', 'ES', 'Série Sciences Économiques et Gestion', '2b222222-3c33-4d44-9e55-66ff77aa88bb');

-- Insert subjects (shared across countries)
INSERT INTO subjects (id, name, description, color, icon) VALUES
  ('5e111111-2f22-4a33-8b44-334455667700', 'Mathématiques', 'Mathématiques générales et analytiques', '#3B82F6', 'calculator'),
  ('5e111111-2f22-4a33-8b44-334455667701', 'Physique', 'Physique appliquée et expérimentale', '#8B5CF6', 'zap'),
  ('5e111111-2f22-4a33-8b44-334455667702', 'Chimie', 'Chimie organique et minérale', '#10B981', 'flask-conical'),
  ('5e111111-2f22-4a33-8b44-334455667703', 'Biologie', 'Sciences de la vie et de la terre', '#059669', 'leaf'),
  ('5e111111-2f22-4a33-8b44-334455667704', 'Français', 'Langue et littérature française', '#DC2626', 'book-open'),
  ('5e111111-2f22-4a33-8b44-334455667705', 'Anglais', 'Langue anglaise', '#2563EB', 'languages'),
  ('5e111111-2f22-4a33-8b44-334455667706', 'Histoire-Géographie', 'Histoire régionale et géopolitique', '#A855F7', 'map'),
  ('5e111111-2f22-4a33-8b44-334455667707', 'Philosophie', 'Philosophie générale', '#7C3AED', 'brain'),
  ('5e111111-2f22-4a33-8b44-334455667708', 'Sciences Économiques', 'Économie et gestion', '#F59E0B', 'trending-up'),
  ('5e111111-2f22-4a33-8b44-334455667709', 'Sciences Naturelles', 'SVT et environnement', '#22C55E', 'microscope'),
  ('5e111111-2f22-4a33-8b44-33445566770a', 'Éducation Physique', 'EPS et sport', '#EF4444', 'activity'),
  ('5e111111-2f22-4a33-8b44-33445566770b', 'Arts Plastiques', 'Arts plastiques et design', '#EC4899', 'palette');

-- Associate subjects with series (coefficients vary by series type)
-- Scientific series (S1, S2)
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

-- Literary series (L1, L2)
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

-- Economic & social series (ES)
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

-- Insert curated tags (difficulty, exam type, skills, and learning focus)
INSERT INTO tags (id, name, type, color, description) VALUES
  -- Difficulty ladder
  ('6f111111-2a22-4b33-8c44-445566778810', 'Fondations', 'difficulty', '#0EA5E9', 'Revoir les bases essentielles'),
  ('6f111111-2a22-4b33-8c44-445566778811', 'Maîtrise', 'difficulty', '#F59E0B', 'Consolider les acquis intermédiaires'),
  ('6f111111-2a22-4b33-8c44-445566778812', 'Performance', 'difficulty', '#EF4444', 'S''entraîner sur des sujets exigeants'),
  -- Exam formats
  ('6f111111-2a22-4b33-8c44-445566778813', 'Bac Blanc', 'exam_type', '#8B5CF6', 'Simulations complètes du baccalauréat'),
  ('6f111111-2a22-4b33-8c44-445566778814', 'Contrôle Continu', 'exam_type', '#64748B', 'Évaluations périodiques en classe'),
  ('6f111111-2a22-4b33-8c44-445566778815', 'Diagnostic', 'exam_type', '#22C55E', 'Mesurer son niveau avant révision'),
  -- Skills & competencies
  ('6f111111-2a22-4b33-8c44-445566778816', 'Résolution de problèmes', 'topic', '#3B82F6', 'Développer la logique et la méthodologie'),
  ('6f111111-2a22-4b33-8c44-445566778817', 'Analyse de documents', 'topic', '#A855F7', 'Lire, comprendre et interpréter des sources'),
  ('6f111111-2a22-4b33-8c44-445566778818', 'Rédaction & Argumentation', 'topic', '#DC2626', 'Structurer une copie convaincante'),
  ('6f111111-2a22-4b33-8c44-445566778819', 'Méthodes rapides', 'topic', '#10B981', 'Fiches mémo et astuces express'),
  -- Context tags
  ('6f111111-2a22-4b33-8c44-44556677881a', 'Révisions intensives', 'topic', '#06B6D4', 'Programme de révisions planifié'),
  ('6f111111-2a22-4b33-8c44-44556677881b', 'Coaching en groupe', 'topic', '#F97316', 'Activités collaboratives et tutorat');
