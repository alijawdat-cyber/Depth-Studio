/**
 * 🏗️ Base Repository Pattern - Depth Studio
 * ==========================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: Repository Pattern محكم الأنواع بدون any
 */

import { 
  Firestore, 
  CollectionReference, 
  DocumentReference,
  Query,
  QuerySnapshot,
  DocumentSnapshot,
  WriteResult,
  FieldValue,
  WhereFilterOp
} from "firebase-admin/firestore";
import { BaseEntity, ID } from "../../../types/src/core/base";
import { db } from "../config/firebase";
import { logger } from "firebase-functions";

/**
 * 🔍 خيارات الاستعلام
 */
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: {
    field: string;
    direction: "asc" | "desc";
  }[];
  where?: {
    field: string;
    operator: WhereFilterOp;
    value: unknown;
  }[];
}

/**
 * 📄 نتائج الصفحات
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 🏗️ Base Repository Class
 * جميع الدوال محكمة الأنواع - لا any موجود!
 */
export abstract class BaseRepository<T extends BaseEntity> {
  protected readonly collection: CollectionReference;
  protected readonly collectionName: string;
  protected readonly firestore: Firestore;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.firestore = db; // 🔥 استخدام Firestore للعمليات المتقدمة
    this.collection = this.firestore.collection(collectionName);
    logger.info(`🏗️ ${this.constructor.name} initialized for collection: ${collectionName}`);
  }

  /**
   * 🔄 تنفيذ معاملة متعددة الوثائق (Transaction)
   * فائدة Firestore: ضمان التناسق في العمليات المعقدة
   */
  async runTransaction<TResult>(
    updateFunction: (transaction: FirebaseFirestore.Transaction) => Promise<TResult>
  ): Promise<TResult> {
    try {
      const result = await this.firestore.runTransaction(updateFunction);
      logger.info(`🔄 Transaction completed successfully for ${this.collectionName}`);
      return result;
    } catch (error) {
      logger.error(`❌ Transaction failed for ${this.collectionName}`, error);
      throw new Error(`Transaction failed: ${error}`);
    }
  }

  /**
   * 📊 تنفيذ دفعة معاملات (Batch Operations)
   * فائدة Firestore: تنفيذ عدة عمليات في دفعة واحدة بكفاءة
   */
  createBatch(): FirebaseFirestore.WriteBatch {
    return this.firestore.batch();
  }

  /**
   * 📝 إنشاء وثيقة جديدة
   */
  async create(data: Omit<T, "id" | "created_at" | "updated_at">): Promise<T> {
    try {
      const now: FieldValue = FieldValue.serverTimestamp();
      const docRef: DocumentReference = this.collection.doc();
      
      const newDoc: T = {
        ...data,
        id: docRef.id,
        created_at: now,
        updated_at: now,
      } as T;

      await docRef.set(newDoc);
      logger.info(`✅ Created document in ${this.collectionName}`, { id: docRef.id });
      
      return newDoc;
    } catch (error) {
      logger.error(`❌ Error creating document in ${this.collectionName}`, error);
      throw new Error(`Failed to create document: ${error}`);
    }
  }

  /**
   * 🔍 البحث عن وثيقة بالمعرف
   */
  async findById(id: ID): Promise<T | null> {
    try {
      const docRef: DocumentReference = this.collection.doc(id);
      const doc: DocumentSnapshot = await docRef.get();
      
      if (!doc.exists) {
        return null;
      }

      const data = doc.data() as T;
      logger.info(`🔍 Found document in ${this.collectionName}`, { id });
      return data;
    } catch (error) {
      logger.error(`❌ Error finding document in ${this.collectionName}`, error);
      throw new Error(`Failed to find document: ${error}`);
    }
  }

  /**
   * 📋 البحث عن جميع الوثائق مع خيارات
   */
  async findAll(options: QueryOptions = {}): Promise<T[]> {
    try {
      let query: Query = this.collection;

      // تطبيق الفلاتر
      if (options.where) {
        for (const condition of options.where) {
          query = query.where(condition.field, condition.operator, condition.value);
        }
      }

      // تطبيق الترتيب
      if (options.orderBy) {
        for (const order of options.orderBy) {
          query = query.orderBy(order.field, order.direction);
        }
      }

      // تطبيق التحديد والإزاحة
      if (options.offset) {
        query = query.offset(options.offset);
      }
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const snapshot: QuerySnapshot = await query.get();
      const results: T[] = snapshot.docs.map(doc => doc.data() as T);
      
      logger.info(`📋 Found ${results.length} documents in ${this.collectionName}`);
      return results;
    } catch (error) {
      logger.error(`❌ Error finding documents in ${this.collectionName}`, error);
      throw new Error(`Failed to find documents: ${error}`);
    }
  }

  /**
   * 📄 البحث مع صفحات
   */
  async findPaginated(
    page: number = 1, 
    limit: number = 10, 
    options: Omit<QueryOptions, "limit" | "offset"> = {}
  ): Promise<PaginatedResult<T>> {
    try {
      const offset: number = (page - 1) * limit;
      
      // البحث عن البيانات
      const data: T[] = await this.findAll({
        ...options,
        limit,
        offset
      });

      // حساب العدد الكلي
      const totalSnapshot: QuerySnapshot = await this.buildQuery(options).get();
      const total: number = totalSnapshot.size;

      const result: PaginatedResult<T> = {
        data,
        total,
        page,
        limit,
        hasNext: offset + limit < total,
        hasPrev: page > 1
      };

      logger.info(`📄 Paginated query for ${this.collectionName}`, { 
        page, 
        limit, 
        total, 
        returned: data.length 
      });

      return result;
    } catch (error) {
      logger.error(`❌ Error in paginated query for ${this.collectionName}`, error);
      throw new Error(`Failed to execute paginated query: ${error}`);
    }
  }

  /**
   * ✏️ تحديث وثيقة
   */
  async update(id: ID, data: Partial<Omit<T, "id" | "created_at">>): Promise<T> {
    try {
      const docRef: DocumentReference = this.collection.doc(id);
      const updateData = {
        ...data,
        updated_at: FieldValue.serverTimestamp(),
      };

      await docRef.update(updateData);
      
      // جلب البيانات المحدثة
      const updatedDoc = await this.findById(id);
      if (!updatedDoc) {
        throw new Error(`Document with id ${id} not found after update`);
      }

      logger.info(`✏️ Updated document in ${this.collectionName}`, { id });
      return updatedDoc;
    } catch (error) {
      logger.error(`❌ Error updating document in ${this.collectionName}`, error);
      throw new Error(`Failed to update document: ${error}`);
    }
  }

  /**
   * 🗑️ حذف وثيقة
   */
  async delete(id: ID): Promise<void> {
    try {
      const docRef: DocumentReference = this.collection.doc(id);
      const writeResult: WriteResult = await docRef.delete();
      
      logger.info(`🗑️ Deleted document from ${this.collectionName}`, { 
        id, 
        writeTime: writeResult.writeTime 
      });
    } catch (error) {
      logger.error(`❌ Error deleting document from ${this.collectionName}`, error);
      throw new Error(`Failed to delete document: ${error}`);
    }
  }

  /**
   * 🏗️ بناء استعلام مساعد
   */
  private buildQuery(options: Omit<QueryOptions, "limit" | "offset">): Query {
    let query: Query = this.collection;

    if (options.where) {
      for (const condition of options.where) {
        query = query.where(condition.field, condition.operator, condition.value);
      }
    }

    if (options.orderBy) {
      for (const order of options.orderBy) {
        query = query.orderBy(order.field, order.direction);
      }
    }

    return query;
  }

  /**
   * 🔢 حساب عدد الوثائق
   */
  async count(options: Omit<QueryOptions, "limit" | "offset"> = {}): Promise<number> {
    try {
      const query: Query = this.buildQuery(options);
      const snapshot: QuerySnapshot = await query.get();
      
      logger.info(`🔢 Counted ${snapshot.size} documents in ${this.collectionName}`);
      return snapshot.size;
    } catch (error) {
      logger.error(`❌ Error counting documents in ${this.collectionName}`, error);
      throw new Error(`Failed to count documents: ${error}`);
    }
  }
} 