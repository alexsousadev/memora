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

### Backend (arquivo `.env` na raiz)
```bash
# URL de conexão completa do Postgres
DATABASE_URL=

# Porta do servidor Express (opcional, padrão 3000)
PORT=

# Origem permitida para WebAuthn (URL do frontend)
ORIGIN=

# Base única da API (usada em todo o frontend)
VITE_API_URL=

# Chave do Google Gemini TTS; Deixe vazio para usar fallback do navegador
VITE_GOOGLE_API_KEY=
```