export function normalizeIranMobile(raw: string): string | null {
  const digits = (raw ?? "")
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/\D/g, "");
  let value = digits;
  if (value.startsWith("0098")) value = value.slice(4);
  else if (value.startsWith("98") && value.length === 12) value = value.slice(2);
  if (value.length === 10 && value.startsWith("9")) value = "0" + value;
  return /^09\d{9}$/.test(value) ? value : null;
}
