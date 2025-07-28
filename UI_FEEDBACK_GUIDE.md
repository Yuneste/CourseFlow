# UI Feedback Guide for CourseFlow

This guide helps you communicate UI changes without needing to write code.

## How to Describe UI Changes

### 1. **Location-Based Feedback**
Instead of: "The button looks wrong"
Say: "On the dashboard page, the blue 'Add Course' button in the top right corner"

### 2. **Visual References**
- **Colors**: Use descriptive terms or hex codes
  - "Make it lighter gray like #F5F5F5"
  - "Use a soft blue like sky blue"
  - "Same color as the header background"

- **Spacing**: Use relative terms
  - "Add more space between the cards (double the current gap)"
  - "Reduce padding inside the box by half"
  - "Make it as wide as the search bar above it"

- **Size**: Compare to other elements
  - "Make the icon same size as the logout icon"
  - "Text should be as big as the page title"
  - "Button height should match input fields"

### 3. **Layout Issues**
Describe using directions and alignment:
- "Center the logo horizontally"
- "Align the buttons to the right edge"
- "Stack these items vertically on mobile"
- "Put the image on the left, text on the right"

### 4. **Inspiration References**
Mention specific websites or apps:
- "Make the cards look like Notion's database cards"
- "Use a sidebar like Discord"
- "Button style similar to Linear.app"
- "Color scheme like Stripe's dashboard"

## Template for Feedback

```
PAGE: [Where is the issue - e.g., Dashboard, Settings, Login]
ELEMENT: [What specific part - e.g., Course Card, Navigation Bar]
ISSUE: [What's wrong - e.g., Too dark, Too small, Wrong position]
DESIRED: [What you want - e.g., Lighter background, Bigger text, Centered]
REFERENCE: [Optional - Similar to X website/app]
```

## Example Feedback

### Good Example:
```
PAGE: Dashboard
ELEMENT: Course Cards
ISSUE: Dark gray background makes it hard to read
DESIRED: Light background (white or very light gray #FAFAFA)
REFERENCE: Like Notion's card backgrounds
```

### Better Example with Multiple Issues:
```
PAGE: Settings
ELEMENTS: 
1. Delete Account button
   - ISSUE: Can't find it
   - DESIRED: Red button at bottom of page
   
2. Page background
   - ISSUE: Too dark (#1a1a1a is too black)
   - DESIRED: Light gray like #F8F9FA
   
3. Section headers
   - ISSUE: Not enough spacing
   - DESIRED: Add more padding above each section

REFERENCE: Settings page like GitHub or Vercel
```

## Color Preferences

Current issues you mentioned:
- Too much dark/black backgrounds
- Poor contrast between text and backgrounds
- Bright black is harsh

Better alternatives:
- **Backgrounds**: 
  - Light mode: #FFFFFF, #F8F9FA, #F5F5F5
  - Dark mode: #1F2937, #374151 (softer grays, not pure black)
  
- **Text**:
  - On light: #1F2937, #374151, #6B7280
  - On dark: #F9FAFB, #E5E7EB, #D1D5DB

## Quick Commands

You can also use these shortcuts:
- "REMOVE ALL DARK BACKGROUNDS" 
- "MAKE IT LIKE [website]"
- "USE LIGHT THEME EVERYWHERE"
- "FIX CONTRAST ISSUES"
- "RESTORE [feature that was removed]"

## Screenshot Markup

If you can take screenshots:
1. Take a screenshot
2. Draw on it:
   - Red circles = things to remove
   - Green circles = things to keep
   - Arrows = where to move things
   - Text = what to change it to

Save as: `feedback-[page]-[date].png`

---

This framework helps me understand exactly what you want without requiring any coding knowledge!