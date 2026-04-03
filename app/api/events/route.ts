import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data } = await supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        return NextResponse.json(data || []);
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}