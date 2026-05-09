/** @type {import('conventional-changelog-conventionalcommits').Options} */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "subject-case": [2, "always", "lower-case"],
    "type-enum": [
      2,
      "always",
      [
        "feat",     // Nueva funcionalidad / New feature
        "fix",      // Bug fix
        "docs",     // Documentación / Documentation
        "style",    // Estilo de código / Code style
        "refactor", // Refactorización / Refactoring
        "perf",     // Performance
        "test",     // Tests
        "build",    // Build system
        "ci",       // CI/CD
        "chore",    // Mantenimiento / Maintenance
        "revert",   // Revertir cambios / Revert
      ],
    ],
  },
  prompt: {
    messages: {
      type: "Selecciona el tipo de cambio:",
      scope: "Îndica el ámbito (opcional):",
      customScope: "Ámbito personalizado:",
      subject: "Describe los cambios en pocas palabras:",
      body: "Describe los cambios en detalle (opcional):",
      breaking: "Hay cambios que rompen la API?",
      footerPrefixes: "Agrega los IDs de issues relacionados (opcional):",
      generatingByAI: "Generando descripción con IA...",
      generatedSelect: "Selecciona una opción o escribe la tuya:",
      confirmCommit "¿Estás seguro de hacer commit?",
    },
    typesLabel: "Tipos disponibles:",
    scopesLabel: "Ámbitos disponibles (escribe uno nuevo si no está):",
  },
};