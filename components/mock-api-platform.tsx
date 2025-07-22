import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface MockApiPlatformProps {
  title: string
  description: string
  endpoints: {
    path: string
    method: string
    description: string
    response: string
  }[]
}

const MockApiPlatform: React.FC<MockApiPlatformProps> = ({ title, description, endpoints }) => {
  return (
    <div className="w-full h-full flex flex-col">
      <header className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              ← Back to Home
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <ScrollArea className="flex-1 p-4">
        <div className="grid gap-4">
          {endpoints.map((endpoint, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>{endpoint.path}</span>
                  <Badge variant="secondary">{endpoint.method}</Badge>
                </CardTitle>
                <CardDescription>{endpoint.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap">{endpoint.response}</pre>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

export default MockApiPlatform
