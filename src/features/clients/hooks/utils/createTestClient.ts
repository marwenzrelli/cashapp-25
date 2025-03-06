
import { supabase } from "@/integrations/supabase/client";

export const createTestClient = async (id: number = 1) => {
  try {
    console.log(`Checking if test client with ID ${id} exists...`);
    
    // Check if client exists
    const { count } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('id', id);
      
    if (count && count > 0) {
      console.log(`Test client with ID ${id} already exists`);
      return true;
    }
    
    console.log(`Creating test client with ID ${id}...`);
    
    // Create test client
    const { error } = await supabase
      .from('clients')
      .insert({
        id: id,
        nom: 'Test',
        prenom: 'Client',
        email: 'test@example.com',
        telephone: '0123456789',
        solde: 1000,
        status: 'active',
        date_creation: new Date().toISOString()
      });
      
    if (error) {
      console.error("Error creating test client:", error);
      return false;
    }
    
    console.log(`Test client with ID ${id} created successfully`);
    return true;
  } catch (error) {
    console.error("Error in createTestClient:", error);
    return false;
  }
};
