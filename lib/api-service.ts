import type { Collection, MockEndpoint } from "@/components/mock-api-platform"

const API_BASE = "/api"

export class ApiService {
  static async getCollections(): Promise<Collection[]> {
    const response = await fetch(`${API_BASE}/collections`)
    if (!response.ok) {
      throw new Error("Failed to fetch collections")
    }
    const data = await response.json()

    // Transform database format to component format
    return data.map((collection: any) => ({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      endpoints:
        collection.endpoints?.map((endpoint: any) => ({
          id: endpoint.id,
          name: endpoint.name,
          method: endpoint.method,
          path: endpoint.path,
          description: endpoint.description,
          response: {
            status: endpoint.response_status,
            headers: endpoint.response_headers,
            body: endpoint.response_body,
          },
          request: endpoint.request_body
            ? {
                headers: endpoint.request_headers || {},
                body: endpoint.request_body,
              }
            : undefined,
          validation: endpoint.validation_config,
        })) || [],
    }))
  }

  static async createCollection(collection: Omit<Collection, "id" | "endpoints">): Promise<Collection> {
    const response = await fetch(`${API_BASE}/collections`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(collection),
    })

    if (!response.ok) {
      throw new Error("Failed to create collection")
    }

    const data = await response.json()
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      endpoints: data.endpoints || [],
    }
  }

  static async updateCollection(id: string, collection: Partial<Collection>): Promise<Collection> {
    const response = await fetch(`${API_BASE}/collections/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(collection),
    })

    if (!response.ok) {
      throw new Error("Failed to update collection")
    }

    return response.json()
  }

  static async deleteCollection(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/collections/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to delete collection")
    }
  }

  static async createEndpoint(collectionId: string, endpoint: Omit<MockEndpoint, "id">): Promise<MockEndpoint> {
    const response = await fetch(`${API_BASE}/endpoints`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        collection_id: collectionId,
        name: endpoint.name,
        method: endpoint.method,
        path: endpoint.path,
        description: endpoint.description,
        response_status: endpoint.response.status,
        response_headers: endpoint.response.headers,
        response_body: endpoint.response.body,
        request_headers: endpoint.request?.headers,
        request_body: endpoint.request?.body,
        validation_config: endpoint.validation,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create endpoint")
    }

    const data = await response.json()
    return {
      id: data.id,
      name: data.name,
      method: data.method,
      path: data.path,
      description: data.description,
      response: {
        status: data.response_status,
        headers: data.response_headers,
        body: data.response_body,
      },
      request: data.request_body
        ? {
            headers: data.request_headers || {},
            body: data.request_body,
          }
        : undefined,
      validation: data.validation_config,
    }
  }

  static async updateEndpoint(id: string, endpoint: MockEndpoint): Promise<MockEndpoint> {
    const response = await fetch(`${API_BASE}/endpoints/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: endpoint.name,
        method: endpoint.method,
        path: endpoint.path,
        description: endpoint.description,
        response_status: endpoint.response.status,
        response_headers: endpoint.response.headers,
        response_body: endpoint.response.body,
        request_headers: endpoint.request?.headers,
        request_body: endpoint.request?.body,
        validation_config: endpoint.validation,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to update endpoint")
    }

    const data = await response.json()
    return {
      id: data.id,
      name: data.name,
      method: data.method,
      path: data.path,
      description: data.description,
      response: {
        status: data.response_status,
        headers: data.response_headers,
        body: data.response_body,
      },
      request: data.request_body
        ? {
            headers: data.request_headers || {},
            body: data.request_body,
          }
        : undefined,
      validation: data.validation_config,
    }
  }

  static async deleteEndpoint(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/endpoints/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to delete endpoint")
    }
  }
}
