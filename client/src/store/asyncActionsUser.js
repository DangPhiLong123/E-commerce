import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiGetCurrent } from '../apis/user'

export const getCurrent = createAsyncThunk('user/current', async (data, {rejectWithValue}) => {
    try {
        const response = await apiGetCurrent()
        console.log('Current API Response:', response)
        if(!response.success) return rejectWithValue(response)
        return response.rs
    } catch (error) {
        console.log('Current API Error:', error)
        return rejectWithValue(error)
    }
})