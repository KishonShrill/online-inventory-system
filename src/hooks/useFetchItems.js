import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const MINUTE = 1000 * 60;

const useFetchItems = () => {
    const DATABSE_URL = import.meta.env.VITE_DEVELOPMENT
    ? `http://${import.meta.env.VITE_LOCALHOST}:5000/api/items`
    : `https://cdiis-ois-server.vercel.app/api/items`;
    
    const fetchURL = () => {return axios.get(DATABSE_URL)};

    return useQuery({
        queryKey: ['fetchedInventoryItems'],
        queryFn: fetchURL,
        staleTime: 5 * MINUTE,
        refetchOnWindowFocus: false,
        enabled: true,
    })
};

export default useFetchItems;