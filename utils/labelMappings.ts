/**
 * Label Mappings Utility
 * 
 * Provides display-friendly labels for data values from the Google Sheet.
 * This ensures a single source of truth for UI labels while preserving
 * the underlying data values used for filtering and logic.
 */

/**
 * Get the display label for a "Jurisdictions Featured" value.
 * 
 * Mapping rules:
 * - "Cross-jurisdictional" or "Cross jurisdictional" → "Applies across jurisdictions"
 * - "Applies across jurisdictions" → "Applies across jurisdictions" (already mapped, return as-is)
 * - All other values → return unchanged
 * - Handles null/undefined gracefully
 * - Trims whitespace to avoid mismatch bugs
 * 
 * @param value - The raw value from the "Jurisdictions Featured" field
 * @returns The display-friendly label
 */
export function getJurisdictionFeaturedLabel(value: string | null | undefined): string {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return '';
  }

  // Trim whitespace and normalize for comparison
  const trimmedValue = String(value).trim();
  const normalizedValue = trimmedValue.toLowerCase();

  // Debug logging - remove after testing
  if (trimmedValue.toLowerCase().includes('jurisd')) {
    console.log('🔍 Jurisdiction mapping:', {
      original: value,
      trimmed: trimmedValue,
      normalized: normalizedValue,
      willMap: normalizedValue === 'cross-jurisdictional' || normalizedValue === 'cross jurisdictional'
    });
  }

  // Apply mapping rules - handle both hyphenated and space-separated versions
  if (normalizedValue === 'cross-jurisdictional' || normalizedValue === 'cross jurisdictional') {
    return 'Applies across jurisdictions';
  }

  // If already using the new label or any other value, return unchanged
  return trimmedValue;
}

/**
 * Get display labels for comma-separated "Jurisdictions Featured" values.
 * Maps each individual value and returns a comma-separated string.
 * 
 * @param value - The raw comma-separated value(s) from the "Jurisdictions Featured" field
 * @returns The comma-separated display-friendly labels
 */
export function getJurisdictionsFeaturedLabels(value: string | null | undefined): string {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return '';
  }

  const trimmedValue = String(value).trim();
  if (trimmedValue === '') {
    return '';
  }

  // Split by comma, map each value, and rejoin
  return trimmedValue
    .split(',')
    .map(v => getJurisdictionFeaturedLabel(v))
    .join(', ');
}

