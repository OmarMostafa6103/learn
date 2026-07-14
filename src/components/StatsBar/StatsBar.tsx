interface StatsBarProps {
  totalCount: number;
  learnedCount: number;
  trashCount: number;
}

export function StatsBar({ totalCount, learnedCount, trashCount }: StatsBarProps) {
  return (
    <div className="app-card stats-bar">
      <div className="stat-tile text-center">
        <div className="stat-value">{totalCount}</div>
        <div className="stat-label">إجمالي الجمل</div>
      </div>
      <div className="stat-tile text-center">
        <div className="stat-value">{learnedCount}</div>
        <div className="stat-label">تم الحفظ</div>
      </div>
      <div className="stat-tile text-center">
        <div className="stat-value">{totalCount - learnedCount}</div>
        <div className="stat-label">متبقي</div>
      </div>
      <div className="stat-tile text-center">
        <div className="stat-value">{trashCount}</div>
        <div className="stat-label">في السلة</div>
      </div>
    </div>
  );
}
