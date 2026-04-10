# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

This is a personal blog and portfolio website built with Hugo static site generator. The site uses a custom Hugo theme called "ecwu-theme" built with Tailwind CSS v4. The project is a git repository that includes the theme as a git submodule.

## Common Development Commands

### Hugo Development
```bash
# Start local development server
hugo server -D

# Build the site for production
hugo

# Clean the public directory before building
rm -rf public/ && hugo

# Deploy (likely handled by GitHub Actions based on config)
```

### Tailwind CSS Development
The theme uses Tailwind CSS v4 and requires separate compilation:

```bash
# Watch and compile Tailwind CSS during development
npx @tailwindcss/cli -i themes/ecwu-theme/assets/css/styles.scss -o themes/ecwu-theme/assets/css/style.css --watch

# One-time CSS build
npx @tailwindcss/cli -i themes/ecwu-theme/assets/css/styles.scss -o themes/ecwu-theme/assets/css/style.css
```

### Package Management
```bash
# Install dependencies
npm install

# The main package.json only contains Tailwind CSS dependencies
```

## Architecture

### Core Structure
- **Hugo Site**: Main site configuration in `config.toml`
- **Content Organization**:
  - `content/post/` - Blog posts
  - `content/photography/` - Photography posts
  - `content/page/` - Static pages (About, Friends, Changelog, etc.)
- **Theme**: Custom theme in `themes/ecwu-theme/` (git submodule)
- **Static Assets**: In `static/` directory
- **Public Output**: Generated in `public/` directory

### Theme Architecture
The custom theme (`themes/ecwu-theme/`) is built with:
- **Tailwind CSS v4**: Modern CSS framework
- **Hugo Templates**: Go template files in `layouts/`
- **Theme Assets**: SCSS files and other assets in `assets/`

### Key Configuration Files
- `config.toml` - Hugo site configuration including menus, parameters, and markup settings
- `themes/ecwu-theme/theme.toml` - Theme metadata
- `package.json` - Node.js dependencies for Tailwind CSS
- `.gitmodules` - Git submodule configuration for the theme

### Content Structure
- Blog posts use Hugo frontmatter with date, categories, tags, and series
- The site supports taxonomies: tags, categories, and series
- Navigation menus are defined in `config.toml`
- The homepage displays recent posts from configured sections

### Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Multi-language Support**: Configured for English with CJK language support
- **Analytics**: Google Analytics integration
- **Comments**: Giscus integration for blog post comments
- **Social Features**: RSS feed and social media links
- **SEO**: Robots.txt and canonical URL support

## Development Workflow

1. **CSS Development**: Run Tailwind CSS compilation in watch mode while making style changes
2. **Content Creation**: Create new content files in the appropriate `content/` subdirectory
3. **Local Testing**: Use `hugo server -D` for local development with drafts
4. **Theme Development**: Theme files are in the submodule at `themes/ecwu-theme/`
5. **Production Build**: Run CSS build first, then `hugo` to generate the final site

## Git Submodule Management

The theme is included as a git submodule. To update:
```bash
cd themes/ecwu-theme
git pull origin main
cd ../..
git add themes/ecwu-theme
git commit -m "Update theme submodule"
```