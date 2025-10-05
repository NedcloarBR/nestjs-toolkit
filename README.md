<h1 align="center">
  <br>
  🛠️ NestJS Toolkit
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
