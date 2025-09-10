import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type { PgTransaction } from "drizzle-orm/pg-core";
import { AppError, type APP_ERROR_CODE_KEY } from "../err";
import { db } from "./index";
import * as schema from "./schema";

/**
 * Type representing the transactional database client
 * This is equivalent to TransactionalPrismaClient in Prisma
 */
export type TransactionalDrizzleClient = PgTransaction<
  NodePgQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

/**
 * PostgreSQL transaction configuration options
 */
export interface PgTransactionConfig {
  isolationLevel?: "read uncommitted" | "read committed" | "repeatable read" | "serializable";
  accessMode?: "read only" | "read write";
  deferrable?: boolean;
}

/**
 * Default transaction configuration
 * Using serializable isolation level for maximum consistency
 */
const defaultConfig: PgTransactionConfig = {
  isolationLevel: "serializable",
  accessMode: "read write",
  deferrable: false,
};

/**
 * Maximum number of retry attempts for failed transactions
 */
const MAX_RETRY_ATTEMPTS = 10;

/**
 * Maps PostgreSQL error codes to appropriate app error codes
 * @param pgCode - PostgreSQL error code
 * @returns Appropriate APP_ERROR_CODE_KEY
 */
function getAppErrorCodeFromPgError(pgCode: string): APP_ERROR_CODE_KEY {
  switch (pgCode) {
    case "40001": // serialization_failure
    case "40P01": // deadlock_detected
      return "CONFLICT";
    case "57014": // query_canceled
    case "25P03": // idle_in_transaction_session_timeout
      return "TIMEOUT";
    case "22P02": // invalid_text_representation
    case "22023": // invalid_parameter_value
    case "22012": // division_by_zero
      return "BAD_REQUEST";
    case "42601": // syntax_error
    case "42501": // insufficient_privilege
    case "42883": // undefined_function
      return "UNPROCESSABLE_CONTENT";
    default:
      return "INTERNAL_SERVER_ERROR";
  }
}

/**
 * Determines if a transaction should be retried based on the error
 * @param error - The error that occurred during transaction execution
 * @returns Object with retry decision and appropriate error code
 */
function shouldRetryTransaction(error: unknown): { shouldRetry: boolean; errorCode: APP_ERROR_CODE_KEY } {
  // Handle PostgreSQL-specific errors that indicate serialization conflicts
  if (error && typeof error === "object" && "code" in error) {
    const pgError = error as { code: string; severity?: string };
    const errorCode = getAppErrorCodeFromPgError(pgError.code);
    
    // PostgreSQL error codes that should trigger a retry:
    // 40001 - serialization_failure (serialization failure)
    // 40P01 - deadlock_detected (deadlock detected)
    const shouldRetry = pgError.code === "40001" || pgError.code === "40P01";
    
    return { shouldRetry, errorCode };
  }

  return { shouldRetry: false, errorCode: "INTERNAL_SERVER_ERROR" };
}

/**
 * Executes a function within a database transaction with automatic retry logic
 * 
 * @param body - Function to execute within the transaction context
 * @param config - Optional PostgreSQL transaction configuration
 * @returns Promise resolving to the result of the transaction body
 * 
 * @example
 * ```typescript
 * const result = await transact(async (tx) => {
 *   const user = await tx.insert(users).values({ name: "John" }).returning();
 *   const profile = await tx.insert(profiles).values({ userId: user[0].id });
 *   return { user: user[0], profile };
 * });
 * ```
 * 
 * @example
 * ```typescript
 * // With custom configuration
 * const result = await transact(
 *   async (tx) => {
 *     return await tx.select().from(users);
 *   },
 *   { isolationLevel: "read committed", accessMode: "read only" }
 * );
 * ```
 */
export async function transact<T>(
  body: (tx: TransactionalDrizzleClient) => Promise<T>,
  config: PgTransactionConfig = defaultConfig
): Promise<T> {
  const transactionConfig = { ...defaultConfig, ...config };

  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      const result = await db.transaction(
        async (tx) => {
          return await body(tx);
        },
        transactionConfig
      );
      return result;
    } catch (error) {
      const { shouldRetry, errorCode } = shouldRetryTransaction(error);
      const isLastAttempt = attempt === MAX_RETRY_ATTEMPTS;
      
      if (shouldRetry && !isLastAttempt) {
        // Log retry attempt (using console as per existing codebase patterns)
        console.warn(`Transaction attempt ${attempt} failed (${errorCode}), retrying...`, {
          error: error instanceof Error ? error.message : String(error),
          attempt,
          errorCode,
        });
        continue;
      }

      // Log final error
      console.error(`Transaction failed after ${attempt} attempts:`, error);
      
      if (isLastAttempt && shouldRetry) {
        throw new AppError({
          code: "CONFLICT",
          message: `Transaction failed after ${MAX_RETRY_ATTEMPTS} attempts due to serialization conflicts`,
          cause: error,
        });
      }

      // Re-throw non-retryable errors immediately with appropriate error code
      throw error instanceof AppError 
        ? error 
        : new AppError({
            code: errorCode,
            message: error instanceof Error ? error.message : "Transaction failed",
            cause: error,
          });
    }
  }

  // This should never be reached, but TypeScript requires it
  throw new AppError({
    code: "CONFLICT",
    message: `Transaction failed after ${MAX_RETRY_ATTEMPTS} attempts`,
  });
}

