# Claude Instructions for incident-orders

## Project Context
This is a Node.js library module that provides order calculation functionality. It's part of a contract testing demonstration showing integration between an orders service and a pricing service.

## Testing
- Run tests with: `npm test`
- Tests use Node.js built-in test runner (node:test)
- The test suite validates the contract with the pricing service (expects `response.price`)

## Code Conventions
- Keep code simple and focused on demonstrating contract testing concepts
- The `total` function reads `.price` from pricing service responses per the established contract
- Maintain the existing module.exports pattern for CommonJS compatibility
