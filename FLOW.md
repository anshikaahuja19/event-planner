# Event Planning as a Constraint Satisfaction Problem (CSP)

This application structures the event planning process using principles from **Lecture 9: Problem Solving & Optimization**.

## 1. Defining the Problem
In the context of Lumina, an event is treated as a set of variables that must be assigned values while satisfying specific constraints.

### Variables (X)
- $V_{budget}$: Category-wise allocation.
- $V_{venue}$: Selected venue.
- $V_{timeline}$: Sequential task execution.
- $V_{attendees}$: Guest list status.

### Domains (D)
- **Budget**: Possible INR ranges for each category (Catering, Decor, etc.).
- **Vendors**: Available vendors in the location.
- **Time**: Dates prior to the event execution date.

### Constraints (C)
- **Hard Constraints**: 
    - $\sum CategoryBudgets \le TotalBudget$
    - $VenueCapacity \ge GuestCount$
    - $TaskDate < EventDate$
- **Soft Constraints (Optimization)**:
    - Preferring high-rated vendors within budget.
    - Minimizing travel time for guests based on location.

## 2. AI Optimization Logic
The "AI Generator" in `script.js` solves this CSP by:
1. **Initial Assignment**: Using categorical templates (Wedding, Corporate) to provide a base allocation.
2. **Backtracking Search**: Evaluating budget splits against the defined domains and constraints.
3. **Timeline Scheduling**: Applying a sequential dependency graph to ensure tasks like "Booking Venue" appear before "Sending Invites".

## 3. Implementation in Code
The `generateAISuggestions` function in `script.js` serves as the heuristic engine that transforms user input (constraints) into a feasible planning solution.
