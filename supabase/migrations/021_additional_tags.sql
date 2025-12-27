-- Additional educational tags for better course categorization
-- This extends the initial tag set from 003_seed_data.sql
-- Tags are generic metadata, NOT subject-specific topics

INSERT INTO tags (id, name, type, color, description) VALUES
  -- Learning format tags
  ('7f111111-3a22-5b33-9c44-556677889990', 'Cours vidéo', 'format', '#EF4444', 'Leçons en format vidéo'),
  ('7f111111-3a22-5b33-9c44-556677889991', 'Exercices interactifs', 'format', '#3B82F6', 'QCM et activités pratiques'),
  ('7f111111-3a22-5b33-9c44-556677889992', 'Fiches de révision', 'format', '#22C55E', 'Résumés et mémos'),
  ('7f111111-3a22-5b33-9c44-556677889993', 'Corrigés détaillés', 'format', '#8B5CF6', 'Explications pas à pas'),
  ('7f111111-3a22-5b33-9c44-556677889994', 'Cours audio', 'format', '#F97316', 'Leçons à écouter'),
  ('7f111111-3a22-5b33-9c44-556677889995', 'Mind maps', 'format', '#EC4899', 'Schémas et cartes mentales'),
  ('7f111111-3a22-5b33-9c44-556677889996', 'Infographies', 'format', '#0EA5E9', 'Visuels synthétiques'),
  ('7f111111-3a22-5b33-9c44-556677889997', 'Quiz', 'format', '#10B981', 'Évaluations rapides'),
  
  -- Preparation timeline
  ('7f111111-3a22-5b33-9c44-556677889998', 'Dernière ligne droite', 'timeline', '#EF4444', 'Révisions de dernière minute'),
  ('7f111111-3a22-5b33-9c44-556677889999', '1 mois avant', 'timeline', '#F59E0B', 'Préparation à court terme'),
  ('7f111111-3a22-5b33-9c44-55667788999a', '3 mois avant', 'timeline', '#10B981', 'Révisions anticipées'),
  ('7f111111-3a22-5b33-9c44-55667788999b', 'Toute l''année', 'timeline', '#3B82F6', 'Apprentissage continu'),
  
  -- Audience tags (Terminale only)
  ('7f111111-3a22-5b33-9c44-55667788999c', 'Terminale S', 'audience', '#3B82F6', 'Série scientifique'),
  ('7f111111-3a22-5b33-9c44-55667788999d', 'Terminale L', 'audience', '#DC2626', 'Série littéraire'),
  ('7f111111-3a22-5b33-9c44-55667788999e', 'Terminale ES', 'audience', '#F59E0B', 'Série économique et sociale'),
  
  -- Special feature tags
  ('7f111111-3a22-5b33-9c44-556677889a01', 'Nouveau', 'special', '#EF4444', 'Contenu récemment ajouté'),
  ('7f111111-3a22-5b33-9c44-556677889a02', 'Populaire', 'special', '#F59E0B', 'Les plus consultés'),
  ('7f111111-3a22-5b33-9c44-556677889a03', 'Recommandé', 'special', '#22C55E', 'Sélection de l''équipe'),
  ('7f111111-3a22-5b33-9c44-556677889a04', 'Essentiel', 'special', '#3B82F6', 'Incontournable pour le bac'),
  ('7f111111-3a22-5b33-9c44-556677889a05', 'Complet', 'special', '#8B5CF6', 'Programme exhaustif'),
  ('7f111111-3a22-5b33-9c44-556677889a06', 'Express', 'special', '#F97316', 'Apprentissage rapide'),
  
  -- Learning approach tags
  ('7f111111-3a22-5b33-9c44-556677889a10', 'Pratique', 'approach', '#10B981', 'Axé sur les exercices'),
  ('7f111111-3a22-5b33-9c44-556677889a11', 'Théorique', 'approach', '#3B82F6', 'Axé sur les concepts'),
  ('7f111111-3a22-5b33-9c44-556677889a12', 'Méthodologie', 'approach', '#8B5CF6', 'Méthodes et techniques'),
  ('7f111111-3a22-5b33-9c44-556677889a13', 'Révision', 'approach', '#F59E0B', 'Consolidation des acquis'),
  ('7f111111-3a22-5b33-9c44-556677889a14', 'Découverte', 'approach', '#22C55E', 'Premier apprentissage'),
  ('7f111111-3a22-5b33-9c44-556677889a15', 'Approfondissement', 'approach', '#DC2626', 'Niveau avancé'),
  
  -- Study mode tags
  ('7f111111-3a22-5b33-9c44-556677889a20', 'Autonome', 'mode', '#06B6D4', 'Apprentissage individuel'),
  ('7f111111-3a22-5b33-9c44-556677889a21', 'Guidé', 'mode', '#8B5CF6', 'Avec accompagnement'),
  ('7f111111-3a22-5b33-9c44-556677889a22', 'Collaboratif', 'mode', '#F97316', 'Travail en groupe'),
  ('7f111111-3a22-5b33-9c44-556677889a23', 'Tutorat', 'mode', '#EC4899', 'Avec tuteur'),
  
  -- Duration tags
  ('7f111111-3a22-5b33-9c44-556677889a30', 'Court (< 15 min)', 'duration', '#22C55E', 'Sessions courtes'),
  ('7f111111-3a22-5b33-9c44-556677889a31', 'Moyen (15-45 min)', 'duration', '#F59E0B', 'Sessions moyennes'),
  ('7f111111-3a22-5b33-9c44-556677889a32', 'Long (> 45 min)', 'duration', '#EF4444', 'Sessions longues'),
  
  -- Certification/validation tags
  ('7f111111-3a22-5b33-9c44-556677889a40', 'Avec certificat', 'certification', '#10B981', 'Certificat de réussite'),
  ('7f111111-3a22-5b33-9c44-556677889a41', 'Évaluation finale', 'certification', '#3B82F6', 'Test de validation'),
  ('7f111111-3a22-5b33-9c44-556677889a42', 'Suivi personnalisé', 'certification', '#8B5CF6', 'Analyse de progression')
  
ON CONFLICT (id) DO NOTHING;
