-- ============================================================
-- DruidaBot — Schema Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- Códigos de producto generados al vender un dispositivo
create table if not exists product_codes (
  code        text primary key,            -- ej: "DRUID-A3F7-K9"
  device_id   text not null unique,        -- coincide con DEVICE_ID en config.h
  used        boolean default false,
  used_by     uuid references auth.users(id) on delete set null,
  used_at     timestamptz
);

-- Dispositivos vinculados a un usuario (uno por usuario por ahora)
create table if not exists devices (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null unique,
  device_id   text not null unique,
  name        text not null default 'Mi DruidaBot',
  code        text references product_codes(code),
  created_at  timestamptz default now()
);

-- ── Row Level Security ──────────────────────────────────────
alter table product_codes enable row level security;
alter table devices        enable row level security;

-- product_codes: solo lectura para verificar si un código existe
-- (la escritura la hace un service_role key desde el backend)
create policy "Verificar código propio"
  on product_codes for select
  using (
    used_by = auth.uid()
    or (used = false)   -- permite verificar disponibilidad sin exponer datos
  );

-- devices: cada usuario solo ve y modifica su propio dispositivo
create policy "Ver propio dispositivo"
  on devices for select
  using (user_id = auth.uid());

create policy "Insertar propio dispositivo"
  on devices for insert
  with check (user_id = auth.uid());

create policy "Actualizar propio dispositivo"
  on devices for update
  using (user_id = auth.uid());

-- ── Función para vincular un código de producto ─────────────
-- Llamada desde el API route con service_role key (bypasa RLS)
create or replace function link_device(
  p_code    text,
  p_user_id uuid,
  p_name    text default 'Mi DruidaBot'
)
returns json
language plpgsql
security definer   -- corre como superuser, bypasea RLS
as $$
declare
  v_device_id text;
  v_device_row devices%rowtype;
begin
  -- Verificar que el código existe y no fue usado
  select device_id into v_device_id
  from product_codes
  where code = p_code and used = false;

  if not found then
    return json_build_object('ok', false, 'error', 'Código inválido o ya fue usado');
  end if;

  -- Verificar que el usuario no tiene ya un dispositivo
  if exists (select 1 from devices where user_id = p_user_id) then
    return json_build_object('ok', false, 'error', 'Ya tenés un dispositivo vinculado');
  end if;

  -- Marcar código como usado
  update product_codes
  set used = true, used_by = p_user_id, used_at = now()
  where code = p_code;

  -- Crear el device
  insert into devices (user_id, device_id, name, code)
  values (p_user_id, v_device_id, p_name, p_code)
  returning * into v_device_row;

  return json_build_object(
    'ok', true,
    'device_id', v_device_row.device_id,
    'name', v_device_row.name
  );
end;
$$;
