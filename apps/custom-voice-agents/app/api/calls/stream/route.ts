import { NextRequest } from 'next/server'
export const runtime = 'nodejs'
export async function GET(req: NextRequest){
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller){
      const lines = [
        'Hi there, thanks for calling! How can I help today?',
        'I wanted to learn more about your pricing.',
        'Absolutely. We offer a free pilot and tiered plans based on usage.',
        'Great, can we book a demo for tomorrow?',
        "Done. I've scheduled it and sent a calendar invite."
      ]
      let i = 0
      const iv = setInterval(()=>{
        if(i>=lines.length){ clearInterval(iv); controller.close(); return }
        controller.enqueue(encoder.encode(`data: ${lines[i++]}\n\n`))
      }, 900)
    }
  })
  return new Response(stream, { headers:{ 'Content-Type':'text/event-stream', 'Cache-Control':'no-cache', 'Connection':'keep-alive' }})
}
