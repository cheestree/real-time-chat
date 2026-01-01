export function isNotEmptyString(value: string | undefined): boolean {
    return !!value && value.trim() !== ''
}

export function trimOrUndefined(value: string | undefined): string | undefined {
    if (!value) return undefined
    const trimmed = value.trim()
    return trimmed === '' ? undefined : trimmed
}

export function allNotEmpty(...values: (string | undefined)[]): boolean {
    return values.every(isNotEmptyString)
}
