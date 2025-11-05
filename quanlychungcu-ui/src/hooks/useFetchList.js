import { useEffect, useState } from "react";
import api from "../services/api";

export default function useFetchList(path) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();

    (async () => {
      try {
        const res = await api.get(path, { signal: ctrl.signal });
        setData(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
      } catch (err) {
        if (err?.code !== "ERR_CANCELED") {
          setError(err?.response?.data?.message || err.message || "Lỗi không xác định");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [path]);

  return { data, loading, error };
}
