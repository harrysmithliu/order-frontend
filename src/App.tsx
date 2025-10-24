import { useEffect, useRef, useState } from "react";

interface Order {
  id: number;
  orderNo: string;
  username: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  status: string;
}

function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(20);                  // 每页大小（你可以改 10 / 20）
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // 后端的 last=false 表示还有更多
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // 拉取数据：当 page 变化时触发，并把新数据 append 到已有数据
  useEffect(() => {
    if (!hasMore && page > 0) return;           // 没有更多就不再请求
    setLoading(true);
    const url = `http://localhost:8080/api/orders?page=${page}&size=${size}`;
    fetch(url, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        const list: Order[] = data?.content ?? [];
        setOrders((prev) => (page === 0 ? list : [...prev, ...list])); // 追加
        // 从分页信息里判断是否还有下一页
        // Spring Data Page JSON 通常带 last / totalPages / number 等字段
        const noMore = data?.last === true || list.length === 0;
        setHasMore(!noMore);
      })
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, [page, size]); // size 固定也无妨

  // IntersectionObserver：哨兵可见时，且不在加载中且还有更多 -> 下一页
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loading && hasMore) {
          setPage((p) => p + 1);
        }
      },
      { root: null, rootMargin: "200px 0px", threshold: 0 } // 提前 200px 触发
    );

    io.observe(el);
    return () => io.disconnect();
  }, [loading, hasMore]);

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>Order List</h2>

      <table border={1} cellPadding={6} style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Order No</th>
            <th>User</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.orderNo}</td>
              <td>{o.username}</td>
              <td>{o.productName}</td>
              <td>{o.quantity}</td>
              <td>${(o.totalAmount as any)?.toFixed?.(2) ?? o.totalAmount}</td>
              <td>{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 底部哨兵：被看到时触发下一页 */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      {/* 状态提示 */}
      <div style={{ padding: 8, textAlign: "center", color: "#666" }}>
        {loading ? "Loading..." : hasMore ? "" : "No more data"}
      </div>
    </div>
  );
}

export default App;
