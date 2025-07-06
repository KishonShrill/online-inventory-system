// src/hooks/useFetchInventoryAndRecords.js
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const MINUTE = 1000 * 60;
const DATE = new Date().toLocaleDateString('en-CA');

const BASE_URL = import.meta.env.VITE_DEVELOPMENT
  ? `http://${import.meta.env.VITE_LOCALHOST}:5000/api`
  : `https://cdiis-ois-server.vercel.app/api`;

const fetchItems = () => axios.get(`${BASE_URL}/items`);
const fetchRecords = () => axios.get(`${BASE_URL}/records`);
const fetchAttendance = () => axios.get(`${BASE_URL}/attendances`, {params: { limit: "today", date: DATE }})
  .catch((err) => console.log(err.response.data.message));

const useFetchInitialize = () => {
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

  const attendanceQuery = useQuery({
    queryKey: ["fetchedAttendances"],
    queryFn: fetchAttendance,
    staleTime: 5 * MINUTE,
    refetchOnWindowFocus: false,
    enabled: true,
  })

  return { itemsQuery, recordsQuery, attendanceQuery };
};

export default useFetchInitialize;