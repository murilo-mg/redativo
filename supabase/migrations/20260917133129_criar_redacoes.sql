create table public.redacoes (
  id uuid primary key default gen_random_uuid(),

  aluno_id uuid not null
    references public.profiles(id)
    on delete cascade,

  titulo text not null default 'Nova redação',

  tema text not null default 'Tema livre',

  conteudo jsonb not null default '{}'::jsonb,

  texto_plain text not null default '',

  status text not null default 'rascunho'
    check (status in ('rascunho', 'enviada', 'corrigida')),

  origem text not null default 'livre'
    check (origem in ('livre', 'desafio_diario', 'sala')),

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  submitted_at timestamptz
);

create index redacoes_aluno_id_idx
on public.redacoes(aluno_id);

create index redacoes_status_idx
on public.redacoes(status);

alter table public.redacoes enable row level security;

create policy "Alunos podem visualizar suas redações"
on public.redacoes
for select
to authenticated
using (aluno_id = (select auth.uid()));

create policy "Alunos podem criar suas redações"
on public.redacoes
for insert
to authenticated
with check (aluno_id = (select auth.uid()));

create policy "Alunos podem editar suas redações"
on public.redacoes
for update
to authenticated
using (aluno_id = (select auth.uid()))
with check (aluno_id = (select auth.uid()));

create policy "Alunos podem excluir suas redações"
on public.redacoes
for delete
to authenticated
using (aluno_id = (select auth.uid()));

create trigger redacoes_updated_at
before update on public.redacoes
for each row
execute function public.set_updated_at();