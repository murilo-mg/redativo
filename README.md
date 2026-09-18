# Redativo

Plataforma web para treinamento de redação do ENEM. O sistema permite criar, editar e salvar redações, enviá-las para correção automática e visualizar feedbacks organizados pelas cinco competências do ENEM.

## Tecnologias

- Next.js com App Router
- TypeScript
- React
- Tailwind CSS e shadcn/ui
- Supabase Auth e PostgreSQL
- Tiptap para o editor de redações
- Google Gemini API para correção automática

## Pré-requisitos

Instale no computador:

- Git
- Node.js 24 ou superior
- npm

Confira a instalação:

```bash
node --version
npm --version
git --version
```

### Instalação do Node.js no Linux

Caso `node` não exista, instale o nvm e o Node 24:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 24
nvm use 24
```

No Windows, baixe o instalador em:

```text
https://nodejs.org/
```

Após a instalação, feche e abra o terminal novamente.

Se o projeto possuir um arquivo `.nvmrc`, o Node pode ser selecionado com:

```bash
nvm install
nvm use
```

## Baixar o projeto

O repositório é privado. Primeiro, o usuário precisa aceitar o convite do GitHub.

Depois execute:

```bash
git clone https://github.com/murilo-mg/redativo.git
cd redativo
```

## Instalar dependências

Dentro da pasta `redativo`:

```bash
npm install
```

## Configurar variáveis de ambiente

Crie um arquivo chamado `.env.local` diretamente na raiz do projeto, no mesmo nível do arquivo `package.json`.

O arquivo deve conter:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua_chave_publicavel_do_supabase

GEMINI_API_KEY=sua_chave_do_google_ai_studio
GEMINI_MODEL=gemini-3.6-flash
```

### Onde obter os valores

Os valores do Supabase vêm do projeto compartilhado, em:

```text
Supabase → Project Settings → API
```

A chave do Gemini pode ser criada em:

```text
https://aistudio.google.com/app/apikey
```

Cada desenvolvedor deve preferencialmente usar a própria chave do Gemini. A chave do Gemini nunca deve ser colocada no GitHub, enviada em grupo público ou usada com o prefixo `NEXT_PUBLIC_`.

O arquivo `.env.local` não deve ser commitado.

## Executar o projeto

Com o arquivo `.env.local` configurado:

```bash
npm run dev
```

Abra no navegador:

```text
http://localhost:3000
```

Para encerrar o servidor, pressione:

```text
Ctrl + C
```

## Fluxo principal

1. Criar uma conta em `/cadastro`.
2. Entrar em `/login`.
3. Acessar o dashboard.
4. Criar uma nova redação.
5. Salvar como rascunho.
6. Continuar a redação pelo dashboard.
7. Enviar a redação para correção.
8. Solicitar a correção automática.
9. Visualizar as notas das competências C1, C2, C3, C4 e C5.

## Como a correção funciona

O navegador envia a solicitação para a rota protegida:

```text
POST /api/correcoes
```

O servidor:

1. verifica se o usuário está autenticado;
2. verifica se a redação pertence ao usuário;
3. valida o texto recebido;
4. envia o tema e o texto ao Gemini;
5. recebe uma resposta JSON estruturada;
6. valida a resposta com Zod;
7. calcula a nota total;
8. salva a correção na tabela `correcoes` do Supabase.

A chave do Gemini nunca é enviada para o navegador.

## Banco de dados

O projeto utiliza o Supabase para:

- autenticação dos usuários;
- armazenamento das redações;
- armazenamento das correções;
- controle de acesso por usuário usando RLS.

O projeto já possui migrations aplicadas no banco compartilhado. Portanto, para apenas executar a aplicação, não é necessário iniciar um Supabase local.

Não execute migrations novamente no banco compartilhado sem combinar com o grupo.

Se for criado um projeto Supabase separado, será necessário configurar as variáveis de ambiente e aplicar as migrations desse novo projeto.

## Estrutura principal

```text
redativo/
├── app/
│   ├── api/correcoes/       # Rota da correção por IA
│   ├── cadastro/            # Cadastro de usuários
│   ├── dashboard/           # Painel do aluno
│   ├── login/               # Login e logout
│   └── redacoes/            # Criação, edição e visualização
├── components/              # Componentes visuais reutilizáveis
├── lib/
│   ├── ia/                  # Integração com o Gemini
│   └── supabase/            # Clientes do Supabase
├── supabase/
│   └── migrations/          # Alterações versionadas do banco
├── public/                  # Arquivos públicos
├── package.json             # Dependências e scripts
└── .env.local               # Configurações secretas locais
```

## Comandos de verificação

Antes de enviar alterações para o GitHub, execute:

```bash
npm run lint
npm run typecheck
npm run build
```

Todos devem terminar sem erros.

## Erros comuns

### `node: command not found`

O Node.js não está instalado. Instale o Node 24 e abra um novo terminal.

### `npm: command not found`

O npm é instalado junto com o Node.js. Reinstale o Node ou carregue o nvm:

```bash
source ~/.bashrc
nvm use
```

### Erro de variáveis de ambiente

Verifique se:

- o arquivo se chama exatamente `.env.local`;
- está dentro da pasta `redativo`;
- as variáveis estão escritas exatamente como no exemplo;
- o servidor foi reiniciado depois da alteração.

### Erro `401` no Gemini

A chave do Gemini está ausente, incompleta ou incorreta. Gere uma chave no Google AI Studio e confira o valor de `GEMINI_API_KEY`.

### Erro `404` de modelo no Gemini

Confira o nome no `.env.local`:

```env
GEMINI_MODEL=gemini-3.6-flash
```

Depois reinicie o servidor.

### Erro `503` na correção

Significa que o servidor não conseguiu obter resposta do Gemini. Aguarde alguns segundos e tente novamente. Confira também a chave e o modelo configurados.

### Porta 3000 ocupada

Encerre outro servidor com `Ctrl + C` ou execute:

```bash
npm run dev -- -p 3001
```

Nesse caso, abra `http://localhost:3001`.

## Desenvolvimento em equipe

Depois de alterar o código:

```bash
git status
git add .
git commit -m "descreva a alteração"
git push
```

Antes de começar um novo trabalho:

```bash
git pull
```

Não faça commit destes arquivos:

- `.env.local`
- chaves de API;
- senhas;
- tokens;
- arquivos gerados de build.

## Situação atual do MVP

Implementado:

- cadastro e login;
- autenticação com Supabase;
- dashboard;
- criação de redações;
- salvamento de rascunhos;
- edição de redações;
- envio para correção;
- correção automática via Gemini;
- notas e feedbacks das cinco competências do ENEM.

Próximas evoluções:

- desafio diário de repertório;
- salvamento automático;
- reescrita e comparação de versões;
- salas de aula;
- feed de redações autorizado;
- melhorias visuais e responsividade.
