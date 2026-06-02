# Contributing to DevPath Web

Thank you for your interest in contributing to DevPath Web! We are excited to have you here.

DevPath Web is a community-driven project, and every contribution helps improve the platform for developers, learners, and open-source contributors. This guide will help you set up the project locally, follow the contribution workflow, and submit a clean pull request.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [Running the Project](#running-the-project)
- [Branch Naming Conventions](#branch-naming-conventions)
- [Making Changes](#making-changes)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [GSSoC Contributor Guidelines](#gssoc-contributor-guidelines)

## Code of Conduct

Please read and follow the [Code of Conduct](CODE_OF_CONDUCT.md). We expect all contributors to help keep DevPath a welcoming, respectful, and inclusive community.

## Getting Started

### Prerequisites

Before you begin, make sure you have the following installed:

- Git
- Node.js, latest LTS version recommended
- npm
- A code editor such as VS Code

You can verify your installations with:

```bash
git --version
node --version
npm --version
```

### Fork the Repository

1. Go to the DevPath Web repository on GitHub.
2. Click the **Fork** button in the top-right corner.
3. This creates a copy of the repository under your GitHub account.

### Clone Your Fork

Replace `your-username` with your GitHub username:

```bash
git clone https://github.com/your-username/DevPath-Web.git
cd DevPath-Web
```

### Add the Upstream Remote

Add the original repository as `upstream` so you can keep your fork updated:

```bash
git remote add upstream https://github.com/devpathindcommunity-india/DevPath-Web.git
git remote -v
```

### Keep Your Fork Updated

Before starting new work, sync your local branch with the latest changes:

```bash
git checkout master
git pull upstream master
git push origin master
```

## Environment Setup

Install project dependencies:

```bash
npm install
```

Create a local environment file by copying the example file:

```bash
cp .env.example .env.local
```

On Windows PowerShell, you can use:

```bash
Copy-Item .env.example .env.local
```

Open `.env.local` and add the required Firebase configuration values.

Never commit `.env.local` or any secret keys to GitHub.

## Running the Project

Start the development server:

```bash
npm run dev
```

Open your browser and visit:

```text
http://localhost:3000
```

Other useful commands:

```bash
npm run build
npm run start
npm run lint
```

## Branch Naming Conventions

Create a new branch for every issue or contribution. Use clear and descriptive branch names.

Recommended formats:

```text
feature/issue-name
fix/issue-name
docs/issue-name
chore/issue-name
```

Examples:

```text
feature/add-events-section
fix/navbar-mobile-menu
docs/contributing-guide
chore/update-dependencies
```

Avoid working directly on the `master` branch.

## Making Changes

Follow these steps when working on an issue:

1. Make sure the issue is assigned to you before starting.
2. Create a new branch from the latest `master`.
3. Keep your changes focused on the assigned issue.
4. Follow the existing project structure and coding style.
5. Test your changes locally before committing.
6. Avoid making unrelated formatting or refactoring changes.

Create and switch to a new branch:

```bash
git checkout -b docs/contributing-guide
```

Check changed files:

```bash
git status
```

## Commit Message Guidelines

Use clear and meaningful commit messages. Conventional commit style is recommended.

Format:

```text
type: short description
```

Common types:

```text
feat: add a new feature
fix: fix a bug
docs: update documentation
style: update formatting or styling
refactor: restructure code without changing behavior
chore: update config, dependencies, or maintenance files
```

Examples:

```text
docs: add contributing guide
fix: resolve navbar overflow on mobile
feat: add community events section
```

## Pull Request Guidelines

Before opening a pull request, make sure:

- Your branch is updated with the latest `master`.
- The project runs locally without errors.
- You have run linting if your changes include code.
- Your changes are related only to the assigned issue.
- You have reviewed your own changes.
- You have not committed `.env.local`, `node_modules`, or build files.

Push your branch:

```bash
git push origin docs/contributing-guide
```

Then open a pull request from your branch to the original repository's `master` branch.

### Pull Request Title

Use a clear title with a suitable prefix:

```text
docs: add comprehensive contributing guide
```

Examples:

```text
feat: add user profile page
fix: correct footer links
docs: improve setup instructions
```

### Pull Request Description

Include the following details in your PR description:

```md
## Summary

Briefly explain what this PR changes.

## Changes Made

- Added setup instructions
- Added branch naming conventions
- Added pull request checklist

## Related Issue

Closes #issue-number

## Checklist

- [ ] I have read the contributing guidelines
- [ ] My changes are focused on the assigned issue
- [ ] I have tested my changes locally
- [ ] I have run linting where applicable
- [ ] I have not committed sensitive files
```

## Reporting Bugs

If you find a bug, please open an issue and include:

- A clear title
- Steps to reproduce the bug
- Expected behavior
- Actual behavior
- Screenshots or screen recordings, if helpful
- Browser and device details, if relevant

Example title:

```text
Bug: Navbar menu does not close on mobile
```

## Suggesting Features

Feature suggestions are welcome. When creating a feature request, include:

- A clear description of the feature
- Why it would be useful
- Any possible implementation ideas
- Screenshots, references, or examples if available

Example title:

```text
Feature: Add community events calendar
```

## GSSoC Contributor Guidelines

If you are contributing as part of GSSoC, please follow these guidelines:

- Ask to be assigned before working on an issue.
- Work on one assigned issue at a time unless a maintainer allows otherwise.
- Do not raise a pull request for an issue assigned to someone else.
- Keep communication respectful and professional.
- Ask questions on the issue thread if you are stuck.
- Avoid spam comments such as repeated assignment requests.
- Submit original work and avoid copying from other contributors.
- Be patient while maintainers review your pull request.

## Final Notes

Thank you for contributing to DevPath Web. Your time, effort, and ideas help make this project better for the whole community.