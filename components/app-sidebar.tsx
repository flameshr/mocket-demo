"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { AddCollectionDialog } from "@/components/add-collection-dialog"
import { AddEndpointDialog } from "@/components/add-endpoint-dialog"
import { Plus, Search, Folder, Globe, Settings, ChevronRight, ChevronDown } from "lucide-react"
import type { Collection, Endpoint } from "@/lib/api-service"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface AppSidebarProps {
  collections: Collection[]
  selectedCollection: Collection | null
  selectedEndpoint: Endpoint | null
  onCollectionSelect: (collection: Collection) => void
  onEndpointSelect: (endpoint: Endpoint) => void
  onCollectionCreate: (name: string, description?: string) => Promise<void>
  loading: boolean
}

export function AppSidebar({
  collections,
  selectedCollection,
  selectedEndpoint,
  onCollectionSelect,
  onEndpointSelect,
  onCollectionCreate,
  loading,
}: AppSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set())

  const filteredCollections = collections.filter(
    (collection) =>
      collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const toggleCollectionExpanded = (collectionId: string) => {
    const newExpanded = new Set(expandedCollections)
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId)
    } else {
      newExpanded.add(collectionId)
    }
    setExpandedCollections(newExpanded)
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "POST":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "PUT":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "PATCH":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Globe className="h-6 w-6" />
          <span className="font-semibold">MockAPI Platform</span>
        </div>
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            Collections
            <AddCollectionDialog onCollectionCreate={onCollectionCreate}>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </AddCollectionDialog>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {loading ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, i) => (
                  <SidebarMenuItem key={i}>
                    <div className="flex items-center space-x-2 p-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  </SidebarMenuItem>
                ))
              ) : filteredCollections.length === 0 ? (
                <SidebarMenuItem>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Folder className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? "No collections found" : "No collections yet"}
                    </p>
                    {!searchQuery && (
                      <AddCollectionDialog onCollectionCreate={onCollectionCreate}>
                        <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                          <Plus className="h-4 w-4 mr-1" />
                          Create Collection
                        </Button>
                      </AddCollectionDialog>
                    )}
                  </div>
                </SidebarMenuItem>
              ) : (
                filteredCollections.map((collection) => {
                  const isExpanded = expandedCollections.has(collection.id)
                  const isSelected = selectedCollection?.id === collection.id
                  const endpoints = collection.endpoints || []

                  return (
                    <Collapsible
                      key={collection.id}
                      open={isExpanded}
                      onOpenChange={() => toggleCollectionExpanded(collection.id)}
                    >
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={() => onCollectionSelect(collection)}
                          isActive={isSelected}
                          className="w-full"
                        >
                          <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                <Folder className="h-4 w-4" />
                                <span className="truncate">{collection.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {endpoints.length}
                                </Badge>
                              </div>
                              {endpoints.length > 0 &&
                                (isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                ))}
                            </div>
                          </CollapsibleTrigger>
                        </SidebarMenuButton>

                        {endpoints.length > 0 && (
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {endpoints.map((endpoint) => (
                                <SidebarMenuSubItem key={endpoint.id}>
                                  <SidebarMenuSubButton
                                    onClick={() => onEndpointSelect(endpoint)}
                                    isActive={selectedEndpoint?.id === endpoint.id}
                                  >
                                    <div className="flex items-center gap-2 w-full">
                                      <Badge className={`text-xs ${getMethodColor(endpoint.method)}`}>
                                        {endpoint.method}
                                      </Badge>
                                      <span className="truncate text-xs">{endpoint.name}</span>
                                    </div>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                              <SidebarMenuSubItem>
                                <AddEndpointDialog
                                  collectionId={collection.id}
                                  onEndpointCreate={async (endpointData) => {
                                    // This will be handled by the parent component
                                    console.log("Endpoint creation handled by parent")
                                  }}
                                >
                                  <SidebarMenuSubButton className="text-muted-foreground hover:text-foreground">
                                    <Plus className="h-3 w-3 mr-1" />
                                    <span className="text-xs">Add Endpoint</span>
                                  </SidebarMenuSubButton>
                                </AddEndpointDialog>
                              </SidebarMenuSubItem>
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        )}
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
