export async function loadMessages(locale: string) {
  return (await import(`@/messages/${locale}.json`)).default;
}
