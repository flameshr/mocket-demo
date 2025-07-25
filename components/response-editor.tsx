"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Wand2,
  Copy,
  Play,
  User,
  Mail,
  MapPin,
  Calendar,
  Hash,
  Globe,
  FileText,
  ShoppingCart,
  Shuffle,
} from "lucide-react"

// Faker mappings as you specified
export const fakerMappings: Record<string, () => any> = {
  firstname: () => "John", // In real implementation, use faker.person.firstName
  lastname: () => "Doe", // faker.person.lastName
  fullname: () => "John Doe", // faker.person.fullName
  gender: () => "male", // faker.person.sex
  email: () => "john@example.com", // faker.internet.email
  phone: () => "+1-555-0123", // faker.phone.number
  age: () => Math.floor(Math.random() * 62) + 18, // faker.number.int({ min: 18, max: 80 })
  country: () => "United States", // faker.location.country
  city: () => "New York", // faker.location.city
  street: () => "123 Main St", // faker.location.street
  address: () => "123 Main St, New York, NY 10001", // faker.location.streetAddress
  zipcode: () => "10001", // faker.location.zipCode
  date: () => new Date().toISOString().split("T")[0], // faker.date.recent
  datetime: () => new Date().toISOString(), // faker.date.recent
  sentence: () => "Lorem ipsum dolor sit amet.", // faker.lorem.sentence
  paragraph: () => "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", // faker.lorem.paragraph
  url: () => "https://example.com", // faker.internet.url
  word: () => "lorem", // faker.lorem.word
  number: () => Math.floor(Math.random() * 1000), // faker.number.int
  float: () => Math.random() * 1000, // faker.number.float
  boolean: () => Math.random() > 0.5, // faker.datatype.boolean
  httpStatusCode: () => 200, // faker.internet.httpStatusCode
  jwt: () => "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // faker.internet.jwt
  uuid: () => "550e8400-e29b-41d4-a716-446655440000", // faker.string.uuid
  string: () => "sample", // faker.lorem.word
  username: () => "johndoe", // faker.internet.userName
  password: () => "password123", // faker.internet.password
  company: () => "Acme Corp", // faker.company.name
  jobTitle: () => "Software Engineer", // faker.person.jobTitle
  price: () => Math.floor(Math.random() * 10000) / 100, // faker.commerce.price
  product: () => "Laptop", // faker.commerce.productName
  color: () => "blue", // faker.color.human
  image: () => "https://picsum.photos/200/300", // faker.image.url
  avatar: () => "https://i.pravatar.cc/150", // faker.image.avatar
}

const fakerCategories = [
  {
    name: "Person",
    icon: User,
    tags: ["firstname", "lastname", "fullname", "gender", "age", "username", "jobTitle"],
  },
  {
    name: "Contact",
    icon: Mail,
    tags: ["email", "phone"],
  },
  {
    name: "Location",
    icon: MapPin,
    tags: ["country", "city", "street", "address", "zipcode"],
  },
  {
    name: "Date & Time",
    icon: Calendar,
    tags: ["date", "datetime"],
  },
  {
    name: "Content",
    icon: FileText,
    tags: ["sentence", "paragraph", "word", "string"],
  },
  {
    name: "Internet",
    icon: Globe,
    tags: ["url", "email", "username", "password", "jwt"],
  },
  {
    name: "Numbers",
    icon: Hash,
    tags: ["number", "float", "age", "price", "httpStatusCode"],
  },
  {
    name: "Commerce",
    icon: ShoppingCart,
    tags: ["company", "product", "price", "color"],
  },
  {
    name: "Media",
    icon: FileText,
    tags: ["image", "avatar"],
  },
  {
    name: "Data",
    icon: Hash,
    tags: ["uuid", "boolean", "string"],
  },
]

interface ResponseEditorProps {
  responseBody: string
  onResponseChange: (body: string) => void
  onTest: () => void
}

export function ResponseEditor({ responseBody, onResponseChange, onTest }: ResponseEditorProps) {
  const [isDynamic, setIsDynamic] = useState(false)
  const [arrayConfig, setArrayConfig] = useState({ min: 1, max: 5 })
  const [delayConfig, setDelayConfig] = useState({ enabled: false, min: 100, max: 1000 })

  const insertFakerTag = (tag: string) => {
    const cursorPosition = (document.activeElement as HTMLTextAreaElement)?.selectionStart || responseBody.length
    const beforeCursor = responseBody.substring(0, cursorPosition)
    const afterCursor = responseBody.substring(cursorPosition)
    const newValue = beforeCursor + `<<${tag}>>` + afterCursor
    onResponseChange(newValue)
  }

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(responseBody)
      const formatted = JSON.stringify(parsed, null, 2)
      onResponseChange(formatted)
    } catch (error) {
      // Invalid JSON, don't format
    }
  }

  const generateSample = (type: string) => {
    let sample = ""
    switch (type) {
      case "user":
        sample = JSON.stringify(
          {
            id: "<<uuid>>",
            name: "<<fullname>>",
            email: "<<email>>",
            age: "<<age>>",
            address: {
              street: "<<street>>",
              city: "<<city>>",
              country: "<<country>>",
            },
            createdAt: "<<datetime>>",
          },
          null,
          2,
        )
        break
      case "product":
        sample = JSON.stringify(
          {
            id: "<<uuid>>",
            name: "<<product>>",
            price: "<<price>>",
            description: "<<sentence>>",
            company: "<<company>>",
            color: "<<color>>",
            image: "<<image>>",
          },
          null,
          2,
        )
        break
      case "post":
        sample = JSON.stringify(
          {
            id: "<<uuid>>",
            title: "<<sentence>>",
            content: "<<paragraph>>",
            author: "<<fullname>>",
            publishedAt: "<<datetime>>",
            views: "<<number>>",
          },
          null,
          2,
        )
        break
      case "array":
        sample = JSON.stringify(
          [
            {
              id: "<<uuid>>",
              name: "<<fullname>>",
              email: "<<email>>",
            },
          ],
          null,
          2,
        )
        break
    }
    onResponseChange(sample)
  }

  const getActiveDynamicFeatures = () => {
    const features = []
    if (responseBody.includes("<<") && responseBody.includes(">>")) {
      features.push("Dynamic Data")
    }
    if (responseBody.includes("[") && responseBody.includes("]")) {
      features.push("Arrays")
    }
    if (delayConfig.enabled) {
      features.push("Response Delay")
    }
    return features
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/50 dark:border-gray-800/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Dynamic Response Configuration
              </CardTitle>
              <CardDescription className="text-xs">
                Configure mock response with dynamic data generation
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={formatJSON}>
                Format JSON
              </Button>
              <Button size="sm" onClick={onTest}>
                <Play className="h-3 w-3 mr-1" />
                Test
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Sample Generation */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Quick Sample Generation:</Label>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => generateSample("user")}>
                User Object
              </Button>
              <Button size="sm" variant="outline" onClick={() => generateSample("product")}>
                Product Object
              </Button>
              <Button size="sm" variant="outline" onClick={() => generateSample("post")}>
                Blog Post
              </Button>
              <Button size="sm" variant="outline" onClick={() => generateSample("array")}>
                User Array
              </Button>
            </div>
          </div>

          {/* Array Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Array Min Items</Label>
              <Input
                type="number"
                value={arrayConfig.min}
                onChange={(e) => setArrayConfig((prev) => ({ ...prev, min: Number.parseInt(e.target.value) }))}
                min="1"
                max="100"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Array Max Items</Label>
              <Input
                type="number"
                value={arrayConfig.max}
                onChange={(e) => setArrayConfig((prev) => ({ ...prev, max: Number.parseInt(e.target.value) }))}
                min="1"
                max="100"
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Response Delay Configuration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Response Delay</Label>
              <Switch
                checked={delayConfig.enabled}
                onCheckedChange={(enabled) => setDelayConfig((prev) => ({ ...prev, enabled }))}
              />
            </div>
            {delayConfig.enabled && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Min Delay (ms)</Label>
                  <Input
                    type="number"
                    value={delayConfig.min}
                    onChange={(e) => setDelayConfig((prev) => ({ ...prev, min: Number.parseInt(e.target.value) }))}
                    min="0"
                    max="10000"
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Max Delay (ms)</Label>
                  <Input
                    type="number"
                    value={delayConfig.max}
                    onChange={(e) => setDelayConfig((prev) => ({ ...prev, max: Number.parseInt(e.target.value) }))}
                    min="0"
                    max="10000"
                    className="h-7 text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Faker Tags */}
      <Card className="border-border/50 dark:border-gray-800/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Dynamic Data Tags</CardTitle>
          <CardDescription className="text-xs">
            Click to insert faker tags like {"<<firstname>>"} for dynamic data generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={fakerCategories[0].name.toLowerCase()}>
            <TabsList className="grid grid-cols-5 w-full mb-4">
              {fakerCategories.slice(0, 5).map((category) => (
                <TabsTrigger key={category.name} value={category.name.toLowerCase()} className="text-xs">
                  <category.icon className="h-3 w-3 mr-1" />
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="space-y-4">
              {fakerCategories.slice(0, 5).map((category) => (
                <TabsContent key={category.name} value={category.name.toLowerCase()} className="mt-0">
                  <div className="flex flex-wrap gap-1">
                    {category.tags.map((tag) => (
                      <Button
                        key={tag}
                        size="sm"
                        variant="outline"
                        onClick={() => insertFakerTag(tag)}
                        className="text-xs h-7"
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </div>

            {/* Additional categories in a second row */}
            <TabsList className="grid grid-cols-5 w-full mt-4 mb-4">
              {fakerCategories.slice(5).map((category) => (
                <TabsTrigger key={category.name} value={category.name.toLowerCase()} className="text-xs">
                  <category.icon className="h-3 w-3 mr-1" />
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {fakerCategories.slice(5).map((category) => (
              <TabsContent key={category.name} value={category.name.toLowerCase()} className="mt-0">
                <div className="flex flex-wrap gap-1">
                  {category.tags.map((tag) => (
                    <Button
                      key={tag}
                      size="sm"
                      variant="outline"
                      onClick={() => insertFakerTag(tag)}
                      className="text-xs h-7"
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Response Body Editor */}
      <Card className="border-border/50 dark:border-gray-800/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Response Body</CardTitle>
            <Button size="sm" variant="outline">
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={responseBody}
            onChange={(e) => onResponseChange(e.target.value)}
            className="font-mono text-sm border-border/50 dark:border-gray-700 min-h-[300px]"
            placeholder="Enter your response body here..."
          />
        </CardContent>
      </Card>

      {/* Active Features Summary */}
      {getActiveDynamicFeatures().length > 0 && (
        <Card className="border-border/50 dark:border-gray-800/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Shuffle className="h-4 w-4 text-green-400" />
              <Label className="text-sm font-medium">Active Dynamic Features</Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {getActiveDynamicFeatures().map((feature) => (
                <Badge key={feature} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Your response will be dynamically generated with realistic fake data on each request.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
