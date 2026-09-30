-- huellar · más lugares curados (Colegiales/Chacarita/Belgrano) + beneficios extra
-- La base tenía solo 9 lugares — muy poco para que el mapa y las listas se
-- sientan pobladas. Esto no toca posts/check-ins (eso sí tiene que salir de
-- actividad real de usuarios).

insert into public.places (name, category, neighborhood, address, latitude, longitude, tags) values
  ('Plazoleta Conesa', 'plaza', 'Colegiales', 'Av. Elcano y Conesa', -34.5715, -58.4565, array['Sin correa', 'Sombra']),
  ('Plaza Naón', 'plaza', 'Belgrano', 'Av. Cabildo y Naón', -34.5635, -58.4585, array['Bebedero', 'Sombra']),
  ('Espacio Verde Delgado', 'plaza', 'Chacarita', 'Delgado y Jorge Newbery', -34.5825, -58.4515, array['Sin correa']),
  ('Plazoleta Olleros', 'plaza', 'Belgrano', 'Olleros y Cabildo', -34.5715, -58.4515, array['Bebedero']),
  ('Perro Bendito Café', 'cafe', 'Colegiales', 'Av. Elcano 3200', -34.5745, -58.4555, array['Pet friendly', 'Terraza']),
  ('Cafetín Newbery', 'cafe', 'Colegiales', 'Jorge Newbery 3050', -34.5795, -58.4535, array['Pet friendly']),
  ('La Pata Coffee Co.', 'cafe', 'Belgrano', 'Av. Cramer 1800', -34.5695, -58.4495, array['Pet friendly', 'Terraza']),
  ('Patio Chacarita', 'cafe', 'Chacarita', 'Guevara 350', -34.5865, -58.4545, array['Terraza', 'Sin correa']),
  ('Veterinaria Elcano', 'veterinaria', 'Colegiales', 'Av. Elcano 3100', -34.5738, -58.4548, array['Vacunas', 'Peluquería']),
  ('Hospital Veterinario Belgrano', 'veterinaria', 'Belgrano', 'Av. Cabildo 2900', -34.5665, -58.4535, array['Urgencias', 'Guardia 24hs']),
  ('Vet Express Chacarita', 'veterinaria', 'Chacarita', 'Av. Corrientes 6100', -34.5885, -58.4565, array['Vacunas']),
  ('Clínica San Roque', 'veterinaria', 'Colegiales', 'Concepción Arenal 2700', -34.5775, -58.4485, array['Urgencias', 'Vacunas', 'Peluquería']);

insert into public.benefits (title, place_name, neighborhood, points_cost) values
  ('Medialuna gratis', 'Perro Bendito Café', 'Colegiales', 100),
  ('15% en tu compra', 'La Pata Coffee Co.', 'Belgrano', 180),
  ('Primera consulta gratis', 'Veterinaria Elcano', 'Colegiales', 300),
  ('20% en vacunas', 'Hospital Veterinario Belgrano', 'Belgrano', 250);
