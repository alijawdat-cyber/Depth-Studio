/**
 * 🗄️ Base Repository Pattern
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يونيو 2025
 * 
 * @description Generic base repository for all database operations
 * @version 1.0.0
 */

import { 
  CollectionReference, 
  DocumentReference, 
  Query, 
  QuerySnapshot, 
  DocumentSnapshot,
  FieldValue,
  Timestamp 
} from 'firebase-admin/firestore';
import { db } from '../config/firebase';

/**
 * Base interface for all entities
 */
export interface BaseEntity {
  id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by?: string;
  updated_by?: string;
}

/**
 * Query filter interface
 */
export interface QueryFilter {
  field: string;
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in';
  value: any;
}

/**
 * Query options interface
 */
export interface QueryOptions {
  filters?: QueryFilter[];
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  }[];
  limit?: number;
  offset?: number;
}

/**
 * Pagination result interface
 */
export interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Generic Base Repository Class
 */
export abstract class BaseRepository<T extends BaseEntity> {
  protected collection: CollectionReference;
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.collection = db.collection(collectionName);
  }

  /**
   * Create new document
   */
  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>, createdBy?: string): Promise<T> {
    const docData = {
      ...data,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
      ...(createdBy && { created_by: createdBy })
    };

    const docRef = await this.collection.add(docData);
    const createdDoc = await docRef.get();
    
    return {
      id: docRef.id,
      ...createdDoc.data()
    } as T;
  }

  /**
   * Find document by ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      const doc = await this.collection.doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data()
      } as T;
    } catch (error) {
      console.error(`Error finding ${this.collectionName} by id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Find all documents with optional filtering
   */
  async findAll(options?: QueryOptions): Promise<T[]> {
    try {
      let query: Query = this.collection;

      // Apply filters
      if (options?.filters) {
        options.filters.forEach(filter => {
          query = query.where(filter.field, filter.operator, filter.value);
        });
      }

      // Apply ordering
      if (options?.orderBy) {
        options.orderBy.forEach(order => {
          query = query.orderBy(order.field, order.direction);
        });
      }

      // Apply limit
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      // Apply offset
      if (options?.offset) {
        query = query.offset(options.offset);
      }

      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (error) {
      console.error(`Error finding all ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Find documents with pagination
   */
  async findWithPagination(page: number = 1, limit: number = 20, options?: QueryOptions): Promise<PaginationResult<T>> {
    try {
      // Build base query
      let query: Query = this.collection;

      // Apply filters
      if (options?.filters) {
        options.filters.forEach(filter => {
          query = query.where(filter.field, filter.operator, filter.value);
        });
      }

      // Apply ordering
      if (options?.orderBy) {
        options.orderBy.forEach(order => {
          query = query.orderBy(order.field, order.direction);
        });
      }

      // Get total count
      const countSnapshot = await query.get();
      const totalCount = countSnapshot.size;
      const totalPages = Math.ceil(totalCount / limit);

      // Apply pagination
      const offset = (page - 1) * limit;
      const paginatedQuery = query.offset(offset).limit(limit);
      
      const snapshot = await paginatedQuery.get();
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];

      return {
        data,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error(`Error paginating ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Update document by ID
   */
  async update(id: string, data: Partial<Omit<T, 'id' | 'created_at'>>, updatedBy?: string): Promise<T | null> {
    try {
      const updateData = {
        ...data,
        updated_at: FieldValue.serverTimestamp(),
        ...(updatedBy && { updated_by: updatedBy })
      };

      await this.collection.doc(id).update(updateData);
      
      // Return updated document
      return await this.findById(id);
    } catch (error) {
      console.error(`Error updating ${this.collectionName} ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete document by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.collection.doc(id).delete();
      return true;
    } catch (error) {
      console.error(`Error deleting ${this.collectionName} ${id}:`, error);
      throw error;
    }
  }

  /**
   * Check if document exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const doc = await this.collection.doc(id).get();
      return doc.exists;
    } catch (error) {
      console.error(`Error checking if ${this.collectionName} ${id} exists:`, error);
      throw error;
    }
  }

  /**
   * Count documents
   */
  async count(options?: QueryOptions): Promise<number> {
    try {
      let query: Query = this.collection;

      // Apply filters
      if (options?.filters) {
        options.filters.forEach(filter => {
          query = query.where(filter.field, filter.operator, filter.value);
        });
      }

      const snapshot = await query.get();
      return snapshot.size;
    } catch (error) {
      console.error(`Error counting ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Find one document matching criteria
   */
  async findOne(options: QueryOptions): Promise<T | null> {
    try {
      const results = await this.findAll({ ...options, limit: 1 });
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error(`Error finding one ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Batch create multiple documents
   */
  async createMany(items: Omit<T, 'id' | 'created_at' | 'updated_at'>[], createdBy?: string): Promise<T[]> {
    try {
      const batch = db.batch();
      const refs: DocumentReference[] = [];

      items.forEach(item => {
        const ref = this.collection.doc();
        const docData = {
          ...item,
          created_at: FieldValue.serverTimestamp(),
          updated_at: FieldValue.serverTimestamp(),
          ...(createdBy && { created_by: createdBy })
        };
        
        batch.set(ref, docData);
        refs.push(ref);
      });

      await batch.commit();

      // Get created documents
      const results: T[] = [];
      for (const ref of refs) {
        const doc = await ref.get();
        results.push({
          id: ref.id,
          ...doc.data()
        } as T);
      }

      return results;
    } catch (error) {
      console.error(`Error creating many ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get raw collection reference for advanced queries
   */
  getCollection(): CollectionReference {
    return this.collection;
  }

  /**
   * Get raw document reference
   */
  getDocumentRef(id: string): DocumentReference {
    return this.collection.doc(id);
  }
} 