-- ====== ENUM BLOG POST STATUS ======
create type if not exists public.blog_post_status as enum ('DRAFT', 'PUBLISHED');

-- ====== TABELAS ======
create table if not exists public.blog_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,                         -- "Segurança de Gênero"
  slug text not null unique,                         -- "seguranca-de-genero"
  created_at timestamptz not null default now()
);

create table if not exists public.blog_post_tags (
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  tag_id  uuid not null references public.blog_tags(id)  on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, tag_id)
);

create index if not exists blog_post_tags_post_idx on public.blog_post_tags (post_id);
create index if not exists blog_post_tags_tag_idx  on public.blog_post_tags (tag_id);

-- Adicionar campos ao blog_posts se não existirem
do $$ begin
  if not exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='blog_posts' and column_name='status') then
    alter table public.blog_posts add column status public.blog_post_status not null default 'DRAFT';
  end if;
  
  if not exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='blog_posts' and column_name='excerpt') then
    alter table public.blog_posts add column excerpt text;
  end if;
  
  if not exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='blog_posts' and column_name='cover_url') then
    alter table public.blog_posts add column cover_url text;
  end if;
  
  if not exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='blog_posts' and column_name='slug') then
    -- slug já deve existir, mas garantimos unique se não tiver
    alter table public.blog_posts add constraint blog_posts_slug_unique unique (slug);
  else
    -- Adiciona unique constraint se não existir
    if not exists (
      select 1 from pg_constraint 
      where conname = 'blog_posts_slug_unique'
    ) then
      alter table public.blog_posts add constraint blog_posts_slug_unique unique (slug);
    end if;
  end if;
end $$;

-- Remova (se existir) a coluna antiga de array para evitar divergência
do $$ begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='blog_posts' and column_name='tags') then
    alter table public.blog_posts drop column tags;
  end if;
end $$;

-- ====== POLÍTICAS (RLS) ======
alter table public.blog_tags       enable row level security;
alter table public.blog_post_tags  enable row level security;

-- Público lê somente tags que estejam em posts publicados
drop policy if exists "tags: public read used" on public.blog_tags;
create policy "tags: public read used" on public.blog_tags
for select to anon
using (exists (
  select 1 from public.blog_post_tags pt
  join public.blog_posts p on p.id = pt.post_id
  where pt.tag_id = blog_tags.id 
    and p.status = 'PUBLISHED' 
    and p.published_at is not null
));

-- Authenticated users podem ler todas as tags (para autocomplete no editor)
drop policy if exists "tags: authenticated read all" on public.blog_tags;
create policy "tags: authenticated read all" on public.blog_tags
for select to authenticated
using (true);

-- Junções (somente leitura pública)
drop policy if exists "post_tags: public read" on public.blog_post_tags;
create policy "post_tags: public read" on public.blog_post_tags
for select to anon
using (exists (
  select 1 from public.blog_posts p
  where p.id = blog_post_tags.post_id
    and p.status = 'PUBLISHED' 
    and p.published_at is not null
));

-- Authenticated users podem ler todas as junções (para edição)
drop policy if exists "post_tags: authenticated read all" on public.blog_post_tags;
create policy "post_tags: authenticated read all" on public.blog_post_tags
for select to authenticated
using (true);

-- Admin manage (CRUD)
drop policy if exists "tags: admin manage" on public.blog_tags;
create policy "tags: admin manage" on public.blog_tags
for all to authenticated
using (
  exists (
    select 1 from public.profiles pr 
    where pr.user_id = auth.uid() 
    and pr.role = 'ADMIN'
  )
)
with check (
  exists (
    select 1 from public.profiles pr 
    where pr.user_id = auth.uid() 
    and pr.role = 'ADMIN'
  )
);

drop policy if exists "post_tags: admin manage" on public.blog_post_tags;
create policy "post_tags: admin manage" on public.blog_post_tags
for all to authenticated
using (
  exists (
    select 1 from public.profiles pr 
    where pr.user_id = auth.uid() 
    and pr.role = 'ADMIN'
  )
)
with check (
  exists (
    select 1 from public.profiles pr 
    where pr.user_id = auth.uid() 
    and pr.role = 'ADMIN'
  )
);

-- ====== HELPERS ======
create or replace function public.to_slug(p text)
returns text language sql immutable as $$
  select trim(both '-' from regexp_replace(lower(
           translate(coalesce(p,''), 
                     'ÁÀÂÃÄÅÇÉÈÊËÍÌÎÏÑÓÒÔÕÖÚÙÛÜÝáàâãäåçéèêëíìîïñóòôõöúùûüýÿ',
                     'AAAAAACEEEEIIIINOOOOOUUUUYaaaaaaceeeeiiiinooooouuuuyy')
         ), '[^a-z0-9]+', '-', 'g'))
$$;

-- Upsert de tag por nome (slug único)
create or replace function public.upsert_tag(p_name text)
returns public.blog_tags
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slug text := public.to_slug(p_name);
  v_tag public.blog_tags;
begin
  insert into public.blog_tags (name, slug)
  values (p_name, v_slug)
  on conflict (slug) do update set name = excluded.name
  returning * into v_tag;

  return v_tag;
end;
$$;

revoke all on function public.upsert_tag(text) from public;
grant execute on function public.upsert_tag(text) to authenticated;

-- Vincular várias tags por nomes (conveniência no admin)
create or replace function public.link_post_tags_by_names(p_post_id uuid, p_names text[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_tag public.blog_tags;
begin
  if p_names is null or array_length(p_names, 1) is null then 
    -- Remove todas as tags do post se array vazio
    delete from public.blog_post_tags where post_id = p_post_id;
    return; 
  end if;

  -- Remove tags antigas que não estão no novo array
  delete from public.blog_post_tags pt
  where pt.post_id = p_post_id
    and not exists (
      select 1 from unnest(p_names) as n(name)
      join public.blog_tags t on t.name = trim(n.name)
      where t.id = pt.tag_id
    );

  -- Upsert e vincula novas tags
  foreach v_name in array p_names loop
    v_name := trim(v_name);
    if v_name != '' then
      v_tag := public.upsert_tag(v_name);
      insert into public.blog_post_tags (post_id, tag_id)
      values (p_post_id, v_tag.id)
      on conflict (post_id, tag_id) do nothing;
    end if;
  end loop;
end;
$$;

revoke all on function public.link_post_tags_by_names(uuid, text[]) from public;
grant execute on function public.link_post_tags_by_names(uuid, text[]) to authenticated;

-- Materialized View para tag counts (opcional, performance)
create materialized view if not exists public.mv_tag_counts_public as
select 
  t.id, 
  t.name, 
  t.slug, 
  count(*)::int as count
from public.blog_tags t
join public.blog_post_tags pt on pt.tag_id = t.id
join public.blog_posts p on p.id = pt.post_id
where p.status = 'PUBLISHED' and p.published_at is not null
group by t.id, t.name, t.slug;

create unique index if not exists mv_tag_counts_public_slug_idx 
  on public.mv_tag_counts_public(slug);

-- Função para refresh da MV (chamar após publish/unpublish)
create or replace function public.refresh_tag_counts()
returns void
language plpgsql
security definer
as $$
begin
  refresh materialized view concurrently public.mv_tag_counts_public;
end;
$$;

grant execute on function public.refresh_tag_counts() to authenticated;

