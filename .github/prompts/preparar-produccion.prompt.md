---
name: "Preparar para produccion"
description: "Analiza todo el repositorio, elimina fallbacks, mocks, datos de demo y codigo no productivo, y deja una version validada lista para produccion."
argument-hint: "Opcional: exclusiones, areas sensibles, modo solo-analisis o nivel de agresividad"
agent: "agent"
---
Trabaja sobre este workspace siguiendo las reglas de [AGENTS.md](../../AGENTS.md) y tomando como referencias principales [README.md](../../README.md), [package.json](../../package.json), [next.config.mjs](../../next.config.mjs), [eslint.config.mjs](../../eslint.config.mjs) y [tsconfig.json](../../tsconfig.json).

Objetivo: auditar todo el repositorio y dejar una version lista para produccion, eliminando o reemplazando mocks, fallbacks no productivos, datos de demo, defaults temporales, codigo muerto y cualquier acoplamiento que oculte errores reales en runtime, sin retirar degradaciones validas de resiliencia o UX que si formen parte del comportamiento productivo esperado.

Si el usuario aporta argumentos, usalos para ajustar la revision. Ejemplos: exclusiones, carpetas concretas, modo conservador, `solo-analisis`, foco en runtime, foco en seguridad o foco en configuracion.

Proceso esperado:

1. Recorre el repo completo y prioriza los limites de mayor riesgo: configuracion, variables de entorno, auth, middleware, servicios de datos, server actions, layouts, providers y puntos de integracion externos.
2. Detecta evidencia concreta de estas categorias:
   - mocks, stubs o datos de prueba usados fuera de tests
   - fallbacks temporales, valores hardcodeados o defaults de demo
   - ramas de codigo pensadas para desarrollo que siguen activas en produccion
   - codigo muerto, duplicado o legacy que agregue riesgo operacional
   - comportamientos que silencian errores reales en lugar de resolverlos correctamente
3. Para cada hallazgo, decide si corresponde:
   - eliminarlo
   - reemplazarlo por una fuente canonica de produccion
   - convertirlo en una falla explicita con manejo claro
   - conservarlo si es una degradacion intencional, justificada y segura para produccion
4. Explica cada hallazgo con evidencia concreta antes de cambios de alto impacto.
5. Si el usuario no pidio `solo-analisis`, aplica la limpieza completa:
   - elimina artefactos no productivos
   - reemplaza configuraciones hardcodeadas por env, base de datos o servicios reales
   - corrige acoplamientos incorrectos entre flujos publicos y admin
   - simplifica codigo siguiendo clean code y buenas practicas
   - actualiza documentacion o configuracion si la operacion en produccion cambia
6. Valida despues de cada tanda significativa con el chequeo mas estrecho posible.
7. Cierra con una ultima revision global para detectar residuos no productivos, referencias rotas, errores de tipo, problemas de lint aplicables y regresiones obvias.

Reglas de trabajo:

- No dejes fallbacks temporales o defaults falsos que oculten errores reales cuando el dato o la configuracion deberian ser obligatorios.
- Conserva degradaciones validas de UX o resiliencia si son parte intencional del comportamiento productivo y no introducen datos falsos ni enmascaran estados incorrectos.
- No conserves mocks, numeros por defecto, credenciales simuladas, contenido placeholder ni datos de ejemplo en rutas productivas.
- Favorece arreglos de causa raiz, cambios minimos y consistencia con las abstracciones existentes.
- En este repo, para cambios TypeScript usa `pnpm exec tsc --noEmit` o diagnosticos del editor; no confies en `pnpm build` para type safety ni en `pnpm lint` para `ts` o `tsx`.
- Usa `pnpm` para comandos del proyecto.

Formato de salida:

1. `Diagnostico`
   Resume hallazgos, evidencia y riesgo.
2. `Plan de endurecimiento`
   Indica que vas a eliminar, reemplazar, endurecer o conservar y por que.
3. `Cambios aplicados`
   Describe solo los cambios reales ejecutados.
4. `Validacion`
   Enumera chequeos ejecutados y resultado.
5. `Riesgos pendientes`
   Menciona solo decisiones abiertas, deuda real o puntos que requieran confirmacion.

Si el usuario pide `solo-analisis`, no modifiques archivos; entrega `Diagnostico`, `Plan de endurecimiento` y `Riesgos pendientes`.