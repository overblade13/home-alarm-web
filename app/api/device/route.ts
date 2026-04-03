import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Создаем подключение прямо здесь
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { event_type, sensor, message } = data;

        await supabase
            .from('events')
            .insert({ event_type, sensor, message });

        if (event_type === 'ALARM') {
            await supabase.from('system_status').update({ is_alarm: true, is_armed: true }).eq('id', 1);
        } else if (event_type === 'ARM') {
            await supabase.from('system_status').update({ is_armed: true, is_alarm: false }).eq('id', 1);
        } else if (event_type === 'DISARM' || event_type === 'ALARM_RESET') {
            await supabase.from('system_status').update({ is_armed: false, is_alarm: false }).eq('id', 1);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function GET() {
    const { data } = await supabase.from('system_status').select('*').eq('id', 1).single();
    return NextResponse.json(data || { is_armed: false, is_alarm: false });
}
