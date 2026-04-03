import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { action } = await request.json();

    let isArmed = false;
    let isAlarm = false;
    let eventType = '';

    if (action === 'ARM') {
      isArmed = true;
      eventType = 'ARM';
    } else if (action === 'DISARM') {
      isArmed = false;
      isAlarm = false;
      eventType = 'DISARM';
    } else if (action === 'RESET_ALARM') {
      isAlarm = false;
      eventType = 'ALARM_RESET';
    }

    await supabase
      .from('system_status')
      .update({ is_armed: isArmed, is_alarm: isAlarm })
      .eq('id', 1);

    await supabase
      .from('events')
      .insert({
        event_type: eventType,
        sensor: 'WEB',
        message: `System ${action} from web`,
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
