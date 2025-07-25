-- Insert sample collections
INSERT INTO collections (id, name, description) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'User API', 'User management endpoints'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Product API', 'Product catalog endpoints')
ON CONFLICT (id) DO NOTHING;

-- Insert sample endpoints
INSERT INTO endpoints (
  id, collection_id, name, method, path, description, 
  response_status, response_headers, response_body, request_body, validation_config
) VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440001',
    'Get Users',
    'GET',
    '/api/users',
    'Retrieve all users',
    200,
    '{"Content-Type": "application/json"}',
    '[{"id": "<<uuid>>", "name": "<<fullname>>", "email": "<<email>>", "age": "<<age>>", "createdAt": "<<datetime>>"}]',
    NULL,
    NULL
  ),
  (
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440001',
    'Create User',
    'POST',
    '/api/users',
    'Create a new user',
    201,
    '{"Content-Type": "application/json"}',
    '{"id": "<<uuid>>", "name": "<<fullname>>", "email": "<<email>>", "message": "User created successfully"}',
    '{"name": "John Doe", "email": "john@example.com", "age": 25}',
    '{"enabled": true, "rules": [{"id": "1", "field": "name", "type": "required", "message": "Name is required", "enabled": true}, {"id": "2", "field": "email", "type": "email", "message": "Valid email is required", "enabled": true}], "errorScenarios": [], "strictMode": false}'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440021',
    '550e8400-e29b-41d4-a716-446655440002',
    'Get Products',
    'GET',
    '/api/products',
    'Retrieve all products',
    200,
    '{"Content-Type": "application/json"}',
    '[{"id": "<<uuid>>", "name": "<<product>>", "price": "<<price>>", "description": "<<sentence>>", "company": "<<company>>"}]',
    NULL,
    NULL
  )
ON CONFLICT (id) DO NOTHING;
