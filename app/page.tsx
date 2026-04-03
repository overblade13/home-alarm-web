'use client';

import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldOff, Activity, DoorOpen, AlertTriangle, BellOff, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function Home() {
  // Состояния системы
  const [isArmed, setIsArmed] = useState(false);
  const [isAlarm, setIsAlarm] = useState(false);
  const [events, setEvents] = useState<any[]>([]);

  // Загрузка данных при открытии сайта
  useEffect(() => {
    // Восстанавливаем статус
    const savedStatus = localStorage.getItem('alarm_status');
    if (savedStatus) {
      const status = JSON.parse(savedStatus);
      setIsArmed(status.isArmed);
      setIsAlarm(status.isAlarm);
    }
    
    // Восстанавливаем историю
    const savedEvents = localStorage.getItem('alarm_history');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  // Функция сохранения в память браузера
  const saveToStorage = (status: any, history: any) => {
    localStorage.setItem('alarm_status', JSON.stringify(status));
    localStorage.setItem('alarm_history', JSON.stringify(history));
  };

  // Поставить на охрану
  const handleArm = () => {
    setIsArmed(true);
    setIsAlarm(false);
    
    const newEvent = {
      id: Date.now(),
      type: 'ARM',
      text: 'Система поставлена на охрану',
      time: new Date(),
    };
    
    const newHistory = [newEvent, ...events];
    setEvents(newHistory);
    saveToStorage({ isArmed: true, isAlarm: false }, newHistory);
  };

  // Снять с охраны / Сбросить тревогу
  const handleDisarm = () => {
    setIsArmed(false);
    setIsAlarm(false);
    
    const newEvent = {
      id: Date.now(),
      type: 'DISARM',
      text: isAlarm ? 'Тревога сброшена' : 'Система снята с охраны',
      time: new Date(),
    };
    
    const newHistory = [newEvent, ...events];
    setEvents(newHistory);
    saveToStorage({ isArmed: false, isAlarm: false }, newHistory);
  };

  // Тест: Имитация движения
  const triggerMotion = () => {
    if (!isArmed) return; // Не работает если не на охране
    triggerAlarm('MOTION');
  };

  // Тест: Имитация открытия двери
  const triggerDoor = () => {
    if (!isArmed) return;
    triggerAlarm('DOOR');
  };

  // Вызов тревоги
  const triggerAlarm = (sensorType: string) => {
    setIsAlarm(true);
    
    const sensorName = sensorType === 'MOTION' ? 'Датчик движения' : 'Датчик двери';
    
    const newEvent = {
      id: Date.now(),
      type: 'ALARM',
      text: `⚠️ ТРЕВОГА: ${sensorName}`,
      time: new Date(),
    };
    
    const newHistory = [newEvent, ...events];
    setEvents(newHistory);
    saveToStorage({ isArmed: true, isAlarm: true }, newHistory);
  };

  // Определяем цвет главного блока
  const getMainColor = () => {
    if (isAlarm) return 'bg-red-600 border-red-500 shadow-red-500/50';
    if (isArmed) return 'bg-yellow-600 border-yellow-500 shadow-yellow-500/50';
    return 'bg-green-600 border-green-500 shadow-green-500/50';
  };

  // Определяем иконку и текст
  const getStatusInfo = () => {
    if (isAlarm) return { icon: <ShieldAlert size={48} />, text: 'ТРЕВОГА!' };
    if (isArmed) return { icon: <Shield size={48} />, text: 'ПОД ОХРАНОЙ' };
    return { icon: <ShieldOff size={48} />, text: 'СНЯТО С ОХРАНЫ' };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Заголовок */}
        <h1 className="text-3xl font-bold text-center mb-8">🏠 Умная сигнализация</h1>

        {/* Главный статус */}
        <div className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 shadow-2xl transition-all duration-500 ${getMainColor()}`}>
          <div className="mb-4 animate-pulse">{statusInfo.icon}</div>
          <h2 className="text-4xl font-black tracking-wider">{statusInfo.text}</h2>
        </div>

        {/* Кнопки управления */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleArm}
            disabled={isArmed || isAlarm}
            className={`p-4 rounded-xl font-bold text-lg transition-all ${
              isArmed || isAlarm 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 hover:scale-105 active:scale-95'
            }`}
          >
            🔒 НА ОХРАНУ
          </button>

          <button
            onClick={handleDisarm}
            className={`p-4 rounded-xl font-bold text-lg transition-all ${
              !isArmed && !isAlarm 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-orange-600 hover:bg-orange-500 hover:scale-105 active:scale-95'
            }`}
          >
            {isAlarm ? ' СБРОС' : '🔓 СНЯТЬ'}
          </button>
        </div>

        {/* Симуляция датчиков (Для тестов) */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-sm uppercase text-gray-400 font-bold mb-4 tracking-widest">🧪 Тест датчиков (Симуляция)</h3>
          <div className="flex gap-4">
            <button
              onClick={triggerMotion}
              disabled={!isArmed}
              className="flex-1 bg-purple-700 hover:bg-purple-600 disabled:bg-gray-700 disabled:text-gray-500 py-3 rounded-lg font-medium transition-all"
            >
              <Activity className="inline mr-2" size={20}/> Движение
            </button>
            <button
              onClick={triggerDoor}
              disabled={!isArmed}
              className="flex-1 bg-cyan-700 hover:bg-cyan-600 disabled:bg-gray-700 disabled:text-gray-500 py-3 rounded-lg font-medium transition-all"
            >
              <DoorOpen className="inline mr-2" size={20}/> Дверь
            </button>
          </div>
        </div>

        {/* История */}
        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
          <div className="p-4 border-b border-gray-700 bg-gray-850">
            <h3 className="font-bold flex items-center gap-2">
              <AlertTriangle size={18} className="text-yellow-500"/> История событий
            </h3>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {events.length === 0 ? (
              <div className="p-8 text-center text-gray-500">История пуста</div>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="p-4 border-b border-gray-700 flex justify-between items-center hover:bg-gray-750">
                  <div>
                    <span className={`font-bold ${ev.type === 'ALARM' ? 'text-red-400' : ev.type === 'ARM' ? 'text-blue-400' : 'text-green-400'}`}>
                      {ev.type === 'ALARM' && '🚨 '}
                      {ev.type === 'ARM' && '🔒 '}
                      {ev.type === 'DISARM' && '🔓 '}
                      {ev.text}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">
                    {format(ev.time, 'HH:mm:ss')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}