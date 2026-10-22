import { google } from 'googleapis'

export type CalendarEvent = {
  id: string
  title: string
  start: string
  end: string
  url?: string
  location?: string
  description?: string
}

export async function getEvents(
  timeMin: Date,
  timeMax: Date,
): Promise<CalendarEvent[]> {
  try {
    const calendar = google.calendar({
      version: 'v3',
      auth: import.meta.env.GOOGLE_CAL_API_KEY,
    })

    const response = await calendar.events.list({
      calendarId: import.meta.env.GOOGLE_CAL_ID,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      maxResults: 20,
      orderBy: 'startTime',
      fields: 'items(start,end,summary,description,location,htmlLink,id)',
    })

    if (response.status !== 200 || !response.data.items) return []

    return response.data.items
      .filter(
        (event) => event.start?.dateTime && event.end?.dateTime && event.id,
      )
      .map((event) => ({
        id: event.id!,
        title: event.summary || 'Untitled Event',
        start: event.start!.dateTime!,
        end: event.end!.dateTime!,
        url: event.htmlLink || undefined,
        location: event.location || undefined,
        description: event.description || undefined,
      }))
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return []
  }
}

export async function getActiveEvent(titles: string[]) {
  const now = new Date()
  const events = await getEvents(now, new Date(now.getTime() + 1000))
  return events.find((event) =>
    titles.some((title) => event.title.startsWith(title)),
  )
}
