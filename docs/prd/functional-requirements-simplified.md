# Functional Requirements (Simplified)

## FR1: Academic Setup
- Region-aware onboarding wizard adapting to local academic systems
- Course/module input with regional terminology (Credits/ECTS/Marks)
- Visual course organization preview
- Academic period management (Semesters/Terms/Trimesters by region)
- Grade scale configuration (GPA/ECTS/UK Honours)
- **Implementation:** Next.js pages with Supabase data storage, locale detection

## FR2: File Discovery & Upload
- **SIMPLIFIED:** Browser-based folder selection using File API
- Drag-and-drop file upload interface
- Bulk file selection from user's computer
- **Implementation:** HTML5 File API + Next.js upload handling

## FR3: AI Categorization
- Automatic file categorization by course/subject with regional awareness
- Smart file renaming following local naming conventions
- Multi-language content analysis (MVP: EN, FR, DE, ES)
- Duplicate detection and handling
- **Implementation:** OpenAI API with language detection, localized prompts

## FR4: File Organization
- Hierarchical folder structure by course/topic
- File relationship mapping
- Quick search and filters
- **Implementation:** PostgreSQL with Supabase

## FR5: Study Tools
- In-browser PDF/document viewer
- AI-generated summaries and flashcards
- Study session tracking
- **Implementation:** Next.js pages with OpenAI integration

## FR6: Collaboration
- Group workspaces for shared learning
- Real-time chat and file sharing
- Shared whiteboards
- **Implementation:** Supabase Realtime subscriptions

## FR7: Performance Tracking
- Study analytics and insights
- Grade tracking with regional systems (GPA/ECTS/UK Honours/Percentages)
- Grade conversion between systems for exchange students
- Personalized recommendations based on local academic standards
- **Implementation:** PostgreSQL analytics with chart libraries, grade conversion logic

## FR8: Content Discovery
- University library marketplace
- Peer-shared study materials
- Quality ratings and reviews
- **Implementation:** Supabase database with search
