# Memora (API + Front)

Guia rápido para preparar e rodar o projeto (backend em Express/TypeScript com Drizzle + frontend em Vite/React).

## Requisitos
- Node.js 18+ e npm
- PostgreSQL em execução com um banco disponível

## Instalação e Execução
Para construir a aplicação e instalar as dependências:

```bash
npm run build
```

Por fim, execute com o comando:

```bash
npm run start
```

## Variáveis de ambiente

Você pode ver as variáveis de ambiente no arquivo `.env.example`. Mas, basicamente você precisa configurar:

```bash
# URL de conexão completa do Postgres
DATABASE_URL=postgresql://usuario:senha@localhost:5432/memora

# Opcional: porta do servidor Express (padrão 3000)
PORT=3000

# Sua chave de API do Gemini
VITE_GOOGLE_API_KEY="<sua chave>"
```