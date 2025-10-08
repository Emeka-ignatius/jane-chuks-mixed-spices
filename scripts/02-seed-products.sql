-- Seed the products table with JaneChucks Mixed Spices products
-- Based on the product images provided

INSERT INTO products (name, slug, description, category, price, stock_quantity, weight, ingredients, directions_for_use, image_url) VALUES 
(
    'JaneChucks Mixed Spices (For Men)',
    'janechucks-mixed-spices-for-men',
    'Premium mixed spices specially formulated for men''s health and vitality. A powerful blend of natural ingredients to enhance your daily nutrition.',
    'men',
    2500.00, -- ₦2,500
    50,
    '50g',
    ARRAY['Ginger', 'Cinnamon', 'Garlic', 'Olive leaf'],
    'Add desired quantity to your stew or soup. Add one tea spoonful of spices to 20cl of hot water, stir and drink.',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/for_men-J1TzSFwNPcLrkuxCdKs2nDOjmA2716.png'
),
(
    'JaneChucks Mixed Spices (For Women)',
    'janechucks-mixed-spices-for-women',
    'Specially crafted mixed spices designed for women''s wellness and reproductive health. A nourishing blend of premium natural ingredients.',
    'women',
    2500.00, -- ₦2,500
    45,
    '50g',
    ARRAY['Watermelon seed', 'Carrot seed', 'Ginger', 'Tigernuts', 'Date', 'Maca root'],
    'Add desired quantity to your stew or soup. Add one tea spoonful of spices to 20cl of hot water, stir, filter and drink.',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/for_women.jpg-r61WaP0sD2llTAjuGbowBP7j4dnmAa.jpeg'
),
(
    'JaneChucks Mixed Spices (Multi-Purpose)',
    'janechucks-mixed-spices-multi-purpose',
    'Our versatile multi-purpose spice blend suitable for everyone. Perfect for enhancing the flavor and nutritional value of your meals.',
    'multipurpose',
    2200.00, -- ₦2,200
    60,
    '50g',
    ARRAY['Ginger', 'Cinnamon', 'Garlic', 'Olive leaf'],
    'Add desired quantity to your stew or soup. Boil 4 tablespoons of the spices with 60cl of water for 15mins, filter and drink all. Reboil with 30cl of water and discard.',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/multi_purpose.jpg-fjsSTxXQiDr8Fv1fs2y8plyi6jyB7k.jpeg'
);

-- Create a default admin user
INSERT INTO users (email, name, password_hash, is_admin, email_verified) VALUES 
('admin@janechucks.com', 'JaneChucks Admin', '$2b$10$placeholder_hash', true, true)
ON CONFLICT (email) DO NOTHING;
