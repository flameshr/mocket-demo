"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  Code,
  FileText,
  Hash,
  Mail,
  Link,
  GitBranch,
} from "lucide-react"

export interface ConditionalRule {
  field: string
  operator: "equals" | "notEquals" | "contains" | "notContains" | "greaterThan" | "lessThan" | "exists" | "notExists"
  value?: string | number
}

export interface ValidationRule {
  id: string
  field: string
  type: "required" | "email" | "minLength" | "maxLength" | "pattern" | "numeric" | "custom" | "conditional"
  value?: string | number
  message: string
  enabled: boolean
  conditions?: ConditionalRule[]
  conditionalLogic?: "and" | "or"
}

export interface ErrorScenario {
  id: string
  name: string
  condition: string
  statusCode: number
  response: string
  enabled: boolean
  probability?: number
}

export interface ValidationConfig {
  enabled: boolean
  rules: ValidationRule[]
  errorScenarios: ErrorScenario[]
  strictMode: boolean
}

interface ValidationEditorProps {
  config: ValidationConfig
  onConfigChange: (config: ValidationConfig) => void
  method: string
}

const validationTypes = [
  { value: "required", label: "Required", icon: AlertTriangle, description: "Field must be present" },
  { value: "email", label: "Email", icon: Mail, description: "Valid email format" },
  { value: "minLength", label: "Min Length", icon: Hash, description: "Minimum character length" },
  { value: "maxLength", label: "Max Length", icon: Hash, description: "Maximum character length" },
  { value: "pattern", label: "Pattern", icon: Code, description: "Regex pattern match" },
  { value: "numeric", label: "Numeric", icon: Hash, description: "Must be a number" },
  { value: "conditional", label: "Conditional", icon: GitBranch, description: "Depends on other fields" },
  { value: "custom", label: "Custom", icon: FileText, description: "Custom validation logic" },
]

const conditionalOperators = [
  { value: "equals", label: "Equals", description: "Field equals specific value" },
  { value: "notEquals", label: "Not Equals", description: "Field does not equal value" },
  { value: "contains", label: "Contains", description: "Field contains substring" },
  { value: "notContains", label: "Not Contains", description: "Field does not contain substring" },
  { value: "greaterThan", label: "Greater Than", description: "Numeric field is greater than value" },
  { value: "lessThan", label: "Less Than", description: "Numeric field is less than value" },
  { value: "exists", label: "Exists", description: "Field is present" },
  { value: "notExists", label: "Not Exists", description: "Field is not present" },
]

const commonErrorScenarios = [
  {
    name: "Missing Required Field",
    condition: "missing email",
    statusCode: 400,
    response: JSON.stringify({ error: "Email is required", code: "MISSING_EMAIL" }, null, 2),
  },
  {
    name: "Invalid Email Format",
    condition: "invalid email format",
    statusCode: 400,
    response: JSON.stringify({ error: "Invalid email format", code: "INVALID_EMAIL" }, null, 2),
  },
  {
    name: "Duplicate Entry",
    condition: "email already exists",
    statusCode: 409,
    response: JSON.stringify({ error: "Email already exists", code: "DUPLICATE_EMAIL" }, null, 2),
  },
  {
    name: "Password Mismatch",
    condition: "password confirmation mismatch",
    statusCode: 400,
    response: JSON.stringify({ error: "Password confirmation does not match", code: "PASSWORD_MISMATCH" }, null, 2),
  },
  {
    name: "Age Restriction",
    condition: "age below minimum",
    statusCode: 400,
    response: JSON.stringify({ error: "Must be 18 or older", code: "AGE_RESTRICTION" }, null, 2),
  },
  {
    name: "Rate Limit Exceeded",
    condition: "too many requests",
    statusCode: 429,
    response: JSON.stringify({ error: "Rate limit exceeded", code: "RATE_LIMIT" }, null, 2),
  },
  {
    name: "Server Error",
    condition: "random server error",
    statusCode: 500,
    response: JSON.stringify({ error: "Internal server error", code: "SERVER_ERROR" }, null, 2),
  },
]

export function ValidationEditor({ config, onConfigChange, method }: ValidationEditorProps) {
  const [activeTab, setActiveTab] = useState("rules")

  const addValidationRule = () => {
    const newRule: ValidationRule = {
      id: Date.now().toString(),
      field: "",
      type: "required",
      message: "This field is required",
      enabled: true,
    }

    onConfigChange({
      ...config,
      rules: [...config.rules, newRule],
    })
  }

  const updateValidationRule = (id: string, updates: Partial<ValidationRule>) => {
    onConfigChange({
      ...config,
      rules: config.rules.map((rule) => (rule.id === id ? { ...rule, ...updates } : rule)),
    })
  }

  const removeValidationRule = (id: string) => {
    onConfigChange({
      ...config,
      rules: config.rules.filter((rule) => rule.id !== id),
    })
  }

  const addConditionToRule = (ruleId: string) => {
    const newCondition: ConditionalRule = {
      field: "",
      operator: "equals",
      value: "",
    }

    updateValidationRule(ruleId, {
      conditions: [...(config.rules.find((r) => r.id === ruleId)?.conditions || []), newCondition],
    })
  }

  const updateRuleCondition = (ruleId: string, conditionIndex: number, updates: Partial<ConditionalRule>) => {
    const rule = config.rules.find((r) => r.id === ruleId)
    if (!rule || !rule.conditions) return

    const updatedConditions = rule.conditions.map((condition, index) =>
      index === conditionIndex ? { ...condition, ...updates } : condition,
    )

    updateValidationRule(ruleId, { conditions: updatedConditions })
  }

  const removeRuleCondition = (ruleId: string, conditionIndex: number) => {
    const rule = config.rules.find((r) => r.id === ruleId)
    if (!rule || !rule.conditions) return

    const updatedConditions = rule.conditions.filter((_, index) => index !== conditionIndex)
    updateValidationRule(ruleId, { conditions: updatedConditions })
  }

  const addErrorScenario = (template?: (typeof commonErrorScenarios)[0]) => {
    const newScenario: ErrorScenario = {
      id: Date.now().toString(),
      name: template?.name || "New Error Scenario",
      condition: template?.condition || "",
      statusCode: template?.statusCode || 400,
      response: template?.response || JSON.stringify({ error: "Error message" }, null, 2),
      enabled: true,
      probability: 10,
    }

    onConfigChange({
      ...config,
      errorScenarios: [...config.errorScenarios, newScenario],
    })
  }

  const updateErrorScenario = (id: string, updates: Partial<ErrorScenario>) => {
    onConfigChange({
      ...config,
      errorScenarios: config.errorScenarios.map((scenario) =>
        scenario.id === id ? { ...scenario, ...updates } : scenario,
      ),
    })
  }

  const removeErrorScenario = (id: string) => {
    onConfigChange({
      ...config,
      errorScenarios: config.errorScenarios.filter((scenario) => scenario.id !== id),
    })
  }

  const getStatusCodeColor = (code: number) => {
    if (code >= 200 && code < 300) return "bg-green-500/20 text-green-400 border-green-500/30"
    if (code >= 400 && code < 500) return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    if (code >= 500) return "bg-red-500/20 text-red-400 border-red-500/30"
    return "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }

  if (!["POST", "PUT", "PATCH"].includes(method)) {
    return (
      <Card className="border-border/50 dark:border-gray-800/50">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Validation Not Available</h3>
            <p className="text-muted-foreground">
              Request validation is only available for POST, PUT, and PATCH methods.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Validation Toggle */}
      <Card className="border-border/50 dark:border-gray-800/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Request Validation
              </CardTitle>
              <CardDescription className="text-xs">
                Add validation rules and error scenarios for request body
              </CardDescription>
            </div>
            <Switch checked={config.enabled} onCheckedChange={(enabled) => onConfigChange({ ...config, enabled })} />
          </div>
        </CardHeader>

        {config.enabled && (
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Strict Mode</Label>
              <Switch
                checked={config.strictMode}
                onCheckedChange={(strictMode) => onConfigChange({ ...config, strictMode })}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Strict mode rejects requests with unknown fields</p>
          </CardContent>
        )}
      </Card>

      {config.enabled && (
        <Card className="border-border/50 dark:border-gray-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Validation Configuration</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mx-4 mb-4">
                <TabsTrigger value="rules" className="text-xs">
                  Validation Rules
                </TabsTrigger>
                <TabsTrigger value="errors" className="text-xs">
                  Error Scenarios
                </TabsTrigger>
              </TabsList>

              <div className="px-4 pb-4">
                <TabsContent value="rules" className="mt-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Validation Rules</Label>
                    <Button size="sm" onClick={addValidationRule}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Rule
                    </Button>
                  </div>

                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {config.rules.map((rule) => {
                        const validationType = validationTypes.find((t) => t.value === rule.type)
                        const IconComponent = validationType?.icon || AlertTriangle

                        return (
                          <Card key={rule.id} className="border-border/50 dark:border-gray-700/50">
                            <CardContent className="p-3 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <IconComponent className="h-4 w-4" />
                                  <Badge variant="outline" className="text-xs">
                                    {validationType?.label}
                                  </Badge>
                                  {rule.conditions && rule.conditions.length > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Link className="h-3 w-3 mr-1" />
                                      {rule.conditions.length} condition{rule.conditions.length > 1 ? "s" : ""}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={rule.enabled}
                                    onCheckedChange={(enabled) => updateValidationRule(rule.id, { enabled })}
                                  />
                                  <Button variant="ghost" size="sm" onClick={() => removeValidationRule(rule.id)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <Label className="text-xs">Field Name</Label>
                                  <Input
                                    value={rule.field}
                                    onChange={(e) => updateValidationRule(rule.id, { field: e.target.value })}
                                    placeholder="e.g., email"
                                    className="h-8 text-xs"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Validation Type</Label>
                                  <Select
                                    value={rule.type}
                                    onValueChange={(type: any) => updateValidationRule(rule.id, { type })}
                                  >
                                    <SelectTrigger className="h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {validationTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                          {type.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {(rule.type === "minLength" || rule.type === "maxLength") && (
                                <div className="space-y-1">
                                  <Label className="text-xs">Length</Label>
                                  <Input
                                    type="number"
                                    value={rule.value || ""}
                                    onChange={(e) =>
                                      updateValidationRule(rule.id, { value: Number.parseInt(e.target.value) })
                                    }
                                    className="h-8 text-xs"
                                  />
                                </div>
                              )}

                              {rule.type === "pattern" && (
                                <div className="space-y-1">
                                  <Label className="text-xs">Regex Pattern</Label>
                                  <Input
                                    value={rule.value || ""}
                                    onChange={(e) => updateValidationRule(rule.id, { value: e.target.value })}
                                    placeholder="^[a-zA-Z0-9]+$"
                                    className="h-8 text-xs font-mono"
                                  />
                                </div>
                              )}

                              {/* Conditional Logic Section */}
                              {rule.type === "conditional" && (
                                <div className="space-y-3 border-t pt-3">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-xs font-medium">Conditions</Label>
                                    <div className="flex items-center gap-2">
                                      {rule.conditions && rule.conditions.length > 1 && (
                                        <Select
                                          value={rule.conditionalLogic || "and"}
                                          onValueChange={(logic: "and" | "or") =>
                                            updateValidationRule(rule.id, { conditionalLogic: logic })
                                          }
                                        >
                                          <SelectTrigger className="h-6 w-16 text-xs">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="and">AND</SelectItem>
                                            <SelectItem value="or">OR</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      )}
                                      <Button size="sm" variant="outline" onClick={() => addConditionToRule(rule.id)}>
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    {rule.conditions?.map((condition, conditionIndex) => (
                                      <div
                                        key={conditionIndex}
                                        className="flex items-center gap-2 p-2 bg-muted/30 rounded"
                                      >
                                        <Input
                                          value={condition.field}
                                          onChange={(e) =>
                                            updateRuleCondition(rule.id, conditionIndex, { field: e.target.value })
                                          }
                                          placeholder="Field name"
                                          className="h-7 text-xs flex-1"
                                        />
                                        <Select
                                          value={condition.operator}
                                          onValueChange={(operator: any) =>
                                            updateRuleCondition(rule.id, conditionIndex, { operator })
                                          }
                                        >
                                          <SelectTrigger className="h-7 w-24 text-xs">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {conditionalOperators.map((op) => (
                                              <SelectItem key={op.value} value={op.value}>
                                                {op.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        {!["exists", "notExists"].includes(condition.operator) && (
                                          <Input
                                            value={condition.value || ""}
                                            onChange={(e) =>
                                              updateRuleCondition(rule.id, conditionIndex, { value: e.target.value })
                                            }
                                            placeholder="Value"
                                            className="h-7 text-xs flex-1"
                                          />
                                        )}
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => removeRuleCondition(rule.id, conditionIndex)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}

                                    {(!rule.conditions || rule.conditions.length === 0) && (
                                      <div className="text-center py-4 text-muted-foreground">
                                        <GitBranch className="h-6 w-6 mx-auto mb-2 opacity-50" />
                                        <p className="text-xs">No conditions set</p>
                                        <p className="text-xs">Add conditions to make this rule conditional</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="space-y-1">
                                <Label className="text-xs">Error Message</Label>
                                <Input
                                  value={rule.message}
                                  onChange={(e) => updateValidationRule(rule.id, { message: e.target.value })}
                                  className="h-8 text-xs"
                                />
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}

                      {config.rules.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No validation rules configured</p>
                          <p className="text-xs">Add rules to validate request body fields</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="errors" className="mt-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Error Scenarios</Label>
                    <Button size="sm" onClick={() => addErrorScenario()}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Scenario
                    </Button>
                  </div>

                  {/* Quick Add Common Scenarios */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Quick Add Common Scenarios:</Label>
                    <div className="flex flex-wrap gap-1">
                      {commonErrorScenarios.map((scenario, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => addErrorScenario(scenario)}
                          className="text-xs h-7"
                        >
                          {scenario.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {config.errorScenarios.map((scenario) => (
                        <Card key={scenario.id} className="border-border/50 dark:border-gray-700/50">
                          <CardContent className="p-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-400" />
                                <Badge variant="outline" className={getStatusCodeColor(scenario.statusCode)}>
                                  {scenario.statusCode}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={scenario.enabled}
                                  onCheckedChange={(enabled) => updateErrorScenario(scenario.id, { enabled })}
                                />
                                <Button variant="ghost" size="sm" onClick={() => removeErrorScenario(scenario.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="space-y-1">
                                <Label className="text-xs">Scenario Name</Label>
                                <Input
                                  value={scenario.name}
                                  onChange={(e) => updateErrorScenario(scenario.id, { name: e.target.value })}
                                  className="h-8 text-xs"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <Label className="text-xs">Condition</Label>
                                  <Input
                                    value={scenario.condition}
                                    onChange={(e) => updateErrorScenario(scenario.id, { condition: e.target.value })}
                                    placeholder="e.g., missing email"
                                    className="h-8 text-xs"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Status Code</Label>
                                  <Input
                                    type="number"
                                    value={scenario.statusCode}
                                    onChange={(e) =>
                                      updateErrorScenario(scenario.id, { statusCode: Number.parseInt(e.target.value) })
                                    }
                                    className="h-8 text-xs"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Error Response</Label>
                                <Textarea
                                  value={scenario.response}
                                  onChange={(e) => updateErrorScenario(scenario.id, { response: e.target.value })}
                                  className="font-mono text-xs"
                                  rows={4}
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Probability (%)</Label>
                                <Input
                                  type="number"
                                  value={scenario.probability || 0}
                                  onChange={(e) =>
                                    updateErrorScenario(scenario.id, { probability: Number.parseInt(e.target.value) })
                                  }
                                  min="0"
                                  max="100"
                                  className="h-8 text-xs"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {config.errorScenarios.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <XCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No error scenarios configured</p>
                          <p className="text-xs">Add scenarios to simulate different error conditions</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Validation Summary */}
      {config.enabled && (
        <Card className="border-border/50 dark:border-gray-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              Validation Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                {config.rules.filter((r) => r.enabled).length} Rules Active
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {config.rules.filter((r) => r.enabled && r.type === "conditional").length} Conditional Rules
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {config.errorScenarios.filter((s) => s.enabled).length} Error Scenarios
              </Badge>
              {config.strictMode && (
                <Badge variant="secondary" className="text-xs">
                  Strict Mode
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Validation will be applied to all {method} requests. Invalid requests will return appropriate error
              responses.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
