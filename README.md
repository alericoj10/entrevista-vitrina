# Vitrina - Encuadrado Product Engineer

## 🚀 Quick Start

El proyecto ya se encuentra deployeado en este link: [entrevista-vitrina](https://entrevista-vitrina.vercel.app/), por lo que se facilita la revisión. Si igualmente se quisiera ejecutar el proyecto localmente, se pueden seguir los siguientes pasos:

### Prerrequisitos

- Node.js (versión 20 o superior)
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone git@github.com:alericoj10/entrevista-vitrina.git
cd entrevista-vitrina

# Instalar dependencias
npm install
# o
yarn install
```

### Configuración

```bash
# Copiar variables de entorno
cp .env.example .env

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

ADMIN_USERNAME=encuadrado
ADMIN_PASSWORD=enc123**456&789
```

### Desarrollo

```bash
# Ejecutar en modo desarrollo
npm run dev
# o
yarn dev

# El proyecto estará disponible en:
# - Admin: http://localhost:3000/admin
# - Vitrina: http://localhost:3000/store
```

### Credenciales de Acceso

**Admin:**

- Usuario: `encuadrado`
- Contraseña: `enc123**456&789`

### Justificación de Decisiones Técnicas

#### 1. Stack

##### 1.1 Next.js + Tailwind CSS + Typescript Frontend (SPA + SSR)

Elegí usar React con Typescript como principales tecnologías de frontend, ya que:

- Son tecnologías maduras y bien mantenidas
- Next.js permite el desarrollo de una SPA + SSR, lo que me parece ideal en este contexto. Implementé la pagina de admin como SPA, ya que el dinamismo y UX son esenciales para esta pagina, y la de tienda con SSR, ya que permite buena performance y routing para: SEO, generación de links compartibles y descubribles desde los motores de búsqueda.
- Permiten una rápida iteración, fuerzan un buen orden del código, facilitan el mantenimiento y proveen posibilidades de escalabilidad en el futuro.
- Otro beneficio de Next.js es que permite deployear integradamente en Vercel.
- Typescript para incluir seguridad en el tipado del código, puede ayudar a prevenir errores sobretodo cuando se desarrolla rápido y el entorno exige rapidez.
- Son tecnologías que ya utilizan en Encuadrado y he usado en proyectos anteriores.

##### 1.2 Supabase Backend (SQL)

- Decidí usar base de datos SQL ya que por la naturaleza del producto, existen entidades de datos que requieren ser relacionadas entre si y ayuda a mantener estructuras predeterminadas aún con posibilidad de flexibilidad.
- Otras razones de usar SQL: consistencia ACID para transacciones y pagos, facilidad de queries complejas y permiten diseñar el schema pensando en escalabilidad futura con índices y relaciones optimizadas.
- Supabase es una excelente tecnología de backend como servicio, que permite levantar un backend completo y robusto en poco tiempo: Incluye autenticación, base de datos, storage, funciones, webhooks, etc.
- Escala super bien y facilita la posterior migración a una app in-house de backend de ser necesario.

#### 2. Estructura del Proyecto

El proyecto es un monolito "modularizado", esto tiene varios beneficios:

- Facilita la iteración y mantenimiento del código. unificando infraestructura, dependencias y código.
- Facilita la escalabilidad del proyecto.
- Mantiene la separación clara entre módulos permitiendo evolucionar a servicios separados cuando el volumen lo justifique.

## Funcionalidades Implementadas

### ✅ Requerimientos Mínimos - Panel Admin (/admin)

- **Autenticación**: Login con credenciales específicas
- **Gestión de Eventos**: CRUD completo con todos los campos requeridos
  - Nombre, descripción, duración, precio, límite de cupos
  - Link para videollamada (eventos online)
  - Dirección (eventos presenciales)
- **Gestión de Contenido Digital**: CRUD completo para material digital
- **Lista de Inscritos**: Vista detallada con todos los datos requeridos
- **Lista de Descargas**: Tracking de clientes que descargaron contenido

### ✅ Requerimientos Mínimos - Tienda (/store)

- **Vitrina Principal**: Dos secciones claramente diferenciadas (Eventos y Contenido)
- **Páginas de Detalle**: Información completa de cada item
- **Flujo de Pago**: Simulación realista de pasarela de pago
- **Lógica de Aprobación**: Basada en último dígito del precio
- **Vistas de Confirmación**: Pago exitoso y pago rechazado
- **Gestión de Stock**: Control de cupos en tiempo real

### 🌟 Funcionalidades Adicionales Implementadas

- **[Característica 1]**: [Descripción y justificación]
- **[Característica 2]**: [Descripción y justificación]
- **Validaciones Avanzadas**: [Detalles de validaciones implementadas]

### 🚧 Features Despriorizadas (y por qué)

#### Notificaciones por Email

#### Responsive Avanzado

#### Sistema de Descarga Segura de Archivos

## 🎯 Supuestos Realizados

1. **Modelo de Negocio**: Asumí que Encuadrado toma una comisión por transacción, por lo que implementé tracking detallado de pagos
2. **Tipos de Usuario**: Separé claramente los flujos admin vs cliente final para optimizar cada experiencia
3. **Gestión de Archivos**: Prioricé simplicidad con storage local vs complejidad de CDN para el MVP
4. **Flujo de Pagos**: Simulé un flujo realista que se pueda integrar fácilmente con Mercado Pago u otras pasarelas

## 📈 Métricas y Analytics

Si esto fuera producción, implementaría en el panel de admin un dashboard con tracking de:

**Métricas de Negocio:**

- GMV (Gross Merchandise Value) por profesional
- Average Order Value
- Tasa de eventos sold-out
- Métricas funnel: vistas únicas vs pagos (eficiencia landing)
- Time to first sale (nuevos profesionales)

Además se podría incluir monitoreo y observabilidad de:

- Performance de carga de página
- Errores en flujo de pago

## 🔮 Posibles Próximos Pasos Desde Aquí

### Fase 2 - Funcionalidades

- [ ] Sistema completo de notificaciones (email + SMS)
- [ ] Analytics dashboard para profesionales
- [ ] Sistema de reviews y ratings
- [ ] Integración con calendar para eventos

### Mejoras Técnicas

- [ ] Implementar CDN para archivos estáticos
- [ ] Cache layer (Redis) para mejor performance
- [ ] Background jobs para procesamiento pesado
- [ ] Monitoring y alertas

### Escalabilidad

- [ ] Separación en microservicios cuando el volumen lo justifique
- [ ] Database sharding por profesional
- [ ] Rate limiting y anti-fraud
