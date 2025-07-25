-- Insert sample collections
INSERT INTO public.collections (id, name, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'User Management API', 'API endpoints for managing users, authentication, and profiles'),
  ('550e8400-e29b-41d4-a716-446655440001', 'E-commerce API', 'Product catalog, shopping cart, and order management endpoints'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Blog API', 'Content management system for blog posts and comments')
ON CONFLICT (id) DO NOTHING;

-- Insert sample endpoints
INSERT INTO public.endpoints (id, collection_id, name, method, path, response_body, status_code, validation_rules, error_scenarios) VALUES
  (
    '660e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000',
    'Get All Users',
    'GET',
    '/api/users',
    '[
  {
    "id": "<<uuid>>",
    "name": "<<fullname>>",
    "email": "<<email>>",
    "age": "<<age>>",
    "address": {
      "street": "<<street>>",
      "city": "<<city>>",
      "country": "<<country>>"
    },
    "createdAt": "<<datetime>>"
  }
]',
    200,
    '[]',
    '[{"name": "Server Error", "probability": 0.1, "statusCode": 500, "response": {"error": "Internal server error"}}]'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'Create User',
    'POST',
    '/api/users',
    '{
  "id": "<<uuid>>",
  "name": "<<fullname>>",
  "email": "<<email>>",
  "createdAt": "<<datetime>>",
  "message": "User created successfully"
}',
    201,
    '[{"field": "email", "type": "required", "message": "Email is required"}, {"field": "name", "type": "required", "message": "Name is required"}]',
    '[{"name": "Validation Error", "probability": 0.2, "statusCode": 400, "response": {"error": "Invalid email format"}}]'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    'Get Products',
    'GET',
    '/api/products',
    '[
  {
    "id": "<<uuid>>",
    "name": "<<product>>",
    "price": "<<price>>",
    "description": "<<sentence>>",
    "company": "<<company>>",
    "color": "<<color>>",
    "image": "<<image>>"
  }
]',
    200,
    '[]',
    '[]'
  )
ON CONFLICT (id) DO NOTHING;

-- Get the collection IDs for inserting endpoints
DO $$
DECLARE
    user_collection_id UUID;
    product_collection_id UUID;
    blog_collection_id UUID;
BEGIN
    -- Get collection IDs
    SELECT id INTO user_collection_id FROM public.collections WHERE name = 'User Management API';
    SELECT id INTO product_collection_id FROM public.collections WHERE name = 'E-commerce API';
    SELECT id INTO blog_collection_id FROM public.collections WHERE name = 'Blog API';
    
    -- Insert sample endpoints for User Management API
    INSERT INTO public.endpoints (collection_id, name, method, path, description, response_status, response_headers, response_body) VALUES
    (user_collection_id, 'Get Users', 'GET', '/api/users', 'Retrieve all users', 200, '{"Content-Type": "application/json"}', 
     '[{"id": 1, "name": "John Doe", "email": "john@example.com"}, {"id": 2, "name": "Jane Smith", "email": "jane@example.com"}]'),
    (user_collection_id, 'Create User', 'POST', '/api/users', 'Create a new user', 201, '{"Content-Type": "application/json"}', 
     '{"id": 3, "name": "New User", "email": "new@example.com"}'),
    (user_collection_id, 'Get User by ID', 'GET', '/api/users/{id}', 'Get a specific user by ID', 200, '{"Content-Type": "application/json"}', 
     '{"id": 1, "name": "John Doe", "email": "john@example.com"}'),
    (user_collection_id, 'Update User', 'PUT', '/api/users/{id}', 'Update an existing user', 200, '{"Content-Type": "application/json"}', 
     '{"id": 1, "name": "Updated User", "email": "updated@example.com"}'),
    (user_collection_id, 'Delete User', 'DELETE', '/api/users/{id}', 'Delete a user', 204, '{}', '');
    
    -- Insert sample endpoints for E-commerce API
    INSERT INTO public.endpoints (collection_id, name, method, path, description, response_status, response_headers, response_body) VALUES
    (product_collection_id, 'Get Products', 'GET', '/api/products', 'Retrieve all products', 200, '{"Content-Type": "application/json"}', 
     '[{"id": 1, "name": "Laptop", "price": 999.99}, {"id": 2, "name": "Phone", "price": 599.99}]'),
    (product_collection_id, 'Create Product', 'POST', '/api/products', 'Create a new product', 201, '{"Content-Type": "application/json"}', 
     '{"id": 3, "name": "New Product", "price": 299.99}'),
    (product_collection_id, 'Get Product by ID', 'GET', '/api/products/{id}', 'Get a specific product by ID', 200, '{"Content-Type": "application/json"}', 
     '{"id": 1, "name": "Laptop", "price": 999.99}');
    
    -- Insert sample endpoints for Blog API
    INSERT INTO public.endpoints (collection_id, name, method, path, description, response_status, response_headers, response_body) VALUES
    (blog_collection_id, 'Get Posts', 'GET', '/api/posts', 'Retrieve all blog posts', 200, '{"Content-Type": "application/json"}', 
     '[{"id": 1, "title": "First Post", "content": "This is the first post"}, {"id": 2, "title": "Second Post", "content": "This is the second post"}]'),
    (blog_collection_id, 'Create Post', 'POST', '/api/posts', 'Create a new blog post', 201, '{"Content-Type": "application/json"}', 
     '{"id": 3, "title": "New Post", "content": "This is a new post"}'),
    (blog_collection_id, 'Get Post by ID', 'GET', '/api/posts/{id}', 'Get a specific blog post by ID', 200, '{"Content-Type": "application/json"}', 
     '{"id": 1, "title": "First Post", "content": "This is the first post"}');
END $$;
