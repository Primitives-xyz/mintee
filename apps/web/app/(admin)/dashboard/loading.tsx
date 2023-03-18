export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <button type="button" className="" disabled>
      <svg className="animate-spin h-5 w-5 mr-3 ..." viewBox="0 0 24 24"></svg>
      Processing...
    </button>
  );
}
