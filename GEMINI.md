# GEMINI.md

## Project Overview

This project is a Business Intelligence (BI) platform, similar to PowerBI or MS Fabric. It's a full-stack application built with Next.js, a database daemon, and uses IIS for Windows Authentication. The goal of the project is to build a web platform that allows users to create, deploy, and share dashboards using data that is approved by an administrator.

The project is divided into the following phases:

*   **Phase 0: Admin Foundation:** Focuses on setting up the basic administrative features, such as workspace and policy management, role binding, and dataset management.
*   **Phase 1: Runtime + Viewer MVP:** Focuses on implementing the core query execution engine and a minimal viable product for the dashboard viewer.
*   **Phase 2: Builder MVP:** Focuses on building a minimal viable product for the dashboard builder, allowing users to create and publish dashboards.
*   **Phase 3: Productization:** Focuses on improving the user experience with features like undo/redo, drill-down, and saved views.
*   **Phase 4: Admin Advanced:** Focuses on adding advanced administrative features, such as release management, impact preview, and performance dashboards.
*   **Phase 5: Enterprise Features:** Focuses on adding enterprise-level features, such as exporting, embedding, and advanced security.
*   **Phase 6: LLM Integration:** Focuses on integrating a Large Language Model (LLM) to provide features like dashboard summarization and query suggestions.

## Building and Running

The project uses a custom development environment that is likely managed by Nix.

**TODO:** Add instructions on how to build and run the project.

## Development Conventions

The project follows a set of development conventions that are described in the `00_MASTER_PLAN.md` file. These conventions include:

*   **Security:** The project has a strong focus on security, with features like Windows Integrated Authentication, a single source of truth for policies, and a database daemon that isolates database access.
*   **Product/UX:** The project follows a set of UX principles that are designed to provide a consistent and intuitive user experience. These principles include a clear separation of roles, automatic saving of drafts, and guardrails to prevent users from creating dashboards that are too large.
*   **Code:** All settings, policies, and semantic changes are made through a "Draft -> Publish" workflow. The project also uses a sanitizer to block high-risk options, such as function injection and external URLs.
