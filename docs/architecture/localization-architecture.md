# Localization Architecture

## Supported Regions & Languages

### North America
- **Markets:** United States, Canada
- **Languages:** English (en-US), French (fr-CA)
- **Currencies:** USD, CAD
- **Academic Systems:** GPA (4.0), Letter grades
- **Date Format:** MM/DD/YYYY
- **Deployment Region:** US East (Virginia)

### Europe
- **Markets:** EU countries, United Kingdom
- **Languages:** English (en-GB), German (de), French (fr), Spanish (es)
- **Currencies:** EUR, GBP
- **Academic Systems:** ECTS, UK Honours
- **Date Format:** DD/MM/YYYY
- **Deployment Region:** EU West (Frankfurt)

## i18n Implementation Strategy

1. **Routing:** `/[locale]/path` structure for all pages
2. **API Routes:** `/api/[locale]/endpoint` for locale-aware responses
3. **Content:** Translation keys stored in JSON files and database
4. **AI Responses:** Locale-specific prompts for OpenAI
5. **Currency:** Automatic conversion based on user location
6. **Academic Terms:** Dynamic terminology based on region
