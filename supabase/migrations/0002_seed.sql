-- huellar · datos semilla (lugares curados + beneficios + un QR de ejemplo)
-- Correr después de 0001_init.sql.

insert into public.places (name, category, neighborhood, address, latitude, longitude, tags) values
  ('Plaza Alberti', 'plaza', 'Colegiales', 'Av. Álvarez Thomas 1450', -34.5765, -58.449, array['Sin correa', 'Bebedero']),
  ('Parque Los Andes', 'plaza', 'Chacarita', 'Av. Álvarez Thomas y Av. Forest', -34.5843, -58.4553, array['Sin correa', 'Sombra']),
  ('Plaza Arenales', 'plaza', 'Colegiales', 'Conde y Zapiola', -34.572, -58.447, array['Bebedero']),
  ('Bar Iberia', 'cafe', 'Chacarita', 'Av. Corrientes 5583', -34.5875, -58.4535, array['Pet friendly', 'Terraza']),
  ('Full City Coffee', 'cafe', 'Colegiales', 'Av. Federico Lacroze 2100', -34.573, -58.4525, array['Pet friendly']),
  ('Birra Pet Bar', 'cafe', 'Colegiales', 'Concepción Arenal 3200', -34.579, -58.446, array['Terraza', 'Sin correa']),
  ('Clínica Zapiola', 'veterinaria', 'Colegiales', 'Zapiola 1780', -34.575, -58.45, array['Urgencias', 'Vacunas']),
  ('Veterinaria Núñez 24hs', 'veterinaria', 'Núñez', 'Av. Cabildo 3400', -34.568, -58.455, array['Guardia 24hs']),
  ('Veterinaria Cabildo', 'veterinaria', 'Colegiales', 'Av. Cabildo 2250', -34.581, -58.448, array['Vacunas', 'Peluquería']);

insert into public.benefits (title, place_name, neighborhood, points_cost) values
  ('Café gratis', 'Bar Iberia', 'Chacarita', 150),
  ('10% en peluquería', 'Peluquería Zapiola', 'Colegiales', 200),
  ('Consulta veterinaria 50%', 'Clínica Zapiola', 'Colegiales', 350),
  ('Baño gratis', 'Peluquería Zapiola', 'Colegiales', 500);

insert into public.qr_codes (code, place_id)
select 'HUELLA-ALBERTI-01', id from public.places where name = 'Plaza Alberti';
