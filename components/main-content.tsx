"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ValidationEditor } from "@/components/validation-editor"
import { ResponseEditor } from "@/components/response-editor"
import { AiMockGenerator } from "@/components/ai-mock-generator"
import { Settings, Code, Wand2, Play, Save, Trash2 } from "lucide-react"
import type { Collection, Endpoint } from "@/lib/api-service"
import { toast } from "sonner"

interface MainContentProps {
  selectedCollection: Collection | null
  selectedEndpoint: Endpoint | null
  onEndpointCreate: (endpoint: Omit<Endpoint, "id" | "created_at" | "updated_at">) => Promise<void>
  onEndpointUpdate: (id: string, updates: Partial<Endpoint>) => Promise<void>
  onEndpointDelete: (id: string) => Promise<void>
}

export function MainContent({
  selectedCollection,
  selectedEndpoint,
  onEndpointCreate,
  onEndpointUpdate,
  onEndpointDelete,
}: MainContentProps) {
  const [endpointForm, setEndpointForm] = useState({
    name: "",
    method: "GET",
    path: "",
    response_body: "{}",
    status_code: 200,
    headers: {},
    validation_rules: [],
    error_scenarios: [],
    delay_config: { enabled: false, min: 100, max: 1000 },
  })
  const [saving, setSaving] = useState(false)

  // Update form when selected endpoint changes
  useState(() => {
    if (selectedEndpoint) {
      setEndpointForm({
        name: selectedEndpoint.name,
        method: selectedEndpoint.method,
        path: selectedEndpoint.path,
        response_body: selectedEndpoint.response_body || "{}",
        status_code: selectedEndpoint.status_code,
        headers: selectedEndpoint.headers || {},
        validation_rules: selectedEndpoint.validation_rules || [],
        error_scenarios: selectedEndpoint.error_scenarios || [],
        delay_config: selectedEndpoint.delay_config || { enabled: false, min: 100, max: 1000 },
      })
    } else {
      setEndpointForm({
        name: "",
        method: "GET",
        path: "",
        response_body: "{}",
        status_code: 200,
        headers: {},
        validation_rules: [],
        error_scenarios: [],
        delay_config: { enabled: false, min: 100, max: 1000 },
      })
    }
  }, [selectedEndpoint])

  const handleSave = async () => {
    if (!selectedCollection) {
      toast.error("Please select a collection first")
      return
    }

    if (!endpointForm.name || !endpointForm.path) {
      toast.error("Name and path are required")
      return
    }

    setSaving(true)
    try {
      if (selectedEndpoint) {
        // Update existing endpoint
        await onEndpointUpdate(selectedEndpoint.id, {
          ...endpointForm,
          collection_id: selectedCollection.id,
        })
      } else {
        // Create new endpoint
        await onEndpointCreate({
          ...endpointForm,
          collection_id: selectedCollection.id,
        })
      }
    } catch (error) {
      console.error("Save failed:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedEndpoint) return

    if (confirm("Are you sure you want to delete this endpoint?")) {
      try {
        await onEndpointDelete(selectedEndpoint.id)
      } catch (error) {
        console.error("Delete failed:", error)
      }
    }
  }

  const handleTest = () => {
    toast.info("Test functionality coming soon!")
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

  if (!selectedCollection) {
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>MockAPI Platform</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Code className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No Collection Selected</h3>
              <p className="text-muted-foreground max-w-sm">
                Select a collection from the sidebar to start creating and managing your mock API endpoints.
              </p>
            </div>
          </div>
        </div>
      </SidebarInset>
    )
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">MockAPI Platform</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{selectedCollection.name}</BreadcrumbPage>
              </BreadcrumbItem>
              {selectedEndpoint && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{selectedEndpoint.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-4 flex items-center gap-2">
          {selectedEndpoint && (
            <Button size="sm" variant="outline" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? "Saving..." : selectedEndpoint ? "Update" : "Create"}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Tabs defaultValue="endpoint" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="endpoint">
              <Settings className="h-4 w-4 mr-2" />
              Endpoint
            </TabsTrigger>
            <TabsTrigger value="response">
              <Code className="h-4 w-4 mr-2" />
              Response
            </TabsTrigger>
            <TabsTrigger value="validation">
              <Settings className="h-4 w-4 mr-2" />
              Validation
            </TabsTrigger>
            <TabsTrigger value="ai-generate">
              <Wand2 className="h-4 w-4 mr-2" />
              AI Generate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="endpoint" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Endpoint Configuration</CardTitle>
                <CardDescription>Configure the basic settings for your mock API endpoint</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Endpoint Name</Label>
                    <Input
                      id="name"
                      value={endpointForm.name}
                      onChange={(e) => setEndpointForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Get Users"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="method">HTTP Method</Label>
                    <Select
                      value={endpointForm.method}
                      onValueChange={(value) => setEndpointForm((prev) => ({ ...prev, method: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="path">Path</Label>
                  <div className="flex items-center space-x-2">
                    <Badge className={getMethodColor(endpointForm.method)}>{endpointForm.method}</Badge>
                    <Input
                      id="path"
                      value={endpointForm.path}
                      onChange={(e) => setEndpointForm((prev) => ({ ...prev, path: e.target.value }))}
                      placeholder="/api/users"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status Code</Label>
                    <Input
                      id="status"
                      type="number"
                      value={endpointForm.status_code}
                      onChange={(e) =>
                        setEndpointForm((prev) => ({ ...prev, status_code: Number.parseInt(e.target.value) }))
                      }
                      placeholder="200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Actions</Label>
                    <Button onClick={handleTest} variant="outline" className="w-full bg-transparent">
                      <Play className="h-4 w-4 mr-2" />
                      Test Endpoint
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="response" className="space-y-4">
            <ResponseEditor
              responseBody={endpointForm.response_body}
              onResponseChange={(body) => setEndpointForm((prev) => ({ ...prev, response_body: body }))}
              onTest={handleTest}
            />
          </TabsContent>

          <TabsContent value="validation" className="space-y-4">
            <ValidationEditor
              validationRules={endpointForm.validation_rules}
              errorScenarios={endpointForm.error_scenarios}
              onValidationChange={(rules) => setEndpointForm((prev) => ({ ...prev, validation_rules: rules }))}
              onErrorScenariosChange={(scenarios) =>
                setEndpointForm((prev) => ({ ...prev, error_scenarios: scenarios }))
              }
            />
          </TabsContent>

          <TabsContent value="ai-generate" className="space-y-4">
            <AiMockGenerator
              collectionId={selectedCollection.id}
              onGenerate={(generatedData) => {
                setEndpointForm((prev) => ({
                  ...prev,
                  ...generatedData,
                }))
                toast.success("AI generated mock data applied!")
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
}
