import { ModuleRegistrationName } from "@medusajs/modules-sdk"
import { ICustomerModuleService, IAuthModuleService } from "@medusajs/types"
import path from "path"
import { startBootstrapApp } from "../../../../environment-helpers/bootstrap-app"
import { useApi } from "../../../../environment-helpers/use-api"
import { getContainer } from "../../../../environment-helpers/use-container"
import { initDb, useDb } from "../../../../environment-helpers/use-db"
import adminSeeder from "../../../../helpers/admin-seeder"

jest.setTimeout(50000)

const env = { MEDUSA_FF_MEDUSA_V2: true }

describe("POST /store/customers", () => {
  let dbConnection
  let appContainer
  let shutdownServer
  let customerModuleService: ICustomerModuleService

  beforeAll(async () => {
    const cwd = path.resolve(path.join(__dirname, "..", "..", ".."))
    dbConnection = await initDb({ cwd, env } as any)
    shutdownServer = await startBootstrapApp({ cwd, env })
    appContainer = getContainer()
    customerModuleService = appContainer.resolve(
      ModuleRegistrationName.CUSTOMER
    )
  })

  afterAll(async () => {
    const db = useDb()
    await db.shutdown()
    await shutdownServer()
  })

  beforeEach(async () => {
    await adminSeeder(dbConnection)
  })

  afterEach(async () => {
    const db = useDb()
    await db.teardown()
  })

  it("should create a customer", async () => {
    const authService: IAuthModuleService = appContainer.resolve(
      ModuleRegistrationName.AUTH
    )
    const authUser = await authService.createAuthUser({
      entity_id: "store_user",
      provider_id: "test",
    })
    const jwt = await authService.generateJwtToken(authUser.id, "store")

    const api = useApi() as any
    const response = await api.post(
      `/store/customers`,
      {
        first_name: "John",
        last_name: "Doe",
        email: "john@me.com",
      },
      { headers: { authorization: `Bearer ${jwt}` } }
    )

    expect(response.status).toEqual(200)
    expect(response.data.customer).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        first_name: "John",
        last_name: "Doe",
        email: "john@me.com",
      })
    )
  })
})
