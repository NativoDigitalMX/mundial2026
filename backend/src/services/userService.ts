import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { User, UserCreateInput, UserLoginInput, SafeUser } from '../models/User';
import  db from '../config/database';

const SALT_ROUNDS = 10;

export class UserService {
    static async createUser(userData: UserCreateInput): Promise<SafeUser> {
        const connection = await db.getConnection();
        
        // Verificar si el código ya existe
        const [existing] = await connection.execute(
            'SELECT id FROM users WHERE user_code = ?',
            [userData.user_code]
        );
        
        if ((existing as any[]).length > 0) {
            throw new Error('El código de usuario ya existe');
        }
        
        // Hash de la contraseña
        const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);
 
        
        const [result] = await connection.execute(
            `INSERT INTO users 
             (user_code, full_name, password_hash, is_admin) 
             VALUES (?, ?, ?, ?)`,
            [
                userData.user_code,
                userData.full_name,
                // '${hash}',
                passwordHash,
                userData.is_admin || false
            ]
        );
        
        const insertedId = (result as mysql.ResultSetHeader).insertId;
        
        const [users] = await connection.execute(
            'SELECT * FROM users WHERE id = ?',
            [insertedId]
        );
        
        connection.release();

        const user = (users as any[])[0];

        return {
        id: user.id,
        user_code: user.user_code,
        full_name: user.full_name,
        is_admin: user.is_admin,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at
    };
    }

 static async updateUser(userId: number, updateData: any): Promise<any> {
    const connection = await db.getConnection();
    
    try {

      // Hashear contraseña si se proporciona
      if (updateData.password) {
        const saltRounds = 10;
        updateData.password_hash = await bcrypt.hash(updateData.password, saltRounds);
        delete updateData.password; // Eliminar password plano
      }
      
      // Construir query dinámica
      const fields = Object.keys(updateData);
      const values = Object.values(updateData);
      
      if (fields.length === 0) {
        throw new Error('No hay datos para actualizar');
      }
      
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      
      const query = `
        UPDATE users 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      await connection.execute(query, [...values, userId]);
      
      // Obtener usuario actualizado
      const [updatedUsers] = await connection.execute(
        'SELECT id, user_code, full_name, is_admin, is_active, created_at, updated_at FROM users WHERE id = ?',
        [userId]
      );
      
      const updatedUser = (updatedUsers as any[])[0];
      return updatedUser;
      
    } catch (error: any) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    } finally {
      connection.release();
    }
  }

static async userHasPredictions(userId: number): Promise<boolean> {
  const connection = await db.getConnection();
  try {
    const [result] = await connection.execute(
      'SELECT COUNT(*) as count FROM predictions WHERE user_id = ?',
      [userId]
    );
    const count = (result as any[])[0]?.count || 0;
    return count > 0;
  } finally {
    connection.release();
  }
}

static async getPredictionCount(userId: number): Promise<number> {
  const connection = await db.getConnection();
  try {
    const [result] = await connection.execute(
      'SELECT COUNT(*) as count FROM predictions WHERE user_id = ?',
      [userId]
    );
    return (result as any[])[0]?.count || 0;
  } finally {
    connection.release();
  }
}
static async deleteUser(userId: number, deletePredictions: boolean = false): Promise<void> {
  const connection = await db.getConnection();
  
  try {
    // Verificar si tiene predicciones
    const [predictionsResult] = await connection.execute(
      'SELECT COUNT(*) as prediction_count FROM predictions WHERE user_id = ?',
      [userId]
    );
    
    const rows = predictionsResult as any[];
    const count = rows[0]?.prediction_count || rows[0]?.['COUNT(*)'] || 0;
    // Si tiene predicciones y NO se autorizó eliminarlas, lanzar error
    if (count > 0 && !deletePredictions) {
      throw new Error('USER_HAS_PREDICTIONS'); // Error especial
    }
    
    // Si tiene predicciones Y se autorizó eliminarlas, eliminarlas primero
    if (count > 0 && deletePredictions) {
      await connection.execute(
        'DELETE FROM predictions WHERE user_id = ?',
        [userId]
      );
    }
    
    // Finalmente eliminar usuario
    await connection.execute(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );    
  } catch (error: any) {
    console.error('❌ Error en deleteUser:', error);
    throw error;
    
  } finally {
    connection.release();
  }
}
    
static async validateLogin(loginData: UserLoginInput): Promise<SafeUser | null> {
        const connection = await db.getConnection();
        
        const [users] = await connection.execute(
            'SELECT * FROM users WHERE user_code = ? AND is_active = TRUE',
            [loginData.user_code]
        );
        
        const userArray = users as any[];
        
        if (userArray.length === 0) {
            connection.release();
            return null;
        }
        
        const user = userArray[0];
        const isValid = await bcrypt.compare(loginData.password, user.password_hash);
        
        connection.release();
        
        if (!isValid) {
            return null;
        }
        
        // return user;
        return {
        id: user.id,
        user_code: user.user_code,
        full_name: user.full_name,
        is_admin: user.is_admin,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at
    };
    }
    
static async getUserById(id: number): Promise<SafeUser | null> {
        const connection = await db.getConnection();
        
        const [users] = await connection.execute(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        
        connection.release();
        
        const userArray = users as any[];
    
    if (userArray.length === 0) {
        return null;
    }
    
    const user = userArray[0];
    
    // Devolver objeto seguro
    return {
        id: user.id,
        user_code: user.user_code,
        full_name: user.full_name,
        is_admin: user.is_admin,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at
    };
    }
    
static async getUserByCode(userCode: string): Promise<SafeUser | null> {
        const connection = await db.getConnection();
        
        const [users] = await connection.execute(
            'SELECT * FROM users WHERE user_code = ?',
            [userCode]
        );
        
        connection.release();
        
        const userArray = users as any[];
    
    if (userArray.length === 0) {
        return null;
    }
    
    const user = userArray[0];
    
    // Devolver objeto seguro
    return {
        id: user.id,
        user_code: user.user_code,
        full_name: user.full_name,
        is_admin: user.is_admin,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at
    };
    }
    
static async getAllUsers(): Promise<SafeUser[]> {
        const connection = await db.getConnection();
        
        const [users] = await connection.execute(
            'SELECT id, user_code, full_name, is_admin, is_active, created_at FROM users ORDER BY created_at DESC'
        );
        
        connection.release();
        
        return users as SafeUser[];
    }
}