import { Hono } from 'hono';

const swagger = new Hono();

// OpenAPI JSON Spec
const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'FlipRead API',
    version: '1.0.0',
    description: 'API for managing flipbooks and user accounts.',
  },
  servers: [
    {
      url: 'https://api.flipread.com/api', // Example, adjust as needed or use relative URL
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'flipread_token',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          plan: { type: 'string', enum: ['free', 'basic', 'pro', 'business'] },
          avatar_url: { type: 'string' },
        },
      },
      Book: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          slug: { type: 'string' },
          type: { type: 'string', enum: ['pdf', 'epub'] },
          view_count: { type: 'integer' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
    },
  },
  security: [
    {
      cookieAuth: [],
    },
  ],
  paths: {
    '/auth/login': {
      post: {
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
          },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                  name: { type: 'string' },
                },
                required: ['email', 'password', 'name'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Registration successful',
          },
          '400': {
            description: 'User already exists',
          },
        },
      },
    },
    '/user/profile': {
      get: {
        summary: 'Get user profile',
        responses: {
          '200': {
            description: 'User profile',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
      },
      patch: {
        summary: 'Update user profile',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  avatar: { type: 'string' }, // base64
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Profile updated',
          },
        },
      },
    },
    '/docs/books': {
      get: {
        summary: 'List user books',
        responses: {
          '200': {
            description: 'List of books',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Book' },
                },
              },
            },
          },
        },
      },
    },
    // Add more endpoints as needed
  },
};

// Serve OpenAPI Spec
swagger.get('/spec', (c) => {
  return c.json(openApiSpec);
});

// Serve Swagger UI
swagger.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>FlipRead API Documentation</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            url: '/api/swagger/spec', // Correct path to spec
            dom_id: '#swagger-ui',
          });
        };
      </script>
    </body>
    </html>
  `);
});

export default swagger;
