import { NextFunction, Request, Response } from 'express'
import sanitizeHtml from 'sanitize-html'
import validator from 'validator'

// Sanitizes input to prevent XSS attacks. For message content, we allow @mentions and symbols but strip all HTML. For other fields, we escape HTML entities.
function sanitizeValue(key: string, value: unknown): unknown {
    if (typeof value === 'string') {
        if (key === 'content' || key === 'message') {
            // Strip all HTML for message/chat content, preserve @mentions and symbols
            return sanitizeHtml(value, {
                allowedTags: [],
                allowedAttributes: {},
            })
        }
        // Escape HTML entities for all other fields (names, descriptions, etc.)
        return validator.escape(validator.trim(value))
    }
    if (Array.isArray(value)) {
        return value.map((item) => sanitizeValue(key, item))
    }
    if (value !== null && typeof value === 'object') {
        return sanitizeBody(value as Record<string, unknown>)
    }
    return value
}

function sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {}
    for (const key of Object.keys(body)) {
        sanitized[key] = sanitizeValue(key, body[key])
    }
    return sanitized
}

// Middleware to sanitize incoming request bodies
export const sanitize = (req: Request, _res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeBody(req.body as Record<string, unknown>)
    }
    next()
}
