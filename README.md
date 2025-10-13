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
  <a href="#�-global-helpers">Global Helpers</a>
  •
  <a href="#�📖-license">License</a>
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

## � Global Helpers

NestJS Toolkit provides a collection of utility functions that can be registered globally in your application. These helpers cover common tasks like async operations, date manipulation, security functions, and string utilities.

### Registering Helpers

You can register helpers globally in your application:

```typescript
import { registerHelpers } from '@nedcloarbr/nestjs-toolkit';

// Register all helpers
await registerHelpers({ verbose: true });

// Register specific categories only
await registerHelpers({
  include: ['async', 'date'],
  verbose: true
});

// Exclude specific categories
await registerHelpers({
  exclude: ['security'],
  verbose: true
});

// Override existing globals
await registerHelpers({
  override: true,
  verbose: true
});
```

### Available Helper Categories

#### 🔄 Async Helpers

Utilities for handling asynchronous operations:

| Function | Description | Example |
|----------|-------------|---------|
| `sleep(ms)` | Pauses execution for specified milliseconds | `await sleep(1000)` |
| `retry(fn, attempts, delayMs)` | Retries a function with delays between attempts | `await retry(() => fetchData(), 3, 500)` |
| `timeout(promise, ms)` | Races a promise against a timeout | `await timeout(fetchData(), 5000)` |

**Example:**
```typescript
// Wait 2 seconds
await sleep(2000);

// Retry API call up to 5 times
const data = await retry(() => api.getData(), 5, 1000);

// Timeout after 10 seconds
const result = await timeout(longRunningTask(), 10000);
```

#### 📅 Date Helpers

Utilities for date manipulation and comparison:

| Function | Description | Example |
|----------|-------------|---------|
| `now()` | Returns current date and time | `const date = now()` |
| `today()` | Returns today's date in ISO format (YYYY-MM-DD) | `const dateStr = today()` |
| `addDays(date, days)` | Adds days to a date | `addDays(new Date(), 7)` |
| `subDays(date, days)` | Subtracts days from a date | `subDays(new Date(), 3)` |
| `diffInDays(date1, date2)` | Calculates difference in days between dates | `diffInDays(date1, date2)` |
| `isPast(date)` | Checks if date is in the past | `isPast(someDate)` |
| `isFuture(date)` | Checks if date is in the future | `isFuture(someDate)` |

**Example:**
```typescript
// Get current date
const current = now();

// Get today's date string
const todayStr = today(); // "2025-10-13"

// Add 7 days to current date
const nextWeek = addDays(new Date(), 7);

// Check if a date is in the past
if (isPast(expirationDate)) {
  console.log('Expired!');
}
```

#### 🔒 Security Helpers

Utilities for cryptographic operations and security:

| Function | Description | Example |
|----------|-------------|---------|
| `randomHex(length)` | Generates random hexadecimal string | `randomHex(32)` |
| `toSha256(input)` | Converts string to SHA-256 hash | `toSha256('password')` |
| `mask(str, visible, maskChar)` | Masks a string leaving last N characters visible | `mask('1234567890', 4)` |

**Example:**
```typescript
// Generate a 32-byte random hex string
const token = randomHex(32);

// Hash a password
const hashedPassword = toSha256('myPassword123');

// Mask sensitive data
const maskedCard = mask('1234567890123456', 4); // "************3456"
```

#### 📝 String Helpers

Utilities for string manipulation and formatting:

| Function | Description | Example |
|----------|-------------|---------|
| `slugify(text)` | Converts text to URL-friendly slug | `slugify('Hello World!')` |
| `capitalize(str)` | Capitalizes first character | `capitalize('hello')` |
| `titleCase(str)` | Converts to title case | `titleCase('hello world')` |
| `truncate(str, limit, suffix)` | Truncates string with suffix | `truncate('Long text', 5)` |

**Example:**
```typescript
// Create URL-friendly slug
const slug = slugify('Hello World!'); // "hello-world"

// Capitalize first letter
const capitalized = capitalize('hello'); // "Hello"

// Convert to title case
const title = titleCase('the quick brown fox'); // "The Quick Brown Fox"

// Truncate long text
const short = truncate('This is a very long text', 10); // "This is a..."
```

### Registration Options

The `registerHelpers` function accepts the following options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `include` | `string[]` | `[]` | Categories to include. If not set, all are included |
| `exclude` | `string[]` | `[]` | Categories to exclude |
| `verbose` | `boolean` | `false` | Enable verbose logging during registration |
| `override` | `boolean` | `false` | Allow overwriting existing global functions |

**Available categories:** `async`, `date`, `security`, `string`

## �📖 License

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
