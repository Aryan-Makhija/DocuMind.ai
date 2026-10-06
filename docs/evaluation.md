# RAG Application Evaluation

## Authentication

- [*] User can sign up
- [*] User can sign in
- [ ] Unauthenticated users cannot access protected routes
- [ ] User session identifies the correct user

## Document Management

- [ ] User can upload a PDF
- [ ] PDF is extracted correctly
- [ ] Chunks are created
- [ ] Embeddings are stored
- [ ] Document metadata is stored
- [ ] Document status becomes ready

## RAG Retrieval

- [ ] Question retrieves relevant chunks
- [ ] User can only retrieve their own documents
- [ ] Document filtering works
- [ ] Reranking works
- [ ] Relevant page numbers are returned
- [ ] Document name is returned as a source

## Answer Generation

- [ ] Answer is grounded in uploaded documents
- [ ] Unknown questions don't produce fabricated document answers
- [ ] Sources are returned with answers

## Conversation

- [ ] Conversation is created
- [ ] Messages are persisted
- [ ] Follow-up questions understand previous context
- [ ] Query rewriting resolves conversational references
- [ ] Conversations are isolated between users

## UI

- [ ] Chat interface works
- [ ] Loading state works
- [ ] Errors are displayed
- [ ] Sources are displayed
- [ ] Multiple messages render correctly