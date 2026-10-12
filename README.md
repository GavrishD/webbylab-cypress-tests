# WebbyLab-Shop — Cypress Automation Tests

## Project Overview

This project contains automated end-to-end tests for the WebbyLab-Shop web application, developed as part of a QA test assignment.

The goal is to verify the main shopping workflows, identify defects, and demonstrate practical skills in automated testing using Cypress.

## Technologies

- JavaScript
- Cypress 16
- Node.js and npm
- Docker
- Google Chrome
- Visual Studio Code

## Test Coverage

The automated tests cover:

- Product catalog and category filtering
- Product search and case sensitivity
- Product price sorting
- Product details navigation
- Shopping cart functionality
- Product quantity and total price calculations
- Checkout form validation
- Successful order submission
- Invalid and empty order submission

The project includes both positive and negative test scenarios.

## Bug Reports

During manual testing, 10 defects were documented, covering catalog functionality, shopping cart behavior, form validation, and order processing.

Some automated tests are expected to fail because they reproduce existing application defects.

## Project Structure

webbylab-cypress-tests/
├── cypress/
│ ├── e2e/
│ │ └── catalog.cy.js
│ ├── fixtures/
│ └── support/
├── cypress.config.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md

## How to Run Tests

**Prerequisites:** Node.js, npm, and Docker.

1. Start the WebbyLab-Shop application locally using Docker.
2. Make sure the application is available at `http://localhost:3000`.
3. Install the project dependencies:

npm install

4. Open the Cypress Test Runner:

npm run cy:open

5. Or run the tests in headless mode:

npm test

## Test Results

The automated tests include successful positive scenarios and negative scenarios that expose existing application defects.

Failing tests should be reviewed alongside the documented bug reports to distinguish known application defects from automation issues.

## Author

QA Manual & Automation Testing Portfolio Project.
