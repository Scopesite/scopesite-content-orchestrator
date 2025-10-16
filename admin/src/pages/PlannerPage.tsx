import { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import { useWorkspace } from '../hooks/useWorkspace';

export default function PlannerPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [postsByDay, setPostsByDay] = useState<Record<string, any[]>>({});
  const [showModal, setShowModal] = useState(false);
  const { workspaceId } = useWorkspace();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  useEffect(() => {
    const load = async () => {
      if (!workspaceId) return;
      const { data } = await api.getPosts(workspaceId);
      const map: Record<string, any[]> = {};
      (data || []).forEach((p: any) => {
        const key = (p.scheduled_at || p.createdAt || '').slice(0, 10);
        if (!map[key]) map[key] = [];
        map[key].push(p);
      });
      setPostsByDay(map);
    };
    load();
  }, [workspaceId, currentDate]);

  const dayCell = (day: Date) => {
    const key = format(day, 'yyyy-MM-dd');
    const items = postsByDay[key] || [];
    const has = items.length > 0;
    return (
      <div
        key={day.toISOString()}
        className={`min-h-24 p-3 rounded-lg border cursor-pointer transition-all ${
          isSameMonth(day, currentDate)
            ? 'bg-[var(--panel)] hover:border-[var(--accent)]/40 border-[var(--border)]'
            : 'bg-[var(--panel-2)]/40 border-[var(--border)]/60'
        }`}
        onClick={() => { setSelectedDate(day); setShowModal(true); }}
      >
        <div className="text-sm font-medium flex items-center justify-between">
          <span>{format(day, 'd')}</span>
          {has && <span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_10px_rgba(34,211,238,0.7)]"></span>}
        </div>
        {has && (
          <div className="mt-2 space-y-1">
            {items.slice(0, 2).map((p: any, i: number) => (
              <div key={i} className="text-xs truncate text-[var(--muted)]">{(p.title || p.body || '').toString()}</div>
            ))}
            {items.length > 2 && <div className="text-[10px] text-[var(--muted)]">+{items.length - 2} more</div>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-[var(--text)]">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold glow-text mb-2">Planner</h1>
          <p className="text-[var(--muted)]">Click any day to view/schedule posts</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="px-6 py-3">
          <Plus size={18} /> New Post
        </Button>
      </div>

      <Card className="animate-float-in">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={prevMonth} aria-label="Previous month"><ChevronLeft size={20} /></Button>
            <div className="text-2xl font-semibold">{format(currentDate, 'MMMM yyyy')}</div>
            <Button variant="ghost" onClick={nextMonth} aria-label="Next month"><ChevronRight size={20} /></Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-7 gap-2 text-[var(--muted)] text-xs mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <div key={d} className="text-center">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((d) => dayCell(d))}
          </div>
        </CardBody>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="panel rounded-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-[var(--muted)]">Selected day</div>
                <div className="text-xl font-semibold">{selectedDate ? format(selectedDate, 'EEE d MMM yyyy') : '—'}</div>
              </div>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
            </div>
            {/* List posts on this day */}
            <div className="space-y-2 max-h-80 overflow-auto">
              {(selectedDate ? postsByDay[format(selectedDate, 'yyyy-MM-dd')] || [] : []).map((p: any, i: number) => (
                <div key={i} className="border border-[var(--border)] rounded-lg p-3">
                  <div className="text-sm font-medium">{p.title || (p.body || '').slice(0, 60)}</div>
                  <div className="text-xs text-[var(--muted)]">{(p.channels || p.requested_channels || []).join(', ')}</div>
                </div>
              ))}
              {selectedDate && (postsByDay[format(selectedDate, 'yyyy-MM-dd')] || []).length === 0 && (
                <div className="text-sm text-[var(--muted)]">No posts scheduled. Use New Post to create one.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

