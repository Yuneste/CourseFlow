# External APIs

## OpenAI API
- **Purpose:** AI-powered file categorization, content analysis, summary and flashcard generation
- **Documentation:** https://platform.openai.com/docs
- **Base URL(s):** https://api.openai.com/v1
- **Authentication:** Bearer token (API key)
- **Rate Limits:** 10,000 TPM (tokens per minute) for GPT-3.5-turbo

**Key Endpoints Used:**
- `POST /chat/completions` - All AI operations using chat format

**Integration Notes:** Use streaming for long responses, implement retry logic with exponential backoff, cache results to minimize API calls
