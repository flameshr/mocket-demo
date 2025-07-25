import type { ValidationRule, ValidationConfig, ConditionalRule } from "@/components/validation-editor"

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  statusCode: number
  response?: any
}

export class ValidationProcessor {
  static validateRequest(requestBody: any, config: ValidationConfig): ValidationResult {
    if (!config.enabled) {
      return { isValid: true, errors: [], statusCode: 200 }
    }

    const errors: string[] = []
    const body = typeof requestBody === "string" ? JSON.parse(requestBody) : requestBody

    // Check for random error scenarios first
    for (const scenario of config.errorScenarios.filter((s) => s.enabled)) {
      if (scenario.probability && Math.random() * 100 < scenario.probability) {
        return {
          isValid: false,
          errors: [scenario.name],
          statusCode: scenario.statusCode,
          response: JSON.parse(scenario.response),
        }
      }
    }

    // Apply validation rules
    for (const rule of config.rules.filter((r) => r.enabled)) {
      const fieldValue = body[rule.field]

      // Check if conditional rule conditions are met
      if (rule.type === "conditional" && rule.conditions && rule.conditions.length > 0) {
        const conditionsMet = this.evaluateConditions(rule.conditions, body, rule.conditionalLogic || "and")
        if (!conditionsMet) {
          continue // Skip this rule if conditions are not met
        }
      }

      const error = this.validateField(fieldValue, rule, body)
      if (error) {
        errors.push(error)

        // Check for specific error scenarios
        const matchingScenario = config.errorScenarios.find(
          (s) => s.enabled && s.condition.toLowerCase().includes(rule.field.toLowerCase()),
        )
        if (matchingScenario) {
          return {
            isValid: false,
            errors: [error],
            statusCode: matchingScenario.statusCode,
            response: JSON.parse(matchingScenario.response),
          }
        }
      }
    }

    // Strict mode: check for unknown fields
    if (config.strictMode) {
      const allowedFields = config.rules.map((r) => r.field)
      const unknownFields = Object.keys(body).filter((field) => !allowedFields.includes(field))
      if (unknownFields.length > 0) {
        errors.push(`Unknown fields: ${unknownFields.join(", ")}`)
      }
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        errors,
        statusCode: 400,
        response: {
          error: "Validation failed",
          details: errors,
          code: "VALIDATION_ERROR",
        },
      }
    }

    return { isValid: true, errors: [], statusCode: 200 }
  }

  private static evaluateConditions(conditions: ConditionalRule[], body: any, logic: "and" | "or"): boolean {
    const results = conditions.map((condition) => this.evaluateCondition(condition, body))

    if (logic === "and") {
      return results.every((result) => result)
    } else {
      return results.some((result) => result)
    }
  }

  private static evaluateCondition(condition: ConditionalRule, body: any): boolean {
    const fieldValue = body[condition.field]
    const conditionValue = condition.value

    switch (condition.operator) {
      case "equals":
        return fieldValue === conditionValue

      case "notEquals":
        return fieldValue !== conditionValue

      case "contains":
        return typeof fieldValue === "string" && typeof conditionValue === "string"
          ? fieldValue.includes(conditionValue)
          : false

      case "notContains":
        return typeof fieldValue === "string" && typeof conditionValue === "string"
          ? !fieldValue.includes(conditionValue)
          : true

      case "greaterThan":
        const numValue = Number(fieldValue)
        const numCondition = Number(conditionValue)
        return !isNaN(numValue) && !isNaN(numCondition) && numValue > numCondition

      case "lessThan":
        const numValue2 = Number(fieldValue)
        const numCondition2 = Number(conditionValue)
        return !isNaN(numValue2) && !isNaN(numCondition2) && numValue2 < numCondition2

      case "exists":
        return fieldValue !== undefined && fieldValue !== null && fieldValue !== ""

      case "notExists":
        return fieldValue === undefined || fieldValue === null || fieldValue === ""

      default:
        return false
    }
  }

  private static validateField(value: any, rule: ValidationRule, body: any): string | null {
    switch (rule.type) {
      case "required":
        if (value === undefined || value === null || value === "") {
          return rule.message
        }
        break

      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return rule.message
        }
        break

      case "minLength":
        if (value && typeof value === "string" && value.length < (rule.value as number)) {
          return rule.message
        }
        break

      case "maxLength":
        if (value && typeof value === "string" && value.length > (rule.value as number)) {
          return rule.message
        }
        break

      case "pattern":
        if (value && typeof value === "string" && !new RegExp(rule.value as string).test(value)) {
          return rule.message
        }
        break

      case "numeric":
        if (value && isNaN(Number(value))) {
          return rule.message
        }
        break

      case "conditional":
        // For conditional rules, we apply the same validation as required by default
        // but this could be extended to have different validation types
        if (value === undefined || value === null || value === "") {
          return rule.message
        }
        break

      case "custom":
        // Custom validation logic can be implemented here
        // For now, we'll just return null (valid)
        break
    }

    return null
  }

  static getValidationSummary(config: ValidationConfig): string {
    if (!config.enabled) return "Validation disabled"

    const activeRules = config.rules.filter((r) => r.enabled).length
    const conditionalRules = config.rules.filter((r) => r.enabled && r.type === "conditional").length
    const activeScenarios = config.errorScenarios.filter((s) => s.enabled).length

    return `${activeRules} rules (${conditionalRules} conditional), ${activeScenarios} error scenarios${config.strictMode ? ", strict mode" : ""}`
  }
}
