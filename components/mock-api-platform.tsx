"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { MainContent } from "@/components/main-content"
import { SidebarProvider } from "@/components/ui/sidebar"
import { apiService, type Collection, type Endpoint } from "@/lib/api-service"
import { toast } from "sonner"

export function MockApiPlatform() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)

  const loadCollections = async () => {
    try {
      setLoading(true)
      const fetchedCollections = await apiService.getCollections()
      setCollections(fetchedCollections)

      // If we have collections but no selected one, select the first
      if (fetchedCollections.length > 0 && !selectedCollection) {
        setSelectedCollection(fetchedCollections[0])
        if (fetchedCollections[0].endpoints && fetchedCollections[0].endpoints.length > 0) {
          setSelectedEndpoint(fetchedCollections[0].endpoints[0])
        }
      }

      setNeedsSetup(false)
    } catch (error) {
      console.error("Failed to load collections:", error)
      if (error instanceof Error && error.message.includes("does not exist")) {
        setNeedsSetup(true)
      } else {
        toast.error("Failed to load collections")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCollections()
  }, [])

  const handleCollectionSelect = (collection: Collection) => {
    setSelectedCollection(collection)
    // Select first endpoint if available
    if (collection.endpoints && collection.endpoints.length > 0) {
      setSelectedEndpoint(collection.endpoints[0])
    } else {
      setSelectedEndpoint(null)
    }
  }

  const handleEndpointSelect = (endpoint: Endpoint) => {
    setSelectedEndpoint(endpoint)
  }

  const handleCollectionCreate = async (name: string, description?: string) => {
    try {
      const newCollection = await apiService.createCollection({ name, description })
      const updatedCollections = [...collections, { ...newCollection, endpoints: [] }]
      setCollections(updatedCollections)
      setSelectedCollection({ ...newCollection, endpoints: [] })
      setSelectedEndpoint(null)
      toast.success("Collection created successfully")
    } catch (error) {
      console.error("Failed to create collection:", error)
      toast.error("Failed to create collection")
    }
  }

  const handleEndpointCreate = async (endpointData: Omit<Endpoint, "id" | "created_at" | "updated_at">) => {
    if (!selectedCollection) return

    try {
      const newEndpoint = await apiService.createEndpoint(endpointData)

      // Update the collections state
      const updatedCollections = collections.map((col) =>
        col.id === selectedCollection.id ? { ...col, endpoints: [...(col.endpoints || []), newEndpoint] } : col,
      )
      setCollections(updatedCollections)

      // Update selected collection
      const updatedSelectedCollection = {
        ...selectedCollection,
        endpoints: [...(selectedCollection.endpoints || []), newEndpoint],
      }
      setSelectedCollection(updatedSelectedCollection)
      setSelectedEndpoint(newEndpoint)

      toast.success("Endpoint created successfully")
    } catch (error) {
      console.error("Failed to create endpoint:", error)
      toast.error("Failed to create endpoint")
    }
  }

  const handleEndpointUpdate = async (endpointId: string, updates: Partial<Endpoint>) => {
    if (!selectedCollection || !selectedEndpoint) return

    try {
      const updatedEndpoint = await apiService.updateEndpoint(endpointId, updates)

      // Update collections state
      const updatedCollections = collections.map((col) =>
        col.id === selectedCollection.id
          ? {
              ...col,
              endpoints: col.endpoints?.map((ep) => (ep.id === endpointId ? updatedEndpoint : ep)) || [],
            }
          : col,
      )
      setCollections(updatedCollections)

      // Update selected collection and endpoint
      const updatedSelectedCollection = {
        ...selectedCollection,
        endpoints: selectedCollection.endpoints?.map((ep) => (ep.id === endpointId ? updatedEndpoint : ep)) || [],
      }
      setSelectedCollection(updatedSelectedCollection)
      setSelectedEndpoint(updatedEndpoint)

      toast.success("Endpoint updated successfully")
    } catch (error) {
      console.error("Failed to update endpoint:", error)
      toast.error("Failed to update endpoint")
    }
  }

  const handleEndpointDelete = async (endpointId: string) => {
    if (!selectedCollection) return

    try {
      await apiService.deleteEndpoint(endpointId)

      // Update collections state
      const updatedCollections = collections.map((col) =>
        col.id === selectedCollection.id
          ? {
              ...col,
              endpoints: col.endpoints?.filter((ep) => ep.id !== endpointId) || [],
            }
          : col,
      )
      setCollections(updatedCollections)

      // Update selected collection
      const updatedSelectedCollection = {
        ...selectedCollection,
        endpoints: selectedCollection.endpoints?.filter((ep) => ep.id !== endpointId) || [],
      }
      setSelectedCollection(updatedSelectedCollection)

      // Clear selected endpoint if it was deleted
      if (selectedEndpoint?.id === endpointId) {
        const remainingEndpoints = updatedSelectedCollection.endpoints || []
        setSelectedEndpoint(remainingEndpoints.length > 0 ? remainingEndpoints[0] : null)
      }

      toast.success("Endpoint deleted successfully")
    } catch (error) {
      console.error("Failed to delete endpoint:", error)
      toast.error("Failed to delete endpoint")
    }
  }

  if (needsSetup) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold">Welcome to MockAPI Platform</h1>
          <p className="text-muted-foreground max-w-md">
            To get started, please run the SQL scripts in your Supabase dashboard to set up the database tables.
          </p>
          <div className="space-y-2 text-sm text-left bg-muted p-4 rounded-lg">
            <p className="font-medium">Steps:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to your Supabase dashboard</li>
              <li>Navigate to the SQL Editor</li>
              <li>Run scripts/001-create-tables.sql</li>
              <li>Run scripts/002-seed-data.sql</li>
              <li>Refresh this page</li>
            </ol>
          </div>
          <button
            onClick={loadCollections}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Check Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar
          collections={collections}
          selectedCollection={selectedCollection}
          selectedEndpoint={selectedEndpoint}
          onCollectionSelect={handleCollectionSelect}
          onEndpointSelect={handleEndpointSelect}
          onCollectionCreate={handleCollectionCreate}
          loading={loading}
        />
        <MainContent
          selectedCollection={selectedCollection}
          selectedEndpoint={selectedEndpoint}
          onEndpointCreate={handleEndpointCreate}
          onEndpointUpdate={handleEndpointUpdate}
          onEndpointDelete={handleEndpointDelete}
        />
      </div>
    </SidebarProvider>
  )
}
