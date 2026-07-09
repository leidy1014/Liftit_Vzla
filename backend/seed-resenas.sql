-- ══════════════════════════════════════════════════════
--  SEED DE RESEÑAS FICTICIAS — Liftit Fitness
--  Ejecutar en: Supabase → SQL Editor → New query → Run
--  Es seguro correrlo varias veces (no duplica datos).
-- ══════════════════════════════════════════════════════

-- PASO 1: Crear usuarios ficticios
-- La contraseña es inválida a propósito: nunca podrán hacer login.
INSERT INTO usuarios (email, nombre, password, rol, activo)
VALUES
  ('ana.gil@correo.co',      'Ana Gil',      '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lash', 'vendedor', true),
  ('julio.vera@correo.co',   'Julio Vera',   '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lash', 'vendedor', true),
  ('diana.reyes@correo.co',  'Diana Reyes',  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lash', 'vendedor', true)
ON CONFLICT (email) DO NOTHING;


-- PASO 2: Reseñas de Ana Gil — 4 o 5 estrellas según el ID del producto
INSERT INTO resenas (puntuacion, comentario, producto_id, usuario_id)
SELECT
  CASE WHEN p.id % 2 = 0 THEN 5 ELSE 4 END,
  CASE p.id % 5
    WHEN 0 THEN 'Excelente producto, la calidad es muy buena. Lo recomiendo sin dudarlo.'
    WHEN 1 THEN 'Muy contenta con la compra. Llegó rápido y en perfectas condiciones.'
    WHEN 2 THEN 'Vale cada peso. Lo estoy usando hace semanas y sin ningún problema.'
    WHEN 3 THEN 'De lo mejor que he comprado para mis rutinas. Muy resistente.'
    ELSE        'Gran calidad, se nota que está bien fabricado. Volveré a comprar.'
  END,
  p.id,
  u.id
FROM productos p
CROSS JOIN (SELECT id FROM usuarios WHERE email = 'ana.gil@correo.co') u
WHERE NOT EXISTS (
  SELECT 1 FROM resenas r WHERE r.producto_id = p.id AND r.usuario_id = u.id
);


-- PASO 3: Reseñas de Julio Vera — también 4 o 5 estrellas (invertido)
INSERT INTO resenas (puntuacion, comentario, producto_id, usuario_id)
SELECT
  CASE WHEN p.id % 2 = 1 THEN 5 ELSE 4 END,
  CASE p.id % 5
    WHEN 0 THEN 'Buena calidad, el material es muy resistente. Cumple todo lo que promete.'
    WHEN 1 THEN 'Perfecto para entrenar en casa. Lo recomiendo totalmente.'
    WHEN 2 THEN 'Muy buen producto, la relación calidad-precio es excelente.'
    WHEN 3 THEN 'Me llegó bien empacado y en excelente estado. Buen proveedor.'
    ELSE        'Cumple perfectamente con lo que buscaba. La calidad es notoria.'
  END,
  p.id,
  u.id
FROM productos p
CROSS JOIN (SELECT id FROM usuarios WHERE email = 'julio.vera@correo.co') u
WHERE NOT EXISTS (
  SELECT 1 FROM resenas r WHERE r.producto_id = p.id AND r.usuario_id = u.id
);


-- PASO 4: Reseñas de Diana Reyes — todas 5 estrellas
INSERT INTO resenas (puntuacion, comentario, producto_id, usuario_id)
SELECT
  5,
  CASE p.id % 4
    WHEN 0 THEN 'Lo compré para mi gym en casa y ha sido una excelente inversión. Todo de primera.'
    WHEN 1 THEN 'Increíble la calidad. Lleva meses de uso intensivo y sigue como nuevo.'
    WHEN 2 THEN 'El mejor que he encontrado a este precio. Mi entrenador también lo recomienda.'
    ELSE        'Muy satisfecha con la compra. Llegó antes de lo esperado y en perfectas condiciones.'
  END,
  p.id,
  u.id
FROM productos p
CROSS JOIN (SELECT id FROM usuarios WHERE email = 'diana.reyes@correo.co') u
WHERE NOT EXISTS (
  SELECT 1 FROM resenas r WHERE r.producto_id = p.id AND r.usuario_id = u.id
);


-- ══ VERIFICACIÓN (opcional, para confirmar que se insertó todo) ══
-- SELECT p.nombre, COUNT(r.id) AS reseñas, ROUND(AVG(r.puntuacion), 1) AS promedio
-- FROM productos p
-- LEFT JOIN resenas r ON r.producto_id = p.id
-- GROUP BY p.id, p.nombre
-- ORDER BY p.nombre;
