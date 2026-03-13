# Technical Decisions

## Chosen Stack
- Next.js
- TypeScript
- Tailwind CSS
- App Router
- Firebase Authentication
- Cloud Firestore

## Why This Stack Was Chosen
- Next.js provides a strong web-first foundation for a responsive school application and supports structured growth over time.
- TypeScript improves maintainability and makes the codebase safer as the project grows in modules and data models.
- Tailwind CSS supports fast, consistent responsive UI development for phones and laptops without adding a heavy design system at this stage.
- App Router fits a modern Next.js structure and keeps page, layout, and route organization clean.
- Firebase Authentication is a practical starting point for secure sign-in flows without building custom authentication infrastructure too early.
- Cloud Firestore is a good fit for the early notification-focused MVP and can support flexible document-based data as the platform evolves.

## Alternatives Not Chosen
- Plain React with custom routing was not chosen because Next.js provides a better project foundation, routing model, and deployment path for this product.
- A traditional server-rendered MVC approach was not chosen because the product needs a modern responsive frontend and a structure that can grow into additional clients.
- SQL-first backend setup was not chosen for the MVP because Firebase offers a faster setup path for authentication and early data storage. A relational database can be reconsidered later if reporting or complex transactional needs grow significantly.
- CSS modules or custom CSS-only styling were not chosen because Tailwind gives a faster and more consistent responsive UI workflow for the MVP.
- A microservices architecture was not chosen because it would add unnecessary complexity at this stage. A modular monolith remains the practical recommendation for the MVP.

## Deployment Direction
The recommended deployment direction is:
- Host the Next.js application on a platform that supports modern web deployments and environment variables.
- Use Firebase services for authentication and Firestore data storage.
- Keep secrets in environment variables and never hardcode production credentials.

Practical recommendation:
Start with a single web deployment and a single Firebase project for development, then separate environments later as the project matures.

## Future Expansion Note
The chosen stack keeps the project web first while remaining compatible with future mobile and smartwatch support.

Future-ready direction:
- Reuse Firebase Authentication across future clients where appropriate.
- Reuse backend-facing data structures and notification concepts across web, mobile, and smartwatch channels.
- Keep notification logic and tracking logic modular so new clients can adopt them without changing the core web MVP structure.
