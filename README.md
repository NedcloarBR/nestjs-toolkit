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
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org/)

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

- Node.js >= 20
- npm or yarn

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
| `config:init` | Initialize the CLI configuration file for your project | `-f, --force` - Force initialization without confirmation | `nestjs-toolkit config:init [--force]` |

**Example:**
```bash
# Interactive initialization
nestjs-toolkit config:init

# Force initialization without confirmation
nestjs-toolkit config:init --force
```

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
const { httpAdapter } = app.get(HttpAdapterHost);
app.useGlobalFilters(
  new AllExceptionsFilter(httpAdapter),   // catches everything else
  new HttpExceptionFilter(httpAdapter),   // highest priority for HttpExceptions
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
