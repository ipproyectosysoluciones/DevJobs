# Contributing | Contribuciones

Thanks for your interest in DevJobs! Here's how to contribute.

¡Gracias por tu interés en DevJobs! Acá te explicamos cómo contribuir.

## Code of Conduct | Código de Conducta

By participating, you agree to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

Al participar, aceptás cumplir con nuestro [Código de Conducta](CODE_OF_CONDUCT.md).

## Git Workflow | Flujo de Trabajo

```
feat/* ──▶ dev ──▶ staging ──▶ main
```

1. Branch from `dev`: `feat/<description>`, `fix/<description>`, `chore/<description>`
2. Use conventional commits (`feat:`, `fix:`, `docs:`, `chore:`, etc.)
3. Open a **Pull Request** to `dev`
4. After review, it follows: `dev` → `staging` → `main`

## Development Setup | Configuración de Desarrollo

```bash
pnpm install
docker compose up -d
cp .env.example .env
pnpm seed
pnpm dev
```

## Requirements | Requisitos

- Node.js >= 25
- pnpm >= 9
- Docker + Docker Compose

## Commands | Comandos

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server with hot reload |
| `pnpm build` | Production build |
| `pnpm test` | Run tests |
| `pnpm seed` | Seed test data |

## Checklist Before PR | Checklist Antes del PR

- [ ] `pnpm build` passes (0 TypeScript errors)
- [ ] `pnpm test` passes (all tests)
- [ ] Conventional commit format (husky + commitlint)
- [ ] Code is focused and minimal (no debug logs, no unrelated changes)
- [ ] Branch is up to date with `dev`

## Questions? | ¿Preguntas?

Open a [Discussion](https://github.com/ipproyectosysoluciones/DevJobs/discussions) or email bladi.mir@outlook.com.
