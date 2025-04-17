import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Define table type based on your schema
export interface Table {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  capacity: number;
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

// Thunk to fetch tables from API
export const fetchTables = createAsyncThunk(
  "tables/fetchTables",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/tables");
      if (!response.ok) {
        throw new Error("Failed to fetch tables");
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const tableSlice = createSlice({
  name: "tables",
  initialState,
  reducers: {
    selectTable: (state, action) => {
      const tableId = action.payload;
      if (!state.selectedTableIds.includes(tableId)) {
        state.selectedTableIds.push(tableId);
      }
    },
    unselectTable: (state, action) => {
      state.selectedTableIds = state.selectedTableIds.filter(
        (id) => id !== action.payload
      );
    },
    setSelectedTableIds: (state, action) => {
      state.selectedTableIds = action.payload;
    },
    clearSelectedTables: (state) => {
      state.selectedTableIds = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.tables = action.payload;
        state.loading = false;
      })
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
