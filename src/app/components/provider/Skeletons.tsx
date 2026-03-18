export function TopNavbarSkeleton() {
  return <div className="h-16 w-full bg-white/5 rounded-xl animate-pulse" />;
}

export function BottomNavSkeleton() {
  return <div className="h-16 w-full bg-white/5 rounded-t-xl animate-pulse md:hidden" />;
}

export function SidebarSkeleton() {
  return <div className="w-60 h-screen bg-white/5 animate-pulse hidden md:block" />;
}

export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      <div className="h-10 w-48 bg-white/5 rounded-xl" />
      <div className="h-48 bg-white/5 rounded-3xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="h-24 bg-white/5 rounded-2xl" />
        <div className="h-24 bg-white/5 rounded-2xl" />
        <div className="h-24 bg-white/5 rounded-2xl" />
        <div className="h-24 bg-white/5 rounded-2xl" />
      </div>
      <div className="h-56 bg-white/5 rounded-3xl" />
      <div className="h-48 bg-white/5 rounded-3xl" />
    </div>
  );
}