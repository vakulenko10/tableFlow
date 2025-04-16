import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface Reservation {
  id: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
}

export interface Table {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  capacity: number;
  reserved: boolean; // Shows if the table is currently reserved
  reservations?: Reservation[]; // Information about all reservations
}

interface TableState {
  tables: Table[];
  selectedTableIds: string[];
  loading: boolean;
  error: string | null;
}

const initialState: TableState = {
  tables: [],
  selectedTableIds: [],
  loading: false,
  error: null,
};

/**
 * Async thunk to fetch tables from the API
 * Makes a GET request to /api/tables endpoint
 *
 * Returns tables with their current reservation status and positions
 * Used when mounting components that display table information
 */
export const fetchTables = createAsyncThunk(
  "tables/fetchTables",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/tables");
      if (!response.ok) {
        throw new Error("Failed to fetch tables");
      }
      const tables = await response.json();
      return tables;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * Redux slice for tables
 * Defines actions and reducers for table management
 */
const tableSlice = createSlice({
  name: "tables",
  initialState,
  reducers: {
    /**
     * Action to select a single table
     * Adds tableId to selectedTableIds array if not already present
     */
    selectTable: (state, action) => {
      const tableId = action.payload;
      if (!state.selectedTableIds.includes(tableId)) {
        state.selectedTableIds.push(tableId);
      }
    },

    /**
     * Action to unselect a single table
     * Removes specified tableId from selectedTableIds array
     */
    unselectTable: (state, action) => {
      state.selectedTableIds = state.selectedTableIds.filter(
        (id) => id !== action.payload
      );
    },

    /**
     * Action to set multiple selected tables at once
     * Replaces entire selectedTableIds array with new array
     * Used when selecting a table from the floor map
     */
    setSelectedTableIds: (state, action) => {
      state.selectedTableIds = action.payload;
    },

    /**
     * Action to clear all selected tables
     * Empties the selectedTableIds array
     * Used after successful reservation or when canceling
     */
    clearSelectedTables: (state) => {
      state.selectedTableIds = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle pending state while fetching tables
      .addCase(fetchTables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Handle successful table fetch - store tables in state
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.tables = action.payload;
        state.loading = false;
      })
      // Handle error during table fetch - store error message
      .addCase(fetchTables.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });
  },
});


export const {
  selectTable,
  unselectTable,
  setSelectedTableIds,
  clearSelectedTables,
} = tableSlice.actions;


export default tableSlice.reducer;
