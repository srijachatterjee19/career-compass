/// <reference types="cypress" />

// Custom commands for job status progression testing

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login and create a test user
       * @example cy.loginAndCreateUser()
       */
      loginAndCreateUser(): Chainable<void>
      
      /**
       * Custom command to create a test job
       * @example cy.createTestJob('Software Engineer', 'Tech Corp')
       */
      createTestJob(title: string, company: string): Chainable<void>
      
      /**
       * Custom command to navigate to job edit page
       * @example cy.navigateToJobEdit()
       */
      navigateToJobEdit(): Chainable<void>
      
      /**
       * Custom command to change job status and verify progression rules
       * @example cy.changeJobStatus('Applied', ['Applied', 'Interviewing', 'Offer', 'Rejected'])
       */
      changeJobStatus(newStatus: string, expectedAvailableStatuses: string[]): Chainable<void>
      
      /**
       * Custom command to verify status is locked (Rejected state)
       * @example cy.verifyStatusLocked()
       */
      verifyStatusLocked(): Chainable<void>
    }
  }
}

// Login and create test user
Cypress.Commands.add('loginAndCreateUser', () => {
  // First, try to register a new user
  cy.request({
    method: 'POST',
    url: '/api/auth/register',
    body: {
      email: 'test-status-progression@example.com',
      password: 'Password123',
      display_name: 'Test User Status'
    },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 400 && response.body.error?.includes('already registered')) {
      // User exists, try to login
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: {
          email: 'test-status-progression@example.com',
          password: 'Password123'
        }
      }).then((loginResponse) => {
        expect(loginResponse.status).to.eq(200)
        // Store the user info for later use
        cy.wrap(loginResponse.body.user).as('testUser')
      })
    } else {
      // New user created
      expect(response.status).to.eq(201)
      cy.wrap(response.body.user).as('testUser')
    }
  })
})

// Create a test job
Cypress.Commands.add('createTestJob', (title: string, company: string) => {
  cy.get('@testUser').then((user: any) => {
    cy.request({
      method: 'POST',
      url: '/api/jobs',
      body: {
        title,
        company,
        status: 'Saved',
        userId: user.id
      }
    }).then((response) => {
      expect(response.status).to.eq(201)
      cy.wrap(response.body).as('testJob')
    })
  })
})

// Navigate to job edit page
Cypress.Commands.add('navigateToJobEdit', () => {
  cy.get('@testJob').then((job: any) => {
    cy.visit(`/jobs/edit/${job.id}`)
    // Wait for the page to load
    cy.get('[data-testid="job-title-input"]', { timeout: 10000 }).should('be.visible')
  })
})

// Change job status and verify progression rules
Cypress.Commands.add('changeJobStatus', (newStatus: string, expectedAvailableStatuses: string[]) => {
  // Open status dropdown
  cy.get('[data-testid="status-select"]').click()
  
  // Select the new status
  cy.get('[data-testid="status-select-content"]')
    .contains(newStatus)
    .click()
  
  // Verify the status was changed
  cy.get('[data-testid="status-select"]').should('contain', newStatus)
  
  // Verify available statuses are correct
  cy.get('[data-testid="status-select"]').click()
  cy.get('[data-testid="status-select-content"]').within(() => {
    // Check that only expected statuses are available
    expectedAvailableStatuses.forEach(status => {
      cy.contains(status).should('be.visible')
    })
    
    // Check that unavailable statuses are not shown
    const allStatuses = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected']
    const unavailableStatuses = allStatuses.filter(s => !expectedAvailableStatuses.includes(s))
    unavailableStatuses.forEach(status => {
      cy.contains(status).should('not.exist')
    })
  })
  
  // Close the dropdown
  cy.get('[data-testid="status-select"]').click()
})

// Verify status is locked (Rejected state)
Cypress.Commands.add('verifyStatusLocked', () => {
  // Check that status dropdown shows Rejected
  cy.get('[data-testid="status-select"]').should('contain', 'Rejected')
  
  // Try to change status - should show error
  cy.get('[data-testid="status-select"]').click()
  cy.get('[data-testid="status-select-content"]').within(() => {
    // Only Rejected should be available
    cy.contains('Rejected').should('be.visible')
    cy.contains('Saved').should('not.exist')
    cy.contains('Applied').should('not.exist')
    cy.contains('Interviewing').should('not.exist')
    cy.contains('Offer').should('not.exist')
  })
  
  // Check that the help text indicates locked state
  cy.contains('Job has been rejected. No further status changes allowed.').should('be.visible')
  
  // Close dropdown
  cy.get('[data-testid="status-select"]').click()
})