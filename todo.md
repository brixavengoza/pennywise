# PennyWise TODO

## High Prio

### Frontend Authentication
- [ ] Polish auth middleware on frontend
  - [ ] Improve token refresh logic
  - [ ] Add better error handling for expired tokens
  - [ ] Implement automatic retry on 401 errors
  - [ ] Add loading states during authentication checks
  - [ ] Improve redirect logic after login/logout

## Medium Proi

### Features
- [ ] Add export functionality (CSV, PDF)
- [ ] Implement recurring transactions
- [ ] Add budget alerts/notifications
- [ ] Create dashboard widgets
- [ ] Add dark mode support

### Testing
- [ ] Write unit tests for API endpoints
- [ ] Add integration tests for auth flow
- [ ] Test transaction filtering and search
- [ ] Add E2E tests for critical user flows

### Documentation
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Create user guide
- [ ] Document deployment process
- [ ] Add contributing guidelines

## Low Prio

### Blockchain Integration
- [ ] Setup Wagmi configuration
- [ ] Integrate RainbowKit for wallet connection
- [ ] Add wallet address to user profile
- [ ] Create blockchain portfolio page
- [ ] Implement token balance fetching
- [ ] Add blockchain transaction import
- [ ] Create DeFi position tracking
- [ ] Add price charts for crypto assets
- [ ] Implement blockchain-based goals

### Performance
- [ ] Add caching for frequently accessed data
- [ ] Optimize database queries
- [ ] Implement pagination for large datasets
- [ ] Add CDN for static assets

### DevOps
- [ ] Set up CI/CD pipeline
- [ ] Configure staging environment
- [ ] Add monitoring and alerting
- [ ] Implement automated backups

## 📝 Notes

- This project is for learning backend development
- Blockchain features planned using Wagmi + RainbowKit

## ✅ Recently Completed

- [x] Basic authentication system (register, login, refresh)
- [x] Transaction CRUD operations
- [x] Budget management
- [x] Goals tracking
- [x] Analytics endpoints
- [x] Profile management
- [x] Request validation with Zod
- [x] Database setup with Prisma
- [x] JWT-based authentication
- [x] Error handling middleware

