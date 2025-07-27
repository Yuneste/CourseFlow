# Contributing to CourseFlow

First off, thank you for considering contributing to CourseFlow! 🎉

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct: be respectful, inclusive, and constructive.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Screenshots if applicable
- Your environment details

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- A clear and descriptive title
- A detailed description of the proposed enhancement
- Why this enhancement would be useful
- Possible implementation approach

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code, add tests
3. Ensure the test suite passes
4. Make sure your code follows the existing style
5. Issue that pull request!

## Development Setup

1. Fork and clone the repo
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in your values
4. Run development server: `npm run dev`

## Style Guide

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### TypeScript Style Guide

- Use TypeScript strict mode
- Define interfaces for all props
- Use functional components with hooks
- Avoid `any` type - use `unknown` if type is truly unknown

### Code Style

We use ESLint and Prettier. Run `npm run lint` before committing.

## Project Structure

Follow the established project structure:
- Components in `components/`
- API routes in `app/api/`
- Utilities in `lib/`
- Types in `types/`

## Testing

- Write tests for new features
- Maintain test coverage above 80%
- Run `npm test` before submitting PR

## Questions?

Feel free to open an issue with the tag "question" or reach out on our Discord.