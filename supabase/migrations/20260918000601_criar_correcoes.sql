create table if not exists public.correcoes (
  id uuid primary key default gen_random_uuid(),

  redacao_id uuid not null
    references public.redacoes(id)
    on delete cascade,

  aluno_id uuid not null
    references auth.users(id)
    on delete cascade,

  nota_total integer
    check (nota_total >= 0 and nota_total <= 1000),

  competencias jsonb not null default '{}'::jsonb,

  observacoes_gerais jsonb not null default '[]'::jsonb,

  origem text not null default 'ia'
    check (origem in ('ia', 'professor', 'mista')),

  criado_em timestamptz not null default now(),

  atualizado_em timestamptz not null default now(),

  constraint correcoes_redacao_unica
    unique (redacao_id)
);

create index if not exists correcoes_aluno_id_idx
  on public.correcoes(aluno_id);

create index if not exists correcoes_redacao_id_idx
  on public.correcoes(redacao_id);

alter table public.correcoes enable row level security;

create policy "Aluno pode visualizar suas correções"
on public.correcoes
for select
to authenticated
using (aluno_id = auth.uid());

create policy "Aluno pode criar suas correções"
on public.correcoes
for insert
to authenticated
with check (aluno_id = auth.uid());

create policy "Aluno pode atualizar suas correções"
on public.correcoes
for update
to authenticated
using (aluno_id = auth.uid())
with check (aluno_id = auth.uid());