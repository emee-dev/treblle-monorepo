
# Hackathon Project Guide


## Project Setup and SDK Usage Guide

Welcome to my hackathon project! In this guide, I'll walk you through the steps to clone and set up my monorepo, run necessary scripts, and test the SDK I've built using TurboRepo.

## Prerequisites

Before you begin, make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.js.org/)

## Clone the repo

```bash
git clone https://github.com/your-username/treblle-express.git
cd treblle-express

## Install project dependencies
pnpm install

## Add your env files and let turbo initialize the dev server
TREBLLE_API_KEY='' TREBLLE_PROJECT_ID='' turbo run dev --filter sample

```
