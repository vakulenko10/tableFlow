import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";

// Typed dispatch hook for use in components
export const useAppDispatch = () => useDispatch<AppDispatch>();
