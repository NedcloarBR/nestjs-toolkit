<h1 align="center">
  <br>
  <img src="https://github.com/NedcloarBR/nestjs-toolkit/blob/master/logo.svg" width="32px" alt="nestjs-toolkit logo"/> 
  NestJS Toolkit
  <br>
</h1>

<h3 align=center>🚀 A powerful <b>CLI toolkit</b> for <b><a href="https://nestjs.com/">NestJS</a></b> applications with utilities for configuration, key generation, and more!</h3>

<div align=center>

[![npm version](https://img.shields.io/npm/v/@nedcloarbr/nestjs-toolkit.svg?style=flat-square)](https://www.npmjs.com/package/@nedcloarbr/nestjs-toolkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.19-brightgreen.svg)](https://nodejs.org/)
[![Module](https://img.shields.io/badge/module-ESM--only-blueviolet.svg)](https://nodejs.org/api/esm.html)

</div>

<p align="center">
  <a href="#❓-about">About</a>
  •
  <a href="#✨-features">Features</a>
  •
  <a href="#📦-installation">Installation</a>
  •
  <a href="#🚀-usage">Usage</a>
  •
  <a href="#📝-commands">Commands</a>
  •
  <a href="#🔧-global-helpers">Global Helpers</a>
  •
  <a href="#🧩-mixin-utilities">Mixin Utilities</a>
  •
  <a href="#🌐-http-utilities">HTTP Utilities</a>
  •
  <a href="#🗂️-application-configuration">Application Configuration</a>
  •
  <a href="#🔠-utility-types">Utility Types</a>
  •
  <a href="#📖-license">License</a>
  •
  <a href="#🗞️-credits">Credits</a>
</p>

## ❓ About

**NestJS Toolkit** is a comprehensive CLI tool designed to streamline your NestJS development workflow. Built with [nest-commander](https://github.com/jmcdo29/nest-commander) and [NestJS](https://nestjs.com/), it provides essential utilities for managing configurations, generating secure keys, and organizing your project structure efficiently.

If you liked the project, feel free to leave a ⭐ here on Github for it to grow more and more!

## ✨ Features

- 🎨 **Beautiful CLI Interface** - Colorful and intuitive command-line interface with categorized help system
- 🔑 **Key Generation** - Generate secure keys for JWT, sessions, cookies, and application secrets
- ⚙️ **Configuration Management** - Initialize and manage CLI configuration files
- 📋 **Categorized Commands** - Commands organized by categories for better navigation
- 🎯 **Interactive Prompts** - User-friendly interactive prompts for complex operations
- 🔄 **Force Options** - Override confirmations when needed with force flags
- 📊 **Detailed Help System** - Comprehensive help with category-based command display
- 🔧 **Global Helpers** - Utility functions for async operations, dates, security, and strings that can be registered globally
- 🧩 **Mixin Utilities** - Type-safe mixin composition with `CreateMixin`, `UseMixins`, `ComposeMixins`, and more
- 🌐 **HTTP Utilities** - Adapter-agnostic base controller, filters, interceptors, middlewares, and param decorators
- 🗂️ **Application Configuration** - File-name-derived config namespaces, directory auto-loading, and environment validation with class-validator or any Standard Schema
- 🔠 **Utility Types** - Common TypeScript utility types (`Awaitable`, `Maybe`, `DeepPartial`, `Prettify`, and more)

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g @nedcloarbr/nestjs-toolkit
# or
yarn global add @nedcloarbr/nestjs-toolkit
```

### Local Installation

```bash
npm install --save-dev @nedcloarbr/nestjs-toolkit
# or
yarn add -D @nedcloarbr/nestjs-toolkit
```

### Requirements

- Node.js >= 20.19
- npm or yarn
- `@nestjs/common` ^11 || ^12
- `@nestjs/core` ^11 || ^12
- `reflect-metadata` >= 0.1
- `rxjs` >= 7.1

> `@nestjs/common`, `@nestjs/core`, `reflect-metadata`, and `rxjs` are peer dependencies — they must be installed in your project. If you already have a NestJS application, these are already present.

Optional peer dependencies, needed only by [Application Configuration](#🗂️-application-configuration):

- `@nestjs/config` ^4 || ^12
- `class-validator` ^0.14 || ^0.15 and `class-transformer` ^0.5 — for class-based env schemas
- or any [Standard Schema](https://standardschema.dev) library (zod, valibot, arktype, …) instead

> These are resolved lazily, so importing the package without them installed works fine.

### ESM only

This package ships as **ESM only** (`"type": "module"`) — there is no CommonJS build.

- **ESM projects** (`"type": "module"` in your `package.json`): import it directly.
- **CommonJS projects**: use a dynamic `await import("@nedcloarbr/nestjs-toolkit")`, or `require()` it on Node.js versions that support `require(esm)` (Node.js >= 20.19 / >= 22.12).

The CLI (`nestjs-toolkit`) works the same way regardless of your project's module format.

## 🚀 Usage

After installation, you can use the `nestjs-toolkit` command (or the alias you've configured) in your terminal:

```bash
nestjs-toolkit [command] [options]
```

### Get Help

```bash
# Display all available commands
nestjs-toolkit --help

# Display commands by category
nestjs-toolkit help:category <category-name>

# Get help for a specific command
nestjs-toolkit <command> --help
```

## 📝 Commands

### Configuration Commands

| Command | Description | Options | Usage |
|---------|-------------|---------|-------|
| `init` | Initialize the CLI configuration file for your project | `-f, --force` - Force initialization without confirmation | `nestjs-toolkit init [--force]` |
| `make:config` | Create a config file in the standard format, with its env schema next to it | `-s, --schema <kind>` - `class-validator`, `zod`, `valibot`, `arktype` or `none`<br>`-m, --module <format>` - `esm` or `cjs` (read from the nearest `package.json` when omitted)<br>`-d, --dir <path>` - Target directory<br>`-f, --force` - Overwrite an existing file<br>`--skip-register` - Do not add it to `defineEnv({ namespaces })` | `nestjs-toolkit make:config <name> [--schema <kind>]` |

**Example:**
```bash
# Interactive initialization
nestjs-toolkit init

# Force initialization without confirmation
nestjs-toolkit init --force

# Create src/config/mailer.config.ts and register it in defineEnv({ namespaces })
nestjs-toolkit make:config mailer

# Same, with a zod schema instead of the saved default
nestjs-toolkit make:config mailer --schema zod
```

#### `nestjs-toolkit.json`

`init` writes it at the project root. `make:config` reads its `config` block, so it never has to ask:

```json
{
  "envFilePath": ".env",
  "config": {
    "dir": "src/config",
    "schema": "class-validator"
  }
}
```

Without the file, or without the `config` block, `make:config` falls back to `src/config` and `class-validator`. A flag always wins over the file.

The module format is not a setting: `make:config` reads it from the nearest `package.json`, the way Node does. `"type": "module"` generates `defineConfig(import.meta, …)`; no `type`, or `"commonjs"`, generates `defineConfig(__filename, …)`, since `import.meta` does not compile to CommonJS. The import it adds to `defineEnv` follows the extension style the file already uses — `.js` or none. The output says which format it picked and why; `--module` overrides it.

### Key Generation Commands

Generate secure cryptographic keys for various purposes. All commands automatically add the generated key to your `.env` file.

| Command | Description | Usage |
|---------|-------------|-------|
| `key:app` | Generate a new application key | `nestjs-toolkit key:app` |
| `key:jwt` | Generate a new JWT (JSON Web Token) secret key | `nestjs-toolkit key:jwt` |
| `key:session` | Generate a new session secret key | `nestjs-toolkit key:session` |
| `key:cookie` | Generate a new cookie secret key | `nestjs-toolkit key:cookie` |

**Example:**
```bash
# Generate a JWT secret key
nestjs-toolkit key:jwt

# Generate a session secret key
nestjs-toolkit key:session
```

### Help Commands

| Command | Description | Options | Usage |
|---------|-------------|---------|-------|
| `help:category` | Display all commands from a specific category | `-d, --detailed` - Show detailed information for each command | `nestjs-toolkit help:category <category-name> [--detailed]` |

**Available Categories:**
- `config` - Configuration management commands
- `key` - Key generation commands
- `help` - Help and documentation commands

**Example:**
```bash
# List all key generation commands
nestjs-toolkit help:category key

# Show detailed information
nestjs-toolkit help:category key --detailed
```

## 🔧 Global Helpers

NestJS Toolkit provides a collection of utility functions that can be registered globally in your application. These helpers cover common tasks like async operations, date manipulation, security functions, and string utilities.

### Registering Helpers

```typescript
import { registerHelpers } from '@nedcloarbr/nestjs-toolkit';

// Register all helpers
await registerHelpers({ verbose: true });

// Register specific categories only
await registerHelpers({ include: ['async', 'date'], verbose: true });

// Exclude specific categories
await registerHelpers({ exclude: ['security'], verbose: true });

// Override existing globals
await registerHelpers({ override: true, verbose: true });
```

### Available Helper Categories

#### 🔄 Async Helpers

| Function | Description | Example |
|----------|-------------|---------|
| `sleep(ms)` | Pauses execution for specified milliseconds | `await sleep(1000)` |
| `retry(fn, attempts, delayMs)` | Retries a function with delays between attempts | `await retry(() => fetchData(), 3, 500)` |
| `timeout(promise, ms)` | Races a promise against a timeout | `await timeout(fetchData(), 5000)` |

#### 📅 Date Helpers

| Function | Description | Example |
|----------|-------------|---------|
| `now()` | Returns current date and time | `const date = now()` |
| `today()` | Returns today's date in ISO format (YYYY-MM-DD) | `const dateStr = today()` |
| `addDays(date, days)` | Adds days to a date | `addDays(new Date(), 7)` |
| `subDays(date, days)` | Subtracts days from a date | `subDays(new Date(), 3)` |
| `diffInDays(date1, date2)` | Calculates difference in days between dates | `diffInDays(date1, date2)` |
| `isPast(date)` | Checks if date is in the past | `isPast(someDate)` |
| `isFuture(date)` | Checks if date is in the future | `isFuture(someDate)` |

#### 🔒 Security Helpers

| Function | Description | Example |
|----------|-------------|---------|
| `randomHex(length)` | Generates random hexadecimal string | `randomHex(32)` |
| `toSha256(input)` | Converts string to SHA-256 hash | `toSha256('password')` |
| `mask(str, visible, maskChar)` | Masks a string leaving last N characters visible | `mask('1234567890', 4)` |

#### 📝 String Helpers

| Function | Description | Example |
|----------|-------------|---------|
| `slugify(text)` | Converts text to URL-friendly slug | `slugify('Hello World!')` |
| `capitalize(str)` | Capitalizes first character | `capitalize('hello')` |
| `titleCase(str)` | Converts to title case | `titleCase('hello world')` |
| `truncate(str, limit, suffix)` | Truncates string with suffix | `truncate('Long text', 5)` |

### Registration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `include` | `string[]` | `[]` | Categories to include. If not set, all are included |
| `exclude` | `string[]` | `[]` | Categories to exclude |
| `verbose` | `boolean` | `false` | Enable verbose logging during registration |
| `override` | `boolean` | `false` | Allow overwriting existing global functions |

**Available categories:** `async`, `date`, `security`, `string`

## 🧩 Mixin Utilities

NestJS Toolkit provides type-safe mixin composition utilities. Mixins allow you to share behavior (methods and fields) across multiple classes without inheritance chains.

### `CreateMixin`

Wraps a class into a reusable mixin factory. The class can implement one or more interfaces to define its contract.

```typescript
import { CreateMixin, UseMixins } from '@nedcloarbr/nestjs-toolkit';

// 1. Define the contract
interface IWithTimestamps {
  createdAt: Date;
  updatedAt: Date;
}

// 2. Implement the mixin class
class TimestampsMixin implements IWithTimestamps {
  public createdAt!: Date;
  public updatedAt!: Date;
}

// 3. Create the mixin factory
export const WithTimestamps = CreateMixin(TimestampsMixin);
```

> **Declaration merging tip:** when the interface and class share the same name, TypeScript merges them — the `implements` check becomes circular and won't enforce missing fields. Use different names (e.g. `IWithTimestamps` / `TimestampsMixin`) if you want TypeScript to enforce the contract.

### `UseMixins`

Composes one or more mixin factories into a base class to extend from.

```typescript
// Single mixin
class UserEntity extends UseMixins(WithTimestamps) {}

// Multiple mixins via rest params
class PostEntity extends UseMixins(WithTimestamps, WithSoftDelete) {}

// Multiple mixins via array
class PostEntity extends UseMixins([WithTimestamps, WithSoftDelete]) {}

// Single mixin + base class
class AdminEntity extends UseMixins(WithTimestamps, BaseEntity) {}

// Multiple mixins + base class
class SuperEntity extends UseMixins([WithTimestamps, WithSoftDelete], BaseEntity) {}
```

### `ComposeMixins`

Combines multiple mixin factories into a single reusable factory.

```typescript
import { ComposeMixins } from '@nedcloarbr/nestjs-toolkit';

export const WithAudit = ComposeMixins(WithTimestamps, WithSoftDelete);

class UserEntity extends UseMixins(WithAudit) {}
```

### `isMixin`

Runtime check to determine if a value is a mixin factory.

```typescript
import { isMixin } from '@nedcloarbr/nestjs-toolkit';

isMixin(WithTimestamps); // true
isMixin(BaseEntity);     // false
```

### TypeORM example

```typescript
import { CreateMixin, UseMixins } from '@nedcloarbr/nestjs-toolkit';
import { DeleteDateColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

class SoftDeleteMixin {
  @Index()
  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt!: Date | null;
}
export const WithSoftDelete = CreateMixin(SoftDeleteMixin);

class TimestampsMixin {
  @CreateDateColumn({ name: 'created_at' })
  public createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt!: Date;
}
export const WithTimestamps = CreateMixin(TimestampsMixin);

@Entity('users')
class UserEntity extends UseMixins([WithSoftDelete, WithTimestamps]) {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
// UserEntity instances have: id, name, deletedAt, createdAt, updatedAt ✓
```

### API Reference

| Function/Type | Description |
|---------------|-------------|
| `CreateMixin(MixinClass)` | Wraps a class into a mixin factory |
| `UseMixins(mixin)` | Extends a single mixin |
| `UseMixins(f1, f2, ...)` | Composes multiple mixins via rest params |
| `UseMixins([...mixins])` | Composes multiple mixins via array |
| `UseMixins([...mixins], Base)` | Composes mixins on top of a base class |
| `ComposeMixins(...mixins)` | Combines factories into a single reusable factory |
| `isMixin(value)` | Returns `true` if value is a mixin factory |
| `MixinType<T>` | Extracts the added type from a mixin factory |
| `AbstractConstructor<T>` | `abstract new (...args: any[]) => T` |
| `Mixin<TAdded>` | Type of a mixin factory |
| `MixinReturn<TBase, TAdded>` | Return type of a mixin applied to a base class |
| `ExtractAdded<T[]>` | Extracts and intersects added types from a mixin array |
| `UnionToIntersection<U>` | Converts a union type to an intersection type |

## 🌐 HTTP Utilities

Adapter-agnostic HTTP utilities that work with both Express and Fastify adapters.

### `BaseController`

Abstract base class with standardized response helpers and exception shortcuts.

```typescript
import { BaseController } from '@nedcloarbr/nestjs-toolkit';

@Controller('users')
export class UsersController extends BaseController {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  @Get()
  async findAll(@Query() query: PaginationQuery) {
    const result = await this.usersService.findAll(query);
    return this.paginated(result); // compatible with nestjs-typeorm-paginate and nestjs-paginate
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) this.notFound(`User #${id} not found`);
    return this.ok(user);
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return this.created(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return this.noContent();
  }
}
```

#### Response helpers

| Method | Status | Description |
|--------|--------|-------------|
| `ok(data, message?, path?)` | 200 | Standard success response |
| `created(data, message?, path?)` | 201 | Resource created |
| `accepted(data, message?, path?)` | 202 | Accepted for async processing |
| `partialContent(data, message?, path?)` | 206 | Partial content / range response |
| `noContent()` | 204 | No content (returns `null`) |
| `paginated(result, message?, path?)` | 200 | Paginated response — accepts `nestjs-typeorm-paginate` and `nestjs-paginate` results |

#### Exception shortcuts

| Method | Throws |
|--------|--------|
| `notFound(message?)` | `NotFoundException` (404) |
| `badRequest(message?)` | `BadRequestException` (400) |
| `conflict(message?)` | `ConflictException` (409) |
| `unprocessable(message?)` | `UnprocessableEntityException` (422) |
| `forbidden(message?)` | `ForbiddenException` (403) |
| `unauthorized(message?)` | `UnauthorizedException` (401) |

### Filters

Both filters use `HttpAdapterHost` to send responses in an adapter-agnostic way and must be injected via NestJS DI.

#### `HttpExceptionFilter`

Catches all `HttpException` instances and formats them into a standardized error response.

#### `AllExceptionsFilter`

Catches every unhandled exception. Logs unexpected errors and formats them consistently.

```typescript
// main.ts
const httpAdapterHost = app.get(HttpAdapterHost);
app.useGlobalFilters(
  new AllExceptionsFilter(httpAdapterHost),   // catches everything else
  new HttpExceptionFilter(httpAdapterHost),   // highest priority for HttpExceptions
);

// or via APP_FILTER (recommended — supports dependency injection)
// app.module.ts
providers: [
  { provide: APP_FILTER, useClass: AllExceptionsFilter },
  { provide: APP_FILTER, useClass: HttpExceptionFilter },
]
```

**Error response shape:**

```json
{
  "statusCode": 404,
  "message": "User #42 not found",
  "error": "Not Found",
  "timestamp": "2026-06-04T00:00:00.000Z",
  "path": "/users/42"
}
```

### Interceptors

#### `TransformInterceptor`

Wraps raw controller responses into a standardized envelope. Automatically skips responses already formatted by `BaseController`.

```typescript
app.useGlobalInterceptors(new TransformInterceptor());
```

**Response shape:**

```json
{
  "statusCode": 200,
  "message": "OK",
  "data": { ... },
  "timestamp": "2026-06-04T00:00:00.000Z",
  "path": "/users"
}
```

#### `LoggingInterceptor`

Logs every incoming request and outgoing response with duration. Automatically includes the `X-Request-ID` if `RequestIdMiddleware` is registered.

```
→ GET /users
← GET /users 200 +12ms
[uuid] → POST /users
[uuid] ← POST /users 201 +45ms
```

#### `TimeoutInterceptor`

Throws `RequestTimeoutException` if a handler exceeds the configured time limit.

```typescript
// Global — 5 seconds default
app.useGlobalInterceptors(new TimeoutInterceptor());

// Custom timeout
app.useGlobalInterceptors(new TimeoutInterceptor(10000));
```

### Middlewares

All middlewares implement `NestMiddleware` and work with both Express and Fastify adapters.

#### `RequestIdMiddleware`

Generates or propagates a `X-Request-ID` header. If the header is already present in the incoming request (e.g., from an upstream service), it is reused. The ID is also available as `request.requestId`.

```typescript
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
```

#### `ClientIpMiddleware`

Extracts the real client IP considering reverse proxy headers in priority order: `CF-Connecting-IP` → `X-Real-IP` → `X-Forwarded-For` → `X-Client-IP` → `remoteAddress`. The result is available as `request.clientIp`.

```typescript
consumer.apply(ClientIpMiddleware).forRoutes('*');
```

#### `MaintenanceMiddleware`

Returns `503 Service Unavailable` when maintenance mode is active. Accepts a static boolean or a function evaluated on every request.

```typescript
// Via environment variable (checked per request)
consumer
  .apply(new MaintenanceMiddleware({
    enabled: () => process.env.MAINTENANCE_MODE === 'true',
    message: 'Service is temporarily unavailable. Please try again later.',
  }))
  .forRoutes('*');
```

#### `TrailingSlashMiddleware`

Redirects or rewrites URLs with trailing slashes. Useful for normalizing routes and avoiding duplicate entries in logs and analytics.

```typescript
// Redirect /users/ → /users with 301 (default)
consumer.apply(new TrailingSlashMiddleware()).forRoutes('*');

// Silent rewrite without redirect
consumer.apply(new TrailingSlashMiddleware({ redirect: false })).forRoutes('*');

// Temporary redirect
consumer.apply(new TrailingSlashMiddleware({ statusCode: HttpStatus.FOUND })).forRoutes('*');
```

### Param Decorators

#### `@RequestId()`

Extracts the request ID set by `RequestIdMiddleware`. Falls back to the `X-Request-ID` header if the middleware is not registered.

#### `@ClientIp()`

Extracts the client IP set by `ClientIpMiddleware`. Falls back to the native `req.ip` if the middleware is not registered.

#### `@Headers(key?)`

Extracts a specific header by key or all headers if no key is provided. Keys are normalized to lowercase.

```typescript
@Get('profile')
getProfile(
  @RequestId() requestId: string,
  @ClientIp() ip: string,
  @Headers('authorization') token: string,
  @Headers() allHeaders: Record<string, string>,
) {}
```

### Exported types

| Type | Description |
|------|-------------|
| `StandardResponse<T>` | Envelope for `ok`, `created`, `accepted`, `partialContent` |
| `PaginatedResponse<T>` | Envelope for `paginated` — includes `meta` and optional `links` |
| `ErrorResponse` | Shape of error responses from the filters |
| `PaginationLinks` | Links shape (`first`, `previous`, `current`, `next`, `last`) |
| `PaginationResult<T>` | Union of `nestjs-typeorm-paginate` and `nestjs-paginate` result shapes |

## 🗂️ Application Configuration

A configuration subsystem for the applications that consume this package: **creating a config means creating a file** — no array to edit, no barrel to update, no `AppModule` to touch.

These helpers rely on optional peer dependencies. Install only what you use:

```bash
npm install @nestjs/config
# class-validator schemas
npm install class-validator class-transformer
# or any Standard Schema library instead (zod, valibot, arktype, ...)
npm install zod
```

> They are declared as **optional** peer dependencies and are resolved lazily, so importing `@nedcloarbr/nestjs-toolkit` never loads them. You only need them if you call the config helpers.

### `defineConfig`

Wraps `registerAs` from `@nestjs/config`, deriving the namespace from the **file name**: `cdn.config.ts` becomes the `cdn` namespace, so the name is never repeated as a string.

```typescript
// src/config/cdn.config.ts  (ESM)
import { defineConfig } from '@nedcloarbr/nestjs-toolkit';

export default defineConfig(import.meta, () => ({
  ttlMs: 60_000,
  baseUrl: process.env.CDN_URL,
}));
```

```typescript
// src/config/cdn.config.ts  (CommonJS)
import { defineConfig } from '@nedcloarbr/nestjs-toolkit';

export default defineConfig(__filename, () => ({
  ttlMs: 60_000,
  baseUrl: process.env.CDN_URL,
}));
```

A file that is not named `<namespace>.config.<ext>` throws a `ConfigSourceError` at boot — a silently wrong namespace is worse than a loud failure.

#### Typing the injected config

The return type is the one `registerAs` produces, so **the config file exports no type at all** — the consumer derives it from the default export it already imports for `.KEY`:

```typescript
import { InferConfig } from '@nedcloarbr/nestjs-toolkit';
import cdnConfig from './config/cdn.config.js';

@Injectable()
export class CdnService {
  constructor(
    @Inject(cdnConfig.KEY)
    private readonly config: InferConfig<typeof cdnConfig>,
  ) {}
}
```

`InferConfig` mirrors `ConfigType` from `@nestjs/config` (awaiting async factories too), so the consuming file does not need to import it.

If you would rather name the type once and share it, give the factory a const and export it alongside — TypeScript cannot take `typeof` of an anonymous default export:

```typescript
const mailerConfig = defineConfig(import.meta, () => ({ from: 'noreply@example.com' }));

export default mailerConfig;
export type MailerConfig = InferConfig<typeof mailerConfig>;
```

### `loadConfigs` / `loadConfigsSync`

Scan a directory, pick up every `*.config.js` file, sort them by name for a deterministic order, and hand the factories to `ConfigModule`.

```typescript
import { join } from 'node:path';
import { ConfigModule } from '@nestjs/config';
import { loadConfigs } from '@nedcloarbr/nestjs-toolkit';
import { validate } from './env/index.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: loadConfigs(join(import.meta.dirname, 'config')),
      validate,
    }),
  ],
})
export class AppModule {}
```

`loadConfigs` returns `Array<Promise<ConfigFactory>>` and lets `ConfigModule` await them, so the package never needs a top-level `await`. `loadConfigsSync` resolves the same factories through `require` for setups that want `imports` fully synchronous.

> The directory is the **built** one (`dist/config`), not the TypeScript sources — the runtime sees `.js`, never `.ts`. A sibling `index.js` or `define.js` is ignored: only `*.config.js` is picked up.

### `defineEnv`

Validates the environment and returns the `validate` that `ConfigModule.forRoot` expects. It accepts a **class-validator** class or any **Standard Schema** (zod, valibot, arktype, …).

```typescript
// src/env/index.ts
import { defineEnv, loadConfigsSync } from '@nedcloarbr/nestjs-toolkit';
import { AppEnv, DatabaseEnv } from './schemas.js';

// Loaded synchronously so the co-located schemas exist before validate runs.
export const load = loadConfigsSync(join(import.meta.dirname, '../config'));

export const validate = defineEnv({
  schemas: [AppEnv, DatabaseEnv],
  configs: load,
});
```

For a single schema and no config discovery, pass it directly: `defineEnv(AppEnv)`.

`schemas` holds what is not tied to a single config file — the application's own variables, or ones several configs share. `configs` contributes the schemas co-located through `defineConfig`.

#### Schemas next to the config that uses them

**Each config file declares the variables it consumes**, and its factory receives them already validated and typed. Adding a config that needs a new variable stays a one-file change:

```typescript
// src/config/mailer.config.ts — the only file you add
import { IsInt, IsPositive, IsString } from 'class-validator';
import { defineConfig } from '@nedcloarbr/nestjs-toolkit';

class MailerEnv {
  @IsString()
  readonly MAILER_HOST: string = 'smtp.example.com';

  @IsInt()
  @IsPositive()
  readonly MAILER_PORT: number = 587;
}

export default defineConfig(import.meta, MailerEnv, (env) => ({
  host: env.MAILER_HOST,   // typed as MailerEnv
  port: env.MAILER_PORT,
}));
```

> `nestjs-toolkit make:config mailer` scaffolds this file — with a class-validator, zod, valibot or arktype schema — and adds it to `defineEnv({ namespaces })`. See [Configuration Commands](#configuration-commands). When nothing in the project calls `defineEnv`, it says so instead: the config still validates its own schema when it loads, but its failures are no longer reported together with the rest at boot.

Either kind of schema works in either place — a co-located schema can be a Standard Schema too:

```typescript
const StorageEnv = z.object({
  STORAGE_BUCKET: z.string().min(3).default('local-bucket'),
});

export default defineConfig(import.meta, StorageEnv, (env) => ({
  bucket: env.STORAGE_BUCKET,
}));
```

The default lives next to the constraint, so a missing variable falls back instead of failing. Every schema is validated against the same environment and the failures are reported together — across both kinds — each scoped to its namespace:

```
EnvValidationError: Environment validation failed:
  - NODE_ENV: NODE_ENV must be one of the following values: development, production, test
  - [app] PORT: PORT must be a positive number
  - [mailer] MAILER_PORT: MAILER_PORT must be a positive number
  - [storage] STORAGE_BUCKET: Too small: expected string to have >=3 characters
```

> **Use `loadConfigsSync`.** `ConfigModule.forRoot` calls `validate` *before* it awaits `load`, so with the async `loadConfigs` the schemas are not loaded yet when validation runs. If you need the async loader, await it yourself first: `const load = await Promise.all(loadConfigs(dir))`.

Only the keys a schema declares are taken from it when the results are merged, so one config's untouched copy of a variable can never overwrite another's coerced value.

#### Reading the values

Values are read through Nest's own DI, which is typed end to end and mockable in tests:

```typescript
// A config namespace, fully typed
@Inject(appConfig.KEY)
private readonly config: InferConfig<typeof appConfig>;
```

```typescript
// Any validated variable, through ConfigService
configService.get('DB_PORT');   // 5432 (number) — the coerced value
```

If you need the validated environment outside the container — a TypeORM CLI datasource, a script — call the validator yourself and hold the result. It is typed, explicit, and carries no initialization order:

```typescript
const env = validate({ ...process.env });   // typed as AppEnv & DatabaseEnv
```

A single namespace needs no validator: call its factory, as you would one from `registerAs`. Where no `defineEnv` has run, a co-located schema is validated against `process.env` first, with the default options, and throws `EnvValidationError` if it fails. Once a `defineEnv` has run in the process, a config it did not validate throws `EnvNotInitializedError` instead — it was left out of `configs`:

```typescript
import mailerConfig from './config/mailer.config.js';

const mailer = mailerConfig();   // { host: string; port: number }
```

The return type follows the factory: a sync factory returns the object, an `async` one a `Promise` of it.

> **Never import that module from a config file.** The module that calls `defineEnv` is the module that loads the configs, so importing it back creates a cycle `require` cannot resolve. The loader detects it and throws `ConfigCycleError` naming the offending file.

#### Autocomplete on `ConfigService`

Hand `defineEnv` the same configs imported and keyed by namespace, and `InferAppConfig` types every `ConfigService` path straight from the validator — no generated file, no command:

```typescript
// src/env/index.ts
import app from '../config/app.config.js';
import cdn from '../config/cdn.config.js';
import mailer from '../config/mailer.config.js';

export const load = loadConfigsSync(join(import.meta.dirname, '../config'));

export const validate = defineEnv({
  schemas: [AppEnv, DatabaseEnv],
  configs: load,                    // runtime: whatever the folder holds
  namespaces: { app, cdn, mailer }, // types: checked against the folder
});
```

```typescript
import { ConfigService } from '@nestjs/config';
import type { InferAppConfig } from '@nedcloarbr/nestjs-toolkit';
import type { validate } from './env/index.js';

type AppConfig = InferAppConfig<typeof validate>;

@Injectable()
export class SomeService {
  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  method() {
    this.config.get('DB_PORT', { infer: true });      // number — defineEnv schemas
    this.config.get('MAILER_PORT', { infer: true });  // number — co-located in mailer.config.ts
    this.config.get('cdn.ttlMs', { infer: true });    // number — namespace

    this.config.get('DB_PORTT', { infer: true });     // ✗ compile error
    this.config.get('cdn.nope', { infer: true });     // ✗ compile error
  }
}
```

`WasValidated = true` drops the `| undefined` from every result, which is correct here: `defineEnv` blocks the boot if anything is missing.

**Why the imports.** TypeScript only knows the type of a file that some code imports by a literal path. `loadConfigsSync` finds the files at runtime, after compilation, so its result is typed as a plain array — no helper can recover `cdn` or `ttlMs` from it. The `namespaces` map is that literal import and nothing more: the folder stays the runtime source of truth.

**It cannot drift.** When `configs` and `namespaces` are both given, `defineEnv` checks them against each other as soon as it is called:

```
ConfigNamespacesError: defineEnv({ namespaces }) does not match the loaded configs:
  - "storage" is loaded from the config folder but missing from namespaces, so its keys are not typed
  - the "cdn" entry points at the "assets" config — the key must match its file name
```

A new config is one file plus one import: forget the import and the app does not start; rename a file and the stale key is named.

> String-path typing is opt-in. Without `namespaces`, `defineEnv({ schemas, configs: load })` works as before, and injecting a config — `@Inject(cdnConfig.KEY) config: InferConfig<typeof cdnConfig>` — is fully typed either way.

#### Coercion

By default the raw environment strings are coerced to the declared property types — strictly, not the way `class-transformer` does it on its own. Its implicit conversion calls `Boolean(value)`, so `"false"` becomes `true` and any garbage passes as a boolean; and `Number("")` is `0`, so an empty variable passes as zero. `defineEnv` re-reads those cases:

| Declared type | Accepted | Rejected |
|---|---|---|
| `boolean` | `true`/`false`, `1`/`0`, `yes`/`no`, `on`/`off` — case-insensitive | anything else, including an empty string |
| `number` | anything `Number()` parses | an empty string, and anything `Number()` cannot parse |

```
DEBUG=false  -> false
DEBUG=maybe  -> EnvValidationError: DEBUG must be a boolean value
DB_PORT=     -> EnvValidationError: DB_PORT must be an integer number
```

To validate the raw strings instead — `@IsPort()`, `@IsBooleanString()`, `@IsNumberString()` — and convert explicitly inside the config factory, turn it off with `enableImplicitConversion: false`. Standard Schema validators ignore this option; they handle coercion themselves (`z.coerce.number()`, `z.stringbool()`).

#### The validated env inside `ConfigModule`

Whatever `validate` returns *becomes* the module's validated environment, so the coerced values are reachable from `ConfigService` too — `get` looks them up **before** falling back to `process.env`:

| | `configService.get('DB_PORT')` | `process.env.DB_PORT` |
|---|---|---|
| unset | `5432` (number) | `'5432'` (string) |
| `DB_PORT=6543` | `6543` (number) | `'6543'` (string) |

- **`ConfigService` sees the coerced value, not the raw string.** The lookup order is namespaced config (from `load`) → validated env → `process.env`.
- **`process.env` is written back**, but only for `string | boolean | number` keys that were not already set, and always stringified. A variable a schema defaults is therefore visible to code reading `process.env` directly.
- The validated object carries the whole environment, declared or not — **never log it as a whole**.

### API Reference

| Export | Description |
|--------|-------------|
| `defineConfig(source, factory)` | `registerAs` with the namespace derived from the file name. `source` is `import.meta` (ESM) or `__filename` (CommonJS) |
| `defineConfig(source, schema, factory)` | As above, with an env schema (class or Standard Schema) co-located in the config file; `factory` receives it typed |
| `loadConfigs(dir)` | `Array<Promise<RegisteredConfigFactory>>` for every `*.config.js` in `dir`, loaded with dynamic `import()` |
| `loadConfigsSync(dir)` | The same factories resolved synchronously through `require` |
| `defineEnv(schema \| options)` | The `validate` for `ConfigModule.forRoot`. `options.schemas` plus the schemas co-located in `options.configs`; `options.namespaces` types string paths for `InferAppConfig` |
| `InferConfig<typeof cfg>` | The object a config factory produces, awaited when async — same as `ConfigType` |
| `InferAppConfig<typeof validate>` | Everything `ConfigService<…, true>` can read: the validated env, co-located schemas, and every namespace in `namespaces` |
| `EnvValidator<T>` | The validator signature: raw environment in, validated environment out |
| `RegisteredConfigFactory` | A config factory carrying `KEY` and `asProvider()` |
| `ConfigSourceError` | The file is not named `<namespace>.config.<ext>` |
| `ConfigDirectoryError` | The config directory could not be read |
| `ConfigCycleError` | A config file imports the module that loads it |
| `ConfigNamespacesError` | `defineEnv({ namespaces })` does not match the loaded configs |
| `ConfigFactoryError` | A `*.config.js` file has no default-exported factory |
| `EnvValidationError` | Validation failed — `constraints` holds every message |
| `EnvNotInitializedError` | A `defineEnv` ran without validating a config's co-located schema — the config is missing from `configs`, or `load` is async |
| `AsyncEnvSchemaError` | The Standard Schema validated asynchronously, which `ConfigModule` cannot await |
| `MissingOptionalPeerError` | An optional peer dependency is not installed |

## 🔠 Utility Types

General-purpose TypeScript utility types exported from `@nedcloarbr/nestjs-toolkit`.

### Nullability

| Type | Definition | Description |
|------|-----------|-------------|
| `Nullable<T>` | `T \| null` | Value that can be null |
| `Optional<T>` | `T \| undefined` | Value that can be undefined |
| `Maybe<T>` | `T \| null \| undefined` | Value that can be null or undefined |

```typescript
type UserId = Nullable<number>;     // number | null
type Config = Optional<AppConfig>;  // AppConfig | undefined
type Result = Maybe<string>;        // string | null | undefined
```

### Async

| Type | Definition | Description |
|------|-----------|-------------|
| `Awaitable<T>` | `T \| PromiseLike<T>` | Value that can be returned directly or as a promise |

```typescript
type Handler = () => Awaitable<void>;

const sync: Handler = () => {};
const async: Handler = async () => {};
```

### Partial Modifiers

| Type | Description |
|------|-------------|
| `DeepPartial<T>` | Recursively makes all properties optional |
| `PartialBy<T, K>` | Makes only the specified keys optional |
| `RequiredBy<T, K>` | Makes only the specified keys required |

```typescript
// DeepPartial — useful for nested update DTOs
type UpdateConfigDto = DeepPartial<AppConfig>;

// PartialBy — id required, rest optional
type UpdateUserDto = PartialBy<User, 'name' | 'email'>;

// RequiredBy — address always required
type CheckoutDto = RequiredBy<Partial<Order>, 'address'>;
```

### Extraction

| Type | Description |
|------|-------------|
| `ValueOf<T>` | Union of all value types in an object |
| `ArrayElement<T>` | Extracts the element type from an array type |
| `Constructor<T>` | Concrete constructor type (`new (...args) => T`) |

```typescript
type Status = ValueOf<{ active: 'active'; inactive: 'inactive' }>; // "active" | "inactive"

type Item = ArrayElement<User[]>; // User

function create<T>(ctor: Constructor<T>): T {
  return new ctor();
}
```

### DX / Readability

| Type | Description |
|------|-------------|
| `Prettify<T>` | Flattens intersection types into a single readable shape |
| `Dict<T>` | Shorthand for `Record<string, T>` |

```typescript
// Without Prettify — hover shows: { id: number } & { name: string }
// With Prettify — hover shows: { id: number; name: string }
type User = Prettify<{ id: number } & { name: string }>;

type Cache = Dict<number>; // Record<string, number>
```

### Mixin types

| Type | Description |
|------|-------------|
| `AbstractConstructor<T>` | `abstract new (...args: any[]) => T` — base type for mixin classes |
| `Mixin<TAdded>` | Type of a mixin factory produced by `CreateMixin` |
| `MixinReturn<TBase, TAdded>` | Return type of a mixin applied to a base class |
| `MixinType<T>` | Extracts the added type from a mixin factory |
| `ExtractAdded<T[]>` | Extracts and intersects added types from a mixin array |
| `UnionToIntersection<U>` | Converts a union type to an intersection type |

## 📖 License

[MIT License](./LICENSE)

Copyright (c) 2025 NedcloarBR

## 🗞️ Credits

### 🛠️ Built With

- [NestJS](https://nestjs.com/) - A progressive Node.js framework
- [nest-commander](https://github.com/jmcdo29/nest-commander) - A module for using NestJS to build CLI applications
- [Chalk](https://github.com/chalk/chalk) - Terminal string styling
- [Inquirer](https://github.com/SBoudrias/Inquirer.js/) - Interactive command line prompts

### 🫱🏻‍🫲🏻 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/NedcloarBR/nestjs-tools/issues).

Want to see your name on this list? Check out our [contribution guidelines](./CONTRIBUTING.md).

### 👨‍💻 Author

**NedcloarBR**
- GitHub: [@NedcloarBR](https://github.com/NedcloarBR)

---

<p align="center">Made with ❤️ by <a href="https://github.com/NedcloarBR">NedcloarBR</a></p>
