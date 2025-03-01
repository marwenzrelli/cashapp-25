
/**
 * Formats an ID as a 4-digit string with leading zeros
 * @param id The ID to format
 * @returns A string with the ID padded to 4 digits
 */
export const formatId = (id: number | string): string => {
  return id.toString().padStart(4, '0');
};
