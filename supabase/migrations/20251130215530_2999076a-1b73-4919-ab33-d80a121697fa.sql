-- Create a function to generate short tokens
CREATE OR REPLACE FUNCTION generate_short_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..10 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Update all existing long tokens to short tokens
DO $$
DECLARE
  rec RECORD;
  new_token TEXT;
BEGIN
  FOR rec IN SELECT id FROM qr_access WHERE length(access_token) > 10 LOOP
    LOOP
      new_token := generate_short_token();
      -- Check if token already exists
      IF NOT EXISTS (SELECT 1 FROM qr_access WHERE access_token = new_token) THEN
        UPDATE qr_access 
        SET access_token = new_token 
        WHERE id = rec.id;
        EXIT;
      END IF;
    END LOOP;
  END LOOP;
END;
$$;