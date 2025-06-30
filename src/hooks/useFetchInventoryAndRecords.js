// src/hooks/useFetchInventoryAndRecords.js
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const MINUTE = 1000 * 60;

const BASE_URL = import.meta.env.VITE_DEVELOPMENT
  ? `http://${import.meta.env.VITE_LOCALHOST}:5000/api`
  : `https://cdiis-ois-server.vercel.app/api`;

const fetchItems = () => axios.get(`${BASE_URL}/items`);
const fetchRecords = () => axios.get(`${BASE_URL}/records`);

const useFetchInventoryAndRecords = () => {
  const itemsQuery = useQuery({
    queryKey: ["fetchedInventoryItems"],
    queryFn: fetchItems,
    staleTime: 5 * MINUTE,
    refetchOnWindowFocus: false,
    enabled: true,
  });

  const recordsQuery = useQuery({
    queryKey: ["fetchedRecords"],
    queryFn: fetchRecords,
    staleTime: 5 * MINUTE,
    refetchOnWindowFocus: false,
    enabled: true,
  });

  return { itemsQuery, recordsQuery };
};

export default useFetchInventoryAndRecords;