import { ModuleRegistrationName } from "@medusajs/modules-sdk"
import { ICustomerModuleService } from "@medusajs/types"
import path from "path"
import { startBootstrapApp } from "../../../../environment-helpers/bootstrap-app"
import { useApi } from "../../../../environment-helpers/use-api"
import { getContainer } from "../../../../environment-helpers/use-container"
import { initDb, useDb } from "../../../../environment-helpers/use-db"
import { createAuthenticatedCustomer } from "../../../helpers/create-authenticated-customer"

const env = { MEDUSA_FF_MEDUSA_V2: true }

describe("DELETE /store/customers/me/addresses/:address_id", () => {
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

  afterEach(async () => {
    const db = useDb()
    await db.teardown()
  })

  it("should delete a customer address", async () => {
    const { customer, jwt } = await createAuthenticatedCustomer(
      customerModuleService,
      appContainer.resolve(ModuleRegistrationName.AUTH)
    )

    const address = await customerModuleService.addAddresses({
      customer_id: customer.id,
      first_name: "John",
      last_name: "Doe",
      address_1: "Test street 1",
    })

    const api = useApi() as any
    const response = await api.delete(
      `/store/customers/me/addresses/${address.id}`,
      { headers: { authorization: `Bearer ${jwt}` } }
    )

    expect(response.status).toEqual(200)

    const updatedCustomer = await customerModuleService.retrieve(customer.id, {
      relations: ["addresses"],
    })

    expect(updatedCustomer.addresses?.length).toEqual(0)
  })

  it("should fail to delete another customer's address", async () => {
    const { jwt } = await createAuthenticatedCustomer(
      customerModuleService,
      appContainer.resolve(ModuleRegistrationName.AUTH)
    )

    const otherCustomer = await customerModuleService.create({
      first_name: "Jane",
      last_name: "Doe",
    })
    const address = await customerModuleService.addAddresses({
      customer_id: otherCustomer.id,
      first_name: "John",
      last_name: "Doe",
      address_1: "Test street 1",
    })

    const api = useApi() as any
    const response = await api
      .delete(`/store/customers/me/addresses/${address.id}`, {
        headers: { authorization: `Bearer ${jwt}` },
      })
      .catch((e) => e.response)

    expect(response.status).toEqual(404)
  })
})
