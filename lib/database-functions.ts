import { sql } from './db';

export async function createUser(email: string, name?: string) {
  try {
    const result = await sql`
      INSERT INTO users (email, name)
      VALUES (${email}, ${name})
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

export async function createThought(userId: string, content: string, subtasks: any[] = []) {
  try {
    const result = await sql`
      INSERT INTO thoughts (user_id, content, subtasks)
      VALUES (${userId}, ${content}, ${JSON.stringify(subtasks)})
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('Error creating thought:', error);
    throw error;
  }
}

export async function getUserThoughts(userId: string) {
  try {
    const result = await sql`
      SELECT * FROM thoughts 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return result;
  } catch (error) {
    console.error('Error getting thoughts:', error);
    throw error;
  }
}

export async function saveThought(userId: string, thoughtId: string) {
  try {
    const result = await sql`
      INSERT INTO saved_thoughts (user_id, thought_id)
      VALUES (${userId}, ${thoughtId})
      ON CONFLICT (user_id, thought_id) DO NOTHING
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('Error saving thought:', error);
    throw error;
  }
}

export async function getSavedThoughts(userId: string) {
  try {
    const result = await sql`
      SELECT t.*, st.saved_at 
      FROM thoughts t
      JOIN saved_thoughts st ON t.id = st.thought_id
      WHERE st.user_id = ${userId}
      ORDER BY st.saved_at DESC
    `;
    return result;
  } catch (error) {
    console.error('Error getting saved thoughts:', error);
    throw error;
  }
} 