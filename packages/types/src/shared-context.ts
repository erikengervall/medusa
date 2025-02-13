import { EntityManager } from "typeorm"

/**
 * @interface
 *
 * A context used to share resources, such as transaction manager, between the application and the module.
 */
export type SharedContext = {
  /**
   * An instance of a transaction manager.
   */
  transactionManager?: EntityManager
  /**
   * An instance of an entity manager.
   */
  manager?: EntityManager
}

/**
 * @interface
 *
 * A context used to share resources, such as transaction manager, between the application and the module.
 */
export type Context<TManager = unknown> = {
  __type?: "MedusaContext"
  /**
   * An instance of a transaction manager of type `TManager`, which is a typed parameter passed to the context to specify the type of the `transactionManager`.
   */
  transactionManager?: TManager
  /**
   * An instance of a manager, typically an entity manager, of type `TManager`, which is a typed parameter passed to the context to specify the type of the `manager`.
   */
  manager?: TManager
  /**
   * A string indicating the isolation level of the context. Possible values are `READ UNCOMMITTED`, `READ COMMITTED`, `REPEATABLE READ`, or `SERIALIZABLE`.
   */
  isolationLevel?: string
  /**
   * A boolean value indicating whether nested transactions are enabled.
   */
  enableNestedTransactions?: boolean
  /**
   * A string indicating the ID of the current transaction.
   */
  transactionId?: string

  /**
   * A string indicating the ID of the current request.
   */
  requestId?: string
}
