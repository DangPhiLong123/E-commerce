import { createAsyncThunk } from "@reduxjs/toolkit";
import apis from '../apis/app'

export const getCategories = createAsyncThunk('app/categories', async (data, {rejectWithValue}) => {
    const response = await apis.apiGetCategories()
    if(!response.success) return rejectWithValue(response)
        return response.prodCategories
})
