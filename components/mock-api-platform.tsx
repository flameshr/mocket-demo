"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { MainContent } from "@/components/main-content"
import { ApiService } from "@/lib/api-service"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { ValidationConfig } from "./validation-editor"

export interface MockEndpoint {
  id: string
  name: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  path: string
  description?: string
  response: {
    status: number
    headers: Record<string, string>
    body: string
  }
  request?: {
    headers?: Record<string, string>
    body?: string
  }
  validation?: ValidationConfig
}

export interface Collection {
  id: string
  name: string
  description?: string
  endpoints: MockEndpoint[]
}

export function MockApiPlatform() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [selectedEndpoint, setSelectedEndpoint] = useState<MockEndpoint | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Load collections from Supabase on mount
  useEffect(() => {
    loadCollections()
  }, [])

  const loadCollections = async () => {
    try {
      setLoading(true)
      const data = await ApiService.getCollections()
      setCollections(data)

      if (data.length > 0) {
        setSelectedCollection(data[0])
        if (data[0].endpoints.length > 0) {
          setSelectedEndpoint(data[0].endpoints[0])
        }
      }
    } catch (error) {
      console.error("Error loading collections:", error)
      toast({
        title: "Error",
        description: "Failed to load collections. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateEndpoint = async (updatedEndpoint: MockEndpoint) => {
    try {
      setSaving(true)
      const savedEndpoint = await ApiService.updateEndpoint(updatedEndpoint.id, updatedEndpoint)

      setCollections((prev) =>
        prev.map((collection) =>
          collection.id === selectedCollection?.id
            ? {
                ...collection,
                endpoints: collection.endpoints.map((endpoint) =>
                  endpoint.id === savedEndpoint.id ? savedEndpoint : endpoint,
                ),
              }
            : collection,
        ),
      )
      setSelectedEndpoint(savedEndpoint)

      toast({
        title: "Success",
        description: "Endpoint updated successfully!",
      })
    } catch (error) {
      console.error("Error updating endpoint:", error)
      toast({
        title: "Error",
        description: "Failed to update endpoint. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const addEndpoint = async (collectionId: string, endpoint: Omit<MockEndpoint, "id">) => {
    try {
      setSaving(true)
      const newEndpoint = await ApiService.createEndpoint(collectionId, endpoint)

      setCollections((prev) =>
        prev.map((collection) =>
          collection.id === collectionId
            ? { ...collection, endpoints: [...collection.endpoints, newEndpoint] }
            : collection,
        ),
      )

      toast({
        title: "Success",
        description: "Endpoint created successfully!",
      })
    } catch (error) {
      console.error("Error creating endpoint:", error)
      toast({
        title: "Error",
        description: "Failed to create endpoint. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const addCollection = async (collection: Omit<Collection, "id" | "endpoints">) => {
    try {
      setSaving(true)
      const newCollection = await ApiService.createCollection(collection)
      setCollections((prev) => [...prev, newCollection])

      toast({
        title: "Success",
        description: "Collection created successfully!",
      })
    } catch (error) {
      console.error("Error creating collection:", error)
      toast({
        title: "Error",
        description: "Failed to create collection. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSelectCollection = (collection: Collection) => {
    setSelectedCollection(collection)
    if (collection.endpoints.length > 0) {
      setSelectedEndpoint(collection.endpoints[0])
    } else {
      setSelectedEndpoint(null)
    }
  }

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your mock API platform...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full flex overflow-hidden bg-background">
      <AppSidebar
        collections={collections}
        selectedCollection={selectedCollection!}
        selectedEndpoint={selectedEndpoint}
        onSelectCollection={handleSelectCollection}
        onSelectEndpoint={setSelectedEndpoint}
        onAddEndpoint={addEndpoint}
        onAddCollection={addCollection}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        loading={saving}
      />
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-0" : "ml-0"}`}>
        <MainContent
          selectedEndpoint={selectedEndpoint}
          selectedCollection={selectedCollection!}
          onUpdateEndpoint={updateEndpoint}
          onAddEndpoint={addEndpoint}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          saving={saving}
        />
      </div>
    </div>
  )
}
