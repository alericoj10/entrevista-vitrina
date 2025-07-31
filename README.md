# Vitrina - Encuadrado Product Engineer

Postulante: Alejandro Rico

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

### 🌟 Funcionalidades Adicionales Implementadas

- Si un evento ya no está vigente (ya sea porque no hay más cupos o porque ya pasó la fecha del evento) debe mostrarse pero no clickeable (deshabilitado)
- Agregar input para aplicar código de descuento
- Poder crear un código de descuento aplicable al momento de pagar
- Como profesional, poder inscribir a un asistente y que esto genere un link de pago que le permita a éste pagar en cualquier momento previo a la fecha del evento

### 🚧 Features Despriorizadas (y por qué)

#### Notificaciones por Email

Si bien era una funcionalidad deseable, me parece que pude sustituir la notificación por email con las páginas de pago exitoso y rechazado, incluyendo ahí información relevante.

#### Responsive Avanzado

No implementé responsive avanzado ya que el MVP requiere una experiencia simple y clara para el usuario final. Entendiendo que el desarrollo móvil suele ir con un equipo dedicado, distintas decisiones de diseño y UX. Mi foco no fue mobile-first sino mobile-friendly.

#### Sistema de Descarga Segura de Archivos

No implementé sistema de descarga segura de archivos, ya que a mi parecer dependía de las notificaciones por email y configuraciones extra de supabase con links. De todas formas la aplicación actual permite almacenar en storage de supabase los archivos y habilitar links seguros. Esto es algo que el profesional puede compartir, existiendo el flujo de pagos e inscripciones.

#### Vitrina multi-profesional

Para esta ocasión, me enfoque en desarrollar el producto para solo un profesional, esto simplificó el desarrollo y permitió un MVP más rápido. Validando flujos y casos de uso clave. Igualmente la aplicación es de fácil extensión para permitir acceso independiente de profesionales y gestión de sus productos. La experiencia del usuario final sería la misma.

## 📈 Métricas y Analytics

Si esto fuera producción, implementaría en el panel de admin un dashboard con tracking de:

**Métricas de Negocio:**

- GMV (Gross Merchandise Value) por profesional
- Average Order Value: Valor promedio de compra para cada profesional
- Tasa de eventos sold-out: Porcentaje de eventos que no quedaron cupos disponibles
- Métricas funnel: vistas únicas vs pagos (eficiencia landing)
- Time to first sale (nuevos profesionales)

Además se podría incluir monitoreo y observabilidad de:

- Performance de carga de páginas
- Errores en flujo de pagos
- Errores en panel de admin

## 🔮 Posibles Próximos Pasos Desde Aquí

### Fase 2 - Funcionalidades

- [ ] Sistema completo de notificaciones (email + SMS)
- [ ] Sistema de descarga y habilitación de Contenidos Digitales
- [ ] Dashboard con analytics para profesionales
- [ ] Sistema de reviews y ratings de productos
- [ ] Filtros y recomendaciones de productos por categoría/prefesional/ranking/etc
- [ ] Actualizar estado de pago con clientes registrados manualmente + link de pago

### Escalabilidad

- [ ] Separación en microservicios cuando el volumen lo justifique
- [ ] Database sharding por profesional
- [ ] Idempotencia en pagos para asegurar cumplimiento de capacidad en eventos.
- [ ] Implementar seguridad en descarga de Contenidos Digitales, tipo Gumroad para evitar fraude, plagio y copias.
