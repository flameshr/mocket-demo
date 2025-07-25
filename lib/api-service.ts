export interface Collection {
  id: string
  name: string
  description?: string
  endpoints?: Endpoint[]
  created_at: string
  updated_at: string
}

export interface Endpoint {
  id: string
  collection_id: string
  name: string
  method: string
  path: string
  response_body: string
  status_code: number
  headers: Record<string, string>
  validation_rules: ValidationRule[]
  error_scenarios: ErrorScenario[]
  delay_config: DelayConfig
  created_at: string
  updated_at: string
}

export interface ValidationRule {
  field: string
  type: string
  message: string
  conditions?: any
}

export interface ErrorScenario {
  name: string
  probability: number
  statusCode: number
  response: any
}

export interface DelayConfig {
  enabled: boolean
  min: number
  max: number
}

class ApiService {
  private baseUrl = "/api"

  async getCollections(): Promise<Collection[]> {
    const response = await fetch(`${this.baseUrl}/collections`)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch collections")
    }

    // Handle setup case
    if (data.needsSetup) {
      return []
    }

    return data.collections || []
  }

  async createCollection(
    collection: Omit<Collection, "id" | "created_at" | "updated_at" | "endpoints">,
  ): Promise<Collection> {
    const response = await fetch(`${this.baseUrl}/collections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(collection),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to create collection")
    }

    return data.collection
  }

  async updateCollection(id: string, collection: Partial<Collection>): Promise<Collection> {
    const response = await fetch(`${this.baseUrl}/collections/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(collection),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to update collection")
    }

    return data.collection
  }

  async deleteCollection(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/collections/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || "Failed to delete collection")
    }
  }

  async createEndpoint(endpoint: Omit<Endpoint, "id" | "created_at" | "updated_at">): Promise<Endpoint> {
    const response = await fetch(`${this.baseUrl}/endpoints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(endpoint),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to create endpoint")
    }

    return data.endpoint
  }

  async updateEndpoint(id: string, endpoint: Partial<Endpoint>): Promise<Endpoint> {
    const response = await fetch(`${this.baseUrl}/endpoints/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(endpoint),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to update endpoint")
    }

    return data.endpoint
  }

  async deleteEndpoint(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/endpoints/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || "Failed to delete endpoint")
    }
  }
}

export const apiService = new ApiService()
