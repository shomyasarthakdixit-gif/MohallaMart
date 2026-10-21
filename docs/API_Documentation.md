# API Documentation

MohallaMart uses **Swagger UI** for live, interactive API documentation. 
Since the backend uses a robust Express REST API, we utilize `swagger-jsdoc` to generate the OpenAPI specification directly from the route files.

## Accessing the Live API Docs

When the backend server is running in development mode, you can access the interactive Swagger interface at:

**URL**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

> [!TIP]
> Use the **Authorize** button in the top right corner of the Swagger UI to paste your Firebase ID Token (`Bearer <token>`). This will automatically authenticate your requests when you try them out directly from the browser!

## Core Endpoint Groups

- `/api/v1/auth`: Authentication and role-based token validation.
- `/api/v1/shops`: Listing, searching, and managing nearby stores.
- `/api/v1/products`: Managing inventory for shops.
- `/api/v1/orders`: Creating and tracking customer and shop orders.
- `/api/v1/cart`: Managing the global user shopping cart.
- `/api/v1/payments`: Integrating with Razorpay for order checkout.

For the exact payload schemas, error structures, and response types, please refer to the live Swagger documentation.
