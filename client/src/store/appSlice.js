import {  createSlice } from "@reduxjs/toolkit";
import * as actions from './asyncActions'

export const appSlice = createSlice({
    name: 'app',
    initialState: {
        categories: null,
        isLoading: false,
        isShowModal: false,
        modalChildren: null,
        isShowCart: false,
        language: (typeof window !== 'undefined' && window.localStorage.getItem('lang')) || 'en'
    },
    reducers: {
        showModal: (state, action) => {
            state.isShowModal = action.payload.isShowModal;
            state.modalChildren = action.payload.modalChildren;
        },
        showCart: (state) => {
            state.isShowCart = state.isShowCart === false ? true : false;
        },
        setLanguage: (state, action) => {
            state.language = action.payload;
        },
        toggleLanguage: (state) => {
            const next = state.language === 'en' ? 'vi' : 'en'
            state.language = next;
            if (typeof window !== 'undefined') window.localStorage.setItem('lang', next)
        }
    },
    extraReducers: (builder) => {
        builder.addCase(actions.getCategories.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(actions.getCategories.fulfilled, (state, action) => {
            console.log(action);
            state.isLoading = false;
            state.categories = action.payload;
        });
        builder.addCase(actions.getCategories.rejected, (state, action) => {
            state.isLoading = false;
            state.errorMessage = action.payload.message;
        });
    }
})

export const { showModal, showCart, setLanguage, toggleLanguage } = appSlice.actions
export default appSlice.reducer