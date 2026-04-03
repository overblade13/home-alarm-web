import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Создаем клиент Supabase прямо здесь
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- ЭТА ФУНКЦИЯ ПРИНИМАЕТ ДАННЫЕ ОТ ESP32 ---
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { event_type, sensor, message } = data;

    console.log('Received event:', data);

    // 1. Сохраняем событие в таблицу events
    await supabase
      .from('events')
      .insert({ 
        event_type, 
        sensor, 
        message 
      });

    // 2. Если это тревога, обновляем статус системы
    if (event_type === 'ALARM') {
      await supabase
        .from('system_status')
        .update({ is_alarm: true })
        .eq('id', 1);
    }

    return NextResponse.json({ success: true, message: 'Event saved' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to save event' }, { status: 500 });
  }
}

// --- ЭТА ФУНКЦИЯ ОТДАЕТ СТАТУС САЙТУ ---
export async function GET() {
  try {
    const { data } = await supabase
      .from('system_status')
      .select('*')
      .eq('id', 1)
      .single();

    return NextResponse.json(data || { is_armed: false, is_alarm: false });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}
