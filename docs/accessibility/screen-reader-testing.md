# Screen Reader Testing Guide for CourseFlow

## Overview
This guide provides instructions for testing CourseFlow with screen readers to ensure accessibility compliance.

## Testing Checklist

### Navigation
- [ ] Skip to main content link works
- [ ] All navigation items are announced correctly
- [ ] Tab order follows logical sequence
- [ ] Focus indicators are visible

### Forms
- [ ] All form fields have proper labels
- [ ] Required fields are announced
- [ ] Error messages are associated with fields
- [ ] Success messages are announced

### Interactive Elements
- [ ] All buttons have descriptive labels
- [ ] Icon-only buttons have aria-labels
- [ ] Links have meaningful text
- [ ] Modal dialogs trap focus appropriately

### Dynamic Content
- [ ] Loading states are announced
- [ ] Toast notifications are read
- [ ] Content updates are announced via live regions
- [ ] Progress indicators provide feedback

## NVDA Testing Steps

1. **Installation**
   - Download NVDA from nvaccess.org
   - Install with default settings

2. **Basic Navigation**
   - Press `NVDA + Q` to start
   - Use `Tab` to navigate interactive elements
   - Use `H` to jump between headings
   - Use `D` to jump between landmarks

3. **Testing Forms**
   - Navigate to login/register forms
   - Verify all fields announce labels
   - Test error message announcements
   - Check password visibility toggle

4. **Testing Dashboard**
   - Verify course cards are readable
   - Check quick action buttons
   - Test navigation sidebar

## JAWS Testing Steps

1. **Basic Commands**
   - `Insert + Z` to toggle virtual cursor
   - `Insert + F7` for links list
   - `Insert + F5` for form fields list

2. **Specific Tests**
   - Verify heading structure
   - Test table navigation in analytics
   - Check button announcements

## Common Issues to Check

1. **Missing Labels**
   - Icon buttons without text
   - Form fields without labels
   - Images without alt text

2. **Focus Management**
   - Modal dialogs not trapping focus
   - Focus not returning after modal close
   - Skip links not working

3. **Dynamic Content**
   - Loading states not announced
   - Error messages not read
   - Success toasts missed

## Automated Testing

Run accessibility tests:
```bash
npm run test -- accessibility
```

## Manual Testing Priority

1. **High Priority**
   - Login/Register flow
   - Course creation
   - File upload process
   - Dashboard navigation

2. **Medium Priority**
   - Settings pages
   - Analytics views
   - Search functionality

3. **Low Priority**
   - Footer links
   - Help documentation
   - About pages

## Reporting Issues

When reporting accessibility issues:
1. Screen reader and version
2. Browser and version
3. Steps to reproduce
4. Expected vs actual behavior
5. WCAG criterion violated

## Resources

- [NVDA User Guide](https://www.nvaccess.org/files/nvda/documentation/userGuide.html)
- [JAWS Keyboard Commands](https://www.freedomscientific.com/training/jaws/keyboard-commands/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)