# Security Policy

## Repository Access Control

This repository is configured with strict access controls. While the repository may be public for viewing, modifications are restricted to authorized maintainers only.

### For Repository Owner

To ensure your repository remains secure while public, configure these settings on GitHub:

#### 1. **Disable Forking** (Optional but Recommended)
- Go to Settings → General
- Under "Features", uncheck "Forking"
- This prevents others from creating forks

#### 2. **Protect All Branches**
- Go to Settings → Branches
- Add rule for `*` (all branches)
- Enable:
  - ✅ Restrict who can push to matching branches
  - ✅ Include administrators
  - Add yourself as the only allowed user

#### 3. **Disable Issues & Pull Requests**
- Go to Settings → General
- Under "Features", uncheck:
  - ❌ Issues
  - ❌ Projects
  - ❌ Wiki
- Go to Settings → General → Pull Requests
- Uncheck:
  - ❌ Allow merge commits
  - ❌ Allow squash merging
  - ❌ Allow rebase merging

#### 4. **Manage Collaborator Access**
- Go to Settings → Manage access
- Ensure NO collaborators are added
- Review any pending invitations

#### 5. **Disable Actions from Forks**
- Go to Settings → Actions → General
- Under "Fork pull request workflows", select:
  - "Require approval for all outside collaborators"

#### 6. **Configure Interaction Limits**
- Go to Settings → Moderation → Interaction limits
- Set temporary interaction limits when needed
- Can limit to existing users, contributors, or collaborators only

### Security Best Practices

1. **Never commit sensitive data**
   - API keys
   - Passwords
   - Private certificates
   - Personal information

2. **Use environment variables**
   - Store secrets in `.env.local`
   - Never commit `.env` files

3. **Regular audits**
   - Review Settings → Security → Code security and analysis
   - Enable Dependabot alerts (private)
   - Check for exposed secrets

### For Contributors

This repository does not accept external contributions. If you have suggestions or find issues:
- Contact the repository owner directly
- Do not attempt to submit pull requests
- Do not create issues if the feature is disabled

### Reporting Security Vulnerabilities

If you discover a security vulnerability, please:
- DO NOT create a public issue
- Contact the repository owner privately
- Provide detailed information about the vulnerability

## Access Notice

This codebase is proprietary. While it may be temporarily public for technical reasons, it is not open for contributions, modifications, or redistribution without explicit permission from the owner.